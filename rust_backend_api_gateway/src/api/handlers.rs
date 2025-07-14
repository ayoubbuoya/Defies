use actix_web::{post, web, HttpResponse, Responder};
use crate::api::models::{AuthRequest, AuthResponse};
use crate::service::auth_service::handle_auth;

#[post("/verify")]
pub async fn verify_signature(data: web::Json<AuthRequest>) -> impl Responder {
    match handle_auth(data.into_inner()) {
        Ok(token) => HttpResponse::Ok().json(AuthResponse { token }),
        Err(err) => err,
    }
}
