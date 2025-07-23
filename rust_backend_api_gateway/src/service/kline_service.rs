// src/service/kline_service.rs
use serde::{Deserialize, Serialize}; // <-- Make sure Serialize is imported
use std::error::Error;

// Using a tuple to represent the array of numbers for each data point
// [timestamp, open, high, low, close, volume]
type KlineData = (u64, f64, f64, f64, f64, f64);


#[derive(Debug, Deserialize, Serialize)]
pub struct KlineResponse {
    pub success: bool,
    pub data: Vec<KlineData>,
}

pub async fn get_kline_data(
    token0_symbol: &str,
    token1_symbol: &str,
    interval_minutes: u32,
    limit: u32,
) -> Result<KlineResponse, Box<dyn Error>> {
    let url = format!(
        "https://asia-southeast1-ktx-finance-2.cloudfunctions.net/sailor_kline_api/smart_kline/{}/{}?interval={}&limit={}",
        token0_symbol.to_lowercase(),
        token1_symbol.to_lowercase(),
        interval_minutes,
        limit
    );

    let response = reqwest::get(&url).await?.json::<KlineResponse>().await?;

    Ok(response)
}