use serde::{Deserialize, Serialize};
use std::error::Error;

// --- Data Structures to Match the JSON Response ---

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PoolListResponse {
    pub status: String,
    pub daily_protocol_tvl: DailyProtocolTvl,
    pub pool_stats: Vec<PoolStats>,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DailyProtocolTvl {
    pub v3: V3Tvl,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct V3Tvl {
    pub timestamp_at_midnight: Option<f64>, // Changed to Option
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PoolStats {
    pub chain: String,
    pub fee_tier: String,
    pub id: String,
    pub protocol_version: String,
    pub total_liquidity: TotalLiquidity,
    pub tx_count: String,
    pub day: TimePeriodStats,
    pub week: TimePeriodStats,
    pub month: TimePeriodStats,
    pub boost_apr: Option<f64>, // Changed to Option
    pub tvl: Option<f64>,       // Changed to Option
    pub token0: TokenInfo,
    pub token1: TokenInfo,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct TotalLiquidity {
    pub value: String,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub struct TimePeriodStats {
    pub volume: Option<f64>,    // Changed to Option
    pub max_price: Option<f64>, // Changed to Option
    pub min_price: Option<f64>, // Changed to Option
    pub price: Option<f64>,     // Changed to Option
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TokenInfo {
    pub id: String,
    pub symbol: String,
    pub name: String,
    pub decimals: String,
    pub token0_price: Option<String>, // Already Option
    pub token1_price: Option<String>, // Already Option
    pub url: String,
}

// --- Public Service Function ---

/// Fetches the list of pools from the external Sailor API.
pub async fn get_pool_list() -> Result<PoolListResponse, Box<dyn Error>> {
    let url = "https://asia-southeast1-ktx-finance-2.cloudfunctions.net/sailor_poolapi/getPoolList";

    let response = reqwest::get(url).await?;

    if response.status().is_success() {
        let pool_data: PoolListResponse = response.json().await?;
        Ok(pool_data)
    } else {
        let err_msg = format!(
            "External API request failed with status: {}",
            response.status()
        );
        Err(err_msg.into())
    }
}
