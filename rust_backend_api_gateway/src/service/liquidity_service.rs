use crate::math::math::{align_to_tick_spacing, price1_to_tick};
use serde::{Deserialize, Serialize};
use reqwest;
use serde_json::Value;
use std::error::Error;

// --- API Response Structs ---

// Represents a token from the getTokenListV2 endpoint.
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Token {
    pub id: String,
    pub name: String,
    pub symbol: String,
    pub url: String,
    // Decimals can be a string or number in the API response.
    pub decimals: Value,
    pub verified: bool,
}

impl Token {
    // Helper function to get decimals as u8, handling string or number.
    pub fn get_decimals(&self) -> u8 {
        match &self.decimals {
            Value::String(s) => s.parse().unwrap_or(18),
            Value::Number(n) => n.as_u64().unwrap_or(18) as u8,
            _ => 18, // Default to 18 if type is unexpected
        }
    }
}

// Represents a price point from the getPriceList endpoint.
#[derive(Debug, Serialize, Deserialize)]
pub struct Price {
    pub symbol: String,
    pub price: Value, // Price can be a number or a string
    pub id: String,
}

// Represents the response from the smart_kline endpoint.
#[derive(Debug, Serialize, Deserialize)]
pub struct KlineResponse {
    pub success: bool,
    // Data is a nested array: [timestamp, open, high, low, close, volume]
    pub data: Vec<Vec<f64>>,
}

// Represents a single active liquidity position.
#[derive(Debug, Serialize, Deserialize)]
pub struct ActiveLiquidity {
    pub tick: String,
    pub price: String,
    pub liquidity: String,
}

// Represents the response from the getActiveLiquidity endpoint.
#[derive(Debug, Serialize, Deserialize)]
pub struct ActiveLiquidityResponse {
    pub status: String,
    pub active_liquidity: Vec<ActiveLiquidity>,
}


// --- Public Service Functions ---

/// Fetches the list of all available tokens.
/// API Endpoint: https://asia-southeast1-ktx-finance-2.cloudfunctions.net/sailor_poolapi/getTokenListV2
pub async fn get_token_list() -> Result<Vec<Token>, Box<dyn Error>> {
    let url = "https://asia-southeast1-ktx-finance-2.cloudfunctions.net/sailor_poolapi/getTokenListV2";
    let tokens: Vec<Token> = reqwest::get(url).await?.json().await?;
    Ok(tokens)
}

/// Fetches the current prices for a list of token addresses.
/// API Endpoint: https://asia-southeast1-ktx-finance-2.cloudfunctions.net/sailor_poolapi/getPriceList
pub async fn get_price_list(token_addresses: Vec<&str>) -> Result<Vec<Price>, Box<dyn Error>> {
    let addresses = token_addresses.join(",");
    let url = format!("https://asia-southeast1-ktx-finance-2.cloudfunctions.net/sailor_poolapi/getPriceList?tokens={}", addresses);
    let prices: Vec<Price> = reqwest::get(&url).await?.json().await?;
    Ok(prices)
}

/// Fetches historical K-line (candlestick) data for a token pair.
/// API Endpoint: https://asia-southeast1-ktx-finance-2.cloudfunctions.net/sailor_kline_api/smart_kline/{token0}/{token1}
pub async fn get_kline_data(token0_symbol: &str, token1_symbol: &str, interval: &str, limit: u32) -> Result<KlineResponse, Box<dyn Error>> {
    let url = format!(
        "https://asia-southeast1-ktx-finance-2.cloudfunctions.net/sailor_kline_api/smart_kline/{}/{}?interval={}&limit={}",
        token0_symbol.to_lowercase(),
        token1_symbol.to_lowercase(),
        interval,
        limit
    );
    let kline_data: KlineResponse = reqwest::get(&url).await?.json().await?;
    Ok(kline_data)
}

/// Fetches the active liquidity distribution for a given pool address.
/// API Endpoint: https://asia-southeast1-ktx-finance-2.cloudfunctions.net/sailor_poolapi/getActiveLiquidity
pub async fn get_active_liquidity(pool_address: &str) -> Result<ActiveLiquidityResponse, Box<dyn Error>> {
    let url = format!("https://asia-southeast1-ktx-finance-2.cloudfunctions.net/sailor_poolapi/getActiveLiquidity?address={}", pool_address);
    let liquidity_data: ActiveLiquidityResponse = reqwest::get(&url).await?.json().await?;
    Ok(liquidity_data)
}


/// Fetches historical data and calculates the optimal concentrated liquidity range in ticks.
pub async fn get_optimal_liquidity_range(
    token0: &Token,
    token1: &Token,
) -> Result<(i32, i32), Box<dyn Error>> {
    // Fetch k-line data for the last 30 15-minute intervals
    let kline_data = get_kline_data(&token0.symbol, &token1.symbol, "15", 30).await?;
    
    // Calculate price range from the k-line data's high and low points
    let (lower_price, upper_price) = calculate_price_range_from_kline(&kline_data.data);

    // Convert prices to ticks
    let lower_tick = price1_to_tick(lower_price, token0.get_decimals(), token1.get_decimals());
    let upper_tick = price1_to_tick(upper_price, token0.get_decimals(), token1.get_decimals());

    // Align ticks to a standard spacing (e.g., 60 for a 0.3% fee tier)
    let tick_spacing = 60; 
    let aligned_lower_tick = align_to_tick_spacing(lower_tick, tick_spacing);
    let aligned_upper_tick = align_to_tick_spacing(upper_tick, tick_spacing);

    Ok((aligned_lower_tick, aligned_upper_tick))
}

// --- Private Helper Functions ---

/// Calculates the price range (lower and upper bounds) from K-line data.
/// It uses the lowest low and the highest high from the candlestick data.
fn calculate_price_range_from_kline(data: &Vec<Vec<f64>>) -> (f64, f64) {
    if data.is_empty() {
        return (0.0, 0.0);
    }

    // Initialize with the first data point's low and high
    // k-line format: [timestamp, open, high, low, close, volume]
    let mut min_price = data[0][3]; // Index 3 is the low price
    let mut max_price = data[0][2]; // Index 2 is the high price

    for point in data.iter().skip(1) {
        let low = point[3];
        let high = point[2];
        if low < min_price {
            min_price = low;
        }
        if high > max_price {
            max_price = high;
        }
    }

    (min_price, max_price)
}
