use crate::domain::repositories::data_provider::DataProvider;
use crate::domain::repositories::dex_provider::DexProvider;
use crate::dtos::price_history::PricePoint;
use crate::infrastructure::data::sailor_data_provider::SailorDataProvider;
use crate::{
    infrastructure::data::dragonswap_data_provider::DragonSwapDataProvider,
    service::liquidity_service::{self, ActiveLiquidityResponse},
};
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
            info!(
                "Pool {} is not a DragonSwap pool. Using sailor service.",
                pool_address
            );
            let liquidity_data = liquidity_service::get_sailor_liquidity(pool_address).await?;
            Ok(liquidity_data)
        }
        Err(e) => {
            error!("Failed to check pool type for {}: {}", pool_address, e);
            Err(e.into())
        }
    }
}

pub async fn get_kline_data(
    token0_symbol: &str,
    token1_symbol: &str,
    interval_minutes: u32,
    limit: u32,
) -> Result<Vec<PricePoint>, Box<dyn Error>> {
    let data_provider = SailorDataProvider::new();
    let response = data_provider
        .get_price_data(token0_symbol, token1_symbol, interval_minutes, limit)
        .await?;

    Ok(response)
}
