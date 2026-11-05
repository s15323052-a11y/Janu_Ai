import "./style.css";

const app = document.querySelector("#app");
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
        <form id="chat-form" class="composer"><textarea id="prompt" rows="1" placeholder="Message JANU AI..." required></textarea><button aria-label="Send message" type="submit">➤</button></form>
        <p class="hint">Do not enter passwords, API keys or other secrets in chat.</p>
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

const messages = document.querySelector("#messages");
const form = document.querySelector("#chat-form");
const promptBox = document.querySelector("#prompt");
const toggle = document.querySelector("#adult-toggle");

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
  promptBox.value = "";
  const waiting = document.createElement("div");
  waiting.className = "message assistant";
  waiting.textContent = "JANU is preparing a response…";
  messages.append(waiting);
  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, adultMode })
    });
    const data = await response.json();
    waiting.remove();
    if (!response.ok) throw new Error(data.error || "The API request failed.");
    addMessage("assistant", data.reply);
  } catch (error) {
    waiting.remove();
    addMessage("assistant", `The chat service is not connected yet: ${error.message} Check the backend setup before using live chat.`);
  }
});

fetch("/api/health").catch(() => {});


const securityForm = document.querySelector("#security-form");
securityForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const description = document.querySelector("#security-description").value.trim();
  const resultBox = document.querySelector("#security-result");
  resultBox.textContent = "Analyzing supplied event…";
  try {
    const response = await fetch("/api/security/analyze", {
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
    const response = await fetch("/api/security/plan", {
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
