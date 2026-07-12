import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// Safeguard against environments, platforms, or extensions trying to redefine window.fetch
try {
  if (typeof window !== "undefined" && window.fetch) {
    const desc = Object.getOwnPropertyDescriptor(window, "fetch");
    if (desc && (!desc.writable || !desc.configurable)) {
      const originalFetch = window.fetch;
      Object.defineProperty(window, "fetch", {
        value: originalFetch,
        writable: true,
        configurable: true
      });
    }
  }
} catch (e) {
  console.warn("Safeguard: Could not redefine window.fetch:", e);
}

// Google Auth & Gmail API state
let authInstance = null;
let providerInstance = null;
let currentGoogleUser = null;
let currentAccessToken = null;

const menuToggle = document.getElementById("menuToggle");
const menuPanel = document.getElementById("menuPanel");
const heroGrid = document.getElementById("heroGrid");
const landingSpacer = document.getElementById("landingSpacer");
const heroFixed = document.getElementById("heroFixed");
const heroOrbit = document.getElementById("heroOrbit");
const heroTitleWrap = document.getElementById("heroTitleWrap");
const currentPage = window.location.pathname.split("/").pop() || "index.html";

function closeMenu() {
  if (!menuToggle || !menuPanel) return;
  menuToggle.classList.remove("is-open");
  menuToggle.setAttribute("aria-expanded", "false");
  menuPanel.classList.remove("is-open");
  menuPanel.setAttribute("aria-hidden", "true");
  document.body.classList.remove("menu-open");
}

function openMenu() {
  if (!menuToggle || !menuPanel) return;
  menuToggle.classList.add("is-open");
  menuToggle.setAttribute("aria-expanded", "true");
  menuPanel.classList.add("is-open");
  menuPanel.setAttribute("aria-hidden", "false");
  document.body.classList.add("menu-open");
}

if (menuToggle && menuPanel) {
  menuToggle.addEventListener("click", () => {
    if (menuPanel.classList.contains("is-open")) closeMenu();
    else openMenu();
  });

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenu();
  });
}

document.querySelectorAll(".menu-panel a, .menu-pagination button").forEach((item) => {
  const target = item.getAttribute("href") || item.dataset.target;
  if (target === currentPage) {
    item.classList.add("is-current");
    if (item.tagName === "A") item.setAttribute("aria-current", "page");
  }

  item.addEventListener("click", (event) => {
    closeMenu();
    if (target && target.startsWith("#")) {
      event.preventDefault();
      setTimeout(() => document.querySelector(target)?.scrollIntoView({ behavior: "smooth" }), 180);
      return;
    }

    if (item.tagName === "BUTTON" && target) {
      event.preventDefault();
      setTimeout(() => {
        window.location.href = target;
      }, 180);
    }
  });
});

const revealObserver = "IntersectionObserver" in window
  ? new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -42px 0px" },
    )
  : null;

document.querySelectorAll(".reveal").forEach((element) => {
  if (revealObserver) revealObserver.observe(element);
  else element.classList.add("is-visible");
});

