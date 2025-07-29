use crate::infrastructure::price_data_client::PriceDataClient;
use crate::math::{
    calculate_suggested_range_width, calculate_volatility, determine_trend,
    determine_volatility_level,
};
use crate::models::price_history::{
    PoolInfo, PriceHistoryResponse, PricePoint, PriceRange, RecentPrice, RecommendationContext,
    VolatilityInfo,
};
use anyhow::{Result, anyhow};
use tracing::{debug, info, warn};

#[derive(Debug)]
pub struct PriceHistoryService {
    price_client: PriceDataClient,
}

impl PriceHistoryService {
    pub fn new() -> Self {
        Self {
            price_client: PriceDataClient::new(),
        }
    }

    pub async fn get_price_history_analysis(
        &self,
        token0: &str,
        token1: &str,
        interval: u32,
        limit: u32,
    ) -> Result<PriceHistoryResponse> {
        info!(
            "🔍 Starting price history analysis for {}/{}",
            token0, token1
        );

        let price_data = self
            .price_client
            .fetch_kline_data(token0, token1, interval, limit)
            .await?;

        if price_data.is_empty() {
            warn!("⚠️ No price data found for {}/{}", token0, token1);
            return Err(anyhow!(
                "No price data available for the specified token pair"
            ));
        }

        debug!("📊 Processing {} price points", price_data.len());

        let analysis = self.analyze_price_data(PriceAnalysisData {
            token0: token0.to_string(),
            token1: token1.to_string(),
            interval,
            limit,
            data: price_data,
        })?;

        info!(
            "✅ Price history analysis completed for {}/{}",
            token0, token1
        );
        Ok(analysis)
    }

    fn analyze_price_data(&self, analysis_data: PriceAnalysisData) -> Result<PriceHistoryResponse> {
        let data = &analysis_data.data;

        if data.is_empty() {
            return Err(anyhow!("Cannot analyze empty price data"));
        }

        let prices: Vec<f64> = data.iter().map(|p| p.close).collect();
        let highs: Vec<f64> = data.iter().map(|p| p.high).collect();
        let lows: Vec<f64> = data.iter().map(|p| p.low).collect();

        let min_price = lows.iter().fold(f64::INFINITY, |a, &b| a.min(b));
        let max_price = highs.iter().fold(f64::NEG_INFINITY, |a, &b| a.max(b));
        let avg_price = prices.iter().sum::<f64>() / prices.len() as f64;

        // Use the math module functions instead of self methods
        let volatility = calculate_volatility(&prices);
        let volatility_level = determine_volatility_level(volatility);

        let recent_prices: Vec<RecentPrice> = data
            .iter()
            .rev()
            .take(10)
            .map(|p| RecentPrice {
                price: p.close,
                high: p.high,
                low: p.low,
                timestamp: p.tick,
            })
            .collect();

        let recommendation_context = RecommendationContext {
            center_price: avg_price,
            suggested_range_width_percent: calculate_suggested_range_width(volatility),
            trend: determine_trend(&prices),
        };

        let response = PriceHistoryResponse {
            pair: format!("{}/{}", analysis_data.token0, analysis_data.token1),
            price_range: PriceRange {
                min: min_price,
                max: max_price,
                average: avg_price,
            },
            volatility: VolatilityInfo {
                value: volatility,
                percentage: volatility * 100.0,
                level: volatility_level,
            },
            data_points: data.len(),
            interval_minutes: analysis_data.interval,
            pool_info: Some(PoolInfo {
                pool_id: None,
                tvl: None,
                fee_tier: None,
            }),
            recent_prices,
            recommendation_context,
        };

        Ok(response)
    }
}

struct PriceAnalysisData {
    token0: String,
    token1: String,
    interval: u32,
    limit: u32,
    data: Vec<PricePoint>,
}

impl Default for PriceHistoryService {
    fn default() -> Self {
        Self::new()
    }
}
