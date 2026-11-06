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
      <button class="nav" data-view="memory">▤ <span>Memory</span></button>
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
        <p id="service-status" class="hint" role="status">JANU सेवा से संपर्क हो रहा है…</p>
        <div class="voice-toolbar" aria-label="Voice settings">
          <label for="voice-language">भाषा</label>
          <select id="voice-language"><option value="hi-IN">हिंदी</option><option value="en-IN">English (India)</option></select>
          <label for="voice-type">आवाज़</label>
          <select id="voice-type"><option value="female">महिला</option><option value="male">पुरुष</option></select>
          <label class="speak-toggle"><input id="speak-replies" type="checkbox" checked> जवाब बोलकर सुनाएँ</label>
          <button id="stop-speaking" type="button">⏹ रोकें</button>
          <button id="realtime-toggle" type="button" aria-pressed="false">☎ JANU Live से जुड़ें</button>
        </div>
        <p id="voice-status" class="hint" aria-live="polite">बात करने के लिए नीचे माइक दबाएँ। JANU जवाब लिखेगा और बोलकर भी सुनाएगा।</p>
        <form id="chat-form" class="composer"><textarea id="prompt" rows="1" placeholder="Message JANU AI..." required></textarea><button id="voice-input" class="voice-chat-button" type="button" aria-label="Talk to JANU" title="Talk to JANU" aria-pressed="false">🎙</button><button class="send-chat-button" aria-label="Send message" type="submit">➤</button></form>
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
      <section id="memory-view" class="view hidden">
        <div class="triage card">
          <h2>JANU Memory</h2>
          <p>यहाँ केवल वही बातें सेव होंगी जिन्हें आप खुद लिखकर सेव करेंगे। आप किसी भी समय इन्हें देख या मिटा सकते हैं। अभी पूरी चैट अपने-आप सेव नहीं होती।</p>
          <form id="memory-form">
            <textarea id="memory-text" rows="3" maxlength="1000" placeholder="वह बात लिखें जिसे JANU याद रखे..." required></textarea>
            <button type="submit">याद रखें</button>
          </form>
          <p id="memory-status" class="hint" role="status"></p>
          <div id="memory-list" aria-live="polite"></div>
        </div>
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

const realtimeToggle = document.querySelector("#realtime-toggle");
let realtimePeer = null;
let realtimeStream = null;
let realtimeAudio = null;
let realtimeChannel = null;

function setRealtimeState(connected, message) {
  if (realtimeToggle) {
    realtimeToggle.setAttribute("aria-pressed", connected ? "true" : "false");
    realtimeToggle.textContent = connected ? "☎ JANU Live बंद करें" : "☎ JANU Live से जुड़ें";
  }
  if (message) voiceStatus.textContent = message;
}

async function stopRealtimeVoice(message = "JANU Live कनेक्शन बंद हो गया।") {
  if (realtimeChannel) {
    try { realtimeChannel.close(); } catch {}
    realtimeChannel = null;
  }
  if (realtimePeer) {
    try { realtimePeer.close(); } catch {}
    realtimePeer = null;
  }
  if (realtimeStream) {
    realtimeStream.getTracks().forEach(track => track.stop());
    realtimeStream = null;
  }
  if (realtimeAudio) {
    realtimeAudio.pause();
    realtimeAudio.srcObject = null;
    realtimeAudio.remove();
    realtimeAudio = null;
  }
  setRealtimeState(false, message);
}

