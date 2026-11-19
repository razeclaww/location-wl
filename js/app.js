const PIN_HASH = "c3574b9db63ba8ec6762cf68917051aa9fae4fe4c1e312a4497807509ded1e89";
const STORAGE_KEY = "wl_saved_riders_v1";
const HISTORY_KEY = "wl_dispatch_history_v1";

window.addEventListener("DOMContentLoaded", () => {
  setupPhoneInput();
  renderSavedRiders();
  renderHistory();

  if (sessionStorage.getItem("wl_csr_unlocked") === "1") {
    document.getElementById("pinCard").classList.add("hidden");
    document.getElementById("portalContainer").classList.remove("hidden");
  }
});

async function hashInput(str) {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function verifyPin() {
  const entered = document.getElementById("pinInput").value.trim();
  const errorBox = document.getElementById("pinError");

  if (!entered) return;

  const enteredHash = await hashInput(entered);

  if (enteredHash === PIN_HASH) {
    sessionStorage.setItem("wl_csr_unlocked", "1");
    errorBox.classList.add("hidden");
    document.getElementById("pinCard").classList.add("hidden");
    document.getElementById("portalContainer").classList.remove("hidden");
  } else {
    errorBox.classList.remove("hidden");
    document.getElementById("pinInput").select();
  }
}

function setupPhoneInput() {
  const phoneInput = document.getElementById("riderPhoneInput");
  if (!phoneInput) return;

  const lockPrefix = () => {
    let val = phoneInput.value;
    if (!val.startsWith("+977")) {
      val = "+977" + val.replace(/^\+?9?7?7?/, "");
    }
    const cleanRest = val.slice(4).replace(/\D/g, "").slice(0, 10);
    phoneInput.value = "+977" + cleanRest;
  };

  phoneInput.addEventListener("keydown", (e) => {
    if (e.key === "Backspace" || e.key === "Delete") {
      if (phoneInput.selectionStart < 4 || (phoneInput.selectionStart === 4 && phoneInput.selectionEnd === 4 && e.key === "Backspace")) {
        e.preventDefault();
      }
    }
  });

  phoneInput.addEventListener("input", lockPrefix);
  phoneInput.addEventListener("paste", () => setTimeout(lockPrefix, 10));
}

function getLocationTargetUrl() {
  const url = new URL("location.html", window.location.href);
  url.search = "";
  url.hash = "";
  return url.toString();
}

function makeLink() {
  const nameInput = document.getElementById("riderNameInput");
  const phoneInput = document.getElementById("riderPhoneInput");
  const detailsInput = document.getElementById("orderDetailsInput");
  const errorBox = document.getElementById("formError");

  const name = nameInput.value.trim();
  const rawPhone = phoneInput.value.trim();
  const details = detailsInput ? detailsInput.value.trim() : "";
  const cleanPhone = rawPhone.replace(/[^0-9]/g, "");

  errorBox.classList.add("hidden");

  if (!name) {
    showFormError("Please enter the rider's name.");
    nameInput.focus();
    return;
  }

  if (cleanPhone.length < 10) {
    showFormError("Please enter a valid 10-digit mobile number after +977.");
    phoneInput.focus();
    return;
  }

  const formattedPhone = "+977" + cleanPhone.replace(/^977/, "");
  saveRider(name, formattedPhone);

  const targetUrl = new URL(getLocationTargetUrl());
  targetUrl.searchParams.set("r", name);
  targetUrl.searchParams.set("p", cleanPhone);
  if (details) {
    targetUrl.searchParams.set("order", details);
  }

  const finalUrl = targetUrl.toString();

  document.getElementById("resRiderName").textContent = name;
  document.getElementById("resRiderPhone").textContent = formattedPhone;
  const detailsRow = document.getElementById("resDetailsRow");
  if (details) {
    document.getElementById("resDetailsVal").textContent = details;
    detailsRow.classList.remove("hidden");
  } else {
    detailsRow.classList.add("hidden");
  }

  document.getElementById("generatedUrl").textContent = finalUrl;
  document.getElementById("copyBtn").textContent = "Copy Link";

  const testBtn = document.getElementById("testLinkBtn");
  if (testBtn) {
    testBtn.href = finalUrl;
  }

  const resultPanel = document.getElementById("resultPanel");
  resultPanel.classList.remove("hidden");

  addHistoryEntry({
    riderName: name,
    riderPhone: formattedPhone,
    details: details,
    url: finalUrl,
    timestamp: new Date().toISOString()
  });
}

function createNewLink() {
  document.getElementById("resultPanel").classList.add("hidden");
  document.getElementById("generatedUrl").textContent = "";
  document.getElementById("formError").classList.add("hidden");
  document.getElementById("riderNameInput").value = "";
  document.getElementById("riderPhoneInput").value = "+977";
  if (document.getElementById("orderDetailsInput")) {
    document.getElementById("orderDetailsInput").value = "";
  }
  document.getElementById("riderNameInput").focus();
}

function showFormError(msg) {
  const errorBox = document.getElementById("formError");
  errorBox.textContent = msg;
  errorBox.classList.remove("hidden");
}

function copyGeneratedLink() {
  const text = document.getElementById("generatedUrl").textContent;
  if (!text) return;

  navigator.clipboard.writeText(text).then(() => {
    const btn = document.getElementById("copyBtn");
    btn.textContent = "Copied!";
    setTimeout(() => {
      btn.textContent = "Copy Link";
    }, 2000);
  });
}

function getSavedRiders() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function saveRider(name, phone) {
  let list = getSavedRiders();
  list = list.filter((item) => item.phone !== phone);
  list.unshift({ name, phone });
  if (list.length > 8) list.pop();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  renderSavedRiders();
}

function deleteRider(e, phone) {
  e.stopPropagation();
  const list = getSavedRiders().filter((item) => item.phone !== phone);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  renderSavedRiders();
}

function selectRider(rider) {
  document.getElementById("riderNameInput").value = rider.name;
  const phone = rider.phone.startsWith("+977") ? rider.phone : "+977" + rider.phone.replace(/^\+?977?/, "");
  document.getElementById("riderPhoneInput").value = phone;
  document.getElementById("formError").classList.add("hidden");
}

function renderSavedRiders() {
  const list = getSavedRiders();
  const wrap = document.getElementById("savedRidersWrap");
  const container = document.getElementById("riderPills");

  if (!list.length) {
    wrap.classList.add("hidden");
    return;
  }

  wrap.classList.remove("hidden");
  container.innerHTML = "";

  list.forEach((r) => {
    const pill = document.createElement("div");
    pill.className = "pill";
    pill.innerHTML = `
      <span>${escapeHtml(r.name)}</span>
      <span class="pill-phone">${escapeHtml(r.phone)}</span>
      <span class="del" title="Remove">&times;</span>
    `;
    pill.onclick = () => selectRider(r);
    pill.querySelector(".del").onclick = (e) => deleteRider(e, r.phone);
    container.appendChild(pill);
  });
}

function getHistory() {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];
  } catch {
    return [];
  }
}

