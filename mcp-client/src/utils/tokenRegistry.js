// Symbol to address mapping for Sei network ERC-20 tokens
export const TOKEN_REGISTRY = {
  USDC: {
    address: "0x3894085Ef7Ff0f0aeDf52E2A2704928d1Ec074F1",
  },
  USDT: {
    address: "0x9151434b16b9763660705744891fa906f660ecc5",
  },
};

// Tool-specific symbol mapping
export const TOKEN_MAP = {
  SEI: { default: "sei", mcp: "wsei", rest: "sei" },
  USDC: { default: "usdc", mcp: "usdc", rest: "usdc" },
  WSEI : { default: "sei", mcp: "wsei", rest: "sei" },
  USDT: { default: "usdt", mcp: "usdt", rest: "usdt" },
};

// Helper to get address by symbol
export function getTokenAddress(symbol) {
  const entry = TOKEN_REGISTRY[getTokenFunctionalSymbol(symbol, "default").toUpperCase()];
  if (!entry) throw new Error(`Unknown token symbol: ${symbol}`);
  return entry.address;
}

// Helper to get symbol by address
export function getTokenSymbol(address) {
  const entry = Object.values(TOKEN_REGISTRY).find(
    (t) => t.address.toLowerCase() === address.toLowerCase()
  );
  if (!entry) throw new Error(`Unknown token address: ${address}`);
  return entry.symbol;
}

// Helper to get tool-specific symbol
export function getTokenFunctionalSymbol(token, tool) {
  const entry = TOKEN_MAP[token.toUpperCase()];
  if (!entry) throw new Error(`Unknown token: ${token}`);
  return entry[tool] || entry.default;
}