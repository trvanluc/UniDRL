// js/pages/badge-management.page.js
import { BadgeService } from "../services/badge.service.js";




// ============================
// MAIN INITIALIZATION
// ============================
document.addEventListener("DOMContentLoaded", () => {
  // Khởi tạo giao diện
  renderEvents();
  bindEvents();
  initSearchAndFilter();
  initHeaderIcons();
});

// ============================
// RENDER EVENTS (CÓ ẢNH, FILTER)
// ============================
function renderEvents(filteredList = null) {
  const events = filteredList || BadgeService.getAll();
  const grid = document.getElementById("events-grid");
  grid.innerHTML = "";

  if (!events.length) {
    grid.innerHTML = `<div class="col-span-full text-center text-gray-400 py-10">No events found</div>`;
    return;
  }

  events.forEach((evt) => {
    const qaCount = evt.badgeConfig?.qa_pairs?.length || 0;
    const status = evt.badgeConfig?.isClaimable ? "open" : "closed";
    const statusText = evt.badgeConfig?.isClaimable ? "Claiming Open" : "Claiming Closed";
    const statusColor =
      status === "open"
        ? "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400"
        : "bg-gray-100 text-gray-500 dark:bg-white/5 dark:text-gray-400";

    const imageSection = evt.image
      ? `
      <div class="relative h-40 w-full overflow-hidden rounded-2xl mb-4">
        <img src="${evt.image}" alt="${evt.title}" 
          class="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105">
        <div class="absolute inset-0 bg-black/20"></div>
        <div class="absolute top-3 left-3 ${statusColor} text-xs font-bold px-3 py-1 rounded-full backdrop-blur-sm border border-white/10">${statusText}</div>
      </div>`
      : "";

    const card = `
      <div class="bg-surface-light dark:bg-surface-dark rounded-3xl border border-border-light dark:border-border-dark shadow-sm hover:shadow-md transition-all group flex flex-col h-full relative overflow-hidden p-5">
        ${imageSection}
        <h3 class="text-xl font-bold mb-2">${evt.title}</h3>
        <p class="text-sm text-gray-400 mb-3">${evt.date || ""}</p>
        <p class="text-sm mb-4">${qaCount} Questions Configured</p>
        <button data-id="${evt.id}" class="btn-config w-full py-2 rounded-xl bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 font-bold">
          Configure
        </button>
      </div>`;

    grid.insertAdjacentHTML("beforeend", card);
  });

  // Gắn sự kiện mở modal
  document.querySelectorAll(".btn-config").forEach((btn) => {
    btn.addEventListener("click", (e) => openConfigModal(e.target.dataset.id));
  });
}

// ============================
// MODAL LOGIC (CONFIGURE BADGE)
// ============================
function openConfigModal(eventId) {
  const evt = BadgeService.getById(eventId);
  if (!evt) return;

  const modal = document.getElementById("badgeConfigModal");
  modal.classList.remove("hidden");

  document.getElementById("modal-event-title").textContent = evt.title;
  document.getElementById("current-editing-event-id").value = evt.id;
  document.getElementById("config-isClaimable").checked = evt.badgeConfig.isClaimable;
  document.getElementById("rule-bronze").value = evt.badgeConfig.rules.bronze;
  document.getElementById("rule-silver").value = evt.badgeConfig.rules.silver;
  document.getElementById("rule-gold").value = evt.badgeConfig.rules.gold;

  const container = document.getElementById("questions-list");
  container.innerHTML = "";
  evt.badgeConfig.qa_pairs.forEach((q) => addQuestionField(q.q, q.a));
  updateQuestionCount();
}

function closeModal() {
  document.getElementById("badgeConfigModal").classList.add("hidden");
}

