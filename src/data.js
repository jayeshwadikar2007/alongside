// Demo data. Every person here is fictional.

export const CATEGORIES = {
  sensory: "Sensory",
  communication: "Communication",
  emotional_regulation: "Big feelings",
  daily_living: "Daily life",
  social: "Social",
  transitions: "Change and routine",
};

export const MENTORS = [
  { id: "m1", name: "Priya", role: "parent", context: "Son Arjun, now 9. Struggles started around age 4.", challenges: "noise sensitivity, meltdowns in stores and crowded places, eating only a few foods", story: "Noise-canceling headphones changed grocery trips. We started with one-aisle visits and left before he hit his limit. A feeding therapist helped us add new foods slowly by chaining from crackers he already liked." },
  { id: "m2", name: "Daniel", role: "autistic adult", context: "31, software tester. Didn't speak until 6.", challenges: "sensory overload, transitions, meltdowns as a child", story: "As a kid, my meltdowns weren't me being bad. My body was full and had nowhere to go. A visual schedule and a warning before every change gave me back some control. Quiet after a meltdown helped more than talking." },
  { id: "m3", name: "Marisol", role: "parent", context: "Daughter Lucía, now 7.", challenges: "waking at 3am, bedtime battles, sleep deprivation for the whole family", story: "A picture-card bedtime routine done the same way every night made the biggest difference. Our OT suggested a weighted blanket, and our pediatrician helped us look at sleep more closely." },
  { id: "m4", name: "Kevin", role: "parent", context: "Son Eli, now 12.", challenges: "school transitions, getting the right IEP supports, few friends", story: "I learned to bring notes and specific examples to IEP meetings. Eli found friends through a Minecraft club built around his interest instead of a generic social skills group." },
  { id: "m5", name: "Aiko", role: "parent", context: "Son Ren, now 8. Non-speaking until 5.", challenges: "not speaking, frustration from not being understood, hitting when frustrated", story: "Getting an AAC app with our speech therapist was a turning point. We modeled words on it ourselves all day. As Ren could say what he wanted, a lot of the hitting faded." },
  { id: "m6", name: "Fatima", role: "parent", context: "Daughter Noor, now 10.", challenges: "wandering off and running from home or school, safety fears", story: "Door alarms, an ID bracelet, and swim lessons let me sleep again. We also told neighbors and the school so more eyes were watching." },
  { id: "m7", name: "Rosa", role: "autistic adult", context: "26, illustrator. Diagnosed at 19.", challenges: "masking at school, exhaustion and shutdowns at home, late diagnosis as a girl", story: "I held it together all day and fell apart at home, so people thought my parents were the problem. If your child is calm at school and melts down after, they may be masking. Home being the safe place to fall apart is actually trust." },
  { id: "m8", name: "Tom", role: "parent", context: "Son Max, now 9.", challenges: "toilet training delays, resisting bathroom routines", story: "A visual schedule with timed bathroom breaks, and dropping the pressure completely, worked over a few months. Our BCBA helped us break it into tiny steps." },
  { id: "m9", name: "Neha", role: "parent", context: "Daughter Anya, diagnosed at 2, now 5.", challenges: "new diagnosis, long therapy waitlists, not knowing where to start", story: "While we were on waitlists, a parent-coaching program taught me strategies to use at home right away. Joining a local parent group helped me find providers faster than any directory." },
  { id: "m10", name: "Marcus", role: "parent", context: "Son Jalen, now 11.", challenges: "aggression and self-injury during meltdowns, fear for safety", story: "A functional behavior assessment with a BCBA showed us the triggers we were missing, mostly hunger and sudden changes. We built a calm-down corner and he learned to go there before things escalated." },
  { id: "m11", name: "Jordan", role: "autistic adult", context: "22, college student.", challenges: "stimming, sensory seeking, being told to sit still", story: "Stimming is how I regulate. When adults stopped trying to make me stop and gave me safe ways to do it, I could focus far better. Fidgets and movement breaks beat sitting still every time." },
  { id: "m12", name: "Grace", role: "parent", context: "Twins, now 6.", challenges: "clothing textures, haircuts, bath time distress", story: "Seamless socks and tagless clothes ended our morning battles. For haircuts, we found a sensory-friendly barber and practiced with clippers turned off at home for weeks first." },
  { id: "m13", name: "Luis", role: "parent", context: "Son Mateo, now 7. Spanish-speaking family.", challenges: "finding Spanish-speaking providers, grandparents not accepting the diagnosis", story: "A bilingual parent group pointed me to providers who spoke Spanish. A short video explaining autism helped my parents understand Mateo instead of blaming our parenting." },
  { id: "m14", name: "Sam", role: "autistic adult", context: "35, nurse.", challenges: "very limited diet as a child, gagging on textures", story: "Some textures felt genuinely painful to me, not just yucky. Being forced made meals scarier. Having safe foods always on the plate, with no pressure to try the rest, is what slowly widened my diet." },
  { id: "m15", name: "Hannah", role: "parent", context: "Son Oliver, now 5. Struggles started at 3.", challenges: "meltdowns at daycare drop-off, hard transitions between activities", story: "We did the exact same short goodbye ritual every morning and he carried a small comfort object. A photo book of his daycare, looked at the night before, made mornings predictable." },
  { id: "m16", name: "Ravi", role: "parent", context: "Daughter Meera, now 14.", challenges: "puberty, body changes, rising anxiety in the teen years", story: "Simple visual guides and social stories about periods and body changes, introduced early, took the fear out of it. Her OT helped with the hygiene routines step by step." },
  { id: "m17", name: "Chloe", role: "autistic adult", context: "29, elementary teacher.", challenges: "school anxiety, shutdowns, refusing to go to school", story: "School refusal for me was exhaustion, not defiance. What helped was a quiet room I could go to without asking, a shorter day for a while, and one trusted adult at school." },
  { id: "m18", name: "Ahmed", role: "parent", context: "Son Yusuf, now 6.", challenges: "huge meltdowns when the tablet or TV is turned off", story: "Visual timers and a five-minute and one-minute warning made endings predictable. A first-then board showed him what fun thing came next, so stopping didn't feel like losing everything." },
  { id: "m19", name: "Linda", role: "grandparent", context: "Raising grandson Caleb, now 8.", challenges: "caregiver burnout, no breaks, feeling alone", story: "I didn't know respite care existed until another grandparent told me. Our state disability services covered a few hours a week, and a caregiver support group gave me people to call." },
  { id: "m20", name: "Diego", role: "parent", context: "Son Gabriel, now 10.", challenges: "rigid routines, intense distress when plans change", story: "We added a 'surprise' card to his visual schedule and used it for small, happy changes first. Over months, change stopped meaning danger to him." },
  { id: "m21", name: "Mei", role: "parent", context: "Daughter Lily, now 6.", challenges: "repeating lines from shows, echolalia, scripting", story: "Our speech therapist explained that Lily's scripts were her way of communicating. When we started responding to the meaning behind the lines instead of ignoring them, her language grew." },
  { id: "m22", name: "Ben", role: "autistic adult", context: "40, engineer. Diagnosed at 38, after his son.", challenges: "anxiety, need for predictability, not knowing he was autistic", story: "My son's diagnosis was my diagnosis too. Parents, it's worth looking at yourselves. Understanding my own needs made me a calmer, better parent to him." },
  { id: "m23", name: "Olivia", role: "parent", context: "Son Noah, now 9.", challenges: "terror of doctor and dentist visits", story: "We found a sensory-friendly dentist, read a social story about the visit for a week beforehand, and did a practice visit where nothing happened except sitting in the chair." },
  { id: "m24", name: "James", role: "parent", context: "Son Aiden, now 15.", challenges: "being bullied, social isolation, wanting friends", story: "An autistic-led teen group was where Aiden finally felt normal. He made friends who shared his interests, and the bullying at school hurt less once he had his people." },
  { id: "m25", name: "Keisha", role: "parent", context: "Son Malik, now 7, and his older sister.", challenges: "sibling feeling left out, balancing family attention", story: "Fifteen minutes of protected one-on-one time with his sister every day mattered more than I expected. A sibling support group helped her see she wasn't alone either." },
  { id: "m26", name: "Tariq", role: "autistic adult", context: "24, non-speaking, communicates with AAC.", challenges: "not being able to speak, being underestimated", story: "People assumed I didn't understand because I couldn't speak. I understood everything. Presume your child is listening and competent, and keep giving them ways to communicate." },
  { id: "m27", name: "Elena", role: "parent", context: "Daughter Sofia, now 7.", challenges: "car ride meltdowns, escaping the car seat, outings", story: "An adaptive car seat solved the escaping. Showing her a photo of where we were going, and keeping trips short at first, made outings possible again." },
  { id: "m28", name: "Pooja", role: "parent", context: "Son Kabir, now 8.", challenges: "flying, holidays and big family gatherings", story: "TSA Cares and a practice visit to the airport made our first flight work. At family gatherings, we set up a quiet room he could escape to, and relatives learned not to take it personally." },
];

