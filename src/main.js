import "./style.css";

const API_BASE_URL = "https://janu-ai-api.s15323052.workers.dev";
const apiUrl = (path) => new URL(path, API_BASE_URL).toString();
const app = document.querySelector("#app");
let ownerToken = sessionStorage.getItem("janu-owner-session") || "";
const login = document.createElement("section");
login.id = "owner-login";
login.style.cssText = "max-width:420px;margin:12vh auto;padding:32px;border:1px solid #334155;border-radius:18px;background:#111827;color:#f8fafc;font:16px system-ui";
login.innerHTML = '<h1>JANU AI Owner Login</h1><p>Private owner workspace. Session expires after 12 hours.</p><form id="owner-login-form"><label for="owner-password">Owner password</label><input id="owner-password" type="password" autocomplete="current-password" required style="display:block;width:100%;box-sizing:border-box;margin:10px 0 16px;padding:12px;border-radius:8px"><button type="submit" style="padding:10px 18px">Sign in</button><p id="owner-login-error" role="alert"></p></form>';
app.append(login);
const ownerFetch = (url, options = {}) => { const headers = new Headers(options.headers || {}); if (ownerToken) headers.set("Authorization", "Bearer " + ownerToken); return fetch(url, { ...options, headers }); };

const adultModeKey = "janu-adult-mode";
let adultMode = localStorage.getItem(adultModeKey) === "on";

app.innerHTML = `
  <div class="shell">
    <aside class="sidebar">
      <div class="brand"><span class="brand-mark">J</span><div><strong>JANU AI</strong><small>MY AI. MY RULES. MY CONTROL.</small></div></div>
      <button class="nav active" data-view="chat">✦ <span>Chat</span></button>
      <button class="nav" data-view="shield">◈ <span>Cyber Shield</span></button>
      <div class="side-bottom">
        <div class="owner-card"><span class="online-dot"></span><div><strong>Personal workspace</strong><small>Owner controls are local to this demo</small></div></div>
      </div>
    </aside>
    <main class="main">
      <header class="topbar"><div><span class="eyebrow">YOUR PERSONAL AI</span><h1 id="page-title">What shall we create?</h1></div>
        <label class="mode-toggle"><span>18+ Mode</span><input id="adult-toggle" type="checkbox" ${adultMode ? "checked" : ""}><i></i></label>
      </header>
      <section id="chat-view" class="view">
        <div class="welcome"><div class="orb">✦</div><h2>Hello. I'm JANU.</h2><p>Ask, create, research, plan or build. Your workspace, your settings.</p></div>
        <div id="messages" class="messages" aria-live="polite"></div>
        <div class="voice-toolbar" aria-label="Voice controls">
          <button id="voice-input" type="button" aria-pressed="false">🎙️ बोलें</button>
          <label for="voice-language">भाषा</label>
          <select id="voice-language"><option value="hi-IN">हिंदी</option><option value="en-IN">English (India)</option></select>
          <label for="voice-type">आवाज़</label>
          <select id="voice-type"><option value="female">महिला</option><option value="male">पुरुष</option></select>
          <label class="speak-toggle"><input id="speak-replies" type="checkbox" checked> जवाब बोलकर सुनाएँ</label>
          <button id="stop-speaking" type="button">⏹ रोकें</button>
        </div>
        <p id="voice-status" class="hint" aria-live="polite">माइक दबाकर बोलें। आवाज़ की उपलब्धता आपके ब्राउज़र और डिवाइस पर निर्भर है।</p>
        <form id="chat-form" class="composer"><textarea id="prompt" rows="1" placeholder="Message JANU AI..." required></textarea><button aria-label="Send message" type="submit">➤</button></form>
        <p class="hint">Do not enter passwords, API keys or other secrets in chat. Voice input is processed by your browser/device speech service.</p>
      </section>
      <section id="shield-view" class="view hidden">
        <div class="shield-hero"><div class="shield-icon">◈</div><div><span class="eyebrow">JANU AI CYBER SHIELD</span><h2>Protect your digital life.</h2><p>Security guidance and incident-response workspace.</p></div></div>
        <div class="cards">
          <article class="card"><span class="card-icon">⌁</span><h3>Account protection</h3><p>Use unique passwords, a password manager and passkeys or multi-factor authentication.</p></article>
          <article class="card"><span class="card-icon">◉</span><h3>Suspicious activity</h3><p>Review recent sign-ins and active sessions in the official security settings of each account.</p></article>
          <article class="card"><span class="card-icon">⬡</span><h3>Incident response</h3><p>Disconnect a compromised device from the network, preserve evidence and change credentials from a clean device.</p></article>
        </div>
        <div class="triage card">
          <h3>Build an authorized security test plan</h3>
          <p>Prepare a non-destructive checklist for systems you own or are explicitly permitted to test.</p>
          <form id="security-plan-form">
            <input id="security-asset" type="text" maxlength="240" placeholder="Asset name or URL (e.g. your staging app)" required>
            <div class="scope-options">
              <label><input type="checkbox" name="scope" value="web-app"> Web app</label>
              <label><input type="checkbox" name="scope" value="api"> API</label>
              <label><input type="checkbox" name="scope" value="authentication"> Authentication</label>
              <label><input type="checkbox" name="scope" value="configuration"> Configuration</label>
              <label><input type="checkbox" name="scope" value="headers"> Security headers</label>
              <label><input type="checkbox" name="scope" value="dependencies"> Dependencies</label>
            </div>
            <label class="authorization-check"><input id="security-authorization" type="checkbox" required> I own this asset or have written permission to test it.</label>
            <button type="submit">Create test plan</button>
          </form>
          <div id="security-plan-result" aria-live="polite"></div>
        </div>
        <div class="triage card">
          <h3>Analyze a security event</h3>
          <p>Paste an alert or log excerpt with secrets and personal information removed.</p>
          <form id="security-form">
            <textarea id="security-description" rows="4" maxlength="5000" placeholder="Example: multiple failed login attempts from an unfamiliar device..." required></textarea>
            <button type="submit">Analyze event</button>
          </form>
          <div id="security-result" aria-live="polite"></div>
        </div>
        <div class="notice"><strong>Current capability:</strong> This performs rule-based triage on text you submit. It does not scan devices, monitor live network traffic, identify an attacker or block connections. Real detection requires an installed endpoint agent, authorized log integrations and deployment.</div>
      </section>
    </main>
  </div>
`;

