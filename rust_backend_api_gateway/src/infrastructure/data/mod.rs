// mod.rs - UPDATED to use domain trait
pub mod binance_data_provider;
pub mod dragonswap_data_provider;
pub mod sailor_data_provider;

use crate::domain::repositories::data_provider::DataProvider;
use binance_data_provider::BinanceDataProvider;
use dragonswap_data_provider::DragonSwapDataProvider;
use sailor_data_provider::SailorDataProvider;

pub fn get_data_provider(wallet_type: &str) -> Option<Box<dyn DataProvider>> {
    match wallet_type {
        "binance" => Some(Box::new(BinanceDataProvider::new())),
        "dragonswap" => Some(Box::new(DragonSwapDataProvider::new())),
        "sailor" => Some(Box::new(SailorDataProvider::new())),
        _ => None,
    }
}