async function startRealtimeVoice() {
  if (!window.isSecureContext) throw new Error("Live Voice केवल सुरक्षित HTTPS वेबसाइट पर चलेगा।");
  if (!navigator.mediaDevices?.getUserMedia || !window.RTCPeerConnection) {
    throw new Error("इस browser में WebRTC microphone सुविधा उपलब्ध नहीं है। Android Chrome में खोलें।");
  }
  voiceStatus.textContent = "Microphone permission माँगी जा रही है…";
  realtimeStream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const selectedVoice = voiceType.value === "female" ? "coral" : "ash";
  const sessionResponse = await ownerFetch(apiUrl("/api/realtime/session"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ voice: selectedVoice })
  });
  const sessionData = await sessionResponse.json();
  if (!sessionResponse.ok || !sessionData.clientSecret) {
    throw new Error(sessionData.error || "Realtime session नहीं बन पाया।");
  }

  realtimePeer = new RTCPeerConnection();
  realtimeAudio = document.createElement("audio");
  realtimeAudio.autoplay = true;
  realtimeAudio.playsInline = true;
  realtimeAudio.setAttribute("aria-label", "JANU Live voice response");
  document.body.append(realtimeAudio);
  realtimePeer.ontrack = event => {
    realtimeAudio.srcObject = event.streams[0];
    realtimeAudio.play().catch(() => {
      voiceStatus.textContent = "JANU की आवाज़ सुनने के लिए फोन का media playback चालू करें।";
    });
  };
  realtimeStream.getTracks().forEach(track => realtimePeer.addTrack(track, realtimeStream));

  realtimeChannel = realtimePeer.createDataChannel("oai-events");
  realtimeChannel.addEventListener("open", () => {
    setRealtimeState(true, "JANU Live जुड़ गया है। अब सीधे बोलिए, बातचीत real-time में होगी।");
  });
  realtimeChannel.addEventListener("message", event => {
    try {
      const data = JSON.parse(event.data);
      if (data.type === "conversation.item.input_audio_transcription.completed" && data.transcript) {
        addMessage("user", data.transcript);
      } else if (data.type === "response.output_audio_transcript.done" && data.transcript) {
        addMessage("assistant", data.transcript, { speak: false });
      } else if (data.type === "error") {
        voiceStatus.textContent = "Live Voice त्रुटि: " + (data.error?.message || "अज्ञात समस्या");
      }
    } catch {
      // Ignore non-JSON provider events.
    }
  });
  realtimePeer.addEventListener("connectionstatechange", () => {
    if (realtimePeer?.connectionState === "failed") {
      stopRealtimeVoice("Live connection विफल हुआ। Internet जाँचकर फिर कोशिश करें।");
    } else if (realtimePeer?.connectionState === "disconnected") {
      voiceStatus.textContent = "Live connection अस्थायी रूप से disconnect हुआ है…";
    }
  });

  const offer = await realtimePeer.createOffer();
  await realtimePeer.setLocalDescription(offer);
  const answerResponse = await fetch("https://api.openai.com/v1/realtime/calls", {
    method: "POST",
    headers: {
      "Authorization": "Bearer " + sessionData.clientSecret,
      "Content-Type": "application/sdp"
    },
    body: offer.sdp
  });
  if (!answerResponse.ok) {
    const errorText = await answerResponse.text();
    throw new Error("Realtime connection अस्वीकार हुआ: " + errorText.slice(0, 240));
  }
  const answerSdp = await answerResponse.text();
  await realtimePeer.setRemoteDescription({ type: "answer", sdp: answerSdp });
}

realtimeToggle?.addEventListener("click", async () => {
  if (realtimePeer) {
    await stopRealtimeVoice();
    return;
  }
  realtimeToggle.disabled = true;
  try {
    await startRealtimeVoice();
  } catch (error) {
    await stopRealtimeVoice("Live Voice शुरू नहीं हुआ: " + error.message);
  } finally {
    realtimeToggle.disabled = false;
  }
});



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

function addMessage(role, text, options = {}) {
  const item = document.createElement("div");
  item.className = `message ${role}`;
  const label = document.createElement("strong");
  label.textContent = role === "user" ? "YOU" : "JANU";
  const body = document.createElement("p");
  body.textContent = text;
  item.append(label, body);
  messages.append(item);
  item.scrollIntoView({ behavior: "smooth", block: "end" });
  if (role === "assistant" && options.speak !== false) speakText(text);
}

toggle.addEventListener("change", () => {
  adultMode = toggle.checked;
  localStorage.setItem(adultModeKey, adultMode ? "on" : "off");
});

