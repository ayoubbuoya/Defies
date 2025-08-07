use crate::domain::repositories::data_provider::DataProvider;
use crate::domain::repositories::dex_provider::DexProvider;

use crate::config::dragonswap_api_base_url;
use crate::domain::services::data::ActiveLiquidityResponse;
use crate::domain::services::data::{
    DragonSwapPool, DragonSwapResponse, DragonSwapTicksResponse, DragonSwapToken, LiquidityTick,
    UnifiedPool,
};
use crate::dtos::price_history::PricePoint;
use anyhow::{Result, anyhow};
use async_trait::async_trait;
use reqwest;
use std::collections::HashMap;
use tracing::info;

#[derive(Debug)]
pub struct DragonSwapDataProvider {
    base_url: String,
    client: reqwest::Client,
}

impl Default for DragonSwapDataProvider {
    fn default() -> Self {
        Self::new()
    }
}

// First implement DataProvider
#[async_trait]
impl DataProvider for DragonSwapDataProvider {
    async fn get_price_data(
        &self,
        token0: &str,
        token1: &str,
        interval: u32, // Interval in minutes
        limit: u32,
    ) -> Result<Vec<PricePoint>> {
        Err(anyhow!("dragonswap does not support price data retrieval"))
    }
}

// Then implement DexProvider (which extends DataProvider)
#[async_trait]
impl DexProvider for DragonSwapDataProvider {
    async fn get_liquidity_data(&self, pool_address: &str) -> Result<ActiveLiquidityResponse> {
        let url = format!(
            "{}/graph/factory/ticks?pool_address={}&skip=0",
            self.base_url, pool_address
        );
        info!("Fetching DragonSwap liquidity ticks from: {}", url);
        let response = self
            .client
            .get(&url)
            .send()
            .await?
            .json::<DragonSwapTicksResponse>()
            .await?;
        let ticks: Vec<LiquidityTick> = response
            .data
            .ticks
            .into_iter()
            .map(|ds_tick| LiquidityTick {
                tick_idx: ds_tick.tick_idx,
                liquidity_net: ds_tick.liquidity_net,
                price0: ds_tick.price0,
                price1: ds_tick.price1,
            })
            .collect();
        Ok(ActiveLiquidityResponse {
            data: ticks,
            ..Default::default()
        })
    }

    async fn get_pool_list(&self) -> Result<Vec<UnifiedPool>> {
        let mut unified_pools: Vec<UnifiedPool> = Vec::new();

        let url = format!("{}/pools", self.base_url);
        let response = self.client.get(&url).send().await?;

        if response.status().is_success() {
            match response.json::<DragonSwapResponse>().await {
                Ok(dragonswap_data) => {
                    let token_map: HashMap<String, DragonSwapToken> = dragonswap_data
                        .tokens
                        .into_iter()
                        .map(|token| (token.address.clone(), token))
                        .collect();

                    let transformed = dragonswap_data
                        .pools
                        .into_iter()
                        .filter(|pool| pool.pool_type == "V3_POOL")
                        .filter_map(|pool| {
                            DragonSwapDataProvider::transform_dragonswap_pool(pool, &token_map)
                        })
                        .filter(|pool| pool.daily_volume.unwrap_or(0.0) > 1000.0);

                    unified_pools.extend(transformed);
                }
                Err(e) => eprintln!("Failed to parse DragonSwap JSON: {}", e),
            }
        }

        Ok(unified_pools)
    }
}

impl DragonSwapDataProvider {
    pub fn new() -> Self {
        let base_url = dragonswap_api_base_url();

        info!("🔗 Using API base URL from .env: {}", base_url);
        Self {
            base_url,
            client: reqwest::Client::builder()
                .user_agent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36")
                .build()
                .expect("Failed to create reqwest client"),
        }
    }

    pub async fn is_dragonswap_pool(&self, pool_address: &str) -> Result<bool> {
        let url = format!("{}/pools/{}", self.base_url, pool_address);

        info!("Checking DragonSwap for pool: {}", url);

        let response = self.client.get(&url).send().await?;

        info!("Response status: {}", response.status());
        Ok(response.status().is_success())
    }

    /// Converts a pool from the DragonSwap format to our unified format.
    /// Returns an `Option` so we can easily skip pools if token data is missing.
    fn transform_dragonswap_pool(
        pool: DragonSwapPool,
        token_map: &HashMap<String, DragonSwapToken>,
    ) -> Option<UnifiedPool> {
        // Find the token details in our HashMap. If either token isn't found, we can't proceed.
        let token0 = token_map.get(&pool.token0_address)?;
        let token1 = token_map.get(&pool.token1_address)?;

        Some(UnifiedPool {
            id: pool.pool_address,
            protocol: "DragonSwap".to_string(),
            token0_symbol: token0.symbol.clone(),
            token1_symbol: token1.symbol.clone(),
            tvl: pool.liquidity, // DragonSwap API does not provide TVL per pool directly
            daily_volume: pool.daily_volume,
            apr: pool.apr,
            fee_tier: pool
                .fee_tier
                .map(|f| f.to_string())
                .unwrap_or_else(|| "unknown".to_string()),
        })
    }
}
