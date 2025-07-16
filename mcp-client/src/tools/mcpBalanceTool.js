import { DynamicTool } from "langchain/tools";
import { McpClient } from "../infra/mcp/McpClient.js";
import {env} from "../config/env.js";

export const mcpBalanceTool = new DynamicTool({
  name: "get_balance",
  description: "Check the SEI balance of a Sei EVM address using the MCP server. Input should be a JSON string with 'address' and optionally 'network' (defaults to 'sei').",
  func: async (input) => {
    const mcpClient = new McpClient();
    
    try {
      // Parse the input - LangChain might pass it as a string
      let params;
      if (typeof input === 'string') {
        try {
          params = JSON.parse(input);
        } catch {
          // If it's not JSON, treat it as an address
          params = { address: input, network: 'sei' };
        }
      } else {
        params = input;
      }

      const { address, network = env.defaultNetwork } = params;
      
      console.log(`🔍 MCP CLIENT: Calling get_balance for ${address} on ${network}`);
      
      // Call the MCP server's get_balance tool
      const result = await mcpClient.callTool("get_balance", { address, network });
      
      if (result.isError) {
        const errorMsg = result.content[0]?.text || "Unknown error";
        console.error(`❌ MCP ERROR: ${errorMsg}`);
        return `Error getting balance: ${errorMsg}`;
      }
      
      const balanceInfo = result.content[0]?.text || "No balance information returned";
      console.log(`✅ MCP RESULT: ${balanceInfo}`);

       // Ensure the response mentions SEI, not ETH
      const formattedBalance = balanceInfo
        .replace(/ETH/g, 'SEI')
        .replace(/Ether/g, 'SEI')
        .replace(/ether/g, 'SEI');
      
      return formattedBalance;
    } catch (error) {
      console.error(`❌ MCP CLIENT ERROR: ${error.message}`);
      return `Error connecting to MCP server: ${error.message}`;
    } finally {
      await mcpClient.disconnect();
    }
  },
});