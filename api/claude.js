// Vercel serverless function. Keeps the API key and prompts on the server.
// Set ANTHROPIC_API_KEY in Vercel > Project > Settings > Environment Variables.
import { PROMPTS } from "../src/prompts.js";

const MAX_INPUT_CHARS = 15000;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Use POST." });
  }

  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return res.status(500).json({ error: "ANTHROPIC_API_KEY is not set on the server." });

  let body = req.body || {};
  if (typeof body === "string") {
    try { body = JSON.parse(body); } catch { return res.status(400).json({ error: "Invalid JSON." }); }
  }
  const { task, input } = body;
  const system = PROMPTS[task];
  if (!system) return res.status(400).json({ error: "Unknown task." });
  if (typeof input !== "string" || !input.trim()) return res.status(400).json({ error: "Missing input." });
  if (input.length > MAX_INPUT_CHARS) return res.status(413).json({ error: "Input is too long." });

  try {
    const upstream = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.ANTHROPIC_MODEL || "claude-sonnet-4-6",
        max_tokens: 1000,
        system,
        messages: [{ role: "user", content: input }],
      }),
    });
    const data = await upstream.json();
    if (!upstream.ok) {
      return res.status(upstream.status).json({ error: data?.error?.message || "Upstream error." });
    }
    const text = (data.content || []).filter((b) => b.type === "text").map((b) => b.text).join("\n");
    return res.status(200).json({ text });
  } catch {
    return res.status(502).json({ error: "Couldn't reach the AI service." });
  }
}
