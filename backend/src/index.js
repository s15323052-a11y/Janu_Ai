const JSON_HEADERS = {
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "no-store"
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: JSON_HEADERS });
}

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

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (request.method === "GET" && url.pathname === "/api/health") {
      return json({ ok: true, service: "janu-ai-api", configured: Boolean(env.OPENAI_API_KEY) });
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
      return json({ error: "Not found" }, 404);
    }

    if (!env.OPENAI_API_KEY) {
      return json({ error: "Server API key is not configured. Add OPENAI_API_KEY as a Cloudflare secret." }, 503);
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
      if (!upstream.ok) return json({ error: result.error?.message || "AI provider request failed." }, 502);
      const reply = result.choices?.[0]?.message?.content;
      if (!reply) return json({ error: "AI provider returned an empty response." }, 502);
      return json({ reply });
    } catch {
      return json({ error: "Could not reach the AI provider." }, 502);
    }
  }
};
