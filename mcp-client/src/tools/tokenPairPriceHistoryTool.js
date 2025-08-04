import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import { RestClient } from "../infra/rest/RestClient.js";
import { env } from "../config/env.js";
import { getTokenFunctionalSymbol } from "../utils/tokenRegistry.js";
/**
 * token_pair_price_history(token0: string, token1, string, interval?: number = 1440, limit?: number = 200) → string
 *
 * Returns the price history between token0 and token1 as a formatted string for AI processing.
 */

export const tokenPairPriceHistoryTool = new DynamicStructuredTool({
  name: "token_pair_price_history",
  description: "Returns the price history for a token pair.",
  schema: z.object({
    token0: z.string().min(1).describe("Symbol of token0 in lowercase, e.g., 'usdc', 'eth', 'sei'"),
    token1: z.string().min(1).describe("Symbol of token1 in lowercase, e.g., 'usdc', 'eth', 'sei'"),
    interval: z.number().optional().default(1440).describe("Interval between price points in minutes, e.g., 15, 1440"),
    limit: z.number().optional().default(200).describe("Number of data points to return (max 200)"),
  }),
  func: async ({ token0, token1, interval = 1440, limit = 200 }) => {
    console.log(`🔍 Fetching price history for ${token0} and ${token1} with interval ${interval} and limit ${limit}`);
    const token0Symbol = getTokenFunctionalSymbol(token1, "rest");
    const token1Symbol = getTokenFunctionalSymbol(token0, "rest"); // they are swapped because the API expects token0 to be the base token and token1 to be the quote token
    const restClient = new RestClient(env.backendUrl);
    const params = { token0: token0Symbol, token1: token1Symbol, interval, limit };
    const response = await restClient.get("/tools/price-history", params);
    if (response.isError) {
      console.error("Error fetching price history:", response.error);
      throw new Error(response.error);
    }
    console.log(`✅ tokenPairPriceHistoryTool fetched successfully for ${token1}/${token0}`);
    return JSON.stringify(response.data, null, 2);
  },
});