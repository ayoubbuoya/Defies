use serde::{Deserialize, Serialize};
use reqwest;
use std::error::Error;

// --- Public Structs ---

/// Represents the request body to be sent to the JS backend.
#[derive(Debug, Serialize)]
struct PromptRequest<'a> {
    prompt: &'a str,
}

/// Represents the expected response from the JS backend.
/// This can be customized to match the actual response structure.
#[derive(Debug, Serialize, Deserialize)]
pub struct LLMResponse {
    pub response_text: String,
    // Add any other fields you expect from the JS backend
}

// --- Public Service Function ---

/// Sends a prompt to the JavaScript backend and returns the LLM's response.
///
/// # Arguments
///
/// * `prompt` - The user's text prompt.
/// * `js_backend_url` - The URL of your Node.js service that handles the LLM communication.
pub async fn forward_prompt_to_backend(
    prompt: &str,
    js_backend_url: &str,
) -> Result<LLMResponse, Box<dyn Error>> {
    let client = reqwest::Client::new();
    let request_body = PromptRequest { prompt };

    let response = client
        .post(js_backend_url)
        .json(&request_body)
        .send()
        .await?;

    if response.status().is_success() {
        let llm_response: LLMResponse = response.json().await?;
        Ok(llm_response)
    } else {
        // Create an error from the non-successful status code
        let err_msg = format!("Backend request failed with status: {}", response.status());
        Err(err_msg.into())
    }
}
