import GroqLLM from "../llm/GroqLLM.js";
import { initializeAgentExecutorWithOptions } from "langchain/agents";
import { mcpBalanceTool } from "../tools/mcpBalanceTool.js";
import { env } from "../config/env.js";

const llm = new GroqLLM({
  apiKey: env.groqKey,
  modelName: env.groqModel,
  temperature: env.groqTemperature,
});

export async function runAgent(prompt, ctx) {
  console.log("🚀 Starting agent with MCP server connection...");
  
  const executor = await initializeAgentExecutorWithOptions(
    [mcpBalanceTool], // Only the MCP-based balance tool
    llm,
    { 
      agentType: "zero-shot-react-description", 
      verbose: true, // Enable to see the tool calls
      maxIterations: 4
    }
  );

  const systemCtx = `You are a helpful assistant for Sei EVM blockchain queries. 
The user's Sei EVM address is ${ctx.address}. 
Their public key is ${ctx.pubKey}.

You have access to the get_balance tool which connects to an MCP server to check SEI balances.
When checking balances, use the tool with the address parameter.

Format your responses clearly and include the actual balance information from the MCP server.`;

  try {
    const result = await executor.call({ 
      input: `${systemCtx}\n\nUser: ${prompt}` 
    });
    
    console.log("✅ Agent completed successfully");
    return result.output;
  } catch (error) {
    console.error("❌ Agent error:", error.message);
    return `Sorry, I encountered an error: ${error.message}`;
  }
}