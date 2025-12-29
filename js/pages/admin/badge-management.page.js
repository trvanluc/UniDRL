import { BadgeService } from "../../services/badge.service.js";
import { setupThemeToggle, setupSettingsDropdown, setupLogout } from "../../utils/ui-helpers.js";
import { Theme } from "../../utils/theme.js";
import { openModal, closeModal, setupModalListeners } from "../../components/modal/modal-manager.component.js";

// MAIN INITIALIZATION
document.addEventListener("DOMContentLoaded", () => {
  Theme.init();
  setupThemeToggle();
  setupSettingsDropdown();
  setupLogout();

  renderEvents();
  bindEvents();
  initSearchAndFilter();
  initSearchAndFilter();
  // Header icons init handled above via ui-helpers
  setupModalListeners("badgeConfigModal", "btn-close-modal", "modal-overlay"); // Setup modal listeners
});

// RENDER EVENTS (CÓ ẢNH, FILTER)
function renderEvents(filteredList = null) {
  const events = filteredList || BadgeService.getAll();
  const grid = document.getElementById("events-grid");
  if (grid) grid.innerHTML = "";

  if (!events.length) {
    if (grid) grid.innerHTML = `<div class="col-span-full text-center text-gray-400 py-10">No events found</div>`;
    return;
  }

  events.forEach((evt) => {
    const qaCount = evt.badgeConfig?.qa_pairs?.length || 0;
    const status = evt.badgeConfig?.isClaimable ? "open" : "closed";
    const statusText = evt.badgeConfig?.isClaimable ? "Claiming Open" : "Claiming Closed";
    const statusColor = status === "open"
      ? "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400"
      : "bg-gray-100 text-gray-500 dark:bg-white/5 dark:text-gray-400";

    const imageSection = evt.image ? `
      <div class="relative h-40 w-full overflow-hidden rounded-2xl mb-4">
        <img src="${evt.image}" alt="${evt.title}" 
          class="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105">
        <div class="absolute inset-0 bg-black/20"></div>
        <div class="absolute top-3 left-3 ${statusColor} text-xs font-bold px-3 py-1 rounded-full backdrop-blur-sm border border-white/10">${statusText}</div>
      </div>` : "";

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

    if (grid) grid.insertAdjacentHTML("beforeend", card);
  });

  document.querySelectorAll(".btn-config").forEach((btn) => {
    btn.addEventListener("click", (e) => openConfigModal(e.target.dataset.id));
  });
}

// MODAL LOGIC (CONFIGURE BADGE)
function openConfigModal(eventId) {
  const evt = BadgeService.getById(eventId);
  if (!evt) return;

  openModal("badgeConfigModal");

  const titleEl = document.getElementById("modal-event-title");
  if (titleEl) titleEl.textContent = evt.title;

  const editingIdEl = document.getElementById("current-editing-event-id");
  if (editingIdEl) editingIdEl.value = evt.id;

  const claimableEl = document.getElementById("config-isClaimable");
  if (claimableEl) claimableEl.checked = evt.badgeConfig.isClaimable;

  const bronzeEl = document.getElementById("rule-bronze");
  if (bronzeEl) bronzeEl.value = evt.badgeConfig.rules.bronze;

  const silverEl = document.getElementById("rule-silver");
  if (silverEl) silverEl.value = evt.badgeConfig.rules.silver;

  const goldEl = document.getElementById("rule-gold");
  if (goldEl) goldEl.value = evt.badgeConfig.rules.gold;

  const container = document.getElementById("questions-list");
  if (container) container.innerHTML = "";
  evt.badgeConfig.qa_pairs.forEach((q) => addQuestionField(q.q, q.a));
  updateQuestionCount();
}

// Add Question Field
function addQuestionField(q = "", a = "") {
  const container = document.getElementById("questions-list");
  if (!container) return;

  const el = document.createElement("div");
  el.className = "qa-item bg-gray-50 dark:bg-black/20 p-4 rounded-xl border border-gray-200 dark:border-white/10 mb-3";
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

// Update Question Count
function updateQuestionCount() {
  const count = document.querySelectorAll(".qa-item").length;
  const countEl = document.getElementById("current-q-count");
  if (countEl) countEl.textContent = `${count} Items`;
}

// Save Configuration
function saveConfiguration() {
  const idEl = document.getElementById("current-editing-event-id");
  const id = idEl ? idEl.value : null;

  const claimableEl = document.getElementById("config-isClaimable");
  const bronzeEl = document.getElementById("rule-bronze");
  const silverEl = document.getElementById("rule-silver");
  const goldEl = document.getElementById("rule-gold");

  const config = {
    isClaimable: claimableEl ? claimableEl.checked : false,
    rules: {
      bronze: bronzeEl ? +bronzeEl.value || 0 : 0,
      silver: silverEl ? +silverEl.value || 0 : 0,
      gold: goldEl ? +goldEl.value || 0 : 0,
    },
    qa_pairs: Array.from(document.querySelectorAll(".qa-item")).map((el) => ({
      q: el.querySelector(".input-q").value.trim(),
      a: el.querySelector(".input-a").value.trim(),
    })),
  };

  BadgeService.updateBadge(id, config);
  closeModal("badgeConfigModal");
  renderEvents();
}

// Bind Events
function bindEvents() {
  const resetBtn = document.getElementById("btn-reset-data");
  resetBtn?.addEventListener("click", () => {
    if (confirm("Reset all badge data?")) {
      BadgeService.reset();
      renderEvents();
    }
  });

  const addQuestionBtn = document.getElementById("btn-add-question");
  addQuestionBtn?.addEventListener("click", addQuestionField);

  const saveConfigBtn = document.getElementById("btn-save-config");
  saveConfigBtn?.addEventListener("click", saveConfiguration);
}

// Init Search And Filter
function initSearchAndFilter() {
  const searchInput = document.getElementById("search-input");
  const statusFilter = document.getElementById("status-filter");

  if (!searchInput || !statusFilter) return;

  searchInput.addEventListener("input", applySearchAndFilter);
  statusFilter.addEventListener("change", applySearchAndFilter);
}

// Apply Search And Filter
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

// Header initialization handled by ui-helpers.js