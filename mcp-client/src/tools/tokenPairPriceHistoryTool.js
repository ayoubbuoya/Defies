import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";

/**
 * token_pair_price_history(token0: string, token1, string, interval?: number = 1440, limit?: number = 200) → string
 *
 * Returns the price history between token0 and token1 as a formatted string for AI processing.
 */
export const tokenPairPriceHistoryTool = new DynamicStructuredTool({
  name: "token_pair_price_history",
  description: "Returns the price history for a token pair with interval and limit. Use lowercase token symbols (e.g., 'weth', 'usdc', 'wsei').",
  schema: z.object({
    token0: z.string().min(1).describe("Symbol of token0 in lowercase, e.g., 'usdc', 'weth', 'wsei'"),
    token1: z.string().min(1).describe("Symbol of token1 in lowercase, e.g., 'usdc', 'weth', 'wsei'"),
    interval: z
      .union([z.number(), z.string()])
      .transform((val) => {
        const num = typeof val === 'string' ? parseInt(val, 10) : val;
        if (isNaN(num) || num <= 0) {
          throw new Error('Interval must be a positive integer');
        }
        return num;
      })
      .optional()
      .default(1440)
      .describe("Interval between price points in minutes, e.g., 15, 1440"),
    limit: z
      .union([z.number(), z.string()])
      .transform((val) => {
        const num = typeof val === 'string' ? parseInt(val, 10) : val;
        if (isNaN(num) || num <= 0 || num > 200) {
          throw new Error('Limit must be a positive integer between 1 and 200');
        }
        return num;
      })
      .optional()
      .default(200)
      .describe("Number of data points to return (max 200)"),
  }),

  func: async ({ token0, token1, interval = 1440, limit = 200 }) => {
    try {
      // Validate inputs
      if (!token0 || !token1) {
        throw new Error("Both token0 and token1 are required");
      }

      // Normalize token symbols to lowercase
      let normalizedToken0 = token0.toLowerCase().trim();
      let normalizedToken1 = token1.toLowerCase().trim();
      
      // Handle token mapping
      if (normalizedToken0 === "eth") {
        normalizedToken0 = "weth";
      }
      if (normalizedToken1 === "eth") {
        normalizedToken1 = "weth";
      }
      if (normalizedToken0 === "btc") {
        normalizedToken0 = "wbtc";
      }
      if (normalizedToken1 === "btc") {
        normalizedToken1 = "wbtc";
      }

      console.log(`🔍 Fetching price history for ${normalizedToken0}/${normalizedToken1} (interval: ${interval}min, limit: ${limit})`);

      // Use Google Cloud Function API instead of local Rust backend
      const baseUrl = 'https://asia-southeast1-ktx-finance-2.cloudfunctions.net/sailor_kline_api/smart_kline';
      const url = new URL(`${baseUrl}/${normalizedToken0}/${normalizedToken1}`);
      url.searchParams.set('interval', interval.toString());
      url.searchParams.set('limit', limit.toString());

      console.log(`🌐 Cloud Function API call to: ${url.toString()}`);

      // Make direct fetch call
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'BlockAI-Agent/1.0',
        },
      });

      console.log(`📡 Response status: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ HTTP Error Response:`, errorText);
        throw new Error(`HTTP error! status: ${response.status} ${response.statusText}. Response: ${errorText}`);
      }

      const data = await response.json();

      // Check if response exists
      if (!data) {
        throw new Error("No response received from API");
      }

      // Handle the Google Cloud Function response format
      let priceData = [];

      if (Array.isArray(data)) {
        priceData = data;
      } else if (data.success === true && Array.isArray(data.data)) {
        priceData = data.data;
      } else if (data.data && Array.isArray(data.data)) {
        priceData = data.data;
      } else {
        throw new Error(`Unexpected API response format: ${JSON.stringify(data).substring(0, 200)}...`);
      }

      if (priceData.length === 0) {
        throw new Error(`No price history data available for ${normalizedToken0}/${normalizedToken1} pair`);
      }

      console.log(`📊 API returned ${priceData.length} data points`);

      // Transform data to return only essential price information
      const priceHistory = priceData.map((item, index) => {
        if (Array.isArray(item) && item.length >= 6) {
          const [tick, open, high, low, close] = item;
          
          // Validate numeric values
          if (typeof tick !== 'number' || 
              typeof open !== 'number' || 
              typeof high !== 'number' || 
              typeof low !== 'number' || 
              typeof close !== 'number') {
            console.warn(`⚠️ Invalid data at index ${index}:`, item);
            return null;
          }

          return {
            tick: tick,
            open: parseFloat(open.toFixed(6)),
            close: parseFloat(close.toFixed(6)),
            high: parseFloat(high.toFixed(6)),
            low: parseFloat(low.toFixed(6))
          };
        } else if (typeof item === 'object' && item.timestamp && item.open && item.close && item.high && item.low) {
          return {
            tick: item.timestamp,
            open: parseFloat(item.open.toFixed(6)),
            close: parseFloat(item.close.toFixed(6)),
            high: parseFloat(item.high.toFixed(6)),
            low: parseFloat(item.low.toFixed(6))
          };
        } else {
          console.warn(`⚠️ Invalid data format at index ${index}:`, item);
          return null;
        }
      }).filter(Boolean);

      if (priceHistory.length === 0) {
        throw new Error(`No valid price data found after parsing for ${normalizedToken0}/${normalizedToken1}`);
      }

      console.log(`✅ Successfully processed ${priceHistory.length} price history points`);
      
      // Calculate price statistics for AI analysis
      const prices = priceHistory.map(p => p.close);
      const currentPrice = prices[prices.length - 1];
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
      
      // Calculate volatility (standard deviation)
      const variance = prices.reduce((acc, price) => acc + Math.pow(price - avgPrice, 2), 0) / prices.length;
      const volatility = Math.sqrt(variance);
      const volatilityPercent = (volatility / avgPrice) * 100;

      // Get pool metadata if available
      const poolInfo = data.meta ? {
        poolId: data.meta.pool_id,
        tvl: data.meta.tvl,
        feeTier: data.meta.fee_tier
      } : {};

      // Create the response object
      const toolResponse = {
        pair: `${normalizedToken0.toUpperCase()}/${normalizedToken1.toUpperCase()}`,
        price_range: {
          min: minPrice,
          max: maxPrice,
          average: avgPrice
        },
        volatility: {
          value: volatility,
          percentage: volatilityPercent,
          level: volatilityPercent < 2 ? 'LOW' : volatilityPercent < 5 ? 'MEDIUM' : 'HIGH'
        },
        data_points: priceHistory.length,
        interval_minutes: interval,
        pool_info: poolInfo,
        recent_prices: priceHistory.slice(-10).map(p => ({
          price: p.close,
          high: p.high,
          low: p.low,
          timestamp: p.tick
        })),
        recommendation_context: {
          center_price: currentPrice,
          suggested_range_width_percent: volatilityPercent * 2, // 2x volatility for range
          trend: prices[prices.length - 1] > prices[0] ? 'UPWARD' : 'DOWNWARD'
        }
      };

      const jsonResponse = JSON.stringify(toolResponse, null, 2);
      
      // Enhanced logging to show the tool response
      console.log(`📋 TOOL RESPONSE START 📋`);
      console.log(`Tool Name: token_pair_price_history`);
      console.log(`Input: ${token0}/${token1}, interval: ${interval}, limit: ${limit}`);
      console.log(`Response Length: ${jsonResponse.length} characters`);
      console.log(`Response Preview:`);
      console.log(jsonResponse);
      console.log(`📋 TOOL RESPONSE END 📋`);

      return jsonResponse;

    } catch (err) {
      console.error(`❌ Error in tokenPairPriceHistoryTool for ${token0}/${token1}:`, err.message);
      
      // Create error response
      const errorResponse = {
        error: true,
        message: `Price history fetch failed for ${token0}/${token1}: ${err.message}`,
        pair: `${token0.toUpperCase()}/${token1.toUpperCase()}`
      };

      const errorJson = JSON.stringify(errorResponse, null, 2);
      
      // Log error response
      console.log(`📋 ERROR TOOL RESPONSE START 📋`);
      console.log(`Tool Name: token_pair_price_history`);
      console.log(`Input: ${token0}/${token1}, interval: ${interval}, limit: ${limit}`);
      console.log(`Error Response:`);
      console.log(errorJson);
      console.log(`📋 ERROR TOOL RESPONSE END 📋`);

      return errorJson;
    }
  },
});