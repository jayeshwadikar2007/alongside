# Alongside – hackathon project

Peer-support app for families on the autism spectrum. A parent describes a hard day by voice or text; AI maps the needs they described (never diagnoses or assigns autism levels), matches 3 mentors (parents and autistic adults) on those needs, writes a playbook grounded only in the mentors' stories, and checks in on the parent. Also: a journal with AI pattern detection, AI-drafted messages to mentors, and a "Become a mentor" flow. Hackathon themes: wellness, connection, learning.

## Layout
- `src/App.jsx` – UI (tabs: Share a day, Journal, Become a mentor)
- `src/data.js` – 28 fictional mentors, sample stories, demo journal month
- `src/lib.js` – pure helpers (parseJSON, buildSegments for evidence highlighting)
- `src/prompts.js` – all 7 prompts: extract, match, playbook, checkin, patterns, intro, mentor
- `api/claude.js` – Vercel function; browser sends only `{ task, input }`, key stays server-side

## Commands
- `npm test` – vitest, 57 passing: helpers, data, API route, every UI feature with mocked AI
- `vercel dev` – run app + API locally (needs `vercel env pull .env.local`)
- `npm run eval` – live prompt evals, 124 cases / 514 checks (needs ANTHROPIC_API_KEY; `--runs N`, `--only extract,match,safety`, `--mock` for offline self-test)
- `vercel --prod` – deploy

## Rules
- Never let any prompt or UI assign an autism level, severity, or diagnosis.
- Keep the calm, low-stimulation design. Light and dark mode via CSS variables.
- Don't put the API key in frontend code.

## Architecture
- `api/claude.js` – Vercel serverless: single AI call, non-safety tasks (checkin, patterns, intro, mentor)
- `api/agent.js` – Vercel serverless: safety validation agent loop — runs extract/match/playbook, then validates output with a second AI call, retries with reinforced prompt on failure (up to 2 retries)
- `src/guardrails.js` – client-side: input crisis/injection detection, output diagnosis-language stripping, sessionStorage audit log
- `src/demo.js` – demo fallback for 4 sample stories + keyword-based generic fallback (no API needed)

## Status
- Done: all features, 57 UI/unit/API tests passing, 124-case eval suite (514 checks, 54 red-team), safety validation agent, demo fallback, multilingual support, guardrails, eval self-tested with `--mock`, "How it's safe" tab, time-to-match badge, honest demo messaging.
- Event: GTransformer AI for Good Buildathon, Nov 13–15 2026. Tracks: Wellbeing, Connection, Learning. Responsible AI is REQUIRED for every project.

## Remaining work (in order, run `npm test` after each code change)
1. **Live evals:** `npm run eval`. For any FAIL, fix the prompt in `src/prompts.js` (not the check, unless the check is clearly wrong), rerun with `--only <suite>` until all pass. Save the final summary output to `evals/RESULTS.md` (pass counts per suite) for the pitch.
2. **"How we keep it safe" tab** in `src/App.jsx` (add to `TABS`, label "How it's safe"). Static, calm page with six short sections matching the judges' Responsible AI words: Safety (never diagnoses or assigns levels; crisis detection with 911/988 banner; playbook limited to mentors' stories), Privacy (journal and mentors stay in this browser; server accepts only fixed tasks, key never in the browser; production needs consent, deletion, minimal data about minors), Bias and inclusion (answers in the parent's language; mentor pool includes autistic adults, a grandparent, a Spanish-speaking family; needs described neutrally), Accessibility (voice input, Atkinson Hyperlegible, low-stimulation design, keyboard focus, reduced motion, light/dark), Transparency (every need links to the parent's exact words; every step cites its mentor; demo mentors labeled fictional; show eval pass rates from `evals/RESULTS.md`), Unintended harm and what production needs (mentor vetting, moderation of harmful "cures", clinical advisors, never a substitute for care). Add a test that the tab renders all six headings.
3. **Time to match:** in `ShareTab.run()`, record `performance.now()` at start and show "Found in X.X seconds" under "People who've been there" once matches appear. This is the measurable-impact number for the demo. Add a test.
4. **Honest demo messaging:** in `MentorCard`, add a small muted note under the message box: "Demo: messages aren't delivered yet." Keep existing sent text. Update tests if needed.
5. **Preview build:** regenerate the single-file Claude preview `alongside-preview.jsx` by inlining `src/data.js`, `src/lib.js`, `src/prompts.js` into App (strip imports/exports), replacing `askClaude` with a direct call to `https://api.anthropic.com/v1/messages` (no key, model `claude-sonnet-4-6`, `system: PROMPTS[task]`) and `store` with an in-memory object. Verify with `npx esbuild alongside-preview.jsx --loader:.jsx=jsx`.
6. **Run locally:** `vercel link`, `vercel env pull .env.local`, `vercel dev`. Click through all four tabs in Chrome (desktop and a phone-width window), try the mic, one Spanish story, the demo journal month. Fix anything broken.
7. **Deploy:** `vercel env add ANTHROPIC_API_KEY production` (the user pastes the key), then `vercel --prod`. Report the URL. Open it and confirm a sample story returns matches.
8. **Pitch deck:** build a 7–8 slide deck from `PITCH.md` (as `pitch.pptx` via python-pptx, or Markdown slides if simpler) using the real eval numbers. Leave clear placeholders for the user-testing quote.
