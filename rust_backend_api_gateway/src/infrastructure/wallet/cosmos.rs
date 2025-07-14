use actix_web::HttpResponse;
use base64::engine::general_purpose;
use base64::Engine as _;
use k256::{ecdsa::VerifyingKey, ecdsa::Signature as KSignature, ecdsa::signature::Verifier};
use sha2::{Sha256, Digest};
use crate::api::models::AuthRequest;
use crate::domain::wallet::WalletVerifier;

pub struct CosmosVerifier;

impl WalletVerifier for CosmosVerifier {
    fn verify(&self, data: &AuthRequest) -> Result<(), HttpResponse> {
        let pub_key = data.pub_key.as_ref()
            .ok_or_else(|| HttpResponse::BadRequest().body("Missing pub_key"))?;

        let pub_key_bytes = general_purpose::STANDARD
            .decode(pub_key)
            .map_err(|_| HttpResponse::BadRequest().body("Invalid pub_key"))?;

        let sig_bytes = general_purpose::STANDARD
            .decode(&data.signature)
            .map_err(|_| HttpResponse::BadRequest().body("Invalid signature"))?;

        let hash = Sha256::digest(data.message.as_bytes());

        let vk = VerifyingKey::from_sec1_bytes(&pub_key_bytes)
            .map_err(|_| HttpResponse::Unauthorized().body("Invalid public key"))?;

        let sig = KSignature::from_der(&sig_bytes)
            .map_err(|_| HttpResponse::Unauthorized().body("Invalid signature format"))?;

        vk.verify(&hash, &sig)
            .map_err(|_| HttpResponse::Unauthorized().body("Signature verification failed"))?;

        Ok(())
    }
}