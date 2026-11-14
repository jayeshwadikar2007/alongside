// Canned responses for sample stories + keyword-based fallbacks for custom text.
// Used when the API is unavailable — keeps the demo working without credits.

import { SAMPLES } from "./data.js";

export function sampleIdx(text) {
  const t = text.trim();
  for (let i = 0; i < SAMPLES.length; i++) {
    if (t === SAMPLES[i].trim()) return i;
  }
  return -1;
}

const R = [
  // ── 0: grocery store (English) ───────────────────────────────────────
  {
    extract: `{"summary":"You're carrying a lot — the exhaustion is real, and so is the love behind every hard trip to the store.","child_age":"4","challenges":[{"category":"sensory","label":"Overwhelmed by noise","evidence":"screams and covers his ears","confidence":0.95},{"category":"daily_living","label":"Very limited foods","evidence":"only eats crackers and plain pasta","confidence":0.9},{"category":"emotional_regulation","label":"Meltdowns in public","evidence":"everyone is staring at us","confidence":0.8}],"triggers":["grocery store","crowded places"],"parent_stress":"high","crisis":false}`,
    match: `{"matches":[{"id":"m1","reason":"Priya's son Arjun had the same reaction to store noise at age 4 — she found strategies that made trips possible again.","shared":["noise in stores","meltdowns in public"]},{"id":"m14","reason":"Sam experienced food textures as genuinely painful, not picky — their insight changes how to think about the crackers-and-pasta phase.","shared":["limited diet","texture sensitivity"]},{"id":"m2","reason":"Daniel can explain what sensory overload feels like from the inside, helping you understand what your son is experiencing rather than just managing the behaviour.","shared":["sensory overload","meltdowns"]}]}`,
    playbook: `{"steps":[{"title":"Try noise-canceling headphones","detail":"Start with one short aisle and leave before he hits his limit. Priya found building up gradually made full trips possible within a few weeks.","source":"m1"},{"title":"Keep safe foods on the plate, no pressure","detail":"Sam found that having familiar foods always available — with zero pressure to try anything else — was what slowly expanded their diet over time.","source":"m14"},{"title":"Leave before the limit, not after","detail":"Priya learned to watch for early signs and leave while things were still okay, rather than pushing through until meltdown.","source":"m1"}],"reframe":{"title":"A meltdown isn't a tantrum","body":"Daniel explains that a meltdown happens when the nervous system is completely overwhelmed — it's not defiance. Your son isn't giving you a hard time; he's having a hard time."}}`,
    checkin: "That exhaustion is real, and the courage it takes to keep showing up for him is real too. Tonight, even ten quiet minutes for yourself — before the dishes, before tomorrow — counts.",
  },

  // ── 1: masking daughter ──────────────────────────────────────────────
  {
    extract: `{"summary":"You're noticing something important that many parents miss — that calm at school and falling apart at home often go hand in hand.","child_age":"7","challenges":[{"category":"emotional_regulation","label":"Crashes after school","evidence":"minute she gets home she falls apart","confidence":0.95},{"category":"daily_living","label":"Waking at 3am","evidence":"wakes up at 3am most nights","confidence":0.9},{"category":"emotional_regulation","label":"Masking at school","evidence":"angel at school","confidence":0.85}],"triggers":["after school","nighttime"],"parent_stress":"high","crisis":false}`,
    match: `{"matches":[{"id":"m7","reason":"Rosa was exactly this child — calm at school, falling apart at home — and her explanation of masking will completely reframe what you're seeing.","shared":["masking","shutdowns at home"]},{"id":"m3","reason":"Marisol's whole family was sleep-deprived from 3am wake-ups until a consistent picture-card bedtime routine changed everything.","shared":["3am wake-ups","sleep"]},{"id":"m2","reason":"Daniel helps parents understand why home is where their child finally lets go — it's actually a sign of safety and trust.","shared":["holding it in","emotional release at home"]}]}`,
    playbook: `{"steps":[{"title":"Give a decompression buffer after school","detail":"Rosa explains the child is exhausted from holding it together all day. Even 20 quiet minutes before any demands — snack, couch, no questions — can reduce the crash.","source":"m7"},{"title":"Build a picture-card bedtime routine","detail":"Marisol found that the same visual routine done in the same order every night made bedtime predictable and calmed the sleep.","source":"m3"},{"title":"Quiet after a meltdown, not talking","detail":"Daniel found that talking through what happened immediately made things worse. Quiet first, connection later.","source":"m2"}],"reframe":{"title":"Home is the safe place to fall apart","body":"Rosa explains that your daughter holds everything together at school because she has to, and falls apart at home because she trusts you enough to. The meltdowns are a sign you're her safe person."}}`,
    checkin: "What you're describing takes so much out of a parent — the vigilance, the cleanup, the gap between how the world sees her and how hard things actually are. That's worth acknowledging. What do you do when you get a moment to yourself?",
  },

  // ── 2: non-speaking, hitting ─────────────────────────────────────────
  {
    extract: `{"summary":"You're in one of the hardest places — a new diagnosis, a long wait, and a child who is trying so hard to reach you.","child_age":"5","challenges":[{"category":"communication","label":"Not yet speaking","evidence":"still not talking","confidence":0.95},{"category":"emotional_regulation","label":"Hits when frustrated","evidence":"hits me or bangs his head on the floor","confidence":0.9},{"category":"transitions","label":"Long therapy waitlist","evidence":"waitlist for therapy is eight months","confidence":0.8}],"triggers":["unmet needs","frustration"],"parent_stress":"high","crisis":false}`,
    match: `{"matches":[{"id":"m5","reason":"Aiko's son Ren was also non-speaking at five with the same frustration-hitting — getting an AAC app changed everything and the hitting faded as he could communicate.","shared":["non-speaking","hitting from frustration"]},{"id":"m26","reason":"Tariq is non-speaking himself and communicates by AAC — his message about presuming competence is one of the most important things a parent in your position can hear.","shared":["AAC","being understood"]},{"id":"m9","reason":"Neha was on the same 8-month waitlist and found parent-coaching programs that taught her strategies to use at home right away.","shared":["waitlist","new diagnosis"]}]}`,
    playbook: `{"steps":[{"title":"Ask about AAC now, before the waitlist clears","detail":"Aiko found that even before formal therapy, an AAC app gave Ren a voice — and as he could say what he wanted, the hitting faded.","source":"m5"},{"title":"Presume he understands everything","detail":"Tariq says people assumed he didn't understand because he couldn't speak — he understood everything. Talk to him, explain what's happening, and give him time to respond.","source":"m26"},{"title":"Find a parent-coaching program while you wait","detail":"Neha found programs through her regional autism center that taught her strategies for home right away — the waitlist matters less when you have tools now.","source":"m9"}],"reframe":{"title":"He's communicating — you're learning his language","body":"Tariq and Aiko both say hitting and head-banging are a child saying 'I need something and have no other way to tell you.' He's not being difficult; he's trying his hardest to reach you."}}`,
    checkin: "Eight months is a long time to hold this alone. You're already doing something brave by looking for help now, before the system is ready for you. What feels most urgent today — the communication, the hitting, or just getting through the day?",
  },

  // ── 3: Spanish grocery story ─────────────────────────────────────────
  {
    extract: `{"summary":"Estás cargando con mucho — el agotamiento es real, y también lo es el amor detrás de cada viaje difícil al supermercado.","child_age":"4","challenges":[{"category":"sensory","label":"Sobrecarga de ruido","evidence":"grita y se tapa los oídos","confidence":0.95},{"category":"daily_living","label":"Alimentación muy limitada","evidence":"solo come galletas y pasta","confidence":0.9},{"category":"emotional_regulation","label":"Meltdowns en público","evidence":"todos nos miran","confidence":0.8}],"triggers":["supermercado","lugares concurridos"],"parent_stress":"high","crisis":false}`,
    match: `{"matches":[{"id":"m13","reason":"Luis es una familia hispanohablante que navegó los mismos desafíos — sabe cómo encontrar recursos y profesionales que hablan español.","shared":["familia hispanohablante","recursos en español"]},{"id":"m1","reason":"El hijo de Priya, Arjun, tenía la misma reacción al ruido del supermercado a los 4 años — ella encontró estrategias que hicieron posibles las visitas.","shared":["ruido en tiendas","meltdowns en público"]},{"id":"m14","reason":"Sam vivió las texturas de los alimentos como algo genuinamente doloroso — su perspectiva cambia cómo entender la fase de galletas y pasta.","shared":["dieta limitada","sensibilidad a texturas"]}]}`,
    playbook: `{"steps":[{"title":"Busca grupos de familias hispanohablantes","detail":"Luis encontró que un grupo bilingüe de padres le señaló recursos y profesionales en español mucho más rápido que cualquier directorio.","source":"m13"},{"title":"Prueba auriculares con cancelación de ruido","detail":"Empieza con un pasillo corto y sal antes de que llegue a su límite. Priya encontró que ir gradualmente hizo posibles las visitas completas en pocas semanas.","source":"m1"},{"title":"Alimentos seguros en el plato, sin presión","detail":"Sam descubrió que tener alimentos familiares siempre disponibles — sin presión de probar nada más — fue lo que fue ampliando su dieta poco a poco.","source":"m14"}],"reframe":{"title":"Un meltdown no es una rabieta","body":"Un meltdown ocurre cuando el sistema nervioso está completamente saturado — no es desobediencia. Tu hijo no te hace la vida difícil; él está pasándola difícil."}}`,
    checkin: "Ese agotamiento es real, y el valor que toma seguir apareciendo para él también lo es. Esta noche, aunque sean diez minutos tranquilos para ti — antes de los platos, antes de mañana — cuentan.",
  },
];

