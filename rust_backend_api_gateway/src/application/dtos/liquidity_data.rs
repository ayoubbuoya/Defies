use serde::{Deserialize, Serialize};

#[derive(Deserialize)]
pub struct LiquidityDataQuery {
    pub pool_address: String,
}
