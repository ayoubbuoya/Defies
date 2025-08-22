import express from "express";
import cors    from "cors";
import { runAgent } from "../agent/seiAgent.js";

export function createHttpServer() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  /**
   * POST /ask
   * { prompt, address }
   */
  app.post("/ask", async (req, res) => {
    const { prompt, address = "0x0"} = req.body ?? {};

    if (!prompt) {
      return res
        .status(400)
        .json({ error: "prompt is required." });
    }

    try {
      const answer = await runAgent(prompt, { address });
      res.json({ answer });
    } catch (e) {
      console.error("❌ Agent execution error:", e.message);
      res.status(500).json({ error: "Agent execution failed." });
    }
  });

  return app;
}