// Enhanced response parsing with strict structure enforcement
class ResponseProcessor {
  static parseAgentResponse(output) {
    try {
      // 1. POOL RECOMMENDATION - Must have pool_id, min_price, max_price + message
      if (output.startsWith("POOL_RECOMMENDATION|")) {
        return this.parsePoolRecommendation(output);
      }
      
      // 2. STANDARD - Just message
      if (output.startsWith("STANDARD|")) {
        return {
          type: "STANDARD",
          message: output.substring(9) // Remove "STANDARD|" prefix
        };
      }
      
      // 4. Default to STANDARD if no prefix
      return {
        type: "STANDARD",
        message: output
      };
      
    } catch (error) {
      console.error("Error parsing agent response:", error);
      return {
        type: "STANDARD",
        message: output // Fallback to original output
      };
    }
  }

  static parsePoolRecommendation(output) {
  const parts = output.split("|");
  const message = parts[1];
  
  const recommendation = {};
  for (let i = 2; i < parts.length; i++) {
    const [key, value] = parts[i].split(":");
    
    // Handle different field types appropriately
    if (key === 'pool_id') {
      recommendation[key] = value; // Keep as string for contract addresses
    } else if (key === 'min_price' || key === 'max_price') {
      recommendation[key] = parseFloat(value); // Parse as number for prices
    } else {
      recommendation[key] = isNaN(value) ? value : parseFloat(value);
    }
  }

  // ENFORCED STRUCTURE - Exactly these fields
  return {
    type: "POOL_RECOMMENDATION",
    message: message,
    pool_id: recommendation.pool_id,
    min_price: recommendation.min_price,
    max_price: recommendation.max_price
  };
}

  // Optional: Validate response structure
  static validateResponse(response) {
    const structures = {
      "STANDARD": ["type", "message"],
      "POOL_RECOMMENDATION": ["type", "message", "pool_id", "min_price", "max_price"]
    };

    const requiredFields = structures[response.type];
    if (!requiredFields) {
      return { valid: false, error: `Unknown response type: ${response.type}` };
    }

    const missing = requiredFields.filter(field => !(field in response));
    if (missing.length > 0) {
      return { valid: false, error: `Missing fields: ${missing.join(', ')}` };
    }

    return { valid: true };
  }
}

export function parseAgentResponse(output) {
  const parsed = ResponseProcessor.parseAgentResponse(output);
  
  // Optional validation
  const validation = ResponseProcessor.validateResponse(parsed);
  if (!validation.valid) {
    console.warn("Response validation warning:", validation.error);
  }
  
  // Log structured response for debugging
  console.log("📋 Structured Response:", JSON.stringify(parsed, null, 2));
  
  return parsed;
}

export const RESPONSE_TYPES = {
  STANDARD: "standard",
  POOL_RECOMMENDATION: "pool_recommendation"
};