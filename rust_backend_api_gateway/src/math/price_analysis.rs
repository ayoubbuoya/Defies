/// Calculate volatility from price data using standard deviation
pub fn calculate_volatility(prices: &[f64]) -> f64 {
    if prices.len() < 2 {
        return 0.0;
    }

    let mean = prices.iter().sum::<f64>() / prices.len() as f64;
    let variance = prices
        .iter()
        .map(|price| {
            let diff = price - mean;
            diff * diff
        })
        .sum::<f64>()
        / prices.len() as f64;

    (variance.sqrt() / mean).abs()
}

/// Determine volatility level based on volatility value
pub fn determine_volatility_level(volatility: f64) -> String {
    match volatility {
        v if v < 0.02 => "LOW".to_string(),
        v if v < 0.05 => "MEDIUM".to_string(),
        _ => "HIGH".to_string(),
    }
}

/// Calculate suggested range width based on volatility
pub fn calculate_suggested_range_width(volatility: f64) -> f64 {
    match volatility {
        v if v < 0.02 => 5.0,
        v if v < 0.05 => 10.0,
        v if v < 0.1 => 20.0,
        _ => 30.0,
    }
}

/// Determine price trend from price data
pub fn determine_trend(prices: &[f64]) -> String {
    if prices.len() < 2 {
        return "SIDEWAYS".to_string();
    }

    let first_third = &prices[..prices.len() / 3];
    let last_third = &prices[prices.len() * 2 / 3..];

    let first_avg = first_third.iter().sum::<f64>() / first_third.len() as f64;
    let last_avg = last_third.iter().sum::<f64>() / last_third.len() as f64;

    let change_percent = (last_avg - first_avg) / first_avg;

    match change_percent {
        c if c > 0.02 => "UPWARD".to_string(),
        c if c < -0.02 => "DOWNWARD".to_string(),
        _ => "SIDEWAYS".to_string(),
    }
}
