use std::env;

pub fn jwt_secret() -> String {
    env::var("JWT_SECRET").unwrap_or_else(|_| "dev-secret".to_string())
}

pub fn price_fetch_api_base_url() -> String {
    env::var("PRICE_FETCH_API_BASE_URL")
        .unwrap_or_else(|_| "https://api.binance.com/api/v3".to_string())
}
