use serde::{Deserialize, Serialize};

// Represents the request body received by the Rust backend
#[derive(Debug, Deserialize)]
pub struct PromptRequest {
    pub prompt: String,
    pub address: String,
}
