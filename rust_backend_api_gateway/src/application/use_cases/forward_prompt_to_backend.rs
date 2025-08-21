use crate::application::dtos::ask::{NodeJsRequest, NodeJsResponse};
use reqwest;
use std::error::Error;

/// Sends a prompt to the Node.js backend and returns the response as-is.
pub async fn forward_prompt_to_backend(
    prompt: &str,
    address: &str,
    nodejs_backend_url: &str,
) -> Result<NodeJsResponse, Box<dyn Error>> {
    let client = reqwest::Client::new();

    let request_body = NodeJsRequest { prompt, address };

    println!("🚀 Sending request to Node.js backend:");
    println!("   URL: {}", nodejs_backend_url);
    println!("   Prompt: {}", prompt);
    println!("   Address: {}", address);

    let response = client
        .post(nodejs_backend_url)
        .json(&request_body)
        .send()
        .await?;

    let status = response.status();
    println!("📥 Received response with status: {}", status);

    if response.status().is_success() {
        let response_text = response.text().await?;
        println!("📋 Raw response body: {}", response_text);

        let nodejs_response: NodeJsResponse =
            serde_json::from_str(&response_text).map_err(|e| {
                format!(
                    "Failed to parse JSON response: {}. Raw response: {}",
                    e, response_text
                )
            })?;

        println!("✅ Response forwarded successfully");
        Ok(nodejs_response)
    } else {
        let error_text = response
            .text()
            .await
            .unwrap_or_else(|_| "Unknown error".to_string());
        let err_msg = format!(
            "Node.js backend request failed with status {}: {}",
            status, error_text
        );
        println!("❌ Error response: {}", err_msg);
        Err(err_msg.into())
    }
}
