import { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { AIMessage, HumanMessage, SystemMessage } from "@langchain/core/messages";
import { env } from "../config/env.js";

let fetchFn;

if (typeof globalThis.fetch !== "function") {
  const { default: nodeFetch } = await import("node-fetch");
  fetchFn = nodeFetch;
} else {
  fetchFn = globalThis.fetch;
}

export default class GroqLLM extends BaseChatModel {
  constructor({ apiKey, modelName, temperature}) {
    super({});
    this.apiKey = apiKey;
    this.modelName = modelName;
    this.temperature = temperature;
    this.baseURL = env.groqUrl;
  }

  _llmType() {
    return "groq-llama";
  }

  async _generate(messages, options) {
    const groqMessages = messages.map((message) => {
      if (message instanceof SystemMessage) {
        return { role: "system", content: message.content };
      } else if (message instanceof HumanMessage) {
        return { role: "user", content: message.content };
      } else if (message instanceof AIMessage) {
        return { role: "assistant", content: message.content };
      }
      return { role: "user", content: message.content };
    });

    const body = {
      model: this.modelName,
      messages: groqMessages,
      temperature: this.temperature,
      max_tokens: 2048,
      stop: ["Observation:"] // Stop before generating fake observations
    };

    const res = await fetchFn(this.baseURL, {
      method: "POST",
      headers: { 
        "Authorization": `Bearer ${this.apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Groq API error: ${res.status} – ${err}`);
    }

    const json = await res.json();
    let output = json?.choices?.[0]?.message?.content ?? "";
    
    // Ensure we stop at the action and don't generate fake observations
    if (output.includes("Observation:")) {
      const obsIndex = output.indexOf("Observation:");
      output = output.substring(0, obsIndex).trim();
    }
    
    return {
      generations: [{ 
        message: new AIMessage(output), 
        text: output 
      }],
    };
  }
}