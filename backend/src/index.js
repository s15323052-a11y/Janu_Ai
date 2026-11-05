const JSON_HEADERS = {
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "no-store"
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: JSON_HEADERS });
}

const SYSTEM_PROMPT = `You are JANU AI, a helpful personal assistant. Be clear, respectful, and useful. Support Hindi and English. The user may enable an adult-conversation preference; this does not override applicable law, provider terms, or safeguards against exploitation, sexual content involving minors, non-consensual intimate content, violence, cyber abuse, or privacy invasion. For cybersecurity, provide defensive guidance and authorized testing only. Never claim to have scanned or secured a device unless a connected tool actually performed that action.`;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (request.method === "GET" && url.pathname === "/api/health") {
      return json({ ok: true, service: "janu-ai-api", configured: Boolean(env.OPENAI_API_KEY) });
    }

    if (request.method !== "POST" || url.pathname !== "/api/chat") {
      return json({ error: "Not found" }, 404);
    }

    if (!env.OPENAI_API_KEY) {
      return json({ error: "Server API key is not configured. Add OPENAI_API_KEY as a Cloudflare secret." }, 503);
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return json({ error: "Request body must be valid JSON." }, 400);
    }

    const message = typeof body.message === "string" ? body.message.trim() : "";
    if (!message || message.length > 12000) {
      return json({ error: "Message is required and must be under 12,000 characters." }, 400);
    }

    const modeNote = body.adultMode === true
      ? "Adult conversation preference is enabled for this user. Respond maturely to lawful adult topics while following the system safeguards."
      : "Standard conversation mode is enabled.";

    try {
      const upstream = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${env.OPENAI_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: env.JANU_MODEL || "gpt-4o-mini",
          messages: [
            { role: "system", content: SYSTEM_PROMPT + "\\n" + modeNote },
            { role: "user", content: message }
          ]
        })
      });
      const result = await upstream.json();
      if (!upstream.ok) {
        return json({ error: result.error?.message || "AI provider request failed." }, 502);
      }
      const reply = result.choices?.[0]?.message?.content;
      if (!reply) return json({ error: "AI provider returned an empty response." }, 502);
      return json({ reply });
    } catch {
      return json({ error: "Could not reach the AI provider." }, 502);
    }
  }
};
