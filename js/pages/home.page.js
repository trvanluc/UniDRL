import { requireAuth } from "../guards/auth.guard.js";
import { ROLES } from "../config/constants.js";
import { EVENTS } from "../data/events.data.js";

/**
 * =========================
 * HOME PAGE CONTROLLER
 * =========================
 */

document.addEventListener("DOMContentLoaded", () => {
  const user = requireAuth();
  if (!user) return;

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
      <a class="text-sm font-medium hover:text-primary" href="student/my-event.html">My Events</a>
      <a class="text-sm font-medium hover:text-primary" href="student/my-journey.html">My Journey</a>
      <a class="text-sm font-medium hover:text-primary" href="student/profile.html">Profile</a>
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
  if (!grid) return; // defensive check

  const filterButtons = document.querySelectorAll("[data-filter]");

  function renderEvents(filter = "All") {
    grid.innerHTML = "";

    const filteredEvents =
      filter === "All"
        ? EVENTS
        : EVENTS.filter(event => event.category === filter);

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
    <div class="group flex flex-col bg-white dark:bg-card-dark rounded-xl overflow-hidden border hover:border-primary/50 transition-all">
      <div class="h-48 overflow-hidden">
        <img 
          src="${event.image}" 
          alt="${event.title}" 
          class="w-full h-full object-cover"
        />
      </div>

      <div class="p-6 flex flex-col gap-4 flex-1">
        <h3 class="text-xl font-bold">${event.title}</h3>

        <div class="text-sm text-slate-500">
          <div>${event.date}</div>
          <div>${event.time}</div>
        </div>

        <div class="mt-auto flex justify-between items-center pt-4 border-t">
          <span class="font-bold">${event.points} DRL</span>
          <a 
            href="event-detail.html?id=${event.id}" 
            class="h-10 px-5 rounded-full bg-primary text-black font-bold flex items-center"
          >
            View Detail
          </a>
        </div>
      </div>
    </div>
  `;
}
