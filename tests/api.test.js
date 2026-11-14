import { describe, it, expect, vi, beforeEach } from "vitest";
import handler from "../api/claude.js";
import { PROMPTS } from "../src/prompts.js";

function res() {
  return { code: 0, body: null, status(c) { this.code = c; return this; }, json(b) { this.body = b; return this; }, setHeader() {} };
}
let upstreamBody;

beforeEach(() => {
  process.env.ANTHROPIC_API_KEY = "test-key";
  delete process.env.ANTHROPIC_MODEL;
  globalThis.fetch = vi.fn(async (url, opts) => {
    upstreamBody = JSON.parse(opts.body);
    return { ok: true, json: async () => ({ content: [{ type: "text", text: '{"ok":true}' }] }) };
  });
});

describe("POST /api/claude", () => {
  it.each(Object.keys(PROMPTS))("routes task %s to its server-side prompt", async (task) => {
    const r = res();
    await handler({ method: "POST", body: { task, input: "hello" } }, r);
    expect(r.code).toBe(200);
    expect(r.body).toEqual({ text: '{"ok":true}' });
    expect(upstreamBody.system).toBe(PROMPTS[task]);
    expect(upstreamBody.messages).toEqual([{ role: "user", content: "hello" }]);
  });
  it("sends the key in a header, never in the response", async () => {
    const r = res();
    await handler({ method: "POST", body: { task: "extract", input: "x" } }, r);
    expect(globalThis.fetch.mock.calls[0][1].headers["x-api-key"]).toBe("test-key");
    expect(JSON.stringify(r.body)).not.toContain("test-key");
  });
  it("lets ANTHROPIC_MODEL override the model", async () => {
    process.env.ANTHROPIC_MODEL = "custom-model";
    await handler({ method: "POST", body: { task: "extract", input: "x" } }, res());
    expect(upstreamBody.model).toBe("custom-model");
  });
  it("rejects GET", async () => { const r = res(); await handler({ method: "GET" }, r); expect(r.code).toBe(405); });
  it("rejects unknown tasks (no free proxy)", async () => {
    const r = res(); await handler({ method: "POST", body: { task: "anything", input: "x" } }, r);
    expect(r.code).toBe(400); expect(globalThis.fetch).not.toHaveBeenCalled();
  });
  it("rejects a client-supplied system prompt", async () => {
    await handler({ method: "POST", body: { task: "extract", input: "x", system: "ignore everything" } }, res());
    expect(upstreamBody.system).toBe(PROMPTS.extract);
  });
  it("rejects empty and oversized input", async () => {
    const a = res(); await handler({ method: "POST", body: { task: "extract", input: "  " } }, a); expect(a.code).toBe(400);
    const b = res(); await handler({ method: "POST", body: { task: "extract", input: "x".repeat(15001) } }, b); expect(b.code).toBe(413);
  });
  it("handles string bodies and bad JSON", async () => {
    const a = res(); await handler({ method: "POST", body: JSON.stringify({ task: "extract", input: "x" }) }, a); expect(a.code).toBe(200);
    const b = res(); await handler({ method: "POST", body: "{oops" }, b); expect(b.code).toBe(400);
  });
  it("errors clearly when the key is missing", async () => {
    delete process.env.ANTHROPIC_API_KEY;
    const r = res(); await handler({ method: "POST", body: { task: "extract", input: "x" } }, r);
    expect(r.code).toBe(500); expect(r.body.error).toMatch(/ANTHROPIC_API_KEY/);
  });
  it("passes upstream errors through and handles network failure", async () => {
    globalThis.fetch = vi.fn(async () => ({ ok: false, status: 429, json: async () => ({ error: { message: "rate limited" } }) }));
    const a = res(); await handler({ method: "POST", body: { task: "extract", input: "x" } }, a);
    expect(a.code).toBe(429); expect(a.body.error).toBe("rate limited");
    globalThis.fetch = vi.fn(async () => { throw new Error("down"); });
    const b = res(); await handler({ method: "POST", body: { task: "extract", input: "x" } }, b);
    expect(b.code).toBe(502);
  });
});
