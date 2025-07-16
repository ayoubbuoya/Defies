import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import { McpClient } from "../infra/mcp/McpClient.js";
import { env } from "../config/env.js";

/**
 * get_balance(address: string, network?: string = "sei") → string
 *
 * Returns the SEI balance for the given Sei‑EVM address.
 */
export const mcpBalanceTool = new DynamicStructuredTool({
  name: "get_balance",
  description:
    "Return only the SEI balance of a Sei‑EVM address by querying an MCP server.",
  schema: z.object({
    address: z
      .string()
      .describe("A valid Sei‑EVM wallet address, e.g. 0xABCD…"),
    network: z
      .string()
      .optional()
      .default(env.defaultNetwork)
      .describe("Chain ID or network name"),
  }),

  /** The actual executor */
  func: async ({ address, network }) => {
    const mcpClient = new McpClient();

    try {
      console.log(`🔍 get_balance → ${address} on ${network}`);

      const res = await mcpClient.callTool("get_balance", { address, network });

      if (res.isError) {
        const err = res.content?.[0]?.text ?? "Unknown MCP error";
        throw new Error(err);
      }

      // Normalise wording so the agent never says “ETH”.
      const raw = res.content?.[0]?.text ?? "0 SEI";
      const balance = raw.replace(/ether|eth/gi, "SEI");

      console.log(`✅ MCP balance: ${balance}`);
      return balance;
    } catch (err) {
      console.error(`❌ MCP client error: ${err.message}`);
      throw new Error(`MCP error – ${err.message}`);
    } finally {
      await mcpClient.disconnect();
    }
  },
});
