use serde::{Deserialize, Serialize};

#[derive(Deserialize)]
pub struct LiquidityDataQuery {
    pub pool_address: String,
}

#[derive(Deserialize)]
pub struct PromptRequest {
    pub prompt: String,
    pub address: String,
}

#[derive(Serialize)]
pub struct PromptResponse {
    pub response_text: String,
}
