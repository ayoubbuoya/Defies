use serde::{Deserialize, Serialize};
use crate::service::liquidity_service::{self, KlineResponse, ActiveLiquidityResponse};
use std::error::Error;

// --- Public Enums and Structs ---

/// Defines the type of data to fetch for the graph.
pub enum GraphDataType {
    LiquidityDistribution,
    PriceCandles,
}

/// Parameters for the graph data request.
pub struct GraphDataParams<'a> {
    pub data_type: GraphDataType,
    // Used for LiquidityDistribution
    pub pool_address: Option<&'a str>,
    // Used for PriceCandles
    pub token0_symbol: Option<&'a str>,
    pub token1_symbol: Option<&'a str>,
    pub interval: Option<&'a str>,
    pub limit: Option<u32>,
}

/// A unified response type to return data for different graphs.
#[derive(Debug, Serialize, Deserialize)]
#[serde(untagged)]
pub enum GraphDataResponse {
    Liquidity(ActiveLiquidityResponse),
    Candles(KlineResponse),
}


// --- Public Service Function ---

/// Fetches data for generating graphs, either liquidity distribution or price candles.
pub async fn get_graph_data(params: GraphDataParams<'_>) -> Result<GraphDataResponse, Box<dyn Error>> {
    match params.data_type {
        GraphDataType::LiquidityDistribution => {
            let pool_address = params.pool_address.ok_or("pool_address is required for LiquidityDistribution")?;
            let liquidity_data = liquidity_service::get_active_liquidity(pool_address).await?;
            Ok(GraphDataResponse::Liquidity(liquidity_data))
        }
        GraphDataType::PriceCandles => {
            let token0_symbol = params.token0_symbol.ok_or("token0_symbol is required for PriceCandles")?;
            let token1_symbol = params.token1_symbol.ok_or("token1_symbol is required for PriceCandles")?;
            let interval = params.interval.unwrap_or("15"); // Default to 15m
            let limit = params.limit.unwrap_or(100); // Default to 100 data points
            let kline_data = liquidity_service::get_kline_data(token0_symbol, token1_symbol, interval, limit).await?;
            Ok(GraphDataResponse::Candles(kline_data))
        }
    }
}
