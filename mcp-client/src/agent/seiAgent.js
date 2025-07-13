import GroqLLM from "../llm/GeminiFlashLLM.js";
import { initializeAgentExecutorWithOptions } from "langchain/agents";
import { checkBalanceTool } from "../tools/checkBalanceTool.js";
import { env } from "../config/env.js";

const llm = new GroqLLM({
  apiKey: env.groqKey, // Add GROQ_API_KEY to your .env file
  modelName: "llama-3.3-70b-versatile",
  temperature: 0,
});

export async function runAgent(prompt, ctx) {
  console.log("🚀 Processing request...");
  
  const executor = await initializeAgentExecutorWithOptions(
    [checkBalanceTool],
    llm,
    { 
      agentType: "zero-shot-react-description", 
      verbose: false,
      maxIterations: 3
    }
  );

  const systemCtx = `You are a helpful assistant for Sei EVM blockchain queries. The user's Sei EVM address is ${ctx.address}. Their public key is ${ctx.pubKey}.

You have access to the following tools:
- check_balance: Use this to check the ETH balance of any Sei EVM address. Always use this tool when asked about balances.

When the user asks about balances, account information, or wallet details, you MUST use the check_balance tool first before providing any response.

Format your responses clearly and include the actual balance information from the tool.`;

  const result = await executor.call({ 
    input: `${systemCtx}\n\nUser: ${prompt}` 
  });

  console.log("✅ Request completed");
  return result.output;
}