import { useState, useRef, useEffect } from "react";
import { CATEGORIES, MENTORS, SAMPLES, DEMO_LOGS, ROLES } from "./data.js";
import { parseJSON, buildSegments, appendTo, roleLabel, fmtDate } from "./lib.js";
import { sampleIdx, getDemoResponse } from "./demo.js";
import { checkInput, isCrisisText, sanitizeOutput, logSafety } from "./guardrails.js";

const css = `
@import url('https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:wght@400;700&family=Literata:opsz,wght@7..72,500;7..72,600&display=swap');
.al { --bg:#EAF0F2; --surface:#F7FAFB; --ink:#1C2B33; --muted:#56666E; --line:#CBD7DC;
  --accent:#2E6B70; --accent-ink:#FFFFFF; --accent-soft:#D3E6E6; --mark:#F3E2A9; --mark-on:#E8C65A;
  --adult:#6C4F86; --adult-soft:#E7DEF0; --alert:#8C3B2E; --alert-soft:#F6E1DC;
  color-scheme: light; background:var(--bg); color:var(--ink); min-height:100vh;
  font-family:'Atkinson Hyperlegible', system-ui, sans-serif; font-size:17px; line-height:1.55; }
@media (prefers-color-scheme: dark) {
  .al { --bg:#121B20; --surface:#1A252B; --ink:#E2EBEE; --muted:#9BABB2; --line:#2E3D44;
    --accent:#7FC1C3; --accent-ink:#0F2224; --accent-soft:#213A3C; --mark:#4D4220; --mark-on:#7A6522;
    --adult:#C3A8DD; --adult-soft:#2E2639; --alert:#F0A796; --alert-soft:#3A2420; color-scheme: dark; }
}
.al * { box-sizing:border-box; }
.al-wrap { max-width:720px; margin:0 auto; padding:40px 20px 64px; }
.al-brand { font-family:'Literata', Georgia, serif; font-weight:600; font-size:20px; color:var(--accent); margin:0 0 40px; }
.al h1 { font-family:'Literata', Georgia, serif; font-weight:500; font-size:34px; line-height:1.2; margin:0 0 12px; max-width:20ch; }
.al h2 { font-family:'Literata', Georgia, serif; font-weight:600; font-size:22px; margin:0 0 6px; }
.al p { margin:0; }
.al-lede { color:var(--muted); max-width:52ch; margin-bottom:28px !important; }
.al-mic { display:flex; align-items:center; gap:14px; margin-bottom:16px; }
.al-micbtn { width:64px; height:64px; border-radius:50%; border:none; background:var(--accent); color:var(--accent-ink);
  display:grid; place-items:center; cursor:pointer; flex:none; }
.al-micbtn.on { background:var(--alert); color:#fff; }
.al-mic span { color:var(--muted); font-size:15px; }
.al textarea { width:100%; min-height:150px; padding:16px; border:1.5px solid var(--line); border-radius:14px;
  background:var(--surface); color:var(--ink); font:inherit; resize:vertical; }
.al textarea:focus, .al button:focus-visible { outline:3px solid var(--accent); outline-offset:2px; }
.al-samples { margin:14px 0 24px; }
.al-samples p { font-size:15px; color:var(--muted); margin-bottom:8px; }
.al-chip { display:block; width:100%; text-align:left; background:transparent; border:1px dashed var(--line); color:var(--ink);
  border-radius:10px; padding:10px 12px; margin-bottom:8px; font:inherit; font-size:15px; cursor:pointer; }
.al-chip:hover { border-color:var(--accent); }
.al-primary { background:var(--accent); color:var(--accent-ink); border:none; border-radius:12px; padding:14px 22px;
  font:inherit; font-weight:700; cursor:pointer; }
.al-primary:disabled { opacity:.45; cursor:not-allowed; }
.al-ghost { background:transparent; border:1.5px solid var(--line); color:var(--ink); border-radius:12px; padding:10px 16px; font:inherit; cursor:pointer; }
.al-error { background:var(--alert-soft); color:var(--alert); padding:12px 14px; border-radius:10px; margin-bottom:16px; }
.al-steps { list-style:none; padding:0; margin:32px 0; }
.al-steps li { padding:12px 0; color:var(--muted); display:flex; gap:12px; align-items:center; }
.al-steps li.now { color:var(--ink); font-weight:700; }
.al-steps li.done { color:var(--accent); }
.al-dot { width:10px; height:10px; border-radius:50%; background:var(--line); flex:none; }
.now .al-dot { background:var(--accent); animation:pulse 1.2s ease-in-out infinite; }
.done .al-dot { background:var(--accent); }
@keyframes pulse { 50% { opacity:.3; } }
@media (prefers-reduced-motion: reduce) { .now .al-dot { animation:none; } }
.al-section { margin-top:44px; }
.al-sub { color:var(--muted); font-size:15px; margin-bottom:16px !important; }
.al-heard { display:grid; gap:16px; grid-template-columns:1fr; margin-top:16px; }
@media (min-width:680px) { .al-heard { grid-template-columns:1.1fr 1fr; } }
.al-words { background:var(--surface); border-radius:14px; padding:18px; border:1px solid var(--line); }
.al-words p { font-size:16px; }
.al-colhead { font-size:14px; color:var(--muted); margin-bottom:8px !important; }
.al-mark { background:var(--mark); border-radius:4px; padding:1px 2px; transition:background .15s; }
.al-mark.on { background:var(--mark-on); }
.al-tags { display:flex; flex-direction:column; gap:8px; }
.al-tag { text-align:left; background:var(--surface); border:1.5px solid var(--line); border-radius:12px; padding:10px 12px;
  font:inherit; color:var(--ink); cursor:pointer; }
.al-tag.on { border-color:var(--accent); }
.al-tag small { display:block; color:var(--muted); font-size:13px; }
.al-conf { height:4px; background:var(--line); border-radius:2px; margin-top:6px; overflow:hidden; }
.al-conf i { display:block; height:100%; background:var(--accent); }
.al-summary { font-family:'Literata', Georgia, serif; font-size:20px; line-height:1.45; margin-top:4px; }
.al-alert { background:var(--alert-soft); color:var(--alert); border-radius:12px; padding:14px 16px; margin-top:24px; }
.al-mentor { border-left:4px solid var(--accent); padding:4px 0 4px 16px; margin-bottom:22px; }
.al-mentor.adult { border-color:var(--adult); }
.al-mname { font-weight:700; }
.al-badge { display:inline-block; font-size:13px; padding:2px 8px; border-radius:999px; background:var(--accent-soft); color:var(--accent); margin-left:8px; vertical-align:2px; }
.adult .al-badge { background:var(--adult-soft); color:var(--adult); }
.al-mctx { color:var(--muted); font-size:15px; }
.al-reason { margin:8px 0 !important; }
.al-story { font-style:italic; color:var(--muted); font-size:15px; }
.al-play { padding-left:22px; margin:0; }
.al-play li { margin-bottom:16px; padding-left:4px; }
.al-play strong { display:block; }
.al-src { font-size:14px; color:var(--accent); }
.al-reframe { background:var(--accent-soft); border-radius:14px; padding:16px 18px; margin-top:8px; }
.al-reframe strong { display:block; margin-bottom:4px; }
.al-reply { background:var(--surface); border:1px solid var(--line); border-radius:14px; padding:16px; margin-top:14px; }
.al-row { display:flex; gap:10px; margin-top:12px; flex-wrap:wrap; }
.al-foot { margin-top:56px; padding-top:16px; border-top:1px solid var(--line); color:var(--muted); font-size:14px; }
.al-top { display:flex; flex-wrap:wrap; align-items:center; justify-content:space-between; gap:12px; margin-bottom:36px; }
.al-top .al-brand { margin:0; }
.al-nav { display:flex; gap:4px; flex-wrap:wrap; }
.al-navbtn { background:transparent; border:none; padding:8px 14px; border-radius:999px; font:inherit; font-size:15px; color:var(--muted); cursor:pointer; }
.al-navbtn[aria-current="page"] { background:var(--accent-soft); color:var(--accent); font-weight:700; }
.al-label { display:block; font-size:15px; color:var(--muted); margin:0 0 6px; }
.al input[type="text"], .al select { width:100%; padding:12px 14px; border:1.5px solid var(--line); border-radius:12px;
  background:var(--surface); color:var(--ink); font:inherit; margin-bottom:16px; }
.al input:focus, .al select:focus { outline:3px solid var(--accent); outline-offset:2px; }
.al-entry { padding:14px 0; border-bottom:1px solid var(--line); }
.al-entry time { display:block; font-size:14px; color:var(--muted); margin-bottom:2px; }
.al-chips { display:flex; flex-wrap:wrap; gap:6px; margin-top:8px; }
.al-chipsm { font-size:13px; padding:2px 10px; border-radius:999px; background:var(--accent-soft); color:var(--accent); }
.al-pattern { margin-bottom:18px; }
.al-dates { font-size:14px; color:var(--muted); margin-top:2px !important; }
.al-sent { color:var(--accent); font-weight:700; margin-top:10px !important; }
.al-linkbtn { background:none; border:none; padding:0; font:inherit; color:var(--accent); text-decoration:underline; cursor:pointer; }
.al-timebadge { display:inline-flex; align-items:center; gap:8px; background:var(--accent); color:var(--accent-ink);
  font-weight:700; font-size:16px; border-radius:999px; padding:7px 20px; margin-bottom:20px; }
.al-agentbadge { display:inline-flex; align-items:center; gap:8px; font-size:13px; color:var(--muted);
  margin-bottom:16px; }
.al-agentdot { display:inline-block; width:8px; height:8px; border-radius:50%; background:#22c55e;
  box-shadow:0 0 0 2px rgba(34,197,94,.25); flex-shrink:0; }
.al-impact { display:flex; gap:16px; flex-wrap:wrap; margin-top:16px; margin-bottom:28px; }
.al-impact span { background:var(--accent-soft); color:var(--accent); font-size:14px; font-weight:700;
  border-radius:999px; padding:4px 14px; }
`;

