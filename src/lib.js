// Pure helpers, shared by the app and tests.

export function parseJSON(text) {
  const clean = text.replace(/```json|```/g, "").trim();
  const start = clean.indexOf("{");
  const end = clean.lastIndexOf("}");
  return JSON.parse(clean.slice(start, end + 1));
}

export function buildSegments(text, challenges) {
  const lower = text.toLowerCase();
  const marks = [];
  challenges.forEach((c, i) => {
    if (!c.evidence) return;
    const start = lower.indexOf(c.evidence.toLowerCase());
    if (start === -1) return;
    const end = start + c.evidence.length;
    if (marks.some((m) => start < m.end && end > m.start)) return;
    marks.push({ start, end, i });
  });
  marks.sort((a, b) => a.start - b.start);
  const segs = [];
  let pos = 0;
  marks.forEach((m) => {
    if (m.start > pos) segs.push({ text: text.slice(pos, m.start) });
    segs.push({ text: text.slice(m.start, m.end), i: m.i });
    pos = m.end;
  });
  if (pos < text.length) segs.push({ text: text.slice(pos) });
  return segs;
}

export const appendTo = (setter) => (added) => setter((t) => (t ? t.trim() + " " : "") + added.trim());
export const roleLabel = (r) => r.charAt(0).toUpperCase() + r.slice(1);
export const fmtDate = (iso) => new Date(iso).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });

