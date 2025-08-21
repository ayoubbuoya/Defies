use crate::{
    domain::services::data::Token,
    infrastructure::data::dragonswap_data_provider::DragonSwapDataProvider,
};
use std::error::Error;

pub async fn get_token_symbol(address: &str) -> Result<Token, Box<dyn Error>> {
    let dragonswap_data_provider = DragonSwapDataProvider::new();
    let token_symbol = dragonswap_data_provider
        .transform_token_address_to_symbol(address)
        .await?;
    Ok(token_symbol)
}
