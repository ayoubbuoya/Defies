use crate::application::dtos::price_history::PricePoint;
use crate::domain::repositories::data_provider::DataProvider;
use crate::infrastructure::data::sailor_data_provider::SailorDataProvider;
use anyhow::Result;
use std::error::Error;

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
