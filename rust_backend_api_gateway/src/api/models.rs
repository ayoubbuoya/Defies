use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc};

#[derive(Deserialize)]
pub struct AuthRequest {
    pub address: String,
    pub message: String,
    pub signature: String,
    pub wallet_type: String,
    pub pub_key: Option<String>,
}

#[derive(Serialize)]
pub struct AuthResponse {
    pub token: String,
}

// --- New Graph Data Models ---

/// Deserializes the query parameters from the /graph-data endpoint.
#[derive(Deserialize)]
pub struct GraphDataQuery {
    #[serde(rename = "type")]
    pub graph_type: String, // "liquidity" or "candles"
    pub pool_address: Option<String>,
    pub token0: Option<String>,
    pub token1: Option<String>,
    pub interval: Option<String>,
    pub limit: Option<u32>,
}

// --- New Prompt Pipeline Models ---

/// Deserializes the JSON body for a prompt request.
#[derive(Deserialize)]
pub struct PromptRequest {
    pub prompt: String,
}

/// Serializes the response from the LLM service.
#[derive(Serialize)]
pub struct PromptResponse {
    pub response_text: String,
}



#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PricePoint {
    pub tick: i64,
    pub open: f64,
    pub high: f64,
    pub low: f64,
    pub close: f64,
    pub volume: Option<f64>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct PriceRange {
    pub min: f64,
    pub max: f64,
    pub average: f64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct VolatilityInfo {
    pub value: f64,
    pub percentage: f64,
    pub level: String, // LOW, MEDIUM, HIGH
}

#[derive(Debug, Serialize, Deserialize)]
pub struct PoolInfo {
    pub pool_id: Option<String>,
    pub tvl: Option<f64>,
    pub fee_tier: Option<f64>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct RecentPrice {
    pub price: f64,
    pub high: f64,
    pub low: f64,
    pub timestamp: i64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct RecommendationContext {
    pub center_price: f64,
    pub suggested_range_width_percent: f64,
    pub trend: String, // UPWARD, DOWNWARD, SIDEWAYS
}

#[derive(Debug, Serialize, Deserialize)]
pub struct PriceHistoryResponse {
    pub pair: String,
    pub price_range: PriceRange,
    pub volatility: VolatilityInfo,
    pub data_points: usize,
    pub interval_minutes: u32,
    pub pool_info: Option<PoolInfo>,
    pub recent_prices: Vec<RecentPrice>,
    pub recommendation_context: RecommendationContext,
}

#[derive(Debug, Deserialize)]
pub struct PriceHistoryRequest {
    pub token0: String,
    pub token1: String,
    pub interval: Option<u32>,
    pub limit: Option<u32>,
}