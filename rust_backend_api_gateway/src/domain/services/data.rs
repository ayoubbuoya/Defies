use serde::{Deserialize, Serialize};

#[derive(Deserialize, Debug)]
pub struct DragonSwapTick {
    #[serde(rename = "tickIdx")]
    pub tick_idx: String,
    #[serde(rename = "liquidityNet")]
    pub liquidity_net: String,
    pub price0: String,
    pub price1: String,
    #[serde(rename = "poolAddress")]
    pub pool_address: String,
}

#[derive(Deserialize, Debug)]
pub struct DragonSwapTicksData {
    pub ticks: Vec<DragonSwapTick>,
}

#[derive(Deserialize, Debug)]
pub struct DragonSwapTicksResponse {
    pub data: DragonSwapTicksData,
}

#[derive(Debug, Serialize, Deserialize, Clone, Default)]
pub struct LiquidityTick {
    pub tick_idx: String,
    pub liquidity_net: String,
    pub price0: String,
    pub price1: String,
}

type KlineData = (i64, f64, f64, f64, f64, f64);

#[derive(Debug, Deserialize, Serialize)]
pub struct KlineResponse {
    pub success: bool,
    pub data: Vec<KlineData>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct UnifiedPool {
    pub id: String,
    pub protocol: String,
    pub token0_symbol: String,
    pub token1_symbol: String,
    pub tvl: Option<f64>,
    pub daily_volume: Option<f64>,
    pub apr: Option<f64>,
    pub fee_tier: String,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SailorPoolStats {
    pub chain: String,
    pub fee_tier: String,
    pub id: String,
    pub protocol_version: String,
    pub total_liquidity: SailorTotalLiquidity,
    pub tx_count: String,
    pub day: SailorTimePeriodStats,
    pub week: SailorTimePeriodStats,
    pub month: SailorTimePeriodStats,
    pub boost_apr: Option<f64>,
    pub tvl: Option<f64>,
    pub token0: SailorTokenInfo,
    pub token1: SailorTokenInfo,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SailorDailyProtocolTvl {
    pub v3: SailorV3Tvl,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SailorV3Tvl {
    pub timestamp_at_midnight: Option<f64>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SailorTotalLiquidity {
    pub value: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SailorTimePeriodStats {
    pub volume: Option<f64>,
    pub max_price: Option<f64>,
    pub min_price: Option<f64>,
    pub price: Option<f64>,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SailorTokenInfo {
    pub id: String,
    pub symbol: String,
    pub name: String,
    pub decimals: String,

    #[serde(alias = "token0Price", alias = "token1Price")]
    pub price: Option<String>,

    pub url: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct DragonSwapToken {
    pub address: String,
    pub name: String,
    pub symbol: String,
    pub usd_price: Option<f64>,
    pub decimals: i64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct DragonSwapPool {
    pub pool_address: String,
    pub token0_address: String,
    pub token1_address: String,
    pub daily_volume: Option<f64>,
    pub liquidity: Option<f64>,
    #[serde(rename = "type")]
    pub pool_type: String,
    pub fee_tier: Option<f64>,
    pub apr: Option<f64>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct DragonSwapResponse {
    pub status: String,
    pub tokens: Vec<DragonSwapToken>,
    pub pools: Vec<DragonSwapPool>,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SailorPoolListResponse {
    pub status: String,
    pub daily_protocol_tvl: Option<SailorDailyProtocolTvl>,
    pub pool_stats: Vec<SailorPoolStats>,
}