app.prepend(login);
const workspace = app.querySelector(".shell");
workspace.hidden = !ownerToken;
login.hidden = Boolean(ownerToken);
document.querySelector("#owner-login-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const errorBox = document.querySelector("#owner-login-error");
  errorBox.textContent = "Signing in…";
  try {
    const response = await fetch(apiUrl("/api/auth/login"), { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({password:document.querySelector("#owner-password").value}) });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Sign-in failed.");
    ownerToken = data.token;
    sessionStorage.setItem("janu-owner-session", ownerToken);
    login.hidden = true;
    workspace.hidden = false;
    document.querySelector("#owner-password").value = "";
  } catch (error) { errorBox.textContent = error.message; }
});

const messages = document.querySelector("#messages");
const form = document.querySelector("#chat-form");
const promptBox = document.querySelector("#prompt");
const toggle = document.querySelector("#adult-toggle");
// Conversation context is kept in this browser tab for the current session.
const conversationHistory = [];

let availableVoices = [];
let recognition = null;
const voiceInputButton = document.querySelector("#voice-input");
const voiceLanguage = document.querySelector("#voice-language");
const voiceType = document.querySelector("#voice-type");
const speakReplies = document.querySelector("#speak-replies");
const voiceStatus = document.querySelector("#voice-status");

function loadSpeechVoices() {
  if (!("speechSynthesis" in window)) return;
  availableVoices = window.speechSynthesis.getVoices();
}
if ("speechSynthesis" in window) {
  loadSpeechVoices();
  window.speechSynthesis.addEventListener?.("voiceschanged", loadSpeechVoices);
}

