# JANU AI API backend (Cloudflare Worker)

This keeps the OpenAI API key on the server. Do not put the key in the Android app, Git repository, or chat.

## Deploy

1. Create/sign in to a Cloudflare account and install Node.js on a computer.
2. From this folder, run:
   `npm install --save-dev wrangler`
3. Log in:
   `npx wrangler login`
4. Create the server-side secret (the key is entered in the terminal prompt, not committed):
   `npx wrangler secret put OPENAI_API_KEY`
5. Deploy:
   `npx wrangler deploy`

Cloudflare will show a Worker URL. The chat endpoint will be:
`https://<your-worker-name>.<your-account-subdomain>.workers.dev/chat`

## Create the OpenAI key

Create an API key in the OpenAI API platform and set up API billing/limits there. ChatGPT subscription access does not include API usage; API usage is billed separately. Keep the key private and add it only with the Wrangler secret command above.

## Test

Send a POST request to `/chat` with JSON:
`{"message":"नमस्ते JANU"}`

A successful response is JSON with a `reply` field.

## Important status

This folder is the secure API backend source, not a deployed service. The Android app still needs the deployed Worker URL configured and its chat screen wired to this endpoint before API chat works on the phone. Deployment requires access to your Cloudflare account and your own OpenAI API key; neither can be created from this GitHub connection.


## Gemini provider (optional)

JANU's backend also supports Google's Gemini API. To use it, create a Gemini API key in Google AI Studio and add it to the Worker as a server-side secret:

`npx wrangler secret put GEMINI_API_KEY`

Optional model setting in `wrangler.toml` or Worker vars:
`GEMINI_MODEL = "gemini-3.8-flash"`

When both provider keys exist, requests default to Gemini. To select a provider explicitly, send `{"message":"नमस्ते","provider":"gemini"}` or `{"message":"Hello","provider":"openai"}`. Keep both keys on the server; never embed them in the Android APK or commit them to GitHub.

Official Gemini API reference: https://ai.google.dev/api/generate-content