// Google Auth, Firebase Initialization & Gmail API send helper
async function sendGmailMessage(accessToken, { name, email, interest, message }) {
  const recipient = "sdc@cit.edu.in";
  const subject = `[SDC Signal] Contact Request from ${name}`;
  
  // Format RFC 2822 raw message
  const rfcEmail = [
    `From: me`,
    `To: ${recipient}`,
    `Subject: =?utf-8?B?${btoa(unescape(encodeURIComponent(subject)))}?=`,
    `Reply-To: ${email}`,
    `MIME-Version: 1.0`,
    `Content-Type: text/html; charset=utf-8`,
    ``,
    `<div style="font-family: system-ui, sans-serif; max-width: 600px; padding: 24px; border: 1px solid #1f1f29; border-radius: 8px; background: #0b0b0f; color: #f4f4f6;">
      <h2 style="color: #8b5cf6; margin-top: 0; font-family: Orbitron, sans-serif; border-bottom: 1px solid #1f1f29; padding-bottom: 12px;">SDC_SIGNAL_RECEIVED</h2>
      <p style="font-size: 14px; color: #94a3b8; font-family: monospace;">A user has submitted a contact signal to Student Developers Cell CIT using Gmail API.</p>
      
      <div style="background: rgba(139, 92, 246, 0.04); border: 1px solid rgba(139, 92, 246, 0.15); border-radius: 6px; padding: 16px; margin: 20px 0;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 6px 0; color: #e2e8f0; font-weight: 600; width: 100px;">Name:</td>
            <td style="padding: 6px 0; color: #f4f4f6;">${name}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #e2e8f0; font-weight: 600;">Email:</td>
            <td style="padding: 6px 0;"><a href="mailto:${email}" style="color: #ec4899; text-decoration: none;">${email}</a></td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #e2e8f0; font-weight: 600;">Interest:</td>
            <td style="padding: 6px 0; color: #a78bfa; font-family: monospace;">${interest}</td>
          </tr>
        </table>
      </div>

      <div style="border-left: 3px solid #8b5cf6; padding-left: 14px; margin: 20px 0;">
        <h4 style="margin: 0 0 6px 0; color: #8b5cf6; text-transform: uppercase; font-size: 11px; letter-spacing: 0.05em; font-family: monospace;">MESSAGE_BODY</h4>
        <p style="margin: 0; line-height: 1.6; color: #e2e8f0; white-space: pre-wrap;">${message}</p>
      </div>

      <div style="margin-top: 32px; border-top: 1px solid #1f1f29; padding-top: 12px; font-size: 11px; color: #64748b; font-family: monospace; display: flex; justify-content: space-between;">
        <span>SENDER_AUTHENTICATED: YES</span>
        <span>SDC CIT PORTFOLIO</span>
      </div>
    </div>`
  ].join('\r\n');

  // Base64Url encode standard RFC2822 content
  const encodedEmail = btoa(unescape(encodeURIComponent(rfcEmail)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  const response = await window.fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      raw: encodedEmail
    })
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error?.message || `Gmail API failed (status ${response.status})`);
  }

  return response.json();
}

function updateAuthUI() {
  const container = document.getElementById("googleAuthBox");
  if (!container) return;

  if (currentGoogleUser && currentAccessToken) {
    container.innerHTML = `
      <div class="auth-header">
        <span class="auth-title">Gmail API Configured</span>
        <button type="button" class="btn-disconnect" id="authDisconnectBtn">Sign Out</button>
      </div>
      <p class="auth-status">Authenticated. Your message will be sent directly from your personal Gmail address.</p>
      <div class="auth-user">
        <img src="${currentGoogleUser.photoURL || 'https://www.gravatar.com/avatar/?d=mp'}" alt="User Avatar" />
        <div class="auth-user-info">
          <span class="auth-user-name">${currentGoogleUser.displayName || 'Google Member'}</span>
          <span class="auth-user-email">${currentGoogleUser.email}</span>
        </div>
      </div>
    `;

    document.getElementById("authDisconnectBtn")?.addEventListener("click", handleLogout);
    
    const submitBtn = document.querySelector("#contactForm button[type='submit']");
    if (submitBtn) {
      submitBtn.textContent = "Send via Gmail API";
    }
  } else if (currentGoogleUser && !currentAccessToken) {
    container.innerHTML = `
      <div class="auth-header">
        <span class="auth-title">Gmail Integration</span>
        <button type="button" class="btn-disconnect" id="authDisconnectBtn">Sign Out</button>
      </div>
      <p class="auth-status">Signed in with Google. Press below to authorize SDC to send this message via your Gmail account.</p>
      <button type="button" class="gsi-material-button" id="authConnectBtn" style="margin-top: 6px;">
        <div class="gsi-material-button-content-wrapper">
          <div class="gsi-material-button-icon">
            <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" style="display: block;">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
              <path fill="none" d="M0 0h48v48H0z"></path>
            </svg>
          </div>
          <span class="gsi-material-button-contents">Authorize Gmail API</span>
        </div>
      </button>
    `;

    document.getElementById("authDisconnectBtn")?.addEventListener("click", handleLogout);
    document.getElementById("authConnectBtn")?.addEventListener("click", handleLogin);

    const submitBtn = document.querySelector("#contactForm button[type='submit']");
    if (submitBtn) {
      submitBtn.textContent = "Authorize & Send";
    }
  } else {
    container.innerHTML = `
      <div class="auth-header">
        <span class="auth-title">Gmail Integration</span>
      </div>
      <p class="auth-status">Authenticate with Gmail to send the message from your own address, or submit directly using our secure server-side email system.</p>
      <button type="button" class="gsi-material-button" id="authConnectBtn" style="margin-top: 6px;">
        <div class="gsi-material-button-content-wrapper">
          <div class="gsi-material-button-icon">
            <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" style="display: block;">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
              <path fill="none" d="M0 0h48v48H0z"></path>
            </svg>
          </div>
          <span class="gsi-material-button-contents">Sign in with Google</span>
        </div>
      </button>
    `;

    document.getElementById("authConnectBtn")?.addEventListener("click", handleLogin);

    const submitBtn = document.querySelector("#contactForm button[type='submit']");
    if (submitBtn) {
      submitBtn.textContent = "Send via Server Fallback";
    }
  }
}

