mod evm;

use crate::domain::repositories::wallet::WalletVerifier;
use evm::EvmVerifier;

pub fn get_verifier(wallet_type: &str) -> Option<Box<dyn WalletVerifier>> {
    match wallet_type {
        "metamask" => Some(Box::new(EvmVerifier)),
        _ => None,
    }
}
