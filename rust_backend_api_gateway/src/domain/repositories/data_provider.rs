use crate::domain::services::data::UnifiedPool;
use crate::dtos::price_history::PricePoint;
use crate::service::liquidity_service::ActiveLiquidityResponse;
use anyhow::Result;
use async_trait::async_trait;

#[async_trait]
pub trait DataProvider {
    async fn get_price_data(
        &self,
        token0: &str,
        token1: &str,
        interval: u32, // Interval in minutes
        limit: u32,
    ) -> Result<Vec<PricePoint>>;
    async fn get_liquidity_data(&self, pool_address: &str) -> Result<ActiveLiquidityResponse>;

    async fn get_pool_list(&self) -> Result<Vec<UnifiedPool>>;
}
