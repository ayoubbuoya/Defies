use std::env;

pub fn jwt_secret() -> String {
    env::var("JWT_SECRET").unwrap_or_else(|_| "dev-secret".to_string())
}

pub fn binance_api_base_url() -> String {
    env::var("BINANCE_API_BASE_URL")
        .unwrap_or_else(|_| "https://api.binance.com/api/v3".to_string())
}

pub fn mcp_client_base_url() -> String {
    env::var("MCP_CLIENT_BASE_URL").unwrap_or_else(|_| "http://localhost:5001/".to_string())
}

pub fn dragonswap_api_base_url() -> String {
    env::var("DRAGONSWAP_API_BASE_URL")
        .unwrap_or_else(|_| "https://sei-api.dragonswap.app/api/v1".to_string())
}

pub fn sailor_api_base_url() -> String {
    env::var("SAILOR_API_BASE_URL")
        .unwrap_or_else(|_| "https://asia-southeast1-ktx-finance-2.cloudfunctions.net".to_string())
}