async function handleLogin() {
  if (!authInstance || !providerInstance) return;
  try {
    const result = await signInWithPopup(authInstance, providerInstance);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    currentAccessToken = credential?.accessToken || null;
    currentGoogleUser = result.user;
    updateAuthUI();
  } catch (error) {
    console.error("Google Sign-In failed:", error);
  }
}

async function handleLogout() {
  if (!authInstance) return;
  try {
    await signOut(authInstance);
    currentAccessToken = null;
    currentGoogleUser = null;
    updateAuthUI();
  } catch (error) {
    console.error("Sign-Out failed:", error);
  }
}

// Automatically trigger Firebase initialization on load
initFirebase();

async function initFirebase() {
  try {
    const configResponse = await window.fetch("/firebase-applet-config.json");
    if (!configResponse.ok) {
      throw new Error("Could not load firebase config JSON");
    }
    const firebaseConfig = await configResponse.json();
    const app = initializeApp(firebaseConfig);
    authInstance = getAuth(app);
    providerInstance = new GoogleAuthProvider();
    providerInstance.addScope("https://mail.google.com/");
    providerInstance.addScope("https://www.googleapis.com/auth/gmail.compose");
    providerInstance.addScope("https://www.googleapis.com/auth/gmail.send");
    
    onAuthStateChanged(authInstance, async (user) => {
      currentGoogleUser = user;
      if (!user) {
        currentAccessToken = null;
      }
      updateAuthUI();
    });
  } catch (error) {
    console.warn("Firebase Auth setup bypassed/offline:", error);
  }
}

const contactForm = document.getElementById("contactForm");
if (contactForm) {
  contactForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(contactForm);
    const name = String(formData.get("name") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const interest = String(formData.get("interest") || "").trim();
    const message = String(formData.get("message") || "").trim();
    const status = contactForm.querySelector(".form-status");

    if (!name || !email || !interest || !message) {
      if (status) {
        status.style.color = "var(--pink)";
        status.textContent = "Complete every field before launching the message.";
      }
      return;
    }

    if (status) {
      status.style.color = "var(--purple)";
      status.textContent = "Sending signal to SDC...";
    }

    // PRIMARY ROUTE: Gmail API
    if (currentGoogleUser && currentAccessToken) {
      try {
        await sendGmailMessage(currentAccessToken, { name, email, interest, message });
        if (status) {
          status.style.color = "#10b981"; // Vibrant successful green
          status.textContent = "Signal delivered! Sent directly from your personal Gmail address.";
        }
        contactForm.reset();
        return;
      } catch (gmailError) {
        console.warn("Gmail API direct sending failed, falling back to server SMTP:", gmailError);
        if (status) {
          status.style.color = "var(--purple)";
          status.textContent = "Gmail API direct delivery bypassed. Launching SMTP fallback...";
        }
      }
    } else if (currentGoogleUser && !currentAccessToken) {
      // Prompt user to authorize Gmail scopes dynamically
      try {
        await handleLogin();
        if (currentAccessToken) {
          await sendGmailMessage(currentAccessToken, { name, email, interest, message });
          if (status) {
            status.style.color = "#10b981";
            status.textContent = "Signal delivered! Sent directly from your authorized Gmail.";
          }
          contactForm.reset();
          return;
        }
      } catch (authErr) {
        console.warn("Gmail dynamic authorization bypassed, falling back to SMTP:", authErr);
      }
    }

    // SECONDARY FALLBACK: Server-side Nodemailer SMTP
    try {
      const response = await window.fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, interest, message })
      });

      const data = await response.json();
      if (response.ok && data.success) {
        if (status) {
          status.style.color = "#10b981"; 
          status.textContent = "Signal delivered! Your request was sent to SDC CIT via secure backup server.";
        }
        contactForm.reset();
      } else {
        throw new Error(data.error || "SMTP backup submission failed");
      }
    } catch (error) {
      console.warn("SMTP fallback failed, opening local mail client:", error);
      const subject = encodeURIComponent(`SDC enquiry from ${name}`);
      const body = encodeURIComponent(
        `Name: ${name}\nEmail: ${email}\nInterest: ${interest}\n\n${message}`,
      );
      if (status) {
        status.style.color = "var(--secondary)";
        status.textContent = "Opening your mail app with the message prepared...";
      }
      setTimeout(() => {
        window.location.href = `mailto:sdc@cit.edu.in?subject=${subject}&body=${body}`;
      }, 800);
    }
  });
}

