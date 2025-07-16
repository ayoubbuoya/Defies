import { AgentExecutor } from "langchain/agents";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { mcpBalanceTool } from "../tools/mcpBalanceTool.js";
import { createToolCallingAgent } from "langchain/agents";
import { createLLM } from "../llm/LLM.js";
import { env } from "../config/env.js";

// 1. Create the LLM instance
const llm = createLLM(env.llmProvider);

/**
 * Run the agent with the given prompt and context.
 * @param {string} prompt - User question
 * @param {object} ctx - Context object with keys like address, pubKey
 */
export async function runAgent(prompt, ctx) {
  console.log("🚀 Starting agent with MCP server connection…");

  // 2. Create the proper prompt template
  const promptTemplate = ChatPromptTemplate.fromMessages([
  [
    "system",
    `You are **BlockAI**, a helpful assistant for the **Sei EVM blockchain**.

Context:
- User address: ${ctx.address}
- Public key: ${ctx.pubKey}
- Network: ${env.defaultNetwork}

Instructions:
- You are limited to the "${env.defaultNetwork}" network.
- Use tools **only when needed** (e.g., to fetch real-time blockchain data).
- Do **not** call the same tool with the same parameters more than once per question.
- Respond clearly and concisely in **Markdown**.
- If the question is unrelated to Sei EVM, briefly explain you are limited to that scope.

Let’s help the user accurately and efficiently.`
  ],
  ["placeholder", "{chat_history}"],
  ["human", "{input}"],
  ["placeholder", "{agent_scratchpad}"],
]);


  // 3. Create the agent with the proper prompt
  const agent = await createToolCallingAgent({
    llm,
    tools: [mcpBalanceTool],
    prompt: promptTemplate,
  });

  // 4. Wrap it in an executor
  const executor = new AgentExecutor({
    agent,
    tools: [mcpBalanceTool],
    verbose: false,
    maxIterations: 4,
  });

  try {
    const { output } = await executor.invoke({ 
      input: prompt,
      chat_history: []
    });
    console.log("✅ Agent completed successfully");
    return output;
  } catch (error) {
    console.error("❌ Agent error:", error.message);
    return `Sorry, I encountered an error: ${error.message}`;
  }
}