function addQuestionField(q = "", a = "") {
  const container = document.getElementById("questions-list");
  const el = document.createElement("div");
  el.className =
    "qa-item bg-gray-50 dark:bg-black/20 p-4 rounded-xl border border-gray-200 dark:border-white/10 mb-3";
  el.innerHTML = `
    <input type="text" value="${q}" class="input-q w-full mb-2 rounded-lg p-2 text-sm bg-white dark:bg-surface-dark border dark:border-white/10" placeholder="Question...">
    <input type="text" value="${a}" class="input-a w-full rounded-lg p-2 text-sm bg-green-50/50 dark:bg-green-900/10 border dark:border-green-900/30" placeholder="Answer...">
    <button class="mt-2 text-xs text-red-400 hover:text-red-600 remove-question">Remove</button>
  `;

  container.appendChild(el);

  el.querySelector(".remove-question").addEventListener("click", () => {
    el.remove();
    updateQuestionCount();
  });

  updateQuestionCount();
}

function updateQuestionCount() {
  const count = document.querySelectorAll(".qa-item").length;
  document.getElementById("current-q-count").textContent = `${count} Items`;
}

function saveConfiguration() {
  const id = document.getElementById("current-editing-event-id").value;
  const config = {
    isClaimable: document.getElementById("config-isClaimable").checked,
    rules: {
      bronze: +document.getElementById("rule-bronze").value || 0,
      silver: +document.getElementById("rule-silver").value || 0,
      gold: +document.getElementById("rule-gold").value || 0,
    },
    qa_pairs: Array.from(document.querySelectorAll(".qa-item")).map((el) => ({
      q: el.querySelector(".input-q").value.trim(),
      a: el.querySelector(".input-a").value.trim(),
    })),
  };

  BadgeService.updateBadge(id, config);
  closeModal();
  renderEvents();
}

function bindEvents() {
  document.getElementById("btn-reset-data")?.addEventListener("click", () => {
    if (confirm("Reset all badge data?")) {
      BadgeService.reset();
      renderEvents();
    }
  });

  document.getElementById("btn-close-modal")?.addEventListener("click", closeModal);
  document.getElementById("modal-overlay")?.addEventListener("click", closeModal);
  document.getElementById("btn-add-question")?.addEventListener("click", addQuestionField);
  document.getElementById("btn-save-config")?.addEventListener("click", saveConfiguration);
}

// ============================
// SEARCH & FILTER
// ============================
function initSearchAndFilter() {
  const searchInput = document.getElementById("search-input");
  const statusFilter = document.getElementById("status-filter");

  if (!searchInput || !statusFilter) return;

  searchInput.addEventListener("input", applySearchAndFilter);
  statusFilter.addEventListener("change", applySearchAndFilter);
}

function applySearchAndFilter() {
  const searchText = document.getElementById("search-input").value.toLowerCase().trim();
  const statusValue = document.getElementById("status-filter").value;

  let events = BadgeService.getAll();

  if (searchText) {
    events = events.filter(
      (e) =>
        e.title.toLowerCase().includes(searchText) ||
        (e.description && e.description.toLowerCase().includes(searchText))
    );
  }

  if (statusValue === "Claiming Open") {
    events = events.filter((e) => e.badgeConfig?.isClaimable === true);
  } else if (statusValue === "Claiming Closed") {
    events = events.filter((e) => e.badgeConfig?.isClaimable === false);
  }

  renderEvents(events);
}

// ============================
// HEADER ICON LOGIC (THEME, SETTINGS, LOGOUT)
// ============================
function initHeaderIcons() {
  const themeBtn = document.querySelector('[title="Theme"]');
  const settingsBtn = document.querySelector('[title="Settings"]');
  const logoutBtn = document.querySelector('[title="Notifications"]');

  if (themeBtn) {
    themeBtn.addEventListener("click", () => {
      const html = document.documentElement;
      const isDark = html.classList.toggle("dark");
      localStorage.setItem("vnuk_theme", isDark ? "dark" : "light");
    });

    const savedTheme = localStorage.getItem("vnuk_theme");
    if (savedTheme === "dark") document.documentElement.classList.add("dark");
  }

  if (settingsBtn) {
    settingsBtn.addEventListener("click", () => {
      window.location.href = "../student/profile.html";
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      if (confirm("Are you sure you want to logout?")) {
        localStorage.removeItem("currentUser");
        window.location.href = "../login.html";
      }
    });
  }
}
