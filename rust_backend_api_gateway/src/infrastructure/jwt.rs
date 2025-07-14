use chrono::{Utc, Duration};
use jsonwebtoken::{encode, EncodingKey, Header};
use serde::Serialize;
use crate::config;
use crate::domain::jwt::JwtEncoder;

#[derive(Serialize)]
pub struct Claims {
    pub sub: String,
    pub exp: usize,
}

pub struct Hs256Jwt;

impl JwtEncoder for Hs256Jwt {
    fn encode(&self, subject: &str) -> Result<String, String> {
        let exp = Utc::now()
            .checked_add_signed(Duration::hours(2))
            .unwrap()
            .timestamp() as usize;

        let claims = Claims {
            sub: subject.to_string(),
            exp,
        };

        encode(&Header::default(), &claims, &EncodingKey::from_secret(config::jwt_secret().as_bytes()))
            .map_err(|_| "JWT encode failed".to_string())
    }
}
