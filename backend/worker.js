const SYSTEM_PROMPT = "You are JANU, a friendly personal AI assistant. Reply naturally in the language the user uses, Hindi or English. Be concise, helpful, and honest.";

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "*";
    const cors = {
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Vary": "Origin"
    };

    if (request.method === "OPTIONS") return new Response(null, { headers: cors });
    const url = new URL(request.url);
    if (url.pathname !== "/chat" || request.method !== "POST") {
      return Response.json({ error: "Not found" }, { status: 404, headers: cors });
    }
    if (!env.OPENAI_API_KEY) {
      return Response.json({ error: "Server API key is not configured." }, { status: 503, headers: cors });
    }

    try {
      const body = await request.json();
      const message = typeof body.message === "string" ? body.message.trim() : "";
      if (!message || message.length > 8000) {
        return Response.json({ error: "Message must contain 1 to 8000 characters." }, { status: 400, headers: cors });
      }

      const upstream = await fetch("https://api.openai.com/v1/responses", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${env.OPENAI_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "gpt-6-luna",
          instructions: SYSTEM_PROMPT,
          input: message,
          max_output_tokens: 700
        })
      });

      const data = await upstream.json();
      if (!upstream.ok) {
        return Response.json({ error: "AI provider request failed.", detail: data.error?.message || "Unknown provider error." }, { status: upstream.status, headers: cors });
      }

      const reply = (data.output || [])
        .flatMap(item => item.content || [])
        .filter(item => item.type === "output_text")
        .map(item => item.text)
        .join("\n")
        .trim();

      if (!reply) return Response.json({ error: "The AI returned an empty response." }, { status: 502, headers: cors });
      return Response.json({ reply }, { headers: cors });
    } catch (error) {
      return Response.json({ error: "Invalid request or server error." }, { status: 500, headers: cors });
    }
  }
};