function speakText(text) {
  if (!speakReplies.checked) return;
  if (!("speechSynthesis" in window) || typeof SpeechSynthesisUtterance === "undefined") {
    voiceStatus.textContent = "इस ब्राउज़र में बोलकर जवाब सुनाने की सुविधा उपलब्ध नहीं है।";
    return;
  }
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = voiceLanguage.value;
  const languagePrefix = voiceLanguage.value.toLowerCase().split("-")[0];
  const matching = availableVoices.filter(v => v.lang?.toLowerCase().startsWith(languagePrefix));
  const genderWords = voiceType.value === "female"
    ? /female|woman|zira|samantha|susan|heera|lekha|karen|veena|priya/i
    : /male|man|david|mark|ravi|rishi|alex|daniel|george/i;
  utterance.voice = matching.find(v => genderWords.test(v.name)) || matching[0] || null;
  utterance.rate = 1;
  utterance.onstart = () => { voiceStatus.textContent = "JANU जवाब बोल रहा है…"; };
  utterance.onend = () => { voiceStatus.textContent = "जवाब पूरा हुआ। फिर से बोलने के लिए माइक दबाएँ।"; };
  utterance.onerror = (event) => { voiceStatus.textContent = "आवाज़ सुनाने में समस्या: " + (event.error || "unknown"); };
  window.speechSynthesis.speak(utterance);
}

function resetVoiceInput() {
  recognition = null;
  voiceInputButton?.setAttribute("aria-pressed", "false");
  if (voiceInputButton) voiceInputButton.textContent = "🎙️ बोलें";
}
function stopListening() {
  const activeRecognition = recognition;
  recognition = null;
  if (activeRecognition) {
    try { activeRecognition.stop(); } catch {}
  }
  voiceInputButton?.setAttribute("aria-pressed", "false");
  if (voiceInputButton) voiceInputButton.textContent = "🎙️ बोलें";
}

voiceInputButton?.addEventListener("click", () => {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!window.isSecureContext) {
    voiceStatus.textContent = "Voice सुविधा सुरक्षित HTTPS connection पर ही चलेगी। JANU को https:// से खोलें।";
    return;
  }
  if (!SpeechRecognition) {
    voiceStatus.textContent = "इस ब्राउज़र में voice input उपलब्ध नहीं है। Android पर Chrome में JANU खोलें और Microphone अनुमति दें।";
    return;
  }
  if (recognition) { stopListening(); voiceStatus.textContent = "माइक बंद कर दिया गया।"; return; }
  const activeRecognition = new SpeechRecognition();
  recognition = activeRecognition;
  activeRecognition.lang = voiceLanguage.value;
  activeRecognition.interimResults = false;
  activeRecognition.continuous = false;
  activeRecognition.maxAlternatives = 1;
  activeRecognition.onstart = () => {
    voiceInputButton.textContent = "⏹ सुनना बंद करें";
    voiceInputButton.setAttribute("aria-pressed", "true");
    voiceStatus.textContent = "JANU सुन रहा है… अब बोलिए।";
  };
  activeRecognition.onresult = (event) => {
    const spoken = event.results?.[0]?.[0]?.transcript?.trim();
    if (spoken) {
      promptBox.value = spoken;
      voiceStatus.textContent = "आपने कहा: " + spoken;
      form.requestSubmit();
    } else {
      voiceStatus.textContent = "आवाज़ साफ़ नहीं समझ आई। कृपया दोबारा बोलें।";
    }
  };
  activeRecognition.onnomatch = () => {
    voiceStatus.textContent = "बोली गई बात समझ नहीं आई। धीरे और साफ़ बोलकर फिर कोशिश करें।";
  };
  activeRecognition.onerror = (event) => {
    const messages = {
      "not-allowed": "माइक की अनुमति नहीं मिली। Android/Chrome की Site settings में Microphone को Allow करें।",
      "service-not-allowed": "ब्राउज़र की speech service उपलब्ध नहीं है या अनुमति नहीं है।",
      "no-speech": "कोई आवाज़ नहीं मिली। माइक के पास बोलकर फिर कोशिश करें।",
      "audio-capture": "माइक नहीं मिल रहा। फोन की Microphone permission और माइक जाँचें।",
      "network": "Speech recognition की network service से संपर्क नहीं हो पाया। Internet जाँचकर फिर कोशिश करें।",
      "language-not-supported": "चुनी हुई भाषा इस browser की speech service में समर्थित नहीं है।"
    };
    voiceStatus.textContent = messages[event.error] || "Voice input में समस्या: " + event.error;
  };
  activeRecognition.onend = () => {
    if (recognition === activeRecognition) resetVoiceInput();
  };
  try { activeRecognition.start(); }
  catch (error) {
    voiceStatus.textContent = "माइक शुरू नहीं हो पाया: " + error.message;
    resetVoiceInput();
  }
});