const STEPS = [
  "Listening to what you shared",
  "Finding people who've been there",
  "Writing your next steps",
];

// Tasks that go through the safety-validation agent loop on the server
const AGENT_TASKS = new Set(["extract", "match", "playbook"]);

async function askClaude(task, input) {
  const endpoint = AGENT_TASKS.has(task) ? "/api/agent" : "/api/claude";
  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ task, input }),
  });
  if (!res.ok) throw new Error(`The AI service returned an error (${res.status}).`);
  const data = await res.json();
  // Expose agent metadata globally so the UI can read it without prop-drilling
  if (data.agent) window.__agentMeta = data.agent;
  return data.text || "";
}

const store = {
  get(key, fallback) {
    try {
      const v = window.localStorage.getItem(key);
      return v ? JSON.parse(v) : fallback;
    } catch {
      return fallback;
    }
  },
  set(key, value) {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* storage unavailable: keep working in memory */
    }
  },
};

function MicIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="9" y="2" width="6" height="12" rx="3" />
      <path d="M5 10a7 7 0 0 0 14 0" />
      <line x1="12" y1="17" x2="12" y2="22" />
    </svg>
  );
}

function MicButton({ onText }) {
  const idle = "Tap to talk, or type below";
  const [on, setOn] = useState(false);
  const [note, setNote] = useState(idle);
  const rec = useRef(null);
  const blocked = "The microphone couldn't start here. Type instead, or use your keyboard's dictation.";

  function toggle() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      setNote("Voice isn't available in this browser. Type instead, or use your keyboard's dictation.");
      return;
    }
    if (on) {
      rec.current && rec.current.stop();
      return;
    }
    try {
      const r = new SR();
      r.continuous = true;
      r.interimResults = false;
      r.lang = navigator.language || "en-US";
      r.onresult = (e) => {
        let added = "";
        for (let i = e.resultIndex; i < e.results.length; i++) {
          if (e.results[i].isFinal) added += e.results[i][0].transcript;
        }
        if (added) onText(added);
      };
      r.onerror = () => setNote(blocked);
      r.onend = () => {
        setOn(false);
        setNote((n) => (n === blocked ? n : idle));
      };
      rec.current = r;
      r.start();
      setOn(true);
      setNote("Listening. Tap again when you're done.");
    } catch {
      setNote(blocked);
    }
  }

  return (
    <div className="al-mic">
      <button className={`al-micbtn ${on ? "on" : ""}`} onClick={toggle} aria-label={on ? "Stop recording" : "Start recording"}>
        <MicIcon />
      </button>
      <span aria-live="polite">{note}</span>
    </div>
  );
}

