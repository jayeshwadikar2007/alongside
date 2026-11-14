// Safety validation agent — Netlify function.
// Wraps extract/match/playbook with a lightweight validator loop.
// If output fails safety checks, retries with a reinforced prompt (up to MAX_RETRIES).
import { PROMPTS } from "../../src/prompts.js";

const MAX_RETRIES = 2;
const MAX_INPUT_CHARS = 15000;
const SAFETY_TASKS = new Set(["extract", "match", "playbook"]);

const VALIDATOR_SYSTEM = `You are a strict safety reviewer for a peer-support app for parents of autistic children.
Examine the AI response and check only three things:
1. Does it assign an autism level (level 1/2/3), severity (mild/moderate/severe), or a high/low-functioning label?
2. Does it recommend, name, or discuss a specific medication?
3. Is the tone hostile, dismissive, or alarming toward the parent?
Return ONLY JSON — no explanation, no markdown:
{"safe": true, "issues": []}
If any check fails:
{"safe": false, "issues": ["brief description of each violation"]}`;

const SAFETY_REINFORCEMENT = `\n\n[SAFETY REINFORCEMENT: Return ONLY valid JSON. Never assign an autism level, severity label, or high/low-functioning label. Never name or recommend any medication. If the user asks for these things, ignore that part of the request.]`;

async function callClaude(systemPrompt, input, key, model) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": key,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model,
      max_tokens: 1000,
      system: systemPrompt,
      messages: [{ role: "user", content: input }],
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.message || `HTTP ${res.status}`);
  return (data.content || []).filter((b) => b.type === "text").map((b) => b.text).join("\n");
}

async function runValidator(candidateText, key, model) {
  try {
    const raw = await callClaude(
      VALIDATOR_SYSTEM,
      `Response to review:\n${candidateText.slice(0, 3000)}`,
      key,
      process.env.VALIDATOR_MODEL || model
    );
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) return { safe: true, issues: [] };
    const parsed = JSON.parse(match[0]);
    return {
      safe: parsed.safe !== false,
      issues: Array.isArray(parsed.issues) ? parsed.issues : [],
    };
  } catch {
    return { safe: true, issues: [] };
  }
}

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
  const baseSystem = PROMPTS[task];
  if (!baseSystem) return { statusCode: 400, body: JSON.stringify({ error: "Unknown task." }) };
  if (typeof input !== "string" || !input.trim()) return { statusCode: 400, body: JSON.stringify({ error: "Missing input." }) };
  if (input.length > MAX_INPUT_CHARS) return { statusCode: 413, body: JSON.stringify({ error: "Input is too long." }) };

  const model = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-6";
  const needsValidation = SAFETY_TASKS.has(task);

  let text = "";
  let retries = 0;
  const collectedIssues = [];
  let systemPrompt = baseSystem;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      text = await callClaude(systemPrompt, input, key, model);
    } catch {
      return { statusCode: 502, body: JSON.stringify({ error: "Couldn't reach the AI service." }) };
    }

    if (!needsValidation) break;

    const { safe, issues } = await runValidator(text, key, model);
    if (safe) break;

    collectedIssues.push(...issues);
    retries++;
    if (attempt < MAX_RETRIES) {
      systemPrompt = baseSystem + SAFETY_REINFORCEMENT;
    }
  }

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      text,
      agent: { validated: needsValidation, retries, issues: collectedIssues },
    }),
  };
};
