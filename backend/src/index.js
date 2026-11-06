const JSON_HEADERS = {
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "no-store",
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: JSON_HEADERS });
}

const SESSION_TTL_SECONDS = 43200;
const encoder = new TextEncoder();
function b64url(bytes) { let s = ""; for (const b of bytes) s += String.fromCharCode(b); return btoa(s).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_"); }
function unb64url(s) { s = s.replace(/-/g, "+").replace(/_/g, "/"); const raw = atob(s + "=".repeat((4 - s.length % 4) % 4)); return Uint8Array.from(raw, x => x.charCodeAt(0)); }
async function signOwnerSession(payload, secret) { const key = await crypto.subtle.importKey("raw", encoder.encode(secret), {name:"HMAC",hash:"SHA-256"}, false, ["sign"]); const body = b64url(encoder.encode(JSON.stringify(payload))); const sig = new Uint8Array(await crypto.subtle.sign("HMAC", key, encoder.encode(body))); return body + "." + b64url(sig); }
async function verifyOwnerSession(token, secret) { if (!token || !secret) return false; const p = token.split("."); if (p.length !== 2) return false; try { const key = await crypto.subtle.importKey("raw", encoder.encode(secret), {name:"HMAC",hash:"SHA-256"}, false, ["verify"]); if (!await crypto.subtle.verify("HMAC", key, unb64url(p[1]), encoder.encode(p[0]))) return false; const data = JSON.parse(new TextDecoder().decode(unb64url(p[0]))); return data.role === "owner" && data.exp > Math.floor(Date.now()/1000); } catch { return false; } }
function constantTimeEqual(a,b) { const x=encoder.encode(a), y=encoder.encode(b); if(x.length!==y.length) return false; let d=0; for(let i=0;i<x.length;i++) d |= x[i]^y[i]; return d===0; }

const SYSTEM_PROMPT = `You are JANU AI, a helpful personal assistant. Be clear, respectful, and useful. Support Hindi and English. The user may enable an adult-conversation preference; this does not override applicable law, provider terms, or safeguards against exploitation, sexual content involving minors, non-consensual intimate content, violence, cyber abuse, or privacy invasion. For cybersecurity, provide defensive guidance and authorized testing only. Never claim to have scanned or secured a device unless a connected tool actually performed that action.`;

function analyzeSecurityEvent(event) {
  const text = [event.type, event.description, event.source, event.destination].filter(Boolean).join(" ").toLowerCase();
  const findings = [];
  const add = (severity, title, detail, action) => findings.push({ severity, title, detail, action });

  if (/multiple failed login|repeated login|brute.?force|many failed sign.?in/.test(text)) {
    add("high", "Repeated authentication failures", "The event description indicates repeated failed sign-in attempts.", "Verify the account owner, revoke unknown sessions, reset the password from a trusted device and enable MFA.");
  }
  if (/unknown device|new device|unrecognized device|unfamiliar device/.test(text)) {
    add("medium", "Unrecognized device", "The event mentions a device that may not belong to the account owner.", "Review the device and session in the service's official security page; sign out unknown sessions.");
  }
  if (/malware|ransomware|trojan|keylogger|suspicious executable/.test(text)) {
    add("critical", "Possible malware indicator", "The event description contains a known malware-related term; this is not a malware scan.", "Isolate the affected device from networks, preserve evidence, and run a reputable endpoint security scan.");
  }
  if (/data exfiltration|unexpected upload|large outbound transfer|data leak/.test(text)) {
    add("high", "Possible unusual data transfer", "The description suggests an unexpected outbound data movement.", "Restrict the affected account or host using approved admin controls and review audit logs.");
  }
  if (/privilege escalation|admin rights|unauthorized admin/.test(text)) {
    add("high", "Possible privilege escalation", "The event suggests an unexpected permission change.", "Review administrator accounts and recent permission changes; remove unauthorized access.");
  }
  if (/phishing|fake login|credential harvest|suspicious link/.test(text)) {
    add("medium", "Possible phishing activity", "The description mentions a phishing-like message or link.", "Do not open the link; report the message and change credentials if they were entered.");
  }
  if (findings.length === 0) {
    add("info", "No rule matched", "The supplied text did not match JANU AI's basic defensive indicators. This does not prove the activity is safe.", "Check the original provider logs and use endpoint/network security monitoring for reliable detection.");
  }

  const rank = { critical: 4, high: 3, medium: 2, info: 1 };
  const severity = findings.reduce((top, item) => rank[item.severity] > rank[top] ? item.severity : top, "info");
  return { severity, findings, disclaimer: "Rule-based triage of user-supplied text only. No device, account, IP, or network was scanned or blocked." };
}


function buildAuthorizedTestPlan(body) {
  const asset = typeof body.asset === "string" ? body.asset.trim() : "";
  const authorization = body.authorization === true;
  const scope = Array.isArray(body.scope) ? body.scope.filter(x => typeof x === "string").slice(0, 12) : [];
  if (!asset || asset.length > 240) {
    return { error: "Provide an asset name or URL (maximum 240 characters)." };
  }
  if (!authorization) {
    return { error: "Confirm that you own this asset or have written permission to test it." };
  }
  if (scope.length === 0) {
    return { error: "Select at least one authorized test area." };
  }
  const allowed = new Set(["web-app", "api", "authentication", "configuration", "headers", "dependencies"]);
  const selected = [...new Set(scope)].filter(item => allowed.has(item));
  if (selected.length === 0) return { error: "No supported test areas were selected." };

  const catalogue = {
    "web-app": ["Review input validation and output encoding in a staging environment.", "Check access-control boundaries using test accounts you control."],
    "api": ["Review API authentication, authorization and object-level access controls.", "Check schema validation, rate limits and error handling with non-destructive test cases."],
    "authentication": ["Verify MFA, password reset, session expiry and account recovery controls.", "Review lockout and alert policies without attempting credential attacks."],
    "configuration": ["Review exposed services and security configuration against an approved baseline.", "Confirm administrative interfaces are restricted to authorized operators."],
    "headers": ["Review HTTPS, HSTS, CSP, framing and cookie security attributes.", "Check CORS policy against the documented application origins."],
    "dependencies": ["Inventory dependencies and compare versions with trusted vulnerability advisories.", "Prioritize supported upgrades and verify fixes in staging."]
  };
  return {
    asset,
    authorized: true,
    plan: selected.flatMap(area => catalogue[area].map(test => ({ area, test }))),
    safety: "Planning only. This endpoint does not connect to, scan, exploit, or modify the named asset. Run tests only against assets explicitly in scope, preferably in staging, and stop if service impact occurs."
  };
}

export { analyzeSecurityEvent, buildAuthorizedTestPlan };

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: JSON_HEADERS });
    }
    if (request.method === "GET" && url.pathname === "/api/health") {
      return json({ ok: true, service: "janu-ai-api", configured: Boolean(env.AI || env.OPENAI_API_KEY), provider: env.AI ? "cloudflare-workers-ai" : (env.OPENAI_API_KEY ? "openai" : "unconfigured") });
    }

    if (request.method === "POST" && url.pathname === "/api/auth/login") {
      let body;
      try { body = await request.json(); } catch { return json({ error: "Request body must be valid JSON." }, 400); }
      if (!env.JANU_OWNER_PASSWORD || !env.JANU_OWNER_SECRET) return json({ error: "Owner authentication is not configured. Set JANU_OWNER_PASSWORD and JANU_OWNER_SECRET as Cloudflare secrets." }, 503);
      const password = typeof body.password === "string" ? body.password : "";
      if (!password || !constantTimeEqual(password, env.JANU_OWNER_PASSWORD)) return json({ error: "Invalid owner credentials." }, 401);
      const now = Math.floor(Date.now()/1000);
      const token = await signOwnerSession({ role:"owner", iat:now, exp:now+SESSION_TTL_SECONDS }, env.JANU_OWNER_SECRET);
      return json({ token, expiresIn: SESSION_TTL_SECONDS });
    }

    if (url.pathname.startsWith("/api/") && url.pathname !== "/api/health" && url.pathname !== "/api/auth/login") {
      const header = request.headers.get("Authorization") || "";
      const token = header.startsWith("Bearer ") ? header.slice(7) : "";
      if (!await verifyOwnerSession(token, env.JANU_OWNER_SECRET)) return json({ error: "Owner authentication required or session expired." }, 401);
    }

    // Create a short-lived browser credential for low-latency, speech-to-speech WebRTC.
    // The permanent OpenAI API key remains on the Worker and is never returned to the browser.
    if (request.method === "POST" && url.pathname === "/api/realtime/session") {
      if (!env.OPENAI_API_KEY) {
        return json({ error: "Realtime voice is not configured. Add OPENAI_API_KEY as a Cloudflare Worker secret." }, 503);
      }
      let body;
      try { body = await request.json(); }
      catch { return json({ error: "Request body must be valid JSON." }, 400); }
      const allowedVoices = new Set(["alloy", "ash", "ballad", "cedar", "coral", "echo", "marin", "sage", "shimmer", "verse"]);
      const voice = typeof body.voice === "string" && allowedVoices.has(body.voice) ? body.voice : "marin";
      try {
        const upstream = await fetch("https://api.openai.com/v1/realtime/client_secrets", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${env.OPENAI_API_KEY}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            expires_after: { anchor: "created_at", seconds: 600 },
            session: {
              type: "realtime",
              model: "gpt-realtime",
              instructions: "You are JANU AI, a warm, helpful personal voice assistant. Speak naturally and concisely. Understand and respond in Hindi or English according to the user's language. Do not claim to perform actions unless a connected tool actually performed them.",
              output_modalities: ["audio"],
              audio: {
                input: {
                  transcription: { model: "gpt-4o-mini-transcribe" },
                  turn_detection: { type: "server_vad" }
                },
                output: { voice }
              }
            })
          })
        });
        const result = await upstream.json();
        if (!upstream.ok) {
          return json({ error: result.error?.message || "Could not create a realtime voice session." }, 502);
        }
        if (!result.value) return json({ error: "Realtime provider returned no temporary client credential." }, 502);
        return json({ clientSecret: result.value, expiresAt: result.expires_at, session: result.session });
      } catch (error) {
        return json({ error: error?.message || "Realtime voice service is unavailable." }, 502);
      }
    }

    // Persistent owner-controlled memory. Requires a Cloudflare KV namespace binding named JANU_MEMORY.
    if (url.pathname === "/api/memory" && request.method === "GET") {
      if (!env.JANU_MEMORY) return json({ error: "Persistent memory storage is not connected yet. Configure the JANU_MEMORY KV binding." }, 503);
      const keys = await env.JANU_MEMORY.list({ prefix: "memory:" });
      const items = [];
      for (const key of keys.keys.slice(0, 100)) {
        const value = await env.JANU_MEMORY.get(key.name, "json");
        if (value) items.push({ id: key.name.slice(7), text: value.text, createdAt: value.createdAt });
      }
      return json({ items });
    }

    if (url.pathname === "/api/memory" && request.method === "POST") {
      if (!env.JANU_MEMORY) return json({ error: "Persistent memory storage is not connected yet. Configure the JANU_MEMORY KV binding." }, 503);
      let body;
      try { body = await request.json(); } catch { return json({ error: "Request body must be valid JSON." }, 400); }
      const text = typeof body.text === "string" ? body.text.trim() : "";
      if (!text || text.length > 1000) return json({ error: "Memory text is required and must be under 1,000 characters." }, 400);
      const id = crypto.randomUUID();
      await env.JANU_MEMORY.put("memory:" + id, JSON.stringify({ text, createdAt: new Date().toISOString() }));
      return json({ saved: true, id }, 201);
    }

    if (url.pathname.startsWith("/api/memory/") && request.method === "DELETE") {
      if (!env.JANU_MEMORY) return json({ error: "Persistent memory storage is not connected yet. Configure the JANU_MEMORY KV binding." }, 503);
      const id = decodeURIComponent(url.pathname.slice("/api/memory/".length));
      if (!/^[0-9a-f-]{36}$/i.test(id)) return json({ error: "Invalid memory ID." }, 400);
      await env.JANU_MEMORY.delete("memory:" + id);
      return json({ deleted: true });
    }

    if (request.method === "POST" && url.pathname === "/api/security/plan") {
      let body;
      try { body = await request.json(); }
      catch { return json({ error: "Request body must be valid JSON." }, 400); }
      const result = buildAuthorizedTestPlan(body);
      if (result.error) return json({ error: result.error }, 400);
      return json(result);
    }

    if (request.method === "POST" && url.pathname === "/api/security/analyze") {
      let body;
      try { body = await request.json(); }
      catch { return json({ error: "Request body must be valid JSON." }, 400); }
      const description = typeof body.description === "string" ? body.description.trim() : "";
      if (!description || description.length > 5000) {
        return json({ error: "Enter an event description under 5,000 characters." }, 400);
      }
      return json(analyzeSecurityEvent({
        type: typeof body.type === "string" ? body.type.slice(0, 120) : "",
        description
      }));
    }

    if (request.method !== "POST" || url.pathname !== "/api/chat") {
      if (url.pathname.startsWith("/api/")) return json({ error: "Not found" }, 404);
      return env.ASSETS.fetch(request);
    }

    let body;
    try { body = await request.json(); }
    catch { return json({ error: "Request body must be valid JSON." }, 400); }

    const message = typeof body.message === "string" ? body.message.trim() : "";
    if (!message || message.length > 12000) {
      return json({ error: "Message is required and must be under 12,000 characters." }, 400);
    }

    const modeNote = body.adultMode === true
      ? "Adult conversation preference is enabled for this user. Respond maturely to lawful adult topics while following the system safeguards."
      : "Standard conversation mode is enabled.";
    const history = Array.isArray(body.history) ? body.history.slice(-20) : [];
    const safeHistory = history
      .filter(item => item && (item.role === "user" || item.role === "assistant") && typeof item.content === "string")
      .map(item => ({ role: item.role, content: item.content.slice(0, 12000) }));
    // The latest message is already included in history by the client; avoid duplicating it.
    const last = safeHistory[safeHistory.length - 1];
    if (!last || last.role !== "user" || last.content !== message) safeHistory.push({ role: "user", content: message });

    try {
      const messages = [
        { role: "system", content: SYSTEM_PROMPT + "\\n" + modeNote },
        ...safeHistory
      ];

      // Explicit web-search requests use the OpenAI Responses API web_search tool.
      // Ordinary chat stays on the configured low-latency provider path below.
      const wantsWebSearch = /\b(search|web search|google it|look up online|latest news)\b|वेब\s*(पर|में)?\s*(सर्च|खोज)|इंटरनेट\s*(पर|में)\s*(खोज|सर्च)|ऑनलाइन\s*(खोज|सर्च)|ताज़ा खबर|लेटेस्ट खबर/i.test(message);
      if (wantsWebSearch) {
        if (!env.OPENAI_API_KEY) {
          return json({ error: "Web Search के लिए Cloudflare में OPENAI_API_KEY secret configure करना होगा।" }, 503);
        }
        const searchInput = safeHistory.map(item => ({ role: item.role, content: item.content }));
        const upstream = await fetch("https://api.openai.com/v1/responses", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${env.OPENAI_API_KEY}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model: env.JANU_SEARCH_MODEL || "gpt-4.1-mini",
            instructions: "You are JANU AI. The user explicitly requested web search. Use the web_search tool, prioritize recent reliable sources, distinguish verified facts from uncertainty, and include source links in your answer. Respond in the user's language.",
            input: searchInput,
            tools: [{ type: "web_search" }],
            tool_choice: "auto"
          })
        });
        const result = await upstream.json();
        if (!upstream.ok) return json({ error: result.error?.message || "Web Search provider request failed." }, 502);
        const reply = result.output
          ?.filter(item => item.type === "message")
          .flatMap(item => item.content || [])
          .filter(item => item.type === "output_text")
          .map(item => item.text)
          .join("\n")
          .trim();
        if (!reply) return json({ error: "Web Search returned no readable answer." }, 502);
        return json({ reply, provider: "openai-web-search", searched: true });
      }

      // Prefer Cloudflare Workers AI: it has a daily free allocation on Workers Free.
      if (env.AI) {
        const result = await env.AI.run(env.JANU_MODEL || "@cf/meta/llama-3.1-8b-instruct", { messages });
        const reply = result?.response || result?.choices?.[0]?.message?.content;
        if (!reply) return json({ error: "Cloudflare AI returned an empty response. The free daily allowance may be exhausted; try again after it resets." }, 502);
        return json({ reply, provider: "cloudflare-workers-ai" });
      }

      // Keep OpenAI as an optional fallback for accounts that still configure it.
      if (env.OPENAI_API_KEY) {
        const upstream = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${env.OPENAI_API_KEY}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model: env.OPENAI_MODEL || "gpt-4o-mini",
            messages
          })
        });
        const result = await upstream.json();
        if (!upstream.ok) return json({ error: result.error?.message || "AI provider request failed." }, 502);
        const reply = result.choices?.[0]?.message?.content;
        if (!reply) return json({ error: "AI provider returned an empty response." }, 502);
        return json({ reply, provider: "openai" });
      }

      return json({ error: "No AI provider is configured. Enable the Cloudflare Workers AI binding." }, 503);
    } catch (error) {
      return json({ error: error?.message || "Could not reach the AI provider." }, 502);
    }
  }
};
