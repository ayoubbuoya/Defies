use serde::{Deserialize, Serialize};

#[derive(Deserialize)]
pub struct PromptRequest {
    pub prompt: String,
    pub address: String,
}

/// Represents the request body to be sent to the Node.js backend.
#[derive(Debug, Serialize)]
pub struct NodeJsRequest<'a> {
    pub prompt: &'a str,
    pub address: &'a str,
}

/// Represents the expected response from the Node.js backend.
#[derive(Debug, Serialize, Deserialize)]
pub struct NodeJsResponse {
    pub answer: serde_json::Value, // Changed to Value to handle both string and object
}
