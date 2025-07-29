import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import { RestClient } from "../infra/rest/RestClient.js";
import { env } from "../config/env.js";

/**
 * get_pools_data() → string
 *
 * Returns all pools data from your backend.
 */
export const poolsDataTool = new DynamicStructuredTool({
  name: "get_pools_data",
  description:
    "Fetch all liquidity pools with data such as id, total liquidity, fee tier, volumes, TVL, and token symbols.",
  schema: z.object({}),

  func: async () => {
    const restClient = new RestClient(env.backendUrl);

    try {
      console.log(`🔍 get_pools_data`);

      const res = await restClient.get("/data/pools");

      if (res.isError) {
        throw new Error(res.error);
      }

      const pools = res.data.poolStats ?? [];

      const simplified = pools.map((pool) => ({
        id: pool.id,
        totalLiquidity: pool.totalLiquidity?.value ?? null,
        feeTier: pool.feeTier,
        dailyVolume: pool.day?.volume ?? null,
        weeklyVolume: pool.week?.volume ?? null,
        monthlyVolume: pool.month?.volume ?? null,
        tvl: pool.tvl,
        token0Symbol: pool.token0?.symbol,
        token1Symbol: pool.token1?.symbol,
      }));

      console.log(`✅ Pools fetched successfully`);
      return JSON.stringify(simplified, null, 2);
    } catch (err) {
      console.error(`❌ poolsDataTool error: ${err.message}`);
      throw new Error(`Failed to fetch pool data – ${err.message}`);
    } finally {
      await restClient.disconnect();
    }
  },
});
