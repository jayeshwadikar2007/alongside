// Canned responses for the three sample stories.
// Used as API fallback so the demo works even without network or API credits.

import { SAMPLES } from "./data.js";

export function sampleIdx(text) {
  const t = text.trim();
  for (let i = 0; i < SAMPLES.length; i++) {
    if (t === SAMPLES[i].trim()) return i;
  }
  return -1;
}

const R = [
  // ── Sample 0: grocery store ──────────────────────────────────────────
  {
    extract: `{"summary":"You're carrying a lot — the exhaustion is real, and so is the love behind every hard trip to the store.","child_age":"4","challenges":[{"category":"sensory","label":"Overwhelmed by noise","evidence":"screams and covers his ears","confidence":0.95},{"category":"daily_living","label":"Very limited foods","evidence":"only eats crackers and plain pasta","confidence":0.9},{"category":"emotional_regulation","label":"Meltdowns in public","evidence":"everyone is staring at us","confidence":0.8}],"triggers":["grocery store","crowded places"],"parent_stress":"high","crisis":false}`,

    match: `{"matches":[{"id":"m1","reason":"Priya's son Arjun had the same reaction to store noise at age 4 — she found strategies that made trips possible again.","shared":["noise in stores","meltdowns in public"]},{"id":"m14","reason":"Sam experienced food textures as genuinely painful, not picky — their insight changes how to think about the crackers-and-pasta phase.","shared":["limited diet","texture sensitivity"]},{"id":"m2","reason":"Daniel can explain what sensory overload feels like from the inside, helping you understand what your son is experiencing rather than just managing the behaviour.","shared":["sensory overload","meltdowns"]}]}`,

    playbook: `{"steps":[{"title":"Try noise-canceling headphones","detail":"Start with one short aisle and leave before he hits his limit. Priya found building up gradually made full trips possible within a few weeks.","source":"m1"},{"title":"Keep safe foods on the plate, no pressure","detail":"Sam found that having familiar foods always available — with zero pressure to try anything else — was what slowly expanded their diet over time.","source":"m14"},{"title":"Leave before the limit, not after","detail":"Priya learned to watch for early signs and leave while things were still okay, rather than pushing through until meltdown.","source":"m1"}],"reframe":{"title":"A meltdown isn't a tantrum","body":"Daniel explains that a meltdown happens when the nervous system is completely overwhelmed — it's not defiance. Your son isn't giving you a hard time; he's having a hard time."}}`,

    checkin: "That exhaustion is real, and the courage it takes to keep showing up for him is real too. Tonight, even ten quiet minutes for yourself — before the dishes, before tomorrow — counts.",
  },

  // ── Sample 1: masking daughter ───────────────────────────────────────
  {
    extract: `{"summary":"You're noticing something important that many parents miss — that calm at school and falling apart at home often go hand in hand.","child_age":"7","challenges":[{"category":"emotional_regulation","label":"Crashes after school","evidence":"minute she gets home she falls apart","confidence":0.95},{"category":"daily_living","label":"Waking at 3am","evidence":"wakes up at 3am most nights","confidence":0.9},{"category":"emotional_regulation","label":"Masking at school","evidence":"angel at school","confidence":0.85}],"triggers":["after school","nighttime"],"parent_stress":"high","crisis":false}`,

    match: `{"matches":[{"id":"m7","reason":"Rosa was exactly this child — calm at school, falling apart at home — and her explanation of masking will completely reframe what you're seeing.","shared":["masking","shutdowns at home"]},{"id":"m3","reason":"Marisol's whole family was sleep-deprived from 3am wake-ups until a consistent picture-card bedtime routine changed everything.","shared":["3am wake-ups","sleep"]},{"id":"m2","reason":"Daniel helps parents understand why home is where their child finally lets go — it's actually a sign of safety and trust.","shared":["holding it in","emotional release at home"]}]}`,

    playbook: `{"steps":[{"title":"Give a decompression buffer after school","detail":"Rosa explains the child is exhausted from holding it together all day. Even 20 quiet minutes before any demands — snack, couch, no questions — can reduce the crash.","source":"m7"},{"title":"Build a picture-card bedtime routine","detail":"Marisol found that the same visual routine done in the same order every night made bedtime predictable and calmed the sleep.","source":"m3"},{"title":"Quiet after a meltdown, not talking","detail":"Daniel found that talking through what happened immediately made things worse. Quiet first, connection later.","source":"m2"}],"reframe":{"title":"Home is the safe place to fall apart","body":"Rosa explains that your daughter holds everything together at school because she has to, and falls apart at home because she trusts you enough to. The meltdowns are a sign you're her safe person."}}`,

    checkin: "What you're describing takes so much out of a parent — the vigilance, the cleanup, the gap between how the world sees her and how hard things actually are. That's worth acknowledging. What do you do when you get a moment to yourself?",
  },

  // ── Sample 2: non-speaking, hitting ──────────────────────────────────
  {
    extract: `{"summary":"You're in one of the hardest places — a new diagnosis, a long wait, and a child who is trying so hard to reach you.","child_age":"5","challenges":[{"category":"communication","label":"Not yet speaking","evidence":"still not talking","confidence":0.95},{"category":"emotional_regulation","label":"Hits when frustrated","evidence":"hits me or bangs his head on the floor","confidence":0.9},{"category":"transitions","label":"Long therapy waitlist","evidence":"waitlist for therapy is eight months","confidence":0.8}],"triggers":["unmet needs","frustration"],"parent_stress":"high","crisis":false}`,

    match: `{"matches":[{"id":"m5","reason":"Aiko's son Ren was also non-speaking at five with the same frustration-hitting — getting an AAC app changed everything and the hitting faded as he could communicate.","shared":["non-speaking","hitting from frustration"]},{"id":"m26","reason":"Tariq is non-speaking himself and communicates by AAC — his message about presuming competence is one of the most important things a parent in your position can hear.","shared":["AAC","being understood"]},{"id":"m9","reason":"Neha was on the same 8-month waitlist and found parent-coaching programs that taught her strategies to use at home right away.","shared":["waitlist","new diagnosis"]}]}`,

    playbook: `{"steps":[{"title":"Ask about AAC now, before the waitlist clears","detail":"Aiko found that even before formal therapy, an AAC app gave Ren a voice — and as he could say what he wanted, the hitting faded.","source":"m5"},{"title":"Presume he understands everything","detail":"Tariq says people assumed he didn't understand because he couldn't speak — he understood everything. Talk to him, explain what's happening, and give him time to respond.","source":"m26"},{"title":"Find a parent-coaching program while you wait","detail":"Neha found programs through her regional autism center that taught her strategies for home right away — the waitlist matters less when you have tools now.","source":"m9"}],"reframe":{"title":"He's communicating — you're learning his language","body":"Tariq and Aiko both say hitting and head-banging are a child saying 'I need something and have no other way to tell you.' He's not being difficult; he's trying his hardest to reach you."}}`,

    checkin: "Eight months is a long time to hold this alone. You're already doing something brave by looking for help now, before the system is ready for you. What feels most urgent today — the communication, the hitting, or just getting through the day?",
  },
];

const GENERIC_CHECKIN = "What you're carrying is real. Even one small thing for yourself tonight — a walk, ten quiet minutes — counts as taking care of yourself.";

export function getDemoResponse(task, idx) {
  if (idx >= 0 && idx < R.length) {
    const r = R[idx][task];
    if (r !== undefined) return r;
  }
  if (task === "checkin") return GENERIC_CHECKIN;
  return null;
}
