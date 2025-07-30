use crate::domain::jwt::JwtEncoder;
use crate::infrastructure::jwt::Hs256Jwt;
use crate::infrastructure::wallet::get_verifier;
use crate::models::auth::AuthRequest;
use actix_web::HttpResponse;

pub fn handle_auth(data: AuthRequest) -> Result<String, HttpResponse> {
    let verifier = get_verifier(&data.wallet_type)
        .ok_or_else(|| HttpResponse::BadRequest().body("Unsupported wallet type"))?;

    verifier.verify(&data)?;

    Hs256Jwt
        .encode(&data.address)
        .map_err(|_| HttpResponse::InternalServerError().body("Token generation failed"))
}
