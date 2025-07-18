import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import { McpClient } from "../infra/mcp/McpClient.js";
import { env } from "../config/env.js";

// Popular ERC-20 tokens on Sei network 
const TOKEN_REGISTRY = {
  "USDC": "0x3894085Ef7Ff0f0aeDf52E2A2704928d1Ec074F1",
  "USDT": "0x9151434b16b9763660705744891fa906f660ecc5",
  // Add more tokens as needed
};

/**
 * get_token_balance(tokenSymbol: string, ownerAddress: string, network?: string = "sei") → string
 *
 * Returns the ERC-20 token balance for the given token Symbol and owner address.
 */
export const mcpTokenBalanceTool = new DynamicStructuredTool({
  name: "get_token_balance",
  description:
    "Check ERC-20 token balance for a specific token Symbol(USDC and USDT only) and owner address by querying an MCP server.",
  schema: z.object({
    tokenSymbol: z
      .string()
      .describe("Token symbol only those symbols are supported: USDC, USDT, WETH, SEI"),
    ownerAddress: z
      .string()
      .describe("The wallet address that owns the tokens, e.g. 0xABCD..."),
    network: z
      .string()
      .optional()
      .default(env.defaultNetwork)
      .describe("Chain ID or network name"),
  }),

  /** The actual executor */
  func: async ({ tokenSymbol, ownerAddress, network }) => {
    const mcpClient = new McpClient();

    try {
      console.log(`🔍 get_token_balance → token: ${tokenSymbol}, owner: ${ownerAddress} on ${network}`);

      const tokenAddress = TOKEN_REGISTRY[tokenSymbol.toUpperCase()];

      if (!tokenAddress) {
    const supported = Object.keys(TOKEN_REGISTRY).join(", ");
    throw new Error(
      `Unsupported token symbol ".`
    );
  }

      const res = await mcpClient.callTool("get_erc20_balance", { 
        address: ownerAddress,
        tokenAddress, 
        network 
      });

      if (res.isError) {
        const err = res.content?.[0]?.text ?? "Unknown MCP error";
        throw new Error(err);
      }

      const balance = res.content?.[0]?.text ?? "0";
      console.log(`✅ MCP token balance: ${balance}`);
      return balance;
    } catch (err) {
      console.error(`❌ MCP client error: ${err.message}`);
      throw new Error(`MCP error – ${err.message}`);
    } finally {
      await mcpClient.disconnect();
    }
  },
});