let cells = [];
let cellSize = 52;

function buildGrid() {
  if (!heroGrid) return;
  heroGrid.innerHTML = "";
  cells = [];
  cellSize = window.innerWidth < 720 ? 42 : 52;
  const cols = Math.ceil(window.innerWidth / cellSize) + 2;
  const rows = Math.ceil(window.innerHeight / cellSize) + 2;
  const offsetX = (window.innerWidth % cellSize) / 2 - cellSize;
  const offsetY = (window.innerHeight % cellSize) / 2 - cellSize;

  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      const cell = document.createElement("div");
      cell.className = "flash-cell";
      cell.style.width = `${cellSize + 1}px`;
      cell.style.height = `${cellSize + 1}px`;
      cell.style.left = `${offsetX + col * cellSize}px`;
      cell.style.top = `${offsetY + row * cellSize}px`;
      heroGrid.appendChild(cell);
      cells.push({
        element: cell,
        row,
        seed: Math.random(),
        roughness: (Math.random() - 0.5) * 4,
      });
    }
  }
  updateHero();
}

function updateHero() {
  if (!landingSpacer || !cells.length) return;

  const rect = landingSpacer.getBoundingClientRect();
  const travel = Math.max(1, rect.height - window.innerHeight);
  const progress = Math.max(0, Math.min(1, -rect.top / travel));
  const visibleRows = Math.ceil(window.innerHeight / cellSize);

  if (-rect.top > rect.height) {
    heroFixed.style.display = "none";
  } else {
    heroFixed.style.display = "flex";
  }

  let incoming = 0;
  let outgoing = 0;
  if (progress < 0.38) incoming = progress / 0.38;
  else if (progress < 0.66) incoming = 1;
  else {
    incoming = 1;
    outgoing = (progress - 0.66) / 0.34;
  }

  const orbitOpacity = progress < 0.58 ? 1 - Math.max(0, (progress - 0.28) / 0.3) : 0;
  const titleOpacity =
    progress < 0.32 ? 0 : progress < 0.58 ? (progress - 0.32) / 0.26 : Math.max(0, 1 - outgoing / 0.5);

  heroOrbit.style.opacity = Math.max(0, Math.min(1, orbitOpacity)).toString();
  heroOrbit.style.transform = `scale(${1 + progress * 0.24})`;
  heroTitleWrap.style.opacity = Math.max(0, Math.min(1, titleOpacity)).toString();

  const incomingLine = visibleRows + 1 - incoming * (visibleRows + 12);
  const outgoingLine = visibleRows + 3 - outgoing * (visibleRows + 14);

  cells.forEach((cell) => {
    const enterDistance = cell.row + cell.roughness * (1 - incoming) - incomingLine;
    const exitDistance = cell.row + cell.roughness * (1 - outgoing) - outgoingLine;
    let opacity = 0;

    if (enterDistance >= 0) opacity = 0.9;
    else if (enterDistance > -4) {
      const threshold = 0.9 - (Math.abs(enterDistance) - 1) * 0.22;
      if (cell.seed < threshold) opacity = 0.75 - (Math.abs(enterDistance) - 1) * 0.15;
    }

    if (exitDistance > 4) opacity = 0;
    else if (exitDistance > 0) {
      const fade = 1 - exitDistance / 4;
      opacity = Math.min(opacity, fade);
    }

    cell.element.style.opacity = Math.max(0, Math.min(0.9, opacity)).toString();
  });
}

window.addEventListener("resize", buildGrid);
window.addEventListener("scroll", updateHero, { passive: true });
buildGrid();
