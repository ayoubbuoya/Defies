use crate::math::math::{align_to_tick_spacing, price1_to_tick};
use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::error::Error;
use std::fmt;

// --- Custom Error for Better Debugging ---
#[derive(Debug)]
struct ApiError {
    message: String,
}

impl fmt::Display for ApiError {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(f, "{}", self.message)
    }
}

impl Error for ApiError {}

// --- API Response Structs ---

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Token {
    pub id: String,
    pub name: String,
    pub symbol: String,
    pub url: String,
    pub decimals: Value,
    pub verified: bool,
}

impl Token {
    pub fn get_decimals(&self) -> u8 {
        match &self.decimals {
            Value::String(s) => s.parse().unwrap_or(18),
            Value::Number(n) => n.as_u64().unwrap_or(18) as u8,
            _ => 18,
        }
    }
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Price {
    pub symbol: String,
    pub price: Value,
    pub id: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct KlineResponse {
    pub success: bool,
    pub data: Vec<Vec<f64>>,
}

#[derive(Debug, Serialize, Deserialize, Clone, Default)]
pub struct LiquidityTick {
    pub tick_idx: String,
    pub liquidity_net: String,
    pub price0: String,
    pub price1: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ActiveLiquidity {
    pub tick: String,
    pub price: f64,
    pub liquidity: String,
}

#[derive(Debug, Serialize, Deserialize, Default)]
pub struct ActiveLiquidityResponse {
    #[serde(default)]
    pub status: String,
    #[serde(default)]
    pub active_liquidity: Vec<ActiveLiquidity>,
    #[serde(default)]
    pub data: Vec<LiquidityTick>,
}

// --- Public Service Functions ---

/// Creates a reqwest client with a standard User-Agent header.
fn create_client() -> Result<reqwest::Client, reqwest::Error> {
    reqwest::Client::builder()
        .user_agent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36")
        .build()
}

pub async fn get_token_list() -> Result<Vec<Token>, Box<dyn Error>> {
    let client = create_client()?;
    let url = "https://asia-southeast1-ktx-finance-2.cloudfunctions.net/sailor_poolapi/getTokenListV2";
    let tokens: Vec<Token> = client.get(url).send().await?.json().await?;
    Ok(tokens)
}

pub async fn get_price_list(token_addresses: Vec<&str>) -> Result<Vec<Price>, Box<dyn Error>> {
    let client = create_client()?;
    let addresses = token_addresses.join(",");
    let url = format!("https://asia-southeast1-ktx-finance-2.cloudfunctions.net/sailor_poolapi/getPriceList?tokens={}", addresses);
    let prices: Vec<Price> = client.get(&url).send().await?.json().await?;
    Ok(prices)
}

pub async fn get_kline_data(token0_symbol: &str, token1_symbol: &str, interval: &str, limit: u32) -> Result<KlineResponse, Box<dyn Error>> {
    let client = create_client()?;
    let url = format!(
        "https://asia-southeast1-ktx-finance-2.cloudfunctions.net/sailor_kline_api/smart_kline/{}/{}?interval={}&limit={}",
        token0_symbol.to_lowercase(),
        token1_symbol.to_lowercase(),
        interval,
        limit
    );
    let kline_data: KlineResponse = client.get(&url).send().await?.json().await?;
    Ok(kline_data)
}

pub async fn get_active_liquidity(pool_address: &str) -> Result<ActiveLiquidityResponse, Box<dyn Error>> {
    let client = create_client()?;
    let url = format!("https://asia-southeast1-ktx-finance-2.cloudfunctions.net/sailor_poolapi/getActiveLiquidity?address={}", pool_address);
    let response = client.get(&url).send().await?.error_for_status()?;
    let body_text = response.text().await?;
    
    let liquidity_data: ActiveLiquidityResponse = serde_json::from_str(&body_text)
        .map_err(|e| -> Box<dyn Error> {
            Box::new(ApiError {
                message: format!("Failed to parse API response. Error: {}. Raw Body: {}", e, body_text),
            })
        })?;

    Ok(liquidity_data)
}

pub async fn get_optimal_liquidity_range(
    token0: &Token,
    token1: &Token,
) -> Result<(i32, i32), Box<dyn Error>> {
    let kline_data = get_kline_data(&token0.symbol, &token1.symbol, "15", 30).await?;
    let (lower_price, upper_price) = calculate_price_range_from_kline(&kline_data.data);
    let lower_tick = price1_to_tick(lower_price, token0.get_decimals(), token1.get_decimals());
    let upper_tick = price1_to_tick(upper_price, token0.get_decimals(), token1.get_decimals());
    let tick_spacing = 60; 
    let aligned_lower_tick = align_to_tick_spacing(lower_tick, tick_spacing);
    let aligned_upper_tick = align_to_tick_spacing(upper_tick, tick_spacing);
    Ok((aligned_lower_tick, aligned_upper_tick))
}

fn calculate_price_range_from_kline(data: &Vec<Vec<f64>>) -> (f64, f64) {
    if data.is_empty() {
        return (0.0, 0.0);
    }
    let mut min_price = data[0][3];
    let mut max_price = data[0][2];
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