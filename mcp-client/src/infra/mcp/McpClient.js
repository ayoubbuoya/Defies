import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export class McpClient {
  constructor() {
    this.client = null;
    this.transport = null;
  }

  async connect() {
    if (this.client) {
      return this.client;
    }

    try {
      // ✅ Chemin corrigé selon package.json
      const serverPath = path.resolve(__dirname, "../../../../../sei-js/packages/mcp-server/dist/esm/index.js");
      
      console.log(`🔍 Attempting to connect to MCP server at: ${serverPath}`);
      
      // Vérifier si le fichier existe
      if (!fs.existsSync(serverPath)) {
        throw new Error(`MCP server not found at: ${serverPath}. Please run 'yarn build' first.`);
      }
      
      this.transport = new StdioClientTransport({
        command: "node",
        args: [serverPath],
        env: {
          ...process.env,
          WALLET_MODE: "disabled"
        }
      });

      this.client = new Client({
        name: "sei-blockchain-client",
        version: "1.0.0",
      }, {
        capabilities: {
          tools: {},
        },
      });

      await this.client.connect(this.transport);
      console.log("✅ MCP Client connected to server via stdio");
      return this.client;
    } catch (error) {
      console.error("❌ Failed to connect to MCP server:", error.message);
      throw error;
    }
  }

  async listAvailableTools() {
    const client = await this.connect();
    try {
      const tools = await client.listTools();
      return tools;
    } catch (error) {
      console.error("❌ Error listing tools:", error.message);
      throw error;
    }
  }

  async callTool(toolName, args) {
    const client = await this.connect();
    try {
      const result = await client.callTool({
        name: toolName,
        arguments: args,
      });
      return result;
    } catch (error) {
      console.error(`❌ Error calling tool ${toolName}:`, error.message);
      throw error;
    }
  }

  async disconnect() {
    if (this.transport) {
      await this.transport.close();
      this.transport = null;
      this.client = null;
      console.log("✅ MCP Client disconnected");
    }
  }
}