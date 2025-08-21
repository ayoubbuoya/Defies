use serde::{Deserialize, Serialize};

#[derive(Deserialize)]
pub struct PromptRequest {
    pub prompt: String,
    pub address: String,
}
