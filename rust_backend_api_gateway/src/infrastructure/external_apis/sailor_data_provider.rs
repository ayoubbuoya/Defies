use crate::domain::repositories::data_provider::DataProvider;
use crate::domain::repositories::dex_provider::DexProvider;

use crate::application::dtos::price_history::PricePoint;
use crate::config::sailor_api_base_url;
use crate::domain::services::data::{ActiveLiquidityResponse, LiquidityTick, Token};
use crate::domain::services::data::{
    KlineResponse, SailorPoolListResponse, SailorPoolStats, UnifiedPool,
};

use anyhow::Result;
use async_trait::async_trait;
use reqwest;
use tracing::info;

#[derive(Debug)]
pub struct SailorDataProvider {
    base_url: String,
    client: reqwest::Client,
}

impl Default for SailorDataProvider {
    fn default() -> Self {
        Self::new()
    }
}

#[async_trait]
impl DataProvider for SailorDataProvider {
    async fn get_price_data(
        &self,
        token0: &str,
        token1: &str,
        interval: u32,
        limit: u32,
    ) -> Result<Vec<PricePoint>> {
        let url = format!(
            "{}/sailor_kline_api/smart_kline/{}/{}?interval={}&limit={}",
            self.base_url,
            token0.to_lowercase(),
            token1.to_lowercase(),
            interval,
            limit
        );

        let response = reqwest::get(&url).await?.json::<KlineResponse>().await?;

        let parsed_response = response
            .data
            .into_iter()
            .map(|data| PricePoint {
                tick: data.0,
                open: data.1,
                high: data.2,
                low: data.3,
                close: data.4,
                volume: Some(data.5),
            })
            .collect();

        Ok(parsed_response)
    }
}

#[async_trait]
impl DexProvider for SailorDataProvider {
    async fn get_liquidity_data(&self, pool_address: &str) -> Result<ActiveLiquidityResponse> {
        let url = format!(
            "{}/sailor_poolapi/getActiveLiquidity?address={}",
            self.base_url, pool_address
        );

        info!("Fetching Sailor liquidity data from: {}", url);

        let response = self.client.get(&url).send().await?.error_for_status()?;
        let body_text = response.text().await?;

        let sailor_response: ActiveLiquidityResponse =
            serde_json::from_str(&body_text).map_err(|e| {
                anyhow::anyhow!(
                    "Failed to parse Sailor API response. Error: {}. Raw Body: {}",
                    e,
                    body_text
                )
            })?;

        // Transform ActiveLiquidity to LiquidityTick format
        let ticks: Vec<LiquidityTick> = sailor_response
            .active_liquidity
            .into_iter()
            .map(|active_liq| LiquidityTick {
                tick_idx: active_liq.tick,
                liquidity_net: active_liq.liquidity,
                price0: active_liq.price.to_string(),
                price1: "0".to_string(), // Sailor API doesn't provide price1, using default
            })
            .collect();

        Ok(ActiveLiquidityResponse {
            status: sailor_response.status,
            data: ticks,
            active_liquidity: Vec::new(), // Clear this since we've moved data to 'data' field
            ..Default::default()
        })
    }

    async fn get_pool_list(&self) -> Result<Vec<UnifiedPool>> {
        let mut unified_pools: Vec<UnifiedPool> = Vec::new();

        let url = format!("{}/sailor_poolapi/getPoolList", self.base_url);
        let response = self.client.get(&url).send().await?;
        if response.status().is_success() {
            match response.json::<SailorPoolListResponse>().await {
                Ok(sailor_data) => {
                    let transformed = sailor_data
                        .pool_stats
                        .into_iter()
                        .map(SailorDataProvider::transform_sailor_pool)
                        .filter(|pool| pool.daily_volume.unwrap_or(0.0) > 1000.0)
                        .filter(|pool| pool.tvl.unwrap_or(0.0) > 1000.0);

                    unified_pools.extend(transformed);
                }
                Err(e) => eprintln!("Failed to parse Sailor JSON: {}", e),
            }
        }
        Ok(unified_pools)
    }
}

impl SailorDataProvider {
    pub fn new() -> Self {
        let base_url = sailor_api_base_url();

        info!("🔗 Using API base URL from .env: {}", base_url);
        Self {
            base_url,
            client: reqwest::Client::builder()
                .user_agent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36")
                .build()
                .expect("Failed to create reqwest client"),
        }
    }

    /// Converts a pool from the Sailor Finance format to our unified format.
    pub fn transform_sailor_pool(pool: SailorPoolStats) -> UnifiedPool {
        let fee_tier_val = match pool.fee_tier.parse::<f64>() {
            Ok(value) => value / 10000.0,
            Err(_) => 0.0, // fallback if parsing fails
        };
        let fee_tier = if fee_tier_val > 0.0 {
            fee_tier_val.to_string()
        } else {
            "N/A".to_string()
        };

        let daily_volume = pool.day.volume.unwrap_or(0.0);
        let tvl = pool.tvl.unwrap_or(0.0);
        let boost_apr = pool.boost_apr.unwrap_or(0.0);

        let apr = if tvl > 0.0 {
            ((daily_volume * fee_tier_val / tvl) * 365.0) + (boost_apr * 100.0)
        } else {
            boost_apr * 100.0
        };

        UnifiedPool {
            id: pool.id,
            protocol: "Sailor".to_string(),
            token0: Token {
                address: pool.token0.id,
                symbol: pool.token0.symbol,
                decimals: pool.token0.decimals,
            },
            token1: Token {
                address: pool.token1.id,
                symbol: pool.token1.symbol,
                decimals: pool.token1.decimals,
            },
            tvl: pool.tvl,
            daily_volume: pool.day.volume,
            apr: Some(apr),
            fee_tier,
        }
    }
}
