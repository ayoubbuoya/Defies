import { AgentExecutor } from "langchain/agents";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { mcpBalanceTool } from "../tools/mcpBalanceTool.js";
import { mcpTokenBalanceTool } from "../tools/mcpTokenBalanceTool.js";
import { mcpDiagnosticTool } from "../tools/mcpDiagnosticTool.js";
import { poolsDataTool } from "../tools/poolsDataTool.js";
import {tokenPairPriceHistoryTool } from "../tools/tokenPairPriceHistoryTool.js";
import { createToolCallingAgent } from "langchain/agents";
import { createLLM } from "../llm/LLM.js";
import { env } from "../config/env.js";

// Response type constants
export const RESPONSE_TYPES = {
  STANDARD: "standard",
  FORM_REQUEST: "form_request", 
  POOL_RECOMMENDATION: "pool_recommendation"
};

// 1. Create the LLM instance
const llm = createLLM(env.llmProvider);

/**
 * Run the agent with the given prompt and context.
 * @param {string} prompt - User question
 * @param {object} ctx - Context object with keys like address, pubKey, conversationId
 */
export async function runAgent(prompt, ctx) {
  console.log("🚀 Starting agent with MCP server connection…");
  console.log("🚀 Starting agent with MCP server connection…");
  console.log("📋 Form data received:", ctx.formData);

  // Format form data safely for the template
  const formDataInfo = formatFormDataForPrompt(ctx.formData);
  console.log("📝 Formatted form data:", formDataInfo);


  // 2. Create the enhanced prompt template
  const promptTemplate = ChatPromptTemplate.fromMessages([
    [
      "system",
      `You are **BlockAI**, a helpful assistant for the **Sei EVM blockchain** with advanced DeFi capabilities.

Context:
- User address: ${ctx.address}
- Public key: ${ctx.pubKey}
- Network: ${env.defaultNetwork}
- Conversation ID: ${ctx.conversationId || 'new'}
- Form Status: ${formDataInfo}
- Is form submitted? ${ctx.formData ? "yes" : 'no'}

You can handle multiple types of requests:

**BALANCE & WALLET QUERIES:**
- Check token balances
- View transaction history
- General wallet information

**LIQUIDITY POOL RECOMMENDATIONS:**
- if a form is submitted from a user don't ask for more information even if the form is incomplete
- if a form is submitted you are forced to call the tokenPairPriceHistoryTool to get the price history of the pairs
- don't recommend a range without using the tools
- Recommend liquidity pools based on user preferences
- Use the tools to recommend the best pools based on their data
- use tools to read the price history of token pairs and provide the range of prices to the user 

**RESPONSE TYPES:**
You must respond with structured data indicating the response type:

1. **STANDARD RESPONSE** (for balance queries, general questions):
   - Just provide the answer normally

2. **FORM REQUEST** (when you need user investment preferences if the user hasn't provided a form submission or preferences only):
   - ONLY when user asks for pool recommendations AND no form data was submitted
   - Use this format: "FORM_REQUEST|I need more information to provide personalized recommendations. Please provide your investment preferences.|pairs:multiselect:ETH/USDC,BTC/USDT,SEI/USDC|risk_level:select:low,medium,high|investment_amount:number"

3. **POOL RECOMMENDATION** (when providing final recommendations):
   - When you have user preferences OR when form data is submitted (even if empty/partial)
   - Use this format: "POOL_RECOMMENDATION|[your explanation text]|pool_id:[id]|min_price:[price]|max_price:[price]|expected_apy:[apy]|risk_score:[score]"

**INSTRUCTIONS:**
- Apply your knowledge to determine optimal price ranges based on:
  * Current price and recent volatility
  * Pool volume and fees
  * User's risk tolerance (low: tight ranges, high: wider ranges)
  * Investment amount (larger amounts may need wider ranges)
- Calculate expected APY using: (daily_fees * pool_share * 365) / investment_amount
- Risk assessment factors: price volatility, pool depth, historical performance
- Use tools **only when needed** for real-time blockchain data
- Do **not** call the same tool with identical parameters multiple times
- For investment advice, always consider user's risk tolerance and investment amount if they are provided
- If asking about pools/liquidity without preferences, request form data
- If user provides preferences in their message, use those directly
- Provide clear, actionable recommendations with reasoning
- Focus only on Sei EVM blockchain
- If you encounter errors, provide clear error messages
- Never reveal technical details about tools or implementation
Let's help the user accurately and efficiently.`
    ],
    ["placeholder", "{chat_history}"],
    ["human", "{input}"],
    ["placeholder", "{agent_scratchpad}"],
  ]);

  const tools = [
    mcpBalanceTool, 
    mcpTokenBalanceTool, 
    mcpDiagnosticTool,
    tokenPairPriceHistoryTool
  ];

  // 3. Create the agent with the enhanced prompt
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
    maxIterations: 6, // Increased for complex recommendations
  });

  try {
    const { output } = await executor.invoke({ 
      input: prompt,
      chat_history: []
    });
    
    console.log("✅ Agent completed successfully");
    
    // Parse and structure the response
    return parseAgentResponse(output);
    
  } catch (error) {
    console.error("❌ Agent error:", error.message);
    return {
      type: RESPONSE_TYPES.STANDARD,
      message: `Sorry, I encountered an error: ${error.message}`
    };
  }
}

