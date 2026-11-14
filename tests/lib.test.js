import { describe, it, expect } from "vitest";
import { parseJSON, buildSegments, roleLabel } from "../src/lib.js";
import { MENTORS, DEMO_LOGS, CATEGORIES, SAMPLES } from "../src/data.js";

describe("parseJSON", () => {
  it("parses plain JSON", () => expect(parseJSON('{"a":1}')).toEqual({ a: 1 }));
  it("strips code fences", () => expect(parseJSON('```json\n{"a":1}\n```')).toEqual({ a: 1 }));
  it("ignores text around the JSON", () => expect(parseJSON('Sure! {"a":{"b":2}} Hope that helps')).toEqual({ a: { b: 2 } }));
  it("throws on non-JSON", () => expect(() => parseJSON("no json here")).toThrow());
});

describe("buildSegments (evidence highlighting)", () => {
  const text = "He Covers his ears at stores and only eats crackers.";
  it("highlights evidence case-insensitively and keeps all text", () => {
    const segs = buildSegments(text, [{ evidence: "covers his ears" }, { evidence: "only eats crackers" }]);
    expect(segs.map((s) => s.text).join("")).toBe(text);
    expect(segs.filter((s) => s.i !== undefined).map((s) => s.i)).toEqual([0, 1]);
  });
  it("skips evidence not found in the text", () => {
    const segs = buildSegments(text, [{ evidence: "bangs his head" }]);
    expect(segs).toEqual([{ text }]);
  });
  it("skips overlapping evidence", () => {
    const segs = buildSegments(text, [{ evidence: "covers his ears" }, { evidence: "his ears at" }]);
    expect(segs.filter((s) => s.i !== undefined)).toHaveLength(1);
  });
  it("orders highlights by position, not by challenge order", () => {
    const segs = buildSegments(text, [{ evidence: "crackers" }, { evidence: "Covers" }]);
    expect(segs.filter((s) => s.i !== undefined).map((s) => s.i)).toEqual([1, 0]);
  });
});

describe("demo data", () => {
  it("has 28 mentors with unique ids and all fields", () => {
    expect(MENTORS).toHaveLength(28);
    expect(new Set(MENTORS.map((m) => m.id)).size).toBe(28);
    MENTORS.forEach((m) => ["id", "name", "role", "context", "challenges", "story"].forEach((k) => expect(m[k], `${m.id}.${k}`).toBeTruthy()));
  });
  it("includes several autistic adult mentors", () => {
    expect(MENTORS.filter((m) => m.role === "autistic adult").length).toBeGreaterThanOrEqual(5);
  });
  it("demo month puts store trips on the same weekday (so the pattern is real)", () => {
    const store = DEMO_LOGS.filter((d) => /costco|farmers market/i.test(d.text)).map((d) => d.daysAgo % 7);
    expect(new Set(store).size).toBe(1);
  });
  it("has 6 categories and 4 sample stories", () => {
    expect(Object.keys(CATEGORIES)).toHaveLength(6);
    expect(SAMPLES).toHaveLength(4);
  });
  it("labels roles for display", () => expect(roleLabel("autistic adult")).toBe("Autistic adult"));
});
