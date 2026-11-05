# JANU AI

**My AI. My Rules. My Control.**

A starter foundation for a personal AI workspace with a chat interface, an adult-conversation preference toggle, and a defensive cybersecurity guidance dashboard.

## Project structure

- `src/` — Vite-powered browser interface.
- `backend/` — Cloudflare Worker API.
- `/api/health` — API health/configuration check.
- `/api/chat` — server-side AI provider proxy.
- `/api/security/analyze` — rule-based triage for a security event description supplied by the user.

## Run the web interface

1. Install Node.js 20 or newer.
2. Run `npm install` in the repository root.
3. Run `npm run dev` to start Vite.
4. For local API development, run Wrangler from `backend/` after installing Wrangler and configure the provider secret.

## Cloudflare Worker setup

From `backend/`:

1. Install Wrangler.
2. Set the secret with `npx wrangler secret put OPENAI_API_KEY`.
3. Deploy with `npx wrangler deploy`.
4. Configure the Vite development proxy or production routing so `/api/*` reaches the Worker.

Never put provider API keys in browser code or commit them to Git.

## Current scope and honest limitations

This is the initial application scaffold, not a finished production service. The 18+ switch is a conversation preference, not an age-verification system and not a way to bypass provider policies or legal safeguards. The Cyber Shield page includes defensive guidance and a rule-based triage endpoint for text that the user manually submits. It does not inspect devices, ingest live logs, detect intrusions in real time, identify attackers, block IP addresses, or monitor networks.

Before production use, add owner authentication, server-side authorization, rate limiting, abuse monitoring, secure storage, privacy controls, automated tests, and explicit consent for any device/network security integrations. A real Cyber Shield must use authorized endpoint/network security tools and narrowly scoped permissions.

## Planned milestones

1. Verify local build and Worker health endpoint.
2. Add owner-only authentication and settings.
3. Add secure chat history controls and model/provider settings.
4. Add authorized endpoint/network log integrations, live alerting and containment workflows.
5. Add image, audio, video and file workflows.
6. Package a mobile app after the web/API foundation is tested.