// ── Generic keyword-based fallback for any custom story ──────────────────

function topMentors(text) {
  const t = text.toLowerCase();
  const scores = {};
  const bump = (ids) => ids.forEach((id) => { scores[id] = (scores[id] || 0) + 1; });

  if (/noise|loud|ear|scream|crowd|sensory|overwhelm/.test(t)) bump(["m1", "m2", "m12"]);
  if (/sleep|3am|night|wake|bedtime/.test(t)) bump(["m3", "m2"]);
  if (/school|teacher|meltdown|home after|mask/.test(t)) bump(["m7", "m17", "m4"]);
  if (/talk|speak|word|aac|verbal|not say/.test(t)) bump(["m5", "m26", "m21"]);
  if (/hit|bang|head|aggress|hurt himself/.test(t)) bump(["m10", "m5"]);
  if (/food|eat|diet|texture|cracker|pasta|picky/.test(t)) bump(["m14", "m1"]);
  if (/waitlist|diagnos|new|just found|eight month/.test(t)) bump(["m9", "m22"]);
  if (/toilet|bathroom|potty/.test(t)) bump(["m8"]);
  if (/transition|change|tablet|screen|routine/.test(t)) bump(["m18", "m20"]);
  if (/grandparent|grandma|alone|burnout|no help|caregiver/.test(t)) bump(["m19"]);
  if (/español|supermercado|habla|hispanoh/.test(t)) bump(["m13"]);

  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]).map(([id]) => id);
  const defaults = ["m1", "m2", "m9"];
  const result = [...sorted];
  for (const d of defaults) {
    if (result.length >= 3) break;
    if (!result.includes(d)) result.push(d);
  }
  return result.slice(0, 3);
}

