use crate::application::dtos::auth::AuthRequest;
use actix_web::HttpResponse;

pub trait WalletVerifier {
    fn verify(&self, data: &AuthRequest) -> Result<(), HttpResponse>;
}
