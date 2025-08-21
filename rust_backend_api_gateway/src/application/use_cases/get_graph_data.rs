use crate::domain::repositories::dex_provider::DexProvider;
use crate::domain::services::data::ActiveLiquidityResponse;
use crate::infrastructure::data::dragonswap_data_provider::DragonSwapDataProvider;
use crate::infrastructure::data::sailor_data_provider::SailorDataProvider;
use anyhow::Result;
use std::error::Error;
use tracing::{error, info};

pub async fn get_graph_data(pool_address: &str) -> Result<ActiveLiquidityResponse, Box<dyn Error>> {
    let data_provider = DragonSwapDataProvider::new();

    match data_provider.is_dragonswap_pool(pool_address).await {
        Ok(true) => {
            info!(
                "Pool {} identified as a DragonSwap pool. Fetching data ONLY from DragonSwap.",
                pool_address
            );
            let liquidity_data = data_provider.get_liquidity_data(pool_address).await?;
            Ok(liquidity_data)
        }
        Ok(false) => {
            let sailor_data_provider = SailorDataProvider::new();
            info!(
                "Pool {} is not a DragonSwap pool. Using sailor service.",
                pool_address
            );
            let liquidity_data = sailor_data_provider
                .get_liquidity_data(pool_address)
                .await?;
            Ok(liquidity_data)
        }
        Err(e) => {
            error!("Failed to check pool type for {}: {}", pool_address, e);
            Err(e.into())
        }
    }
}