const MENTOR_REASONS = {
  m1: "Priya's son had similar reactions in busy public places — she found strategies that made outings possible again.",
  m2: "Daniel offers an autistic adult's perspective on what your child may be experiencing from the inside.",
  m3: "Marisol went through similar sleep challenges and found routines that helped the whole family.",
  m4: "Kevin navigated school supports and found his son thrived with the right accommodations.",
  m5: "Aiko's son had similar communication challenges — AAC was a turning point for their family.",
  m7: "Rosa was the child who held it together at school and fell apart at home — her insight on masking is invaluable.",
  m8: "Tom worked through daily routine challenges step by step and found what clicked.",
  m9: "Neha navigated a new diagnosis and long waitlists and found ways to get support right away.",
  m10: "Marcus learned to identify the triggers behind difficult moments and built strategies around them.",
  m12: "Grace found practical solutions for sensory challenges around clothing and daily routines.",
  m13: "Luis is a Spanish-speaking parent who found bilingual resources and community support.",
  m14: "Sam experienced sensory challenges with food as genuinely painful — their perspective changes how to think about a limited diet.",
  m17: "Chloe experienced school refusal herself — quiet spaces and trusted adults made the difference.",
  m18: "Ahmed found that visual timers and clear warnings made difficult transitions much calmer.",
  m19: "Linda raised her grandson alone and found respite care and community support she didn't know existed.",
  m20: "Diego helped his son build flexibility around change using small, positive surprises.",
  m21: "Mei learned that scripting and echolalia were her daughter's way of communicating, not a problem to fix.",
  m22: "Ben was diagnosed alongside his son and found that understanding his own needs made him a better parent.",
  m26: "Tariq is non-speaking and uses AAC — his message about presuming competence is one every parent should hear.",
};

