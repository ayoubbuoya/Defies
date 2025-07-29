use actix_web::{HttpResponse, ResponseError};
use serde_json::json;
use std::fmt;
use thiserror::Error;

#[derive(Debug, Error)]
pub enum ApiError {
    #[error("Invalid input: {0}")]
    InvalidInput(String),
    
    #[error("Service error: {0}")]
    ServiceError(String),
    
    #[error("External API error: {0}")]
    ExternalApiError(String),
    
    #[error("Internal server error")]
    InternalError,
}

impl ResponseError for ApiError {
    fn error_response(&self) -> HttpResponse {
        match self {
            ApiError::InvalidInput(msg) => HttpResponse::BadRequest().json(json!({
                "error": "Invalid input",
                "message": msg
            })),
            ApiError::ServiceError(msg) => HttpResponse::InternalServerError().json(json!({
                "error": "Service error",
                "message": msg
            })),
            ApiError::ExternalApiError(msg) => HttpResponse::BadGateway().json(json!({
                "error": "External API error",
                "message": msg
            })),
            ApiError::InternalError => HttpResponse::InternalServerError().json(json!({
                "error": "Internal server error"
            })),
        }
    }
}