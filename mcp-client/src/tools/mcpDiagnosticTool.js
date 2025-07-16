import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import { McpClient } from "../infra/mcp/McpClient.js";

/**
 * Diagnostic tool to list available MCP tools
 */
export const mcpDiagnosticTool = new DynamicStructuredTool({
  name: "list_mcp_tools",
  description: "List all available MCP server tools for debugging",
  schema: z.object({}),

  func: async () => {
    const mcpClient = new McpClient();

    try {
      console.log("🔍 Listing available MCP tools...");
      
      const tools = await mcpClient.listAvailableTools();
      
      console.log("✅ Available MCP tools:", tools.tools.map(t => t.name));
      
      return JSON.stringify({
        availableTools: tools.tools.map(tool => ({
          name: tool.name,
          description: tool.description,
          inputSchema: tool.inputSchema
        }))
      }, null, 2);
    } catch (err) {
      console.error(`❌ MCP diagnostic error: ${err.message}`);
      throw new Error(`MCP diagnostic error – ${err.message}`);
    } finally {
      await mcpClient.disconnect();
    }
  },
});