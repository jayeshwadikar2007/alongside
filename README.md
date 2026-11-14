# Alongside

Hackathon prototype for families on the autism spectrum. It does not diagnose. Built-in mentors are fictional.

## Features

- **Share a day:** a parent talks or types about a hard day. AI maps the needs they described (with the exact words highlighted), matches three mentors on those needs, writes a playbook grounded only in the mentors' stories, and checks in on the parent.
- **Message a mentor:** AI drafts an editable first message to a matched mentor.
- **Journal and patterns:** every shared day is saved on the device. With 3+ entries, AI finds patterns across days (weekdays, triggers, sleep, what helped) and suggests a question for the care team. "Load a demo month" seeds realistic entries for live demos.
- **Become a mentor:** an experienced parent or autistic adult tells their story by voice; AI turns it into an editable mentor profile that joins the matching pool immediately.
- Multilingual: answers come back in the language the person used.

## Deploy to Vercel

1. Push this folder to a GitHub repo.
2. In Vercel, click **Add New > Project** and import the repo. Vercel detects Vite automatically.
3. Before deploying, open **Environment Variables** and add `ANTHROPIC_API_KEY` with your key.
4. Deploy. The frontend calls `/api/claude`, which runs on the server and keeps the key private.

Optional: set `ANTHROPIC_MODEL` to use a different Claude model.

## Run locally

`npm run dev` serves only the frontend, so AI calls will fail. To run the API route too:

```
npm i -g vercel
vercel link
vercel env pull .env.local
vercel dev
```

## Structure

- `src/App.jsx` – the UI, mentor data, and demo journal
- `src/prompts.js` – all AI prompts (imported only by the server)
- `api/claude.js` – serverless route holding the API key
- The browser sends only a task name (`extract`, `match`, `playbook`, `checkin`, `patterns`, `intro`, `mentor`) and the input text, so nobody can use your endpoint as a general-purpose Claude proxy.

## Microphone

Uses the browser's built-in speech recognition. Works in Chrome, Edge, and Safari over HTTPS (Vercel provides this). Not supported in Firefox or most in-app browsers (links opened from WhatsApp, Slack, Instagram). Sample stories are a backup for live demos.

## Data

Journal entries and new mentors are stored in the browser's localStorage, so they stay on the device. A real launch would need accounts, a database, mentor vetting, and moderation.

## Tests

- `npm test` runs 54 offline tests: helpers, the API route, and every UI feature with a mocked AI.
- `npm run eval` runs 19 live cases (106 checks) against Claude: schema, exact evidence, never assigning autism levels, crisis detection, Spanish and Hindi, mentor recall, grounded playbooks, and more. Each case runs 3 times; any check under 90% fails. Options: `--runs 5`, `--only extract,match`, `--mock`.
