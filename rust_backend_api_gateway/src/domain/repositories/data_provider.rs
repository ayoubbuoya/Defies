use crate::application::dtos::price_history::PricePoint;
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
}
