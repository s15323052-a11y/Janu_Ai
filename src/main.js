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
        <div class="notice"><strong>Important:</strong> This starter dashboard does not scan devices, block attackers or monitor networks. Those capabilities require separately installed, permissioned security software and integrations.</div>
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
