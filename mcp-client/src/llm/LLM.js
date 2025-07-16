import { ChatGroq } from "@langchain/groq";
import { env } from "../config/env.js";


export function createLLM(llmprovider ){

  switch (llmprovider) {
    case "groq":
      return createGroqLLM();
    default:
      throw new Error(`Unsupported LLM provider: ${llmprovider}`);
  }

}

function createGroqLLM() {
  return new ChatGroq({
    apiKey: env.groqKey,
    model: env.groqModel,
    temperature: env.groqTemperature,
    stream: true,
    timeout: 15000,
    maxRetries: 3,
  });
}
