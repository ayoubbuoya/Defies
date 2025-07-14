import dotenv from "dotenv";
dotenv.config();

export const env = {
  evmRpc:  process.env.SEI_EVM_RPC  || "https://evm-rpc.sei-apis.com",
  symbol:  process.env.CHAIN_SYMBOL || "SEI",
  openaiKey: process.env.OPENAI_API_KEY || "",
  geminiKey: process.env.GEMINI_API_KEY || "",
  groqKey:   process.env.GROQ_API_KEY   || "",
};
