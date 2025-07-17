import 'dotenv/config';
import Groq from 'groq-sdk';
import fetch from 'node-fetch';

const apiKey = process.env.GROQ_API_KEY;

if (!apiKey) {
  console.error(" GROQ_API_KEY is missing! Check your .env file.");
  process.exit(1);
}

const groq = new Groq({ apiKey });

async function main() {
  try {
    // 1. Fetch market data
    const response = await fetch(
      "https://asia-southeast1-ktx-finance-2.cloudfunctions.net/sailor_kline_api/smart_kline/wsei/usdt?interval=15&limit=30"
    );
    const marketData = await response.json();

    // 2. Prepare prompt
    const prompt = `Given the following market data, determine a conservative price range for concentrated liquidity provision for this trading pair.
Return only a JSON array in the format: [minPrice, maxPrice].
The range should be wide enough to minimize impermanent loss (approx. ±10% of the current price).
No explanation or extra text.

Market data: ${JSON.stringify(marketData.data)}

}
 `;

    // 3. Call Groq API
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      model: "meta-llama/llama-4-scout-17b-16e-instruct",

    });

    console.log("🧠 Groq Response:\n", completion.choices[0]?.message?.content || "No response");
  } catch (error) {
    console.error("🔥 Error:", error);
  }
}

main();
