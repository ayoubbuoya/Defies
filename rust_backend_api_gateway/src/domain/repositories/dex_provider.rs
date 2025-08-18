use crate::domain::repositories::data_provider::DataProvider;
use crate::domain::services::data::ActiveLiquidityResponse;
use crate::domain::services::data::UnifiedPool;
use anyhow::Result;
use async_trait::async_trait;

#[async_trait]
pub trait DexProvider: DataProvider {
    async fn get_liquidity_data(&self, pool_address: &str) -> Result<ActiveLiquidityResponse>;

    async fn get_pool_list(&self) -> Result<Vec<UnifiedPool>>;
}