function addHistoryEntry(entry) {
  let list = getHistory();
  list.unshift(entry);
  if (list.length > 30) list.pop();
  localStorage.setItem(HISTORY_KEY, JSON.stringify(list));
  renderHistory();
}

function clearHistory() {
  if (confirm("Clear all dispatch history?")) {
    localStorage.removeItem(HISTORY_KEY);
    renderHistory();
  }
}

function formatTimestamp12hr(isoString) {
  const date = new Date(isoString);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const month = months[date.getMonth()];
  const day = date.getDate();

  let hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12;

  return `${month} ${day}, ${hours}:${minutes} ${ampm}`;
}

function renderHistory() {
  const list = getHistory();
  const container = document.getElementById("historyList");
  const countBadge = document.getElementById("historyCount");

  countBadge.textContent = list.length;

  if (!list.length) {
    container.innerHTML = '<div class="empty-history">No dispatches yet. Generated links will appear here.</div>';
    return;
  }

  container.innerHTML = "";

  list.forEach((item, index) => {
    const card = document.createElement("div");
    card.className = "history-card";
    const timeFormatted = formatTimestamp12hr(item.timestamp);

    card.innerHTML = `
      <div class="history-top">
        <span class="hist-name">${escapeHtml(item.riderName)}</span>
        <span class="hist-time">${timeFormatted}</span>
      </div>
      <div class="hist-phone">${escapeHtml(item.riderPhone)}</div>
      ${item.details ? `<div class="hist-detail">${escapeHtml(item.details)}</div>` : ""}
      <div class="hist-actions">
        <button class="btn-hist-copy" id="histCopy-${index}">Copy Link</button>
      </div>
    `;

    card.querySelector(`#histCopy-${index}`).onclick = (e) => {
      e.stopPropagation();
      navigator.clipboard.writeText(item.url).then(() => {
        const btn = card.querySelector(`#histCopy-${index}`);
        btn.textContent = "Copied!";
        setTimeout(() => {
          btn.textContent = "Copy Link";
        }, 1500);
      });
    };

    container.appendChild(card);
  });
}

function escapeHtml(str) {
  return str.replace(/[&<>'"]/g, (tag) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "'": "&#39;",
    '"': "&quot;",
  }[tag] || tag));
}