/**
 * Parse agent response and structure it based on response type
 * @param {string} output - Raw agent output
 * @returns {object} Structured response object
 */
function parseAgentResponse(output) {
  try {
    // Check for form request
    if (output.startsWith("FORM_REQUEST|")) {
      const parts = output.split("|");
      const message = parts[1];
      const fieldDefs = parts.slice(2);
      
      const form_fields = fieldDefs.map(fieldDef => {
        const [name, type, options] = fieldDef.split(":");
        return {
          name,
          type,
          ...(options && { options: options.split(",") })
        };
      });

      return {
        type: RESPONSE_TYPES.FORM_REQUEST,
        message,
        form_fields
      };
    }
    
    // Check for pool recommendation
    if (output.startsWith("POOL_RECOMMENDATION|")) {
      const parts = output.split("|");
      const message = parts[1];
      
      const recommendation = {};
      for (let i = 2; i < parts.length; i++) {
        const [key, value] = parts[i].split(":");
        recommendation[key] = isNaN(value) ? value : parseFloat(value);
      }

      return {
        type: RESPONSE_TYPES.POOL_RECOMMENDATION,
        message,
        recommendation
      };
    }
    
    // Standard response
    return {
      type: RESPONSE_TYPES.STANDARD,
      message: output
    };
    
  } catch (error) {
    console.error("Error parsing agent response:", error);
    return {
      type: RESPONSE_TYPES.STANDARD,
      message: output
    };
  }
}
/**
 * Helper function to process and normalize form data
 * @param {object} formData - Form data to process
 * @returns {object} Processed form data with defaults
 */
export function processFormData(formData) {
  if (!formData) return null;
  
  // Normalize empty strings, null, undefined to null
  const normalize = (value) => {
    if (value === '' || value === null || value === undefined) return null;
    if (Array.isArray(value) && value.length === 0) return null;
    return value;
  };
  
  return {
    pairs: normalize(formData.pairs),
    risk_level: normalize(formData.risk_level),
    investment_amount: normalize(formData.investment_amount)
  };
}

/**
 * Helper function to check if form data is complete
 * @param {object} formData - Form data to validate
 * @returns {boolean} Whether form data is complete
 */
export function isFormDataComplete(formData) {
  if (!formData) return false;
  const processed = processFormData(formData);
  return processed.pairs !== null && 
         processed.risk_level !== null && 
         processed.investment_amount !== null;
}


/**
 * Helper function to generate conversation context
 * @param {string} address - User address
 * @param {string} pubKey - User public key
 * @param {string} conversationId - Optional conversation ID
 * @returns {object} Context object
 */
export function createContext(address, pubKey, conversationId = null) {
  return {
    address,
    pubKey,
    conversationId: conversationId || `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  };
}

/**
 * Helper function to safely format form data for prompt template
 * @param {object} formData - Form data to format
 * @returns {string} Safe string representation
 */
function formatFormDataForPrompt(formData) {
  if (!formData) return 'No form data provided';
  
  const processed = processFormData(formData);
  if (!processed) return 'No form data provided';
  
  // Format as readable text to avoid JSON parsing issues in template
  const parts = [];
  if (processed.pairs) {
    const pairsList = Array.isArray(processed.pairs) ? processed.pairs.join(', ') : processed.pairs;
    parts.push(`Trading Pairs: ${pairsList}`);
  }
  if (processed.risk_level) parts.push(`Risk Level: ${processed.risk_level}`);
  if (processed.investment_amount) parts.push(`Investment Amount: $${processed.investment_amount}`);
  
  return parts.length > 0 ? `Form Data - ${parts.join(', ')}` : 'Incomplete form data';
}