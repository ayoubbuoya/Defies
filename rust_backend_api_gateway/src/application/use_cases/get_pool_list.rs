use crate::domain::repositories::dex_provider::DexProvider;
use crate::{
    domain::services::data::UnifiedPool,
    infrastructure::data::{
        dragonswap_data_provider::DragonSwapDataProvider, sailor_data_provider::SailorDataProvider,
    },
};
use std::error::Error;

pub async fn get_pool_list() -> Result<Vec<UnifiedPool>, Box<dyn Error>> {
    let dragonswap_data_provider = DragonSwapDataProvider::new();
    let sailor_data_provider = SailorDataProvider::new();

    let dragonswap_pools = dragonswap_data_provider.get_pool_list().await?;
    let sailor_pools = sailor_data_provider.get_pool_list().await?;

    let mut all_pools = Vec::new();
    all_pools.extend(dragonswap_pools);
    all_pools.extend(sailor_pools);

    Ok(all_pools)
}