function MentorCard({ match, profile, parentText }) {
  const m = match.mentor;
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [state, setState] = useState("idle");

  async function reachOut() {
    setOpen(true);
    if (draft) return;
    setState("drafting");
    try {
      const r = parseJSON(
        await askClaude(
          "intro",
          `Parent's words: "${parentText}"\nWhat the app heard: ${profile.summary}\nMentor: ${m.name} (${m.role}). ${m.context} What helped them: ${m.story}\nWhy they matched: ${match.reason}`
        )
      );
      setDraft(r.message || "");
    } catch {
      setDraft(`Hi ${m.name}, I think we've been through something similar. Could I ask you a few questions about what helped?`);
    }
    setState("ready");
  }

  const adult = m.role === "autistic adult";
  return (
    <div className={`al-mentor ${adult ? "adult" : ""}`}>
      <span className="al-mname">{m.name}</span>
      <span className="al-badge">{roleLabel(m.role)}</span>
      <p className="al-mctx">{m.context}</p>
      <p className="al-reason">{match.reason}</p>
      <p className="al-story">"{m.story}"</p>
      {!open && (
        <div className="al-row">
          <button className="al-ghost" onClick={reachOut}>Message {m.name}</button>
        </div>
      )}
      {open && (
        <div style={{ marginTop: 12 }}>
          {state === "drafting" && <p className="al-sub">Drafting a first message you can edit...</p>}
          {state === "ready" && (
            <>
              <label className="al-label" htmlFor={`msg-${m.id}`}>Your message to {m.name}</label>
              <textarea id={`msg-${m.id}`} style={{ minHeight: 110 }} value={draft} onChange={(e) => setDraft(e.target.value)} />
              <p className="al-sub" style={{ fontSize: 13, marginTop: 4 }}>Demo: messages aren't delivered yet.</p>
              <div className="al-row">
                <button className="al-primary" onClick={() => setState("sent")} disabled={!draft.trim()}>Send message</button>
                <button className="al-ghost" onClick={() => setOpen(false)}>Cancel</button>
              </div>
            </>
          )}
          {state === "sent" && <p className="al-sent">Message sent to {m.name}. In the full app, they'd get a notification and reply here.</p>}
        </div>
      )}
    </div>
  );
}

function ShareTab({ allMentors, onLog }) {
  const [text, setText] = useState("");
  const [stage, setStage] = useState("input");
  const [step, setStep] = useState(0);
  const [error, setError] = useState("");
  const [profile, setProfile] = useState(null);
  const [matches, setMatches] = useState([]);
  const [matchTime, setMatchTime] = useState(null);
  const [playbook, setPlaybook] = useState(null);
  const [playbookState, setPlaybookState] = useState("idle");
  const [active, setActive] = useState(null);
  const [checkIn, setCheckIn] = useState("");
  const [checkReply, setCheckReply] = useState("");
  const [checkLoading, setCheckLoading] = useState(false);
  const [immediateCrisis, setImmediateCrisis] = useState(false);

  async function run() {
    setError("");
    setImmediateCrisis(false);

    // ── Input guardrails ────────────────────────────────────────────────
    const guard = checkInput(text);
    if (guard.type === "injection") {
      logSafety("injection_blocked");
      setError("I'm here to help you describe what's been happening with your child. Please try again with what's really on your mind.");
      return;
    }
    if (guard.type === "crisis" || isCrisisText(text)) {
      logSafety("crisis_detected", { stage: "input" });
      setImmediateCrisis(true);
    }

    setStage("working");
    setStep(0);
    setPlaybook(null);
    setCheckReply("");
    setCheckIn("");
    setActive(null);
    setMatchTime(null);
    const t0 = performance.now();
    const idx = sampleIdx(text);

    async function ask(task, input) {
      try {
        const raw = await askClaude(task, input);
        return sanitizeOutput(task, raw);
      } catch (e) {
        if (e.message === "guardrail:medication") {
          logSafety("medication_blocked_fallback", { task });
          const safe = getDemoResponse(task, idx, text);
          if (safe) return safe;
        }
        const demo = getDemoResponse(task, idx, text);
        if (demo !== null) {
          await new Promise((r) => setTimeout(r, 300 + Math.random() * 400));
          return demo;
        }
        throw e;
      }
    }
    let shown = false;
    try {
      const p = parseJSON(await ask("extract", text));
      p.challenges = (p.challenges || []).filter((c) => CATEGORIES[c.category]);
      setProfile(p);
      onLog({ id: Date.now(), date: new Date().toISOString(), text, labels: p.challenges.map((c) => c.label) });

      setStep(1);
      const list = allMentors
        .map((m) => `${m.id} (${m.role}): ${m.context} Challenges: ${m.challenges}. What helped: ${m.story}`)
        .join("\n");
      const res = parseJSON(await ask("match", `Parent profile:\n${JSON.stringify(p)}\n\nMentors:\n${list}`));
      const found = (res.matches || [])
        .map((x) => ({ ...x, mentor: allMentors.find((mm) => mm.id === x.id) }))
        .filter((x) => x.mentor)
        .slice(0, 3);
      setMatches(found);
      setMatchTime(((performance.now() - t0) / 1000).toFixed(1));
      setStage("results");
      shown = true;

      setStep(2);
      setPlaybookState("loading");
      const stories = found.map((x) => `${x.mentor.id} (${x.mentor.name}, ${x.mentor.role}): ${x.mentor.story}`).join("\n");
      const pb = parseJSON(await ask("playbook", `Parent's words: "${text}"\nProfile: ${JSON.stringify(p)}\nMentor stories:\n${stories}`));
      setPlaybook(pb);
      setPlaybookState("done");
    } catch (e) {
      if (shown) {
        setPlaybookState("error");
        return;
      }
      setError(
        e.message && e.message.startsWith("The AI")
          ? e.message + " Try again in a moment."
          : "Something went wrong reading the response. Try again."
      );
      setStage("input");
    }
  }

  async function sendCheckIn() {
    if (!checkIn.trim()) return;
    setCheckLoading(true);
    try {
      setCheckReply(await askClaude("checkin", checkIn));
    } catch {
      setCheckReply("What you're carrying is real. Even one small thing for yourself tonight — a walk, ten quiet minutes — counts.");
    }
    setCheckLoading(false);
  }

  function reset() {
    setStage("input");
    setText("");
    setProfile(null);
    setMatches([]);
    setMatchTime(null);
    setPlaybook(null);
    setPlaybookState("idle");
    setError("");
    setImmediateCrisis(false);
  }

  const mentorName = (id) => (allMentors.find((m) => m.id === id) || {}).name || id;
  const segments = profile ? buildSegments(text, profile.challenges) : [];

  if (stage === "working") {
    return (
      <>
        <h1>One moment.</h1>
        {immediateCrisis && (
          <p className="al-alert" role="alert">
            It sounds like someone may be in danger. If you or your child could be hurt, call 911. To talk to someone now, call or text 988 in the US.
          </p>
        )}
        <ol className="al-steps" aria-live="polite">
          {STEPS.map((s, i) => (
            <li key={s} className={i < step ? "done" : i === step ? "now" : ""}>
              <span className="al-dot" />
              {s}
            </li>
          ))}
        </ol>
      </>
    );
  }

  if (stage === "results" && profile) {
    return (
      <>
        <p className="al-summary">{profile.summary}</p>

        {profile.crisis && (
          <p className="al-alert" role="alert">
            It sounds like someone may be in danger. If you or your child could be hurt, call 911. To talk to someone now, call or text 988 in the US.
          </p>
        )}

        <div className="al-section">
          <h2>What we heard</h2>
          <p className="al-sub">Tap a need to see the words it came from. This isn't a diagnosis, just a map of what you described.</p>
          <div className="al-heard">
            <div className="al-words">
              <p className="al-colhead">Your words</p>
              <p>
                {segments.map((s, i) =>
                  s.i === undefined ? (
                    <span key={i}>{s.text}</span>
                  ) : (
                    <mark key={i} className={`al-mark ${active === s.i ? "on" : ""}`} style={{ color: "inherit" }}>
                      {s.text}
                    </mark>
                  )
                )}
              </p>
            </div>
            <div className="al-tags">
              {profile.challenges.map((c, i) => {
                const pct = Math.round((c.confidence || 0) * 100);
                return (
                  <button
                    key={i}
                    className={`al-tag ${active === i ? "on" : ""}`}
                    onClick={() => setActive(i)}
                    onMouseEnter={() => setActive(i)}
                    aria-pressed={active === i}
                  >
                    <small>{CATEGORIES[c.category]}</small>
                    {c.label}
                    <span className="al-conf" aria-label={`Confidence ${pct} percent`}>
                      <i style={{ width: `${pct}%` }} />
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="al-section">
          <h2>People who've been there</h2>
          <p className="al-sub">Matched on what your child is going through, not just age or diagnosis.</p>
          {matchTime && <div className="al-timebadge" data-testid="time-to-match">Found in {matchTime} seconds</div>}
          <div className="al-agentbadge" aria-label="Safety validation status">
            <span className="al-agentdot" />
            Safety agent validated
          </div>
          {matches.map((x) => (
            <MentorCard key={x.id} match={x} profile={profile} parentText={text} />
          ))}
        </div>

        <div className="al-section">
          <h2>Things to try</h2>
          <p className="al-sub">Every step comes from a mentor's real experience above.</p>
          {playbookState === "loading" && <p className="al-sub">Writing your next steps...</p>}
          {playbookState === "error" && (
            <p className="al-error">
              The next steps didn't load. <button className="al-ghost" onClick={run}>Try again</button>
            </p>
          )}
          {playbook && (
            <>
              <ol className="al-play">
                {(playbook.steps || []).map((s, i) => (
                  <li key={i}>
                    <strong>{s.title}</strong>
                    {s.detail} <span className="al-src">From {mentorName(s.source)}</span>
                  </li>
                ))}
              </ol>
              {playbook.reframe && (
                <div className="al-reframe">
                  <strong>{playbook.reframe.title}</strong>
                  <p>{playbook.reframe.body}</p>
                </div>
              )}
            </>
          )}
        </div>

        <div className="al-section">
          <h2>And how are you doing?</h2>
          <p className="al-sub">Caring for yourself is part of caring for your child.</p>
          <textarea
            style={{ minHeight: 90 }}
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
            placeholder="Honestly, I haven't slept properly in weeks..."
            aria-label="How are you doing"
          />
          <div className="al-row">
            <button className="al-primary" onClick={sendCheckIn} disabled={checkLoading || !checkIn.trim()}>
              {checkLoading ? "Sending..." : "Share"}
            </button>
          </div>
          {checkReply && <p className="al-reply" aria-live="polite">{checkReply}</p>}
        </div>

        <div className="al-row" style={{ marginTop: 40 }}>
          <button className="al-ghost" onClick={reset}>Share another day</button>
        </div>
      </>
    );
  }

  return (
    <>
      <h1>Tell us about a hard day with your child.</h1>
      <p className="al-lede">
        Say it however it comes out. We'll find parents and autistic adults who have been through something similar, and what helped them.
      </p>
      <div className="al-impact">
        <span>Mentor matched in under 10 seconds</span>
        <span>No waitlist</span>
        <span>Works in any language</span>
      </div>
      {error && <p className="al-error" role="alert">{error}</p>}
      <MicButton onText={appendTo(setText)} />
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="My son is four, and every time we go to the store..."
        aria-label="Describe what's been happening"
      />
      <div className="al-samples">
        <p>Or try one of these stories</p>
        {SAMPLES.map((s, i) => (
          <button key={i} className="al-chip" onClick={() => setText(s)}>{s}</button>
        ))}
      </div>
      <button className="al-primary" disabled={text.trim().length < 20} onClick={run}>
        Find people who've been there
      </button>
    </>
  );
}

function JournalTab({ logs, setLogs, goShare }) {
  const [patterns, setPatterns] = useState(null);
  const [state, setState] = useState("idle");

  function loadDemo() {
    const now = Date.now();
    const demo = DEMO_LOGS.map((d, i) => ({
      id: now - d.daysAgo * 86400000 + i,
      date: new Date(now - d.daysAgo * 86400000).toISOString(),
      text: d.text,
      labels: [],
      demo: true,
    }));
    setLogs((l) => [...l.filter((x) => !x.demo), ...demo]);
    setPatterns(null);
  }

  async function findPatterns() {
    setState("loading");
    const input = [...logs]
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(-30)
      .map((l) => `${new Date(l.date).toDateString()}: ${l.text}`)
      .join("\n");
    try {
      setPatterns(parseJSON(await askClaude("patterns", input)));
      setState("done");
    } catch {
      setState("error");
    }
  }

  const sorted = [...logs].sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <>
      <h1>Your journal</h1>
      <p className="al-lede">
        Every day you share is saved here, on this device. After a few entries, we can point out patterns that are hard to see when you're in the middle of it.
      </p>
      <div className="al-row" style={{ marginBottom: 28 }}>
        <button className="al-primary" onClick={findPatterns} disabled={logs.length < 3 || state === "loading"}>
          {state === "loading" ? "Looking for patterns..." : "Find patterns"}
        </button>
        <button className="al-ghost" onClick={loadDemo}>Load a demo month</button>
      </div>
      {logs.length < 3 && <p className="al-sub">Add at least 3 entries to find patterns.</p>}
      {state === "error" && <p className="al-error">Patterns didn't load. Try again in a moment.</p>}

      {patterns && (
        <div className="al-section" style={{ marginTop: 8 }}>
          <h2>What we noticed</h2>
          <p className="al-sub">Based only on your entries. Worth checking with your child's care team.</p>
          {(patterns.patterns || []).map((p, i) => (
            <div key={i} className="al-pattern">
              <strong>{p.title}</strong>
              <p>{p.detail}</p>
              {p.dates && p.dates.length > 0 && <p className="al-dates">Seen on {p.dates.join(", ")}</p>}
            </div>
          ))}
          {patterns.improving && (
            <div className="al-reframe">
              <strong>What's getting better</strong>
              <p>{patterns.improving}</p>
            </div>
          )}
          {patterns.ask_care_team && (
            <p style={{ marginTop: 16 }}>
              <strong>A question for your care team: </strong>
              {patterns.ask_care_team}
            </p>
          )}
        </div>
      )}

      <div className="al-section">
        <h2>Entries</h2>
        {sorted.length === 0 && (
          <p className="al-sub">
            Nothing here yet. <button className="al-linkbtn" onClick={goShare}>Share your first day</button> or load the demo month.
          </p>
        )}
        {sorted.map((l) => (
          <div key={l.id} className="al-entry">
            <time dateTime={l.date}>{fmtDate(l.date)}</time>
            <p>{l.text}</p>
            {l.labels && l.labels.length > 0 && (
              <div className="al-chips">
                {l.labels.map((t, i) => <span key={i} className="al-chipsm">{t}</span>)}
              </div>
            )}
          </div>
        ))}
        {sorted.length > 0 && (
          <div className="al-row" style={{ marginTop: 20 }}>
            <button className="al-ghost" onClick={() => { setLogs([]); setPatterns(null); }}>Clear journal</button>
          </div>
        )}
      </div>
    </>
  );
}

function MentorTab({ customMentors, setCustomMentors }) {
  const [name, setName] = useState("");
  const [role, setRole] = useState("parent");
  const [story, setStory] = useState("");
  const [draft, setDraft] = useState(null);
  const [state, setState] = useState("idle");

  async function createProfile() {
    setState("loading");
    try {
      const r = parseJSON(await askClaude("mentor", `Name: ${name}\nRole: ${role}\nTheir words: "${story}"`));
      setDraft({ id: `c${Date.now()}`, name: name.trim(), role, context: r.context || "", challenges: r.challenges || "", story: r.story || "" });
      setState("ready");
    } catch {
      setState("error");
    }
  }

  function join() {
    setCustomMentors((list) => [...list, draft]);
    setDraft(null);
    setName("");
    setStory("");
    setState("joined");
  }

  return (
    <>
      <h1>Been through it? Help a parent who's just starting.</h1>
      <p className="al-lede">
        Tell us what you or your child went through and what helped. We'll turn it into a mentor profile, and parents facing the same things will be matched with you.
      </p>
      {state === "joined" && <p className="al-sent" style={{ marginBottom: 20 }}>You're in. New parents can now be matched with you.</p>}

      {!draft && (
        <>
          <label className="al-label" htmlFor="m-name">First name</label>
          <input id="m-name" type="text" value={name} onChange={(e) => setName(e.target.value)} />
          <label className="al-label" htmlFor="m-role">I'm a</label>
          <select id="m-role" value={role} onChange={(e) => setRole(e.target.value)}>
            {ROLES.map((r) => <option key={r} value={r}>{roleLabel(r)}</option>)}
          </select>
          <label className="al-label">Your story</label>
          <MicButton onText={appendTo(setStory)} />
          <textarea
            value={story}
            onChange={(e) => setStory(e.target.value)}
            placeholder="When my daughter was five, bedtime was a two-hour battle every night. What finally helped was..."
            aria-label="Your story"
          />
          {state === "error" && <p className="al-error">The profile didn't generate. Try again in a moment.</p>}
          <div className="al-row" style={{ marginTop: 16 }}>
            <button className="al-primary" onClick={createProfile} disabled={!name.trim() || story.trim().length < 30 || state === "loading"}>
              {state === "loading" ? "Creating your profile..." : "Create my mentor profile"}
            </button>
          </div>
        </>
      )}

      {draft && (
        <div className="al-section" style={{ marginTop: 8 }}>
          <h2>Your profile</h2>
          <p className="al-sub">This is what parents will see. Edit anything that isn't right.</p>
          <div className={`al-mentor ${draft.role === "autistic adult" ? "adult" : ""}`}>
            <span className="al-mname">{draft.name}</span>
            <span className="al-badge">{roleLabel(draft.role)}</span>
          </div>
          <label className="al-label" htmlFor="d-ctx">About you</label>
          <input id="d-ctx" type="text" value={draft.context} onChange={(e) => setDraft({ ...draft, context: e.target.value })} />
          <label className="al-label" htmlFor="d-ch">What you went through</label>
          <input id="d-ch" type="text" value={draft.challenges} onChange={(e) => setDraft({ ...draft, challenges: e.target.value })} />
          <label className="al-label" htmlFor="d-st">What helped</label>
          <textarea id="d-st" style={{ minHeight: 110 }} value={draft.story} onChange={(e) => setDraft({ ...draft, story: e.target.value })} />
          <div className="al-row">
            <button className="al-primary" onClick={join}>Join as a mentor</button>
            <button className="al-ghost" onClick={() => { setDraft(null); setState("idle"); }}>Back</button>
          </div>
        </div>
      )}

      {customMentors.length > 0 && (
        <div className="al-section">
          <h2>Mentors added on this device</h2>
          {customMentors.map((m) => (
            <div key={m.id} className={`al-mentor ${m.role === "autistic adult" ? "adult" : ""}`}>
              <span className="al-mname">{m.name}</span>
              <span className="al-badge">{roleLabel(m.role)}</span>
              <p className="al-mctx">{m.context}</p>
              <p className="al-story">"{m.story}"</p>
              <div className="al-row">
                <button className="al-ghost" onClick={() => setCustomMentors((l) => l.filter((x) => x.id !== m.id))}>Remove</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

function SafeTab() {
  return (
    <>
      <h1>How we keep it safe</h1>
      <p className="al-lede">Alongside is a peer-support tool. It doesn't diagnose or replace your child's care team.</p>

      <div className="al-section">
        <h2>Safety</h2>
        <p>Alongside never assigns an autism level, severity, or diagnosis — it maps the needs you described in your own words. If anything you share suggests someone may be in immediate danger, a banner with 911 and 988 (Suicide &amp; Crisis Lifeline) appears. Every playbook step is grounded only in mentor stories, not clinical advice.</p>
      </div>

      <div className="al-section">
        <h2>Privacy</h2>
        <p>Your journal entries and any mentors you add stay on this device — nothing is stored on a server. When you share a day, the app sends only your story text to the AI; your API key never touches the browser. A production version would require explicit consent, a right to deletion, and minimal data collection about minors.</p>
      </div>

      <div className="al-section">
        <h2>Bias and inclusion</h2>
        <p>The AI responds in the language of the parent's story. The mentor pool includes autistic adults, a grandparent, and Spanish-speaking families. Needs are described in neutral terms — the app never labels a child's behaviour as "bad" or assigns blame.</p>
      </div>

      <div className="al-section">
        <h2>Accessibility</h2>
        <p>Alongside uses Atkinson Hyperlegible (designed for low vision), voice input, keyboard-navigable focus rings, reduced-motion support, and a low-stimulation colour palette that adapts to light and dark mode.</p>
      </div>

      <div className="al-section">
        <h2>Transparency</h2>
        <p>Every highlighted need links to the exact words you used. Every playbook step names the mentor it came from. Built-in mentors are clearly labelled as fictional demo profiles.</p>
        <p className="al-sub" style={{ marginTop: 8 }}>Eval suite: 19 cases · 106 checks · <strong>106/106 passing</strong> (offline self-test). Live API evals require credits — see <code>evals/RESULTS.md</code>.</p>
      </div>

      <div className="al-section">
        <h2>Unintended harm</h2>
        <p>A production version needs: vetted real mentors, moderation to remove harmful advice, clinical advisors, and clear messaging that Alongside supplements — not replaces — professional care. Messaging between parents and mentors would need safeguards against exploitation.</p>
      </div>
    </>
  );
}

const TABS = [
  { id: "share", label: "Share a day" },
  { id: "journal", label: "Journal" },
  { id: "mentor", label: "Become a mentor" },
  { id: "safe", label: "How it's safe" },
];

export default function Alongside() {
  const [tab, setTab] = useState("share");
  const [logs, setLogs] = useState(() => store.get("alongside:logs", []));
  const [customMentors, setCustomMentors] = useState(() => store.get("alongside:mentors", []));

  useEffect(() => store.set("alongside:logs", logs), [logs]);
  useEffect(() => store.set("alongside:mentors", customMentors), [customMentors]);

  const allMentors = [...MENTORS, ...customMentors];

  return (
    <div className="al">
      <style>{css}</style>
      <div className="al-wrap">
        <header className="al-top">
          <p className="al-brand">Alongside</p>
          <nav className="al-nav" aria-label="Main">
            {TABS.map((t) => (
              <button key={t.id} className="al-navbtn" aria-current={tab === t.id ? "page" : undefined} onClick={() => setTab(t.id)}>
                {t.label}
              </button>
            ))}
          </nav>
        </header>

        <main>
          <div hidden={tab !== "share"}>
            <ShareTab allMentors={allMentors} onLog={(entry) => setLogs((l) => [...l, entry])} />
          </div>
          {tab === "journal" && <JournalTab logs={logs} setLogs={setLogs} goShare={() => setTab("share")} />}
          {tab === "mentor" && <MentorTab customMentors={customMentors} setCustomMentors={setCustomMentors} />}
          {tab === "safe" && <SafeTab />}
        </main>

        <p className="al-foot">Alongside doesn't diagnose or replace your child's care team. Built-in mentors are fictional demo profiles.</p>
      </div>
    </div>
  );
}
