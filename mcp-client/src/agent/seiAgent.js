import { AgentExecutor } from "langchain/agents";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { mcpBalanceTool } from "../tools/mcpBalanceTool.js";
import { mcpTokenBalanceTool } from "../tools/mcpTokenBalanceTool.js";
import { mcpDiagnosticTool } from "../tools/mcpDiagnosticTool.js";
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

  // const availableTools = await mcpDiagnosticTool.call({});
  // console.log("✅ Available tools:", availableTools);

  // 2. Create the proper prompt template
  const promptTemplate = ChatPromptTemplate.fromMessages([
  [
    "system",
    `You are **BlockAI**, a helpful assistant for the **Sei EVM blockchain**.

Context:
- User address: ${ctx.address}
- Public key: ${ctx.pubKey}
- Network: ${env.defaultNetwork}

Instructions should be followed strictly:
- You are limited to the "${env.defaultNetwork}" network.
- Use tools **only when needed** (e.g., to fetch real-time blockchain data).
- Do **not** call the same tool with the same parameters more than once per question.
- Respond clearly.
- If the question is unrelated to Sei EVM, briefly explain you are limited to that scope.
- if you encounter an error, provide a clear error message.
- if you don't know the answer, say "I don't know" instead of making up information.
- don't give users any information about the tools you are using, or the code or any technical details about how you are working.

Let’s help the user accurately and efficiently.`
  ],
  ["placeholder", "{chat_history}"],
  ["human", "{input}"],
  ["placeholder", "{agent_scratchpad}"],
]);


  const tools = [mcpBalanceTool, mcpTokenBalanceTool,mcpDiagnosticTool];

  // 3. Create the agent with the proper prompt
  const agent = await createToolCallingAgent({
    llm,
    tools,
    prompt: promptTemplate,
  });

  // 4. Wrap it in an executor
  const executor = new AgentExecutor({
    agent,
    tools,
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