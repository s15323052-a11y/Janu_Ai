const SYSTEM_PROMPT = "You are JANU, a friendly personal AI assistant. Reply naturally in the language the user uses, Hindi or English. Be concise, helpful, and honest.";

function corsHeaders(request) {
  return {
    "Access-Control-Allow-Origin": request.headers.get("Origin") || "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Vary": "Origin"
  };
}

export default {
  async fetch(request, env) {
    const cors = corsHeaders(request);
    if (request.method === "OPTIONS") return new Response(null, { headers: cors });

    const url = new URL(request.url);
    if (url.pathname !== "/chat" || request.method !== "POST") {
      return Response.json({ error: "Not found" }, { status: 404, headers: cors });
    }

    try {
      const body = await request.json();
      const message = typeof body.message === "string" ? body.message.trim() : "";
      if (!message || message.length > 8000) {
        return Response.json({ error: "Message must contain 1 to 8000 characters." }, { status: 400, headers: cors });
      }

      // Select a provider per request. If omitted, prefer Gemini when its server secret exists.
      const provider = body.provider === "openai" || body.provider === "gemini"
        ? body.provider
        : (env.GEMINI_API_KEY ? "gemini" : "openai");

      let upstream;
      if (provider === "gemini") {
        if (!env.GEMINI_API_KEY) {
          return Response.json({ error: "Gemini server key is not configured." }, { status: 503, headers: cors });
        }
        const model = env.GEMINI_MODEL || "gemini-3.8-flash";
        upstream = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
          method: "POST",
          headers: {
            "x-goog-api-key": env.GEMINI_API_KEY,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
            contents: [{ role: "user", parts: [{ text: message }] }],
            generationConfig: { maxOutputTokens: 700 }
          })
        });
      } else {
        if (!env.OPENAI_API_KEY) {
          return Response.json({ error: "OpenAI server key is not configured." }, { status: 503, headers: cors });
        }
        const model = env.OPENAI_MODEL || "gpt-6-luna";
        upstream = await fetch("https://api.openai.com/v1/responses", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${env.OPENAI_API_KEY}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model,
            instructions: SYSTEM_PROMPT,
            input: message,
            max_output_tokens: 700
          })
        });
      }

      const data = await upstream.json();
      if (!upstream.ok) {
        return Response.json({
          error: `${provider} provider request failed.`,
          detail: data.error?.message || data.error?.status || "Unknown provider error."
        }, { status: upstream.status, headers: cors });
      }

      let reply = "";
      if (provider === "gemini") {
        reply = (data.candidates?.[0]?.content?.parts || [])
          .map(part => part.text || "")
          .join("\n").trim();
      } else {
        reply = (data.output || [])
          .flatMap(item => item.content || [])
          .filter(item => item.type === "output_text")
          .map(item => item.text)
          .join("\n").trim();
      }

      if (!reply) return Response.json({ error: "The AI returned an empty response." }, { status: 502, headers: cors });
      return Response.json({ reply, provider }, { headers: cors });
    } catch (error) {
      return Response.json({ error: "Invalid request or server error." }, { status: 500, headers: cors });
    }
  }
};
