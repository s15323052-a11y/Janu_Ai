# JANU AI

**My AI. My Rules. My Control.**

A starter foundation for a personal AI workspace with a chat interface, an adult-conversation preference toggle, and a defensive cybersecurity guidance dashboard.

## Project structure

- `src/` — Vite-powered browser interface.
- `backend/` — Cloudflare Worker API.
- `/api/health` — API health/configuration check.
- `/api/chat` — server-side AI provider proxy.
- `/api/security/analyze` — rule-based triage for a security event description supplied by the user.
- `/api/security/plan` — creates a permission-gated, non-destructive security test checklist for selected web/API/authentication/configuration areas.

## Run the web interface

1. Install Node.js 20 or newer.
2. Run `npm install` in the repository root.
3. Run `npm run dev` to start Vite.
4. For local API development, run Wrangler from `backend/` after installing Wrangler and configure the provider secret.

## Cloudflare Worker setup

From `backend/`:

1. Install Wrangler.
2. Set the AI provider secret with `npx wrangler secret put OPENAI_API_KEY`.
3. Set a strong owner password with `npx wrangler secret put JANU_OWNER_PASSWORD`.
4. Set a separate random signing secret (at least 32 random bytes) with `npx wrangler secret put JANU_OWNER_SECRET`.
5. Deploy with `npx wrangler deploy`.
6. Configure the Vite development proxy or production routing so `/api/*` reaches the Worker.

The app starts behind an owner sign-in screen. The login endpoint exchanges the owner password for a signed 12-hour session token. The browser keeps the token in sessionStorage; all chat and security POST endpoints require it. Never commit either owner secret, place it in frontend code, or share it in chat. If the owner password or signing secret is lost, rotate the Cloudflare secret and sign in again. The public health endpoint exposes only service status and whether the AI key is configured.

Never put provider API keys in browser code or commit them to Git.

## Current scope and honest limitations

This is the initial application scaffold, not a finished production service. The 18+ switch is a conversation preference, not an age-verification system and not a way to bypass provider policies or legal safeguards. The Cyber Shield page includes defensive guidance, rule-based triage for manually submitted event descriptions, and a permission-confirmed test-plan builder. It does not inspect devices, ingest live logs, detect intrusions in real time, identify attackers, block IP addresses, monitor networks, or execute security tests.

Before production use, add owner authentication, server-side authorization, rate limiting, abuse monitoring, secure storage, privacy controls, automated tests, and explicit consent for any device/network security integrations. A real Cyber Shield must use authorized endpoint/network security tools and narrowly scoped permissions.

## Personal phone-control and conversation roadmap

JANU is intended to become an owner-controlled Android personal assistant with natural Hindi/English conversation and user-selectable voice presentation. Planned Android capabilities include launching apps, opening system settings, managing alarms and reminders, preparing calls/messages, and carrying out other supported tasks through Android intents and narrowly scoped permissions.

Implementation must use Android's supported permission and role model. Accessibility Service, notification access, contacts, microphone, camera, call/SMS roles, and file access must each be requested only when a feature genuinely needs them, with clear disclosure and revocable controls. High-impact actions such as sending messages, placing calls, purchases, deleting files, changing security settings, or sharing private data require an appropriate confirmation step. JANU must never silently bypass Android security, other apps' protections, or user consent.

Conversation style should be natural, candid, and non-judgmental, including mature discussion of lawful adult topics where supported by the selected AI provider and applicable law. A preference setting may control tone and maturity; it cannot disable safeguards against exploitation, sexual content involving minors, non-consensual intimate content, serious harm, or illegal activity. The preference is not an age-verification system.

A future animated 3D avatar is a separate visual milestone; it is not yet implemented. Real-time speech-to-speech, Android phone-control integrations, and avatar rendering must each be built and tested before being described as available.

## Planned milestones

1. Verify local build and Worker health endpoint.
2. Add owner-only authentication and settings.
3. Add secure chat history controls and model/provider settings.
4. Add authorized endpoint/network log integrations, live alerting and containment workflows.
5. Add image, audio, video and file workflows.
6. Package a mobile app after the web/API foundation is tested.
