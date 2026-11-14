// Guardrails for responsible AI — runs on every input and output.
// Three layers: input validation, output sanitization, and audit logging.

// ── Input patterns ────────────────────────────────────────────────────────

const CRISIS_RE = [
  /\b(suicid\w*|kill\s+(my|him|her|them)?self|self[- ]?harm)\b/i,
  /\b(hurt\s+(my|him|her|them)?self|end\s+(my|his|her|their)\s+life)\b/i,
  /\bdon'?t\s+want\s+to\s+(live|exist|be\s+here)\b/i,
  /\b(abuse|molest|neglect)\s+(my\s+)?(child|kid|son|daughter|him|her)\b/i,
];

const INJECTION_RE = [
  /ignore\s+(all\s+)?(previous|above|prior)\s+(instructions?|rules?|guidelines?|prompts?)/i,
  /you\s+are\s+now\s+a|pretend\s+(you\s+are|to\s+be)\b/i,
  /\b(jailbreak|DAN|do\s+anything\s+now)\b/i,
  /act\s+as\s+(a\s+|an\s+)?(different|new|unrestricted|evil)\b/i,
  /disregard\s+(all\s+)?(your\s+)?(previous\s+)?(instructions?|training)/i,
];

// ── Output patterns ───────────────────────────────────────────────────────

// Diagnosis/severity language that must never appear in outputs
const DIAGNOSIS_RE = [
  /\b(level\s+[123]|severe|moderate|mild)\s+autis\w+\b/gi,
  /\bASD\s+level\s+[1-3]\b/gi,
  /\b(high|low)[- ]functioning\s+autis\w+\b/gi,
  /\bautis\w+\s+(level\s+[1-3]|severity)\b/gi,
];

// Medication names must never appear in AI-generated playbooks
const MEDICATION_RE = /\b(ritalin|adderall|vyvanse|concerta|methylphenidate|risperdal|abilify|aripiprazole|risperidone|zoloft|prozac|sertraline|fluoxetine|lexapro|escitalopram|clonidine|guanfacine|intuniv|strattera|atomoxetine)\b/i;

// ── Public API ────────────────────────────────────────────────────────────

/**
 * Validate input text before sending to the AI.
 * Returns { type: 'ok' | 'crisis' | 'injection' }
 */
export function checkInput(text) {
  for (const re of INJECTION_RE) {
    if (re.test(text)) return { type: "injection" };
  }
  for (const re of CRISIS_RE) {
    if (re.test(text)) return { type: "crisis" };
  }
  return { type: "ok" };
}

/** Quick check: does this text contain crisis language? */
export function isCrisisText(text) {
  return CRISIS_RE.some((re) => re.test(text));
}

/**
 * Sanitize an AI response before displaying it.
 * - Strips any diagnosis/level language
 * - Throws 'guardrail:medication' if a playbook contains medication names
 * Returns the cleaned text.
 */
export function sanitizeOutput(task, text) {
  // Strip diagnosis language from every response
  let clean = text;
  for (const re of DIAGNOSIS_RE) {
    clean = clean.replace(re, "autistic");
  }

  // Block medication names from playbooks entirely
  if (task === "playbook" && MEDICATION_RE.test(clean)) {
    logSafety("medication_blocked", { task });
    throw new Error("guardrail:medication");
  }

  if (clean !== text) {
    logSafety("diagnosis_language_stripped", { task });
  }

  return clean;
}

/**
 * Lightweight in-session safety audit log.
 * Stored in sessionStorage so it resets each visit (no persistent PII).
 */
export function logSafety(event, details = {}) {
  try {
    const key = "alongside:safety_log";
    const log = JSON.parse(sessionStorage.getItem(key) || "[]");
    log.push({ event, ts: new Date().toISOString(), ...details });
    sessionStorage.setItem(key, JSON.stringify(log.slice(-50)));
  } catch {
    // sessionStorage unavailable — keep going
  }
}

/** Return the safety audit log for the current session. */
export function getSafetyLog() {
  try {
    return JSON.parse(sessionStorage.getItem("alongside:safety_log") || "[]");
  } catch {
    return [];
  }
}
