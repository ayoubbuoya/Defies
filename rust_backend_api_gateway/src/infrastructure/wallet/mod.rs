mod evm;
mod cosmos;

use crate::domain::wallet::WalletVerifier;
use evm::EvmVerifier;
use cosmos::CosmosVerifier;

pub fn get_verifier(wallet_type: &str) -> Option<Box<dyn WalletVerifier>> {
    match wallet_type {
        "metamask" => Some(Box::new(EvmVerifier)),
        "keplr" | "leap" | "compass" => Some(Box::new(CosmosVerifier)),
        _ => None,
    }
}