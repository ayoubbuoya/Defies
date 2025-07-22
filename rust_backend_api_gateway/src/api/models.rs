use serde::{Deserialize, Serialize};

// --- Existing Auth Models ---

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
