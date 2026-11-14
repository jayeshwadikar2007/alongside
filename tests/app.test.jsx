import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, within, waitFor, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../src/App.jsx";

const STORY = "My son is four. He covers his ears at the store and he only eats crackers now. I'm so tired.";

let replies;
let calls;

function defaultReplies() {
  return {
    extract: {
      summary: "You're carrying a lot right now.",
      child_age: "4",
      challenges: [
        { category: "sensory", label: "Overwhelmed by noise", evidence: "covers his ears", confidence: 0.9 },
        { category: "daily_living", label: "Very limited diet", evidence: "only eats crackers", confidence: 0.8 },
        { category: "not_a_category", label: "Should be dropped", evidence: "tired", confidence: 0.5 },
      ],
      triggers: ["store"],
      parent_stress: "high",
      crisis: false,
    },
    match: {
      matches: [
        { id: "m1", reason: "Priya's son also struggled in stores.", shared: [] },
        { id: "m2", reason: "Daniel can explain sensory overload.", shared: [] },
        { id: "m14", reason: "Sam knows food textures.", shared: [] },
        { id: "nope", reason: "Unknown mentor", shared: [] },
      ],
    },
    playbook: {
      steps: [
        { title: "Try noise-canceling headphones", detail: "Start with short trips.", source: "m1" },
        { title: "Keep a safe food on the plate", detail: "No pressure.", source: "m14" },
      ],
      reframe: { title: "Meltdowns aren't tantrums", body: "A meltdown is overload, not a choice." },
    },
    checkin: "That sounds exhausting. Could you take ten quiet minutes tonight?",
    patterns: {
      patterns: [{ title: "Store trips are hardest", detail: "Crowded places come up often.", dates: ["Thu Oct 22 2026", "Thu Oct 29 2026"] }],
      improving: "Headphones seem to be helping.",
      ask_care_team: "Could an OT assess noise sensitivity?",
    },
    intro: { message: "Hi Priya, my son also melts down at the store. What helped first?" },
    mentor: { context: "Daughter Ana, now 8.", challenges: "bedtime battles", story: "A picture routine helped us." },
  };
}

function okResponse(task) {
  const r = replies[task];
  if (r instanceof Error) return { ok: false, status: 500, json: async () => ({ error: "fail" }) };
  return { ok: true, json: async () => ({ text: typeof r === "string" ? r : JSON.stringify(r) }) };
}

beforeEach(() => {
  localStorage.clear();
  replies = defaultReplies();
  calls = [];
  globalThis.fetch = vi.fn(async (url, opts) => {
    const body = JSON.parse(opts.body);
    calls.push(body);
    expect(url).toBe("/api/claude");
    return okResponse(body.task);
  });
  delete window.SpeechRecognition;
  delete window.webkitSpeechRecognition;
});
afterEach(cleanup);

async function shareStory(user, text = STORY) {
  await user.type(screen.getByLabelText("Describe what's been happening"), text);
  await user.click(screen.getByRole("button", { name: "Find people who've been there" }));
}

const gotoTab = (user, name) => user.click(screen.getByRole("button", { name }));

