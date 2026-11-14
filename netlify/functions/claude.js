// Netlify function — single AI call for non-safety-sensitive tasks.
// Keeps the API key server-side; browser only sends { task, input }.
import { PROMPTS } from "../../src/prompts.js";

const MAX_INPUT_CHARS = 15000;

export const handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Use POST." }) };
  }

  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    return { statusCode: 500, body: JSON.stringify({ error: "ANTHROPIC_API_KEY is not set on the server." }) };
  }

  let body = {};
  try {
    body = JSON.parse(event.body || "{}");
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: "Invalid JSON." }) };
  }

  const { task, input } = body;
  const system = PROMPTS[task];
  if (!system) return { statusCode: 400, body: JSON.stringify({ error: "Unknown task." }) };
  if (typeof input !== "string" || !input.trim()) return { statusCode: 400, body: JSON.stringify({ error: "Missing input." }) };
  if (input.length > MAX_INPUT_CHARS) return { statusCode: 413, body: JSON.stringify({ error: "Input is too long." }) };

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
      return { statusCode: upstream.status, body: JSON.stringify({ error: data?.error?.message || "Upstream error." }) };
    }
    const text = (data.content || []).filter((b) => b.type === "text").map((b) => b.text).join("\n");
    return { statusCode: 200, headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text }) };
  } catch {
    return { statusCode: 502, body: JSON.stringify({ error: "Couldn't reach the AI service." }) };
  }
};
