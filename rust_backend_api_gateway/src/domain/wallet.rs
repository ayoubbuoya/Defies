use actix_web::HttpResponse;
use crate::api::models::AuthRequest;

pub trait WalletVerifier {
    fn verify(&self, data: &AuthRequest) -> Result<(), HttpResponse>;
}