describe("Share a day", () => {
  it("disables submit until there are at least 20 characters", async () => {
    const user = userEvent.setup();
    render(<App />);
    const btn = screen.getByRole("button", { name: "Find people who've been there" });
    expect(btn.disabled).toBe(true);
    await user.type(screen.getByLabelText("Describe what's been happening"), "too short");
    expect(btn.disabled).toBe(true);
    await user.type(screen.getByLabelText("Describe what's been happening"), " but now it is long enough");
    expect(btn.disabled).toBe(false);
  });

  it("sample stories fill the text box", async () => {
    const user = userEvent.setup();
    render(<App />);
    const chip = screen.getAllByRole("button").find((b) => b.textContent.startsWith("My son is four. Every time"));
    await user.click(chip);
    expect(screen.getByLabelText("Describe what's been happening").value).toMatch(/^My son is four/);
  });

  it("runs the full flow: summary, highlighted evidence, mentors, playbook, reframe", async () => {
    const user = userEvent.setup();
    const { container } = render(<App />);
    await shareStory(user);

    expect(await screen.findByText("You're carrying a lot right now.")).toBeTruthy();

    const marks = [...container.querySelectorAll("mark")].map((m) => m.textContent);
    expect(marks).toEqual(["covers his ears", "only eats crackers"]);

    expect(screen.getByRole("button", { name: /Overwhelmed by noise/ })).toBeTruthy();
    expect(screen.queryByText("Should be dropped")).toBeNull();

    expect(screen.getByText("Priya")).toBeTruthy();
    expect(screen.getByText("Daniel")).toBeTruthy();
    expect(screen.getByText("Sam")).toBeTruthy();
    expect(screen.queryByText("Unknown mentor")).toBeNull();
    expect(screen.getAllByText("Autistic adult").length).toBe(2);

    expect(await screen.findByText("Try noise-canceling headphones")).toBeTruthy();
    expect(screen.getByText("From Priya")).toBeTruthy();
    expect(screen.getByText("From Sam")).toBeTruthy();
    expect(screen.getByText("Meltdowns aren't tantrums")).toBeTruthy();

    expect(calls.map((c) => c.task)).toEqual(["extract", "match", "playbook"]);
    expect(calls[0].input).toBe(STORY);
    expect(calls[1].input).toContain("m28 (parent)");
    expect(calls[2].input).toContain("m1 (Priya, parent)");
    expect(calls[2].input).not.toContain("m28");
  });

  it("tapping a need highlights its words", async () => {
    const user = userEvent.setup();
    const { container } = render(<App />);
    await shareStory(user);
    await user.click(await screen.findByRole("button", { name: /Very limited diet/ }));
    const on = container.querySelector("mark.on");
    expect(on && on.textContent).toBe("only eats crackers");
  });

  it("shows a crisis banner when the AI flags danger", async () => {
    replies.extract.crisis = true;
    const user = userEvent.setup();
    render(<App />);
    await shareStory(user);
    const alert = await screen.findByRole("alert");
    expect(alert.textContent).toMatch(/988/);
  });

  it("falls back to results when the API fails", async () => {
    replies.extract = new Error("down");
    const user = userEvent.setup();
    render(<App />);
    await shareStory(user);
    // Generic fallback kicks in — app shows results rather than an error
    expect(await screen.findByText(/challenging/)).toBeTruthy();
    expect(screen.queryByLabelText("Describe what's been happening")).toBeNull();
  });

  it("returns to the input when the AI sends unreadable JSON", async () => {
    replies.extract = "Sorry, I can't help with that.";
    const user = userEvent.setup();
    render(<App />);
    await shareStory(user);
    expect((await screen.findByRole("alert")).textContent).toMatch(/Something went wrong/);
  });

  it("shows a fallback playbook and keeps mentors visible when only the playbook API fails", async () => {
    replies.playbook = new Error("down");
    const user = userEvent.setup();
    render(<App />);
    await shareStory(user);
    expect(screen.getByText("Priya")).toBeTruthy();
    // Generic playbook fallback kicks in instead of error
    expect(await screen.findByText(/Notice what's already working/)).toBeTruthy();
  });

  it("starts over with 'Share another day'", async () => {
    const user = userEvent.setup();
    render(<App />);
    await shareStory(user);
    await user.click(await screen.findByRole("button", { name: "Share another day" }));
    expect(screen.getByLabelText("Describe what's been happening").value).toBe("");
  });
});

describe("Message a mentor", () => {
  it("drafts an editable message and sends it", async () => {
    const user = userEvent.setup();
    render(<App />);
    await shareStory(user);
    await user.click(await screen.findByRole("button", { name: "Message Priya" }));
    const box = await screen.findByLabelText("Your message to Priya");
    expect(box.value).toMatch(/^Hi Priya/);
    const intro = calls.find((c) => c.task === "intro");
    expect(intro.input).toContain(STORY);
    expect(intro.input).toContain("Priya");

    await user.clear(box);
    await user.type(box, "Hi Priya, can we talk?");
    await user.click(screen.getByRole("button", { name: "Send message" }));
    expect(screen.getByText(/Message sent to Priya/)).toBeTruthy();
  });

  it("falls back to a starter message if drafting fails", async () => {
    replies.intro = new Error("down");
    const user = userEvent.setup();
    render(<App />);
    await shareStory(user);
    await user.click(await screen.findByRole("button", { name: "Message Daniel" }));
    expect((await screen.findByLabelText("Your message to Daniel")).value).toMatch(/^Hi Daniel/);
  });
});

describe("Parent check-in", () => {
  it("shows the AI's reply", async () => {
    const user = userEvent.setup();
    render(<App />);
    await shareStory(user);
    await user.type(await screen.findByLabelText("How are you doing"), "I haven't slept in weeks.");
    await user.click(screen.getByRole("button", { name: "Share" }));
    expect(await screen.findByText(/ten quiet minutes/)).toBeTruthy();
    expect(calls.at(-1)).toEqual({ task: "checkin", input: "I haven't slept in weeks." });
  });
});

describe("Journal", () => {
  it("saves each shared day as an entry with its labels, and persists it", async () => {
    const user = userEvent.setup();
    render(<App />);
    await shareStory(user);
    await screen.findByText("You're carrying a lot right now.");
    await gotoTab(user, "Journal");
    const entry = document.querySelector(".al-entry");
    expect(within(entry).getByText(STORY)).toBeTruthy();
    expect(within(entry).getByText("Overwhelmed by noise")).toBeTruthy();
    const saved = JSON.parse(localStorage.getItem("alongside:logs"));
    expect(saved).toHaveLength(1);
    expect(saved[0].text).toBe(STORY);
  });

  it("keeps the share results when switching tabs and back", async () => {
    const user = userEvent.setup();
    render(<App />);
    await shareStory(user);
    await screen.findByText("You're carrying a lot right now.");
    await gotoTab(user, "Journal");
    await gotoTab(user, "Share a day");
    expect(screen.getByText("You're carrying a lot right now.")).toBeTruthy();
  });

  it("needs 3 entries before finding patterns", async () => {
    const user = userEvent.setup();
    render(<App />);
    await gotoTab(user, "Journal");
    expect(screen.getByRole("button", { name: "Find patterns" }).disabled).toBe(true);
    expect(screen.getByText("Add at least 3 entries to find patterns.")).toBeTruthy();
  });

  it("loads a demo month and finds patterns from entries sent oldest first", async () => {
    const user = userEvent.setup();
    const { container } = render(<App />);
    await gotoTab(user, "Journal");
    await user.click(screen.getByRole("button", { name: "Load a demo month" }));
    expect(container.querySelectorAll(".al-entry")).toHaveLength(9);

    // Loading twice doesn't duplicate.
    await user.click(screen.getByRole("button", { name: "Load a demo month" }));
    expect(container.querySelectorAll(".al-entry")).toHaveLength(9);

    await user.click(screen.getByRole("button", { name: "Find patterns" }));
    expect(await screen.findByText("Store trips are hardest")).toBeTruthy();
    expect(screen.getByText(/Seen on Thu Oct 22 2026/)).toBeTruthy();
    expect(screen.getByText("Headphones seem to be helping.")).toBeTruthy();
    expect(screen.getByText(/Could an OT assess/)).toBeTruthy();

    const lines = calls.find((c) => c.task === "patterns").input.split("\n");
    expect(lines).toHaveLength(9);
    expect(lines[0]).toMatch(/Costco/);
    expect(lines[8]).toMatch(/shorter/);
    expect(lines[0]).toMatch(/^\w{3} \w{3} \d{2} \d{4}: /);
  });

  it("shows an error if pattern finding fails", async () => {
    replies.patterns = new Error("down");
    const user = userEvent.setup();
    render(<App />);
    await gotoTab(user, "Journal");
    await user.click(screen.getByRole("button", { name: "Load a demo month" }));
    await user.click(screen.getByRole("button", { name: "Find patterns" }));
    expect(await screen.findByText(/Patterns didn't load/)).toBeTruthy();
  });

  it("clears the journal", async () => {
    const user = userEvent.setup();
    const { container } = render(<App />);
    await gotoTab(user, "Journal");
    await user.click(screen.getByRole("button", { name: "Load a demo month" }));
    await user.click(screen.getByRole("button", { name: "Clear journal" }));
    expect(container.querySelectorAll(".al-entry")).toHaveLength(0);
    expect(JSON.parse(localStorage.getItem("alongside:logs"))).toEqual([]);
  });

  it("restores saved entries on reload", async () => {
    localStorage.setItem("alongside:logs", JSON.stringify([{ id: 1, date: new Date().toISOString(), text: "Saved earlier", labels: [] }]));
    const user = userEvent.setup();
    render(<App />);
    await gotoTab(user, "Journal");
    expect(screen.getByText("Saved earlier")).toBeTruthy();
  });
});

describe("Become a mentor", () => {
  async function createMentor(user) {
    await gotoTab(user, "Become a mentor");
    await user.type(screen.getByLabelText("First name"), "Ana");
    await user.selectOptions(screen.getByLabelText("I'm a"), "parent");
    await user.type(screen.getByLabelText("Your story"), "When my daughter was five, bedtime took two hours every night until we made a picture routine.");
    await user.click(screen.getByRole("button", { name: "Create my mentor profile" }));
  }

  it("needs a name and a real story", async () => {
    const user = userEvent.setup();
    render(<App />);
    await gotoTab(user, "Become a mentor");
    expect(screen.getByRole("button", { name: "Create my mentor profile" }).disabled).toBe(true);
    await user.type(screen.getByLabelText("First name"), "Ana");
    await user.type(screen.getByLabelText("Your story"), "short");
    expect(screen.getByRole("button", { name: "Create my mentor profile" }).disabled).toBe(true);
  });

  it("creates an editable profile, joins, and is matched in the next share", async () => {
    const user = userEvent.setup();
    render(<App />);
    await createMentor(user);

    const mentorCall = calls.find((c) => c.task === "mentor");
    expect(mentorCall.input).toContain("Name: Ana");
    expect(mentorCall.input).toContain("Role: parent");

    const story = await screen.findByLabelText("What helped");
    expect(story.value).toBe("A picture routine helped us.");
    await user.clear(screen.getByLabelText("About you"));
    await user.type(screen.getByLabelText("About you"), "Daughter Ana Lucia, now 8.");
    await user.click(screen.getByRole("button", { name: "Join as a mentor" }));

    expect(screen.getByText(/You're in/)).toBeTruthy();
    const added = screen.getByText("Mentors added on this device").closest(".al-section");
    expect(within(added).getByText("Daughter Ana Lucia, now 8.")).toBeTruthy();
    expect(JSON.parse(localStorage.getItem("alongside:mentors"))).toHaveLength(1);

    await gotoTab(user, "Share a day");
    await shareStory(user);
    await screen.findByText("You're carrying a lot right now.");
    const match = calls.filter((c) => c.task === "match").at(-1);
    expect(match.input).toMatch(/c\d+ \(parent\): Daughter Ana Lucia, now 8\./);
  });

  it("removes an added mentor", async () => {
    const user = userEvent.setup();
    render(<App />);
    await createMentor(user);
    await user.click(await screen.findByRole("button", { name: "Join as a mentor" }));
    await user.click(screen.getByRole("button", { name: "Remove" }));
    expect(screen.queryByText("Mentors added on this device")).toBeNull();
    expect(JSON.parse(localStorage.getItem("alongside:mentors"))).toEqual([]);
  });

  it("shows an error if profile creation fails", async () => {
    replies.mentor = new Error("down");
    const user = userEvent.setup();
    render(<App />);
    await createMentor(user);
    expect(await screen.findByText(/profile didn't generate/)).toBeTruthy();
  });
});

describe("How it's safe tab", () => {
  it("renders all six required headings", async () => {
    const user = userEvent.setup();
    render(<App />);
    await gotoTab(user, "How it's safe");
    for (const heading of ["Safety", "Privacy", "Bias and inclusion", "Accessibility", "Transparency", "Unintended harm"]) {
      expect(screen.getByRole("heading", { name: heading })).toBeTruthy();
    }
  });
});

describe("Time to match", () => {
  it("shows 'Found in X.X seconds' after matches appear", async () => {
    const user = userEvent.setup();
    render(<App />);
    await shareStory(user);
    const el = await screen.findByTestId("time-to-match");
    expect(el.textContent).toMatch(/^Found in \d+\.\d seconds$/);
  });
});

describe("Honest demo messaging", () => {
  it("shows a demo note under the message box", async () => {
    const user = userEvent.setup();
    render(<App />);
    await shareStory(user);
    await user.click(await screen.findByRole("button", { name: "Message Priya" }));
    await screen.findByLabelText("Your message to Priya");
    expect(screen.getByText("Demo: messages aren't delivered yet.")).toBeTruthy();
  });
});

describe("Voice input", () => {
  it("explains the typing fallback when speech isn't supported", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole("button", { name: "Start recording" }));
    expect(screen.getByText(/Voice isn't available in this browser/)).toBeTruthy();
  });

  it("appends dictated speech to the text box", async () => {
    let instance;
    window.SpeechRecognition = class {
      constructor() { instance = this; }
      start() {}
      stop() { this.onend && this.onend(); }
    };
    const user = userEvent.setup();
    render(<App />);
    const box = screen.getByLabelText("Describe what's been happening");
    await user.type(box, "He is four.");
    await user.click(screen.getByRole("button", { name: "Start recording" }));
    expect(screen.getByText(/Listening/)).toBeTruthy();

    const result = [{ transcript: "He screams at the store" }];
    result.isFinal = true;
    const { act } = await import("@testing-library/react");
    act(() => instance.onresult({ resultIndex: 0, results: [result] }));
    expect(box.value).toBe("He is four. He screams at the store");

    await user.click(screen.getByRole("button", { name: "Stop recording" }));
    await waitFor(() => expect(screen.getByText("Tap to talk, or type below")).toBeTruthy());
  });
});