document.querySelectorAll(".nav").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".nav").forEach((b) => b.classList.toggle("active", b === button));
    const view = button.dataset.view;
    document.querySelector("#chat-view").classList.toggle("hidden", view !== "chat");
    document.querySelector("#shield-view").classList.toggle("hidden", view !== "shield");
    document.querySelector("#memory-view").classList.toggle("hidden", view !== "memory");
    document.querySelector("#page-title").textContent = view === "shield" ? "Cyber Shield" : view === "memory" ? "JANU Memory" : "What shall we create?";
    if (view === "memory") loadMemory();
  });
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const message = promptBox.value.trim();
  if (!message) return;
  const sendButton = form.querySelector('button[type="submit"]');
  if (sendButton.disabled) return;
  sendButton.disabled = true;
  sendButton.textContent = "…";
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
    if (!response.ok) { const error = new Error(data.error || "The API request failed."); error.status = response.status; throw error; }
    conversationHistory.push({ role: "assistant", content: data.reply });
    addMessage("assistant", data.reply);
  } catch (error) {
    conversationHistory.pop();
    waiting.remove();
    if (error.status === 401) {
      ownerToken = "";
      sessionStorage.removeItem("janu-owner-session");
      workspace.hidden = true;
      login.hidden = false;
      document.querySelector("#owner-login-error").textContent = "आपका session समाप्त हो गया है। दोबारा sign in करें।";
    }
    addMessage("assistant", `JANU जवाब नहीं दे पाया: ${error.message}`);
  } finally {
    sendButton.disabled = false;
    sendButton.textContent = "➤";
  }
});

async function checkJanuService() {
  const status = document.querySelector("#service-status");
  try {
    const response = await fetch(apiUrl("/api/health"), { cache: "no-store" });
    const data = await response.json();
    if (!response.ok || !data.ok) throw new Error("JANU API उपलब्ध नहीं है।");
    status.textContent = data.configured
      ? "JANU API online है। AI सेवा configured है; chat के लिए owner sign-in जरूरी है।"
      : "JANU API online है, लेकिन AI key configured नहीं है। इसलिए JANU जवाब नहीं दे पाएगा।";
  } catch (error) {
    status.textContent = "JANU सेवा से संपर्क नहीं हो पाया। Internet या service जाँचें।";
  }
}
checkJanuService();


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


async function loadMemory() {
  const list = document.querySelector("#memory-list");
  const status = document.querySelector("#memory-status");
  list.replaceChildren();
  status.textContent = "Saved memories लोड हो रही हैं…";
  try {
    const response = await ownerFetch(apiUrl("/api/memory"));
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Memory load failed.");
    status.textContent = data.items.length ? `${data.items.length} बातें सेव हैं।` : "अभी कोई बात सेव नहीं है।";
    for (const item of data.items) {
      const row = document.createElement("article");
      row.className = "finding";
      const content = document.createElement("p");
      content.textContent = item.text;
      const remove = document.createElement("button");
      remove.type = "button";
      remove.textContent = "मिटाएँ";
      remove.addEventListener("click", async () => {
        if (!confirm("क्या इस याद को मिटाना चाहते हैं?")) return;
        const deleted = await ownerFetch(apiUrl("/api/memory/" + encodeURIComponent(item.id)), { method: "DELETE" });
        if (!deleted.ok) { status.textContent = "याद मिटाई नहीं जा सकी।"; return; }
        loadMemory();
      });
      row.append(content, remove);
      list.append(row);
    }
  } catch (error) { status.textContent = error.message; }
}

document.querySelector("#memory-form")?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const input = document.querySelector("#memory-text");
  const status = document.querySelector("#memory-status");
  status.textContent = "सेव किया जा रहा है…";
  try {
    const response = await ownerFetch(apiUrl("/api/memory"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: input.value.trim() })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Memory save failed.");
    input.value = "";
    status.textContent = "यह बात JANU की Memory में सेव हो गई।";
    loadMemory();
  } catch (error) { status.textContent = error.message; }
});
