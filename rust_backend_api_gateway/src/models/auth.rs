use serde::{Deserialize, Serialize};

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
