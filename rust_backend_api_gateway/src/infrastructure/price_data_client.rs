// we are using the binance API to fetch price data
use crate::api::models::PricePoint;
use anyhow::{Result, anyhow};
use reqwest;
use std::env;
use tracing::{debug, error, info};

#[derive(Debug)]
pub struct PriceDataClient {
    base_url: String,
    client: reqwest::Client,
}

impl Default for PriceDataClient {
    fn default() -> Self {
        Self::new()
    }
}

impl PriceDataClient {
    pub fn new() -> Self {
        let base_url = env::var("PRICE_FETCH_API_BASE_URL")
            .expect("❌ PRICE_FETCH_API_BASE_URL environment variable is required but not found in .env file");

        info!("🔗 Using API base URL from .env: {}", base_url);
        Self {
            base_url,
            client: reqwest::Client::new(),
        }
    }

    pub async fn fetch_kline_data(
        &self,
        token0: &str,
        token1: &str,
        interval: u32, // Interval in minutes
        limit: u32,
    ) -> Result<Vec<PricePoint>> {
        // Convert tokens to Binance symbol format (e.g., USDC + SEI = SEIUSDC)
        let symbol = format!("{}{}", token0.to_uppercase(), token1.to_uppercase());

        // Convert interval (minutes) to Binance format
        let binance_interval = self.convert_interval_to_binance(interval);

        let url = format!(
            "{}/klines?symbol={}&interval={}&limit={}",
            self.base_url, symbol, binance_interval, limit
        );

        info!("🌐 Fetching kline data from Binance: {}", url);

        let response = self
            .client
            .get(&url)
            .send()
            .await
            .map_err(|e| anyhow!("Failed to send request to Binance: {}", e))?;

        if !response.status().is_success() {
            return Err(anyhow!(
                "Binance API request failed with status: {}",
                response.status()
            ));
        }

        let json_response: serde_json::Value = response
            .json()
            .await
            .map_err(|e| anyhow!("Failed to parse Binance JSON response: {}", e))?;

        debug!(
            "📊 Raw Binance API response: {}",
            serde_json::to_string_pretty(&json_response)?
        );

        // Parse the response as array of arrays
        let data_array = json_response
            .as_array()
            .ok_or_else(|| anyhow!("Binance response is not an array"))?;

        if data_array.is_empty() {
            info!("⚠️ No price data available for {} from Binance", symbol);
            return Ok(Vec::new());
        }

        let price_points = self.convert_binance_to_price_points(data_array.clone())?;

        info!(
            "✅ Successfully fetched {} price points for {} from Binance",
            price_points.len(),
            symbol
        );

        Ok(price_points)
    }

    fn convert_interval_to_binance(&self, interval_minutes: u32) -> String {
        match interval_minutes {
            1 => "1m".to_string(),
            3 => "3m".to_string(),
            5 => "5m".to_string(),
            15 => "15m".to_string(),
            30 => "30m".to_string(),
            60 => "1h".to_string(),
            120 => "2h".to_string(),
            240 => "4h".to_string(),
            360 => "6h".to_string(),
            480 => "8h".to_string(),
            720 => "12h".to_string(),
            1440 => "1d".to_string(),
            2880 => "3d".to_string(),
            10080 => "1w".to_string(),
            43200 => "1M".to_string(),
            _ => "1d".to_string(), // Default to 1 day
        }
    }

    fn convert_binance_to_price_points(
        &self,
        data_array: Vec<serde_json::Value>,
    ) -> Result<Vec<PricePoint>> {
        let mut points = Vec::new();

        for (index, item) in data_array.iter().enumerate() {
            match self.parse_binance_kline(item) {
                Ok(point) => points.push(point),
                Err(e) => {
                    error!("❌ Failed to parse Binance kline at index {}: {}", index, e);
                    continue;
                }
            }
        }

        debug!(
            "📈 Converted {} valid price points from {} Binance klines",
            points.len(),
            data_array.len()
        );

        Ok(points)
    }

    fn parse_binance_kline(&self, item: &serde_json::Value) -> Result<PricePoint> {
        let array = item
            .as_array()
            .ok_or_else(|| anyhow!("Binance kline item is not an array"))?;

        if array.len() < 12 {
            return Err(anyhow!(
                "Binance kline array has insufficient elements: {}",
                array.len()
            ));
        }

        // Binance kline format:
        // [
        //   0 Open time,           <- Use for timestamp
        //   1 Open price,          <- Use
        //   2 High price,          <- Use
        //   3 Low price,           <- Use
        //   4 Close price,         <- Use
        //   5 Volume,              <- Use
        //   6 Close time,          <- Ignore
        //   7 Quote asset volume,  <- Ignore
        //   8 Number of trades,    <- Ignore
        //   9 Taker buy base asset volume,  <- Ignore
        //  10 Taker buy quote asset volume, <- Ignore
        //  11 Ignore (always "0") <- Ignore
        // ]

        let open_time = array[0]
            .as_u64()
            .ok_or_else(|| anyhow!("Invalid open time in Binance kline"))?;

        let open_price = array[1]
            .as_str()
            .ok_or_else(|| anyhow!("Invalid open price in Binance kline"))?
            .parse::<f64>()
            .map_err(|e| anyhow!("Failed to parse open price: {}", e))?;

        let high_price = array[2]
            .as_str()
            .ok_or_else(|| anyhow!("Invalid high price in Binance kline"))?
            .parse::<f64>()
            .map_err(|e| anyhow!("Failed to parse high price: {}", e))?;

        let low_price = array[3]
            .as_str()
            .ok_or_else(|| anyhow!("Invalid low price in Binance kline"))?
            .parse::<f64>()
            .map_err(|e| anyhow!("Failed to parse low price: {}", e))?;

        let close_price = array[4]
            .as_str()
            .ok_or_else(|| anyhow!("Invalid close price in Binance kline"))?
            .parse::<f64>()
            .map_err(|e| anyhow!("Failed to parse close price: {}", e))?;

        let volume = array[5]
            .as_str()
            .ok_or_else(|| anyhow!("Invalid volume in Binance kline"))?
            .parse::<f64>()
            .map_err(|e| anyhow!("Failed to parse volume: {}", e))?;

        Ok(PricePoint {
            tick: (open_time / 1000) as i64, // Convert from milliseconds to seconds
            open: open_price,
            high: high_price,
            low: low_price,
            close: close_price,
            volume: Some(volume),
        })
    }
}