document.querySelector("#stop-speaking")?.addEventListener("click", () => {
  if ("speechSynthesis" in window) window.speechSynthesis.cancel();
});
voiceLanguage?.addEventListener("change", () => {
  if (recognition) stopListening();
  voiceStatus.textContent = "भाषा बदल गई। अगली voice command नई भाषा में होगी।";
});

function addMessage(role, text) {
  const item = document.createElement("div");
  item.className = `message ${role}`;
  const label = document.createElement("strong");
  label.textContent = role === "user" ? "YOU" : "JANU";
  const body = document.createElement("p");
  body.textContent = text;
  item.append(label, body);
  messages.append(item);
  item.scrollIntoView({ behavior: "smooth", block: "end" });
  if (role === "assistant") speakText(text);
}

toggle.addEventListener("change", () => {
  adultMode = toggle.checked;
  localStorage.setItem(adultModeKey, adultMode ? "on" : "off");
});

document.querySelectorAll(".nav").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".nav").forEach((b) => b.classList.toggle("active", b === button));
    const shield = button.dataset.view === "shield";
    document.querySelector("#chat-view").classList.toggle("hidden", shield);
    document.querySelector("#shield-view").classList.toggle("hidden", !shield);
    document.querySelector("#page-title").textContent = shield ? "Cyber Shield" : "What shall we create?";
  });
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const message = promptBox.value.trim();
  if (!message) return;
  addMessage("user", message);
  conversationHistory.push({ role: "user", content: message });
  promptBox.value = "";
  const waiting = document.createElement("div");
  waiting.className = "message assistant";
  waiting.textContent = "JANU is preparing a response…";
  messages.append(waiting);
  try {
    const response = await ownerFetch(apiUrl("/api/chat"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, history: conversationHistory.slice(-20), adultMode })
    });
    const data = await response.json();
    waiting.remove();
    if (!response.ok) throw new Error(data.error || "The API request failed.");
    conversationHistory.push({ role: "assistant", content: data.reply });
    addMessage("assistant", data.reply);
  } catch (error) {
    conversationHistory.pop();
    waiting.remove();
    addMessage("assistant", `JANU chat service error: ${error.message}`);
  }
});

fetch(apiUrl("/api/health")).catch(() => {});


const securityForm = document.querySelector("#security-form");
securityForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const description = document.querySelector("#security-description").value.trim();
  const resultBox = document.querySelector("#security-result");
  resultBox.textContent = "Analyzing supplied event…";
  try {
    const response = await ownerFetch(apiUrl("/api/security/analyze"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ description })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Analysis failed.");
    resultBox.replaceChildren();
    const heading = document.createElement("h4");
    heading.textContent = `Triage level: ${data.severity.toUpperCase()}`;
    resultBox.append(heading);
    for (const finding of data.findings) {
      const item = document.createElement("article");
      item.className = "finding";
      const title = document.createElement("strong");
      title.textContent = finding.title;
      const detail = document.createElement("p");
      detail.textContent = finding.detail;
      const action = document.createElement("p");
      action.textContent = `Recommended action: ${finding.action}`;
      item.append(title, detail, action);
      resultBox.append(item);
    }
    const disclaimer = document.createElement("p");
    disclaimer.className = "hint";
    disclaimer.textContent = data.disclaimer;
    resultBox.append(disclaimer);
  } catch (error) {
    resultBox.textContent = `Security analysis is unavailable: ${error.message}`;
  }
});


const planForm = document.querySelector("#security-plan-form");
planForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const resultBox = document.querySelector("#security-plan-result");
  const scope = [...planForm.querySelectorAll('input[name="scope"]:checked')].map(input => input.value);
  resultBox.textContent = "Preparing authorized test checklist…";
  try {
    const response = await ownerFetch(apiUrl("/api/security/plan"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        asset: document.querySelector("#security-asset").value.trim(),
        authorization: document.querySelector("#security-authorization").checked,
        scope
      })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Could not create test plan.");
    resultBox.replaceChildren();
    const heading = document.createElement("h4");
    heading.textContent = `Authorized plan for: ${data.asset}`;
    resultBox.append(heading);
    for (const row of data.plan) {
      const item = document.createElement("p");
      item.textContent = `[${row.area}] ${row.test}`;
      resultBox.append(item);
    }
    const note = document.createElement("p");
    note.className = "hint";
    note.textContent = data.safety;
    resultBox.append(note);
  } catch (error) {
    resultBox.textContent = error.message;
  }
});