export const SAMPLES = [
  "My son is four. Every time we go to the grocery store he screams and covers his ears, and lately he only eats crackers and plain pasta. I'm exhausted and I feel like everyone is staring at us.",
  "My daughter is seven and she's an angel at school, the teacher says she's fine. But the minute she gets home she falls apart, crying and screaming for an hour. And she wakes up at 3am most nights.",
  "He's five and still not talking. When he can't get what he wants he hits me or bangs his head on the floor. We were just diagnosed and the waitlist for therapy is eight months.",
  "Mi hijo tiene cuatro años. Cada vez que vamos al supermercado grita y se tapa los oídos. Solo come galletas y pasta. Estoy agotada y siento que todos nos miran.",
];

// Demo journal: one child's month. Store trips fall on the same weekday, after-school entries on another.
export const DEMO_LOGS = [
  { daysAgo: 21, text: "Took him to Costco. Lasted ten minutes before he was screaming and covering his ears. We had to leave the cart and go." },
  { daysAgo: 18, text: "Rough school pickup. Teacher says he was fine all day, then he melted down in the car for half an hour." },
  { daysAgo: 16, text: "Up at 3am again lining up his cars. Nobody slept." },
  { daysAgo: 15, text: "Another 3am wake-up. I'm running on nothing." },
  { daysAgo: 14, text: "Tried the farmers market. Too loud and crowded. He bit his hand and we left after five minutes." },
  { daysAgo: 11, text: "After school he screamed and cried for an hour. He was holding it in all day again." },
  { daysAgo: 10, text: "Tried noise-canceling headphones at Target. He made it through the whole trip! Still only eating crackers and plain pasta." },
  { daysAgo: 7, text: "Short grocery trip with the headphones, just one aisle. No meltdown. Small win." },
  { daysAgo: 4, text: "After-school meltdown again, but shorter. I let him sit in his room in the quiet first and it helped." },
];

export const ROLES = ["parent", "autistic adult", "grandparent", "other caregiver"];

