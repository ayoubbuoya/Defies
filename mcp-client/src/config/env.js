import dotenv from "dotenv";
dotenv.config();

export const env = {
  evmRpc:  process.env.SEI_EVM_RPC  || "https://evm-rpc.sei-apis.com",
  symbol:  process.env.CHAIN_SYMBOL || "SEI",
  groqKey:   process.env.GROQ_API_KEY   || "",
  groqUrl:   process.env.GROQ_API_URL   || "https://api.groq.com/openai/v1/chat/completions",
  groqModel: process.env.GROQ_MODEL     || "llama-3.3-70b-versatile",
  groqTemperature: parseFloat(process.env.GROQ_TEMPERATURE) || 0,
  defaultNetwork: process.env.SEI_NETWORK || "sei-testnet",
};