function genericFallback(task, text) {
  const t = text.toLowerCase();
  const top3 = topMentors(text);

  if (task === "extract") {
    const challenges = [];
    if (/noise|loud|ear|scream|crowd|sensory/.test(t))
      challenges.push({ category: "sensory", label: "Sensory overload", evidence: (text.match(/\b\w+ (?:his|her|their) ears?\b/i) || [text.split(/\W/).slice(0, 4).join(" ")])[0].slice(0, 40), confidence: 0.85 });
    if (/food|eat|only|cracker|pasta|picky|diet/.test(t))
      challenges.push({ category: "daily_living", label: "Very limited diet", evidence: (text.match(/only eats? [\w ]+/i) || ["limited foods"])[0].slice(0, 40), confidence: 0.8 });
    if (/meltdown|scream|cry|fall apart|tantrum/.test(t))
      challenges.push({ category: "emotional_regulation", label: "Intense meltdowns", evidence: (text.match(/\b(?:meltdown|scream|cri\w+|fall apart)\b/i) || ["meltdowns"])[0].slice(0, 40), confidence: 0.8 });
    if (/sleep|3am|night|wake/.test(t))
      challenges.push({ category: "daily_living", label: "Sleep difficulties", evidence: (text.match(/\b(?:sleep|3am|night|wake)\w*/i) || ["sleep"])[0].slice(0, 40), confidence: 0.8 });
    if (/talk|speak|word|aac/.test(t))
      challenges.push({ category: "communication", label: "Limited speech", evidence: (text.match(/(?:not |still )(?:talk|speak)\w*/i) || ["not talking"])[0].slice(0, 40), confidence: 0.85 });
    if (/hit|bang|head|aggress/.test(t))
      challenges.push({ category: "emotional_regulation", label: "Aggressive when overwhelmed", evidence: (text.match(/\b(?:hit|bang|aggress)\w*/i) || ["hitting"])[0].slice(0, 40), confidence: 0.8 });
    if (/transition|change|routine|tablet|screen/.test(t))
      challenges.push({ category: "transitions", label: "Difficulty with change", evidence: (text.match(/\b(?:transition|change|routine|tablet|screen)\w*/i) || ["transitions"])[0].slice(0, 40), confidence: 0.75 });
    if (challenges.length === 0)
      challenges.push({ category: "emotional_regulation", label: "Daily challenges", evidence: text.trim().split(/\s+/).slice(0, 5).join(" ").slice(0, 40), confidence: 0.65 });

    return JSON.stringify({
      summary: "You're describing something really challenging — what you're feeling is completely understandable, and you're not alone in this.",
      child_age: (text.match(/(\d+)\s*year/i) || [])[1] || null,
      challenges: challenges.slice(0, 4),
      triggers: [],
      parent_stress: "high",
      crisis: /hurt (myself|himself|herself)|kill|suicid/.test(t),
    });
  }

  if (task === "match") {
    return JSON.stringify({
      matches: top3.map((id) => ({
        id,
        reason: MENTOR_REASONS[id] || "This mentor has experience with what you're describing and found strategies that helped.",
        shared: ["daily challenges"],
      })),
    });
  }

  if (task === "playbook") {
    return JSON.stringify({
      steps: [
        { title: "Notice what's already working", detail: "Even in a hard week, there are moments that go better. What's reducing stress even a little? Do more of that deliberately.", source: top3[0] },
        { title: "Connect with another parent this week", detail: "Local parent groups can point you to providers and strategies faster than any directory. Neha found more in a parent group than months of searching online.", source: "m9" },
        { title: "Give yourself a 10-minute window daily", detail: "Caring for yourself is part of caring for your child. Even ten quiet minutes before the day starts changes what's available to you.", source: top3[1] },
      ],
      reframe: { title: "You're not behind", body: "Every family finds their way at their own pace. The fact that you're here, looking for people who understand, already puts you ahead of where you were yesterday." },
    });
  }

  return null;
}

const GENERIC_CHECKIN = "What you're carrying is real. Even one small thing for yourself tonight — a walk, ten quiet minutes — counts as taking care of yourself.";

export function getDemoResponse(task, idx, text = "") {
  if (idx >= 0 && idx < R.length) {
    const r = R[idx][task];
    if (r !== undefined) return r;
  }
  if (task === "checkin") return GENERIC_CHECKIN;
  // Generic fallback for any custom story
  return genericFallback(task, text);
}
