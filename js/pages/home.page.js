/**
 * ==========================================
 * HOME PAGE CONTROLLER
 * ==========================================
 */

import { requireAuth } from "../guards/auth.guard.js";
import { ROLES } from "../config/constants.js";
import { EVENTS } from "../data/events.data.js";

document.addEventListener("DOMContentLoaded", () => {
  const user = requireAuth();
  if (!user) return;

  console.log("✅ User authenticated:", user.name, "| Role:", user.role);
  console.log("✅ Events loaded:", EVENTS.length, "events");

  renderWelcome(user);
  renderLayoutByRole(user);
  initEvents();
});

/**
 * =========================
 * RENDER WELCOME
 * =========================
 */
function renderWelcome(user) {
  const title = document.getElementById("welcome-title");
  if (!title) return;

  title.textContent = `Welcome back, ${user.name || "User"}.`;
}

/**
 * =========================
 * ROLE-BASED LAYOUT
 * =========================
 */
function renderLayoutByRole(user) {
  const navMenu = document.getElementById("nav-menu");
  const adminSidebar = document.getElementById("admin-sidebar");
  const openCreateModal = document.getElementById("open-create-modal");
  const sidebarToggleBtn = document.getElementById("sidebar-toggle-btn");

  if (!navMenu) return;

  // ===== STUDENT =====
  if (user.role === ROLES.STUDENT) {
    navMenu.innerHTML = `
      <a class="text-sm font-bold text-primary" href="home.html">Home</a>
      <a class="text-sm font-medium hover:text-primary transition-colors" href="student/my-event.html">My Events</a>
      <a class="text-sm font-medium hover:text-primary transition-colors" href="student/my-journey.html">My Journey</a>
      <a class="text-sm font-medium hover:text-primary transition-colors" href="student/profile.html">Profile</a>
    `;

    adminSidebar?.classList.add("hidden");
    openCreateModal?.classList.add("hidden");
    sidebarToggleBtn?.classList.add("hidden");
    return;
  }

  // ===== ADMIN / ADVISOR / MANAGER =====
  adminSidebar?.classList.remove("hidden");
  openCreateModal?.classList.remove("hidden");
}

/**
 * =========================
 * EVENT INITIALIZATION
 * =========================
 */
function initEvents() {
  const grid = document.getElementById("events-grid");
  if (!grid) {
    console.error("❌ Element #events-grid not found");
    return;
  }

  const filterButtons = document.querySelectorAll("[data-filter]");

  function renderEvents(filter = "All") {
    grid.innerHTML = "";

    const filteredEvents =
      filter === "All"
        ? EVENTS
        : EVENTS.filter(event => event.category === filter);

    console.log(`🔍 Filter: ${filter} | Found: ${filteredEvents.length} events`);

    if (!filteredEvents.length) {
      grid.innerHTML = `
        <p class="col-span-full text-center text-gray-500">
          No events found
        </p>`;
      return;
    }

    filteredEvents.forEach(event => {
      grid.insertAdjacentHTML("beforeend", createEventCard(event));
    });
  }

  filterButtons.forEach(button => {
    button.addEventListener("click", () => {
      filterButtons.forEach(btn =>
        btn.classList.remove("bg-primary", "text-background-dark")
      );

      button.classList.add("bg-primary", "text-background-dark");
      renderEvents(button.dataset.filter);
    });
  });

  renderEvents("All");
}

/**
 * =========================
 * EVENT CARD COMPONENT
 * =========================
 */
function createEventCard(event) {
  return `
    <div class="group flex flex-col bg-white dark:bg-card-dark rounded-xl overflow-hidden border border-slate-100 dark:border-[#2a3630] hover:border-primary/50 transition-all hover:-translate-y-1 hover:shadow-glow">
      <div class="relative h-48 w-full overflow-hidden">
        <img 
          src="${event.image}" 
          alt="${event.title}" 
          class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div class="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
          <span class="text-xs font-bold text-primary uppercase">${event.status}</span>
        </div>
      </div>

      <div class="p-6 flex flex-col flex-1 gap-4">
        <div class="flex justify-between items-start gap-4">
          <h3 class="text-xl font-bold text-slate-900 dark:text-white leading-tight">${event.title}</h3>
          <div class="flex flex-col items-center justify-center bg-primary/10 rounded-lg p-2 min-w-[60px]">
            <span class="text-xs font-bold text-primary uppercase">${event.date.split(' ')[0]}</span>
            <span class="text-xl font-black text-primary">${event.date.split(' ')[1]}</span>
          </div>
        </div>

        <div class="flex flex-col gap-2 text-slate-500 dark:text-slate-400 text-sm">
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-[18px]">location_on</span>
            <span>${event.location}</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-[18px]">schedule</span>
            <span>${event.time}</span>
          </div>
        </div>

        <div class="mt-auto pt-4 flex items-center justify-between border-t border-slate-100 dark:border-[#2a3630]">
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-primary text-[20px]">stars</span>
            <span class="text-sm font-bold text-slate-900 dark:text-white">${event.points} DRL</span>
          </div>
          <a 
            href="event-detail.html?id=${event.id}" 
            class="h-10 px-5 flex items-center rounded-full bg-slate-100 dark:bg-[#2a3630] group-hover:bg-primary text-slate-900 dark:text-white group-hover:text-background-dark font-bold text-sm transition-colors"
          >
            View Detail
          </a>
        </div>
      </div>
    </div>
  `;
}