use futures::future;
use reqwest::header::USER_AGENT;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::error::Error;

// --- Unified Data Structure ---
// This is the canonical struct that we will return to the API caller.
// It combines the most important fields from both data sources.
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

// --- Structs for Sailor Finance API ---
// (These are your existing structs, kept for the first API call)
#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SailorPoolListResponse {
    pub status: String,
    pub daily_protocol_tvl: Option<SailorDailyProtocolTvl>,
    pub pool_stats: Vec<SailorPoolStats>,
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

// --- Structs for DragonSwap API ---
// (These are new structs to handle the second API call)
#[derive(Debug, Serialize, Deserialize)]
pub struct DragonSwapResponse {
    pub status: String,
    pub tokens: Vec<DragonSwapToken>,
    pub pools: Vec<DragonSwapPool>,
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

// --- Main Service Function ---

/// Fetches pool lists from both Sailor and DragonSwap, merges them, and returns a unified list.
pub async fn get_pool_list() -> Result<Vec<UnifiedPool>, Box<dyn Error>> {
    let sailor_url =
        "https://asia-southeast1-ktx-finance-2.cloudfunctions.net/sailor_poolapi/getPoolList";
    let dragonswap_url = "https://sei-api.dragonswap.app/api/v1/pools";

    // Create a single reqwest client to reuse connections and set a user agent.
    let client = reqwest::Client::new();

    // Define a common browser User-Agent string.
    let browser_user_agent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36";

    // Prepare both API requests. The DragonSwap request now includes the User-Agent header.
    let sailor_request = client.get(sailor_url).send();
    let dragonswap_request = client
        .get(dragonswap_url)
        .header(USER_AGENT, browser_user_agent) // This is the key fix
        .send();

    // Use `futures::future::join` to fetch data concurrently.
    let (sailor_result, dragonswap_result) = future::join(sailor_request, dragonswap_request).await;

    let mut unified_pools: Vec<UnifiedPool> = Vec::new();

    // --- Process Sailor Finance Data ---
    match sailor_result {
        Ok(response) => {
            if response.status().is_success() {
                match response.json::<SailorPoolListResponse>().await {
                    Ok(sailor_data) => {
                        let transformed = sailor_data
                            .pool_stats
                            .into_iter()
                            .map(transform_sailor_pool)
                            .filter(|pool| pool.daily_volume.unwrap_or(0.0) > 1000.0);

                        unified_pools.extend(transformed);
                    }
                    Err(e) => eprintln!("Failed to parse Sailor JSON: {}", e),
                }
            } else {
                eprintln!(
                    "Sailor API request failed with status: {}",
                    response.status()
                );
            }
        }
        Err(e) => eprintln!("Sailor API request failed: {}", e),
    }

    // --- Process DragonSwap Data ---
    match dragonswap_result {
        Ok(response) => {
            if response.status().is_success() {
                match response.json::<DragonSwapResponse>().await {
                    Ok(dragonswap_data) => {
                        let token_map: HashMap<String, DragonSwapToken> = dragonswap_data
                            .tokens
                            .into_iter()
                            .map(|token| (token.address.clone(), token))
                            .collect();

                        let transformed = dragonswap_data
                            .pools
                            .into_iter()
                            .filter(|pool| pool.pool_type == "V3_POOL") // only take V3 pools
                            .filter_map(|pool| transform_dragonswap_pool(pool, &token_map))
                            .filter(|pool| pool.daily_volume.unwrap_or(0.0) > 1000.0);

                        unified_pools.extend(transformed);
                    }
                    Err(e) => eprintln!("Failed to parse DragonSwap JSON: {}", e),
                }
            } else {
                eprintln!(
                    "DragonSwap API request failed with status: {} | Text: {:?}",
                    response.status(),
                    response.text().await
                );
            }
        }
        Err(e) => eprintln!("DragonSwap API request failed: {}", e),
    }

    Ok(unified_pools)
}

// --- Transformation Functions ---

/// Converts a pool from the Sailor Finance format to our unified format.
fn transform_sailor_pool(pool: SailorPoolStats) -> UnifiedPool {
    let fee_tier = match pool.fee_tier.parse::<f64>() {
        Ok(value) => (value / 10000.0).to_string(),
        Err(_) => "N/A".to_string(), // fallback if parsing fails
    };

    UnifiedPool {
        id: pool.id,
        protocol: "Sailor".to_string(),
        token0_symbol: pool.token0.symbol,
        token1_symbol: pool.token1.symbol,
        tvl: pool.tvl,
        daily_volume: pool.day.volume,
        apr: pool.boost_apr, // Using boost_apr as the primary APR source from Sailor
        fee_tier,
    }
}

/// Converts a pool from the DragonSwap format to our unified format.
/// Returns an `Option` so we can easily skip pools if token data is missing.
fn transform_dragonswap_pool(
    pool: DragonSwapPool,
    token_map: &HashMap<String, DragonSwapToken>,
) -> Option<UnifiedPool> {
    // Find the token details in our HashMap. If either token isn't found, we can't proceed.
    let token0 = token_map.get(&pool.token0_address)?;
    let token1 = token_map.get(&pool.token1_address)?;

    Some(UnifiedPool {
        id: pool.pool_address,
        protocol: "DragonSwap".to_string(),
        token0_symbol: token0.symbol.clone(),
        token1_symbol: token1.symbol.clone(),
        tvl: pool.liquidity, // DragonSwap API does not provide TVL per pool directly
        daily_volume: pool.daily_volume,
        apr: pool.apr,
        fee_tier: pool
            .fee_tier
            .map(|f| f.to_string())
            .unwrap_or_else(|| "unknown".to_string()),
    })
}
