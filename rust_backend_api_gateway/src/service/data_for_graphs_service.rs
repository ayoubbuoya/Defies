use crate::service::liquidity_service::{self, ActiveLiquidityResponse, KlineResponse, LiquidityTick};
use serde::{Deserialize, Serialize};
use std::error::Error;
use tracing::{error, info};

// --- Structs for deserializing DragonSwap API responses ---
#[derive(Deserialize, Debug)]
struct DragonSwapPoolCheckResponse {
    status: String,
}

#[derive(Deserialize, Debug)]
struct DragonSwapTick {
    #[serde(rename = "tickIdx")]
    tick_idx: String,
    #[serde(rename = "liquidityNet")]
    liquidity_net: String,
    price0: String,
    price1: String,
        #[serde(rename = "poolAddress")]
    pool_address: String,
}

#[derive(Deserialize, Debug)]
struct DragonSwapTicksData {
    ticks: Vec<DragonSwapTick>,
}

#[derive(Deserialize, Debug)]
struct DragonSwapTicksResponse {
    data: DragonSwapTicksData,
}

// --- Public Enums and Structs ---
pub enum GraphDataType {
    LiquidityDistribution,
    PriceCandles,
}

pub struct GraphDataParams<'a> {
    pub data_type: GraphDataType,
    pub pool_address: Option<&'a str>,
    pub token0_symbol: Option<&'a str>,
    pub token1_symbol: Option<&'a str>,
    pub interval: Option<&'a str>,
    pub limit: Option<u32>,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(untagged)]
pub enum GraphDataResponse {
    Liquidity(ActiveLiquidityResponse),
    Candles(KlineResponse),
}

// --- Private Helper Functions ---
fn create_client() -> Result<reqwest::Client, reqwest::Error> {
    reqwest::Client::builder()
        .user_agent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36")
        .build()
}

// in src/service/data_for_graphs_service.rs

async fn is_dragonswap_pool(pool_address: &str) -> Result<bool, Box<dyn Error>> {
    let client = create_client()?;
    // Corrected to use the v1 endpoint from your screenshots
    let url = format!("https://sei-api.dragonswap.app/api/v1/pools/{}", pool_address);
    
    info!("Checking DragonSwap for pool: {}", url);

    let response = client.get(&url).send().await?;

    // This is a much more reliable check.
    // A valid DragonSwap pool will return a 200 OK success status.
    // An invalid address will return a 404 Not Found, which is not a success status.
    Ok(response.status().is_success())
}

async fn get_dragonswap_liquidity(pool_address: &str) -> Result<ActiveLiquidityResponse, Box<dyn Error>> {
    let client = create_client()?;
    let url = format!("https://sei-api.dragonswap.app/api/v1/graph/factory/ticks?pool_address={}&skip=0", pool_address);
    info!("Fetching DragonSwap liquidity ticks from: {}", url);
    let response = client.get(&url).send().await?.json::<DragonSwapTicksResponse>().await?;
    let ticks: Vec<LiquidityTick> = response.data.ticks.into_iter().map(|ds_tick| LiquidityTick {
            tick_idx: ds_tick.tick_idx,
            liquidity_net: ds_tick.liquidity_net,
            price0: ds_tick.price0,
            price1: ds_tick.price1,
        }).collect();
    Ok(ActiveLiquidityResponse { data: ticks, ..Default::default() })
}

// --- Public Service Function ---
// in src/service/data_for_graphs_service.rs

pub async fn get_graph_data(params: GraphDataParams<'_>) -> Result<GraphDataResponse, Box<dyn Error>> {
    match params.data_type {
        GraphDataType::LiquidityDistribution => {
            let pool_address = params.pool_address.ok_or("pool_address is required for LiquidityDistribution")?;

            match is_dragonswap_pool(pool_address).await {
                // This is the correct logic for a DragonSwap pool
                Ok(true) => {
                    info!("Pool {} identified as a DragonSwap pool. Fetching data ONLY from DragonSwap.", pool_address);

                    // Directly attempt to get DragonSwap data.
                    // If this fails, the specific error from DragonSwap will be sent to the user.
                    let liquidity_data = get_dragonswap_liquidity(pool_address).await?;
                    Ok(GraphDataResponse::Liquidity(liquidity_data))
                }
                // This is the correct logic for a non-DragonSwap (Sailor) pool
                Ok(false) => {
                    info!("Pool {} is not a DragonSwap pool. Using sailor service.", pool_address);
                    let liquidity_data = liquidity_service::get_active_liquidity(pool_address).await?;
                    Ok(GraphDataResponse::Liquidity(liquidity_data))
                }
                // This handles errors during the initial check
                Err(e) => {
                    error!("Failed to check pool type for {}: {}", pool_address, e);
                    Err(e)
                }
            }
        }
        GraphDataType::PriceCandles => {
            let token0_symbol = params.token0_symbol.ok_or("token0_symbol is required for PriceCandles")?;
            let token1_symbol = params.token1_symbol.ok_or("token1_symbol is required for PriceCandles")?;
            let interval = params.interval.unwrap_or("15");
            let limit = params.limit.unwrap_or(100);
            let kline_data = liquidity_service::get_kline_data(token0_symbol, token1_symbol, interval, limit).await?;
            Ok(GraphDataResponse::Candles(kline_data))
        }
    }
}