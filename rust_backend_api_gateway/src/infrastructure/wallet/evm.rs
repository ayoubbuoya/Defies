use actix_web::HttpResponse;
use ethers::types::Signature as EvmSignature;
use ethers::utils::keccak256;

use crate::application::dtos::auth::AuthRequest;
use crate::domain::repositories::wallet::WalletVerifier;

pub struct EvmVerifier;

impl WalletVerifier for EvmVerifier {
    fn verify(&self, data: &AuthRequest) -> Result<(), HttpResponse> {
        // 1. Normalize and trim message
        let raw = data.message.replace("\r\n", "\n").trim().to_string();

        // 2. Ethereum signed message prefix
        let prefixed = format!("\x19Ethereum Signed Message:\n{}{}", raw.len(), raw);
        let hash = keccak256(prefixed);

        // 3. Parse signature
        let sig = data
            .signature
            .parse::<EvmSignature>()
            .map_err(|_| HttpResponse::BadRequest().body("Invalid signature format"))?;

        // 4. Recover signer address
        let recovered_address = sig
            .recover(hash)
            .map_err(|_| HttpResponse::Unauthorized().body("Signature verification failed"))?;

        // 5. Normalize and trim submitted address
        let submitted = data.address.to_string().trim().to_lowercase();
        // Use format! with :x to get full hex representation
        let recovered = format!("0x{:x}", recovered_address).trim().to_lowercase();

        // 6. Compare
        if recovered != submitted {
            return Err(HttpResponse::Unauthorized().body("Address mismatch"));
        }

        Ok(())
    }
}
