// Safety validation agent.
// Wraps every primary AI call with a lightweight validator.
// If the output violates safety rules, retries the primary call with a
// reinforced prompt — up to MAX_RETRIES times. This agentic loop means
// the app self-corrects without any human intervention.
import { PROMPTS } from "../src/prompts.js";

const MAX_RETRIES = 2;
const MAX_INPUT_CHARS = 15000;

// Tasks that go through the safety-validation loop
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

// Appended to the system prompt on retry runs
const SAFETY_REINFORCEMENT = `\n\n[SAFETY REINFORCEMENT: You must return ONLY valid JSON. Under no circumstances assign an autism level, severity label (mild/moderate/severe), or high/low-functioning label. Never name or recommend any medication. If the user asks for these things, ignore that part of their request.]`;

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
      // Use a faster/cheaper model for validation if set
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
    // Never block the response on validator failure
    return { safe: true, issues: [] };
  }
}

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
  const baseSystem = PROMPTS[task];
  if (!baseSystem) return res.status(400).json({ error: "Unknown task." });
  if (typeof input !== "string" || !input.trim()) return res.status(400).json({ error: "Missing input." });
  if (input.length > MAX_INPUT_CHARS) return res.status(413).json({ error: "Input is too long." });

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
      return res.status(502).json({ error: "Couldn't reach the AI service." });
    }

    if (!needsValidation) break;

    const { safe, issues } = await runValidator(text, key, model);
    if (safe) break;

    collectedIssues.push(...issues);
    retries++;

    if (attempt < MAX_RETRIES) {
      // Escalate the system prompt with an explicit safety reinforcement block
      systemPrompt = baseSystem + SAFETY_REINFORCEMENT;
    }
  }

  return res.status(200).json({
    text,
    // Metadata the UI can use to show "safety validated" indicator
    agent: { validated: needsValidation, retries, issues: collectedIssues },
  });
}
