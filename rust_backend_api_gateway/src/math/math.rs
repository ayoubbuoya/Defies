// src/math/math.rs

// REMOVE `utils::format_units` as it's no longer used here.
use alloy::primitives::{U160, U256}; // Keep U160 and U256
use eyre::{Context, Result};

/// Calculates the price of token1 in terms of token0 for concentrated liquidity.
///
/// This function takes a `sqrt_price_x96` (which is sqrt(Price_B_in_A) * 2^96)
/// and converts it into a human-readable `f64` price.
///
/// Args:
/// - `sqrt_price_x96`: The Uniswap V3 square root price, a U160 value scaled by 2^96.
/// - `a_token_decimals`: The number of decimal places for token A (token0 in Uniswap context).
/// - `b_token_decimals`: The number of decimal places for token B (token1 in Uniswap context).
///
/// Returns:
/// - `Result<f64>`: The calculated price as an f64, or an error if conversion fails.
///
/// Note: This uses `f64` for the final price calculation, which may introduce
/// floating-point precision limitations compared to arbitrary-precision libraries.
pub fn calculate_concentrated_liq_token1_price(
    sqrt_price_x96: U160,
    a_token_decimals: u8,
    b_token_decimals: u8,
) -> Result<f64> {
    // Define 2^96 as a U256 for calculations.
    // ADD TYPE ANNOTATION HERE: U256::from(1u128) or just `U256::from(1)` and let Rust infer,
    // but the `(1) << 96` needs the type hint. U256::from(1) is ambiguous,
    // but when combined with the shift, the type needs to be clear.
    // The U256::from(1) already gives a U256. The shift operator for U256 is defined for U256.
    // The previous error was a bit misleading from the compiler; it's more about the `1`'s type
    // before it's converted to U256 and shifted.
    // Let's explicitly cast the 1 to U256.
    let q96: U256 = U256::from(1) << 96; // Explicit type annotation added.

    // Convert U160 sqrt_price_x96 and U256 q96 to f64 for the calculation.
    // This is where precision from arbitrary-precision types is lost,
    // but it simplifies the math significantly.
    let sqrt_price_x96_f64 = sqrt_price_x96.to_string().parse::<f64>()
        .context("Failed to parse U160 sqrt_price_x96 to f64")?;
    let q96_f64 = q96.to_string().parse::<f64>()
        .context("Failed to parse Q96 constant to f64")?;

    // Calculate the raw price: price = (sqrt_price_x96 / 2^96)^2
    // This gives the price in terms of raw token amounts, without considering decimals.
    let raw_price_f64 = (sqrt_price_x96_f64 / q96_f64).powi(2);

    // Adjust the price based on the token decimals.
    // If token A has 18 decimals and token B has 6 decimals,
    // a price of 1 means 1 unit of A for 1 unit of B.
    // But since A is "larger" by 12 decimals, the numerical price needs to reflect this.
    // Price_B_in_A = (Amount_A / 10^A_decimals) / (Amount_B / 10^B_decimals)
    //              = (Amount_A / Amount_B) * 10^(B_decimals - A_decimals)
    // So, we multiply the raw price by 10^(A_decimals - B_decimals) to get the true price.
    let decimal_adjustment_factor = 10_f64.powi(a_token_decimals as i32 - b_token_decimals as i32);

    let final_price_f64 = raw_price_f64 * decimal_adjustment_factor;

    Ok(final_price_f64)
}

/// Aligns a tick to the nearest valid tick that is a multiple of the spacing.
///
/// This is commonly used in Uniswap V3 to ensure liquidity is provided at valid tick boundaries.
///
/// Args:
/// - `tick`: The unaligned tick value.
/// - `spacing`: The tick spacing (e.g., 1, 10, 60, 200).
///
/// Returns:
/// - `i32`: The aligned tick value.
pub fn align_to_tick_spacing(tick: i32, spacing: i32) -> i32 {
    let remainder = tick % spacing;
    if remainder.abs() * 2 >= spacing {
        if tick > 0 {
            tick - remainder + spacing
        } else {
            tick - remainder - spacing
        }
    } else {
        tick - remainder
    }
}

/// Converts a human-readable price to a Uniswap V3 tick.
///
/// Args:
/// - `price`: The human-readable price (e.g., 1.23 USD per ETH).
/// - `token0_decimals`: The number of decimal places for token0.
/// - `token1_decimals`: The number of decimal places for token1.
///
/// Returns:
/// - `i32`: The calculated tick.
///
/// Note: This uses `f64` for the calculation, which may introduce
/// floating-point precision limitations for very large or very small prices.
pub fn price1_to_tick(price: f64, token0_decimals: u8, token1_decimals: u8) -> i32 {
    // Adjust the price to its raw form, relative to 1:1 token amounts
    // (undoing the decimal adjustment that happens for human readability).
    // This is crucial because Uniswap V3 ticks are based on raw price.
    let diff_decimals = (token0_decimals as i32) - (token1_decimals as i32);
    let adjusted_price = price / 10_f64.powi(diff_decimals); // Divide by 10^diff_decimals

    // The core tick calculation: log_sqrt_1.0001(adjusted_price)
    let log_base = 1.0001_f64.ln(); // natural log of 1.0001
    (adjusted_price.ln() / log_base).round() as i32
}