/**
 * ==========================================
 * HOME PAGE CONTROLLER
 * ==========================================
 * Features:
 * - Role-based layout
 * - Event listing with search, filter, pagination
 * ==========================================
 */
import { requireAuth } from "../guards/auth.guard.js";
import { ROLES } from "../config/constants.js";
import { EVENTS } from "../data/events.data.js";
import { Theme } from "../utils/theme.js";
import { Storage } from "../utils/storage.js";
import { setupSettingsDropdown, setupLogout, setupThemeToggle, getBasePath } from "../utils/ui-helpers.js";

const user = Storage.getCurrentUser();

if (user) {
  if (user.role === ROLES.STUDENT) {
    document.body.classList.add("role-student");
  } else {
    document.body.classList.add("role-admin");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const user = requireAuth();
  if (!user) return;
  console.log("User authenticated:", user.name, "| Role:", user.role);
  console.log("Events loaded:", EVENTS.length, "events");
  Theme.init();
  setupThemeToggle();
  setupSettingsDropdown();
  setupLogout();
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
  if (title) title.textContent = `Welcome back, ${user.name || "User"}.`;
}


/**
 * =========================
 * ROLE-BASED LAYOUT
 * =========================
 */
function renderLayoutByRole(user) {
  const adminHeader = document.getElementById("admin-header");
  const studentHeader = document.getElementById("student-header");
  const navMenu = document.getElementById("nav-menu");
  const adminSidebar = document.getElementById("admin-sidebar");
  const openCreateModal = document.getElementById("open-create-modal");
  const sidebarToggleBtn = document.getElementById("sidebar-toggle-btn");
  const adminProfileHeader = document.getElementById("admin-profile-header");
  const studentProfileHeader = document.getElementById("student-profile-header");
  if (!navMenu) return;
  // ===== STUDENT =====
  if (user.role === ROLES.STUDENT) {
    adminHeader?.classList.add("hidden");
    studentHeader?.classList.remove("hidden");
    navMenu.innerHTML = `
      <a class="text-sm font-bold text-primary" href="home.html">Home</a>
      <a class="text-sm font-medium hover:text-primary transition-colors" href="student/my-event.html">My Tickets</a>
      <a class="text-sm font-medium hover:text-primary transition-colors" href="student/my-journey.html">My Journey</a>
      <a class="text-sm font-medium hover:text-primary transition-colors" href="student/profile.html">Profile</a>
    `;
    const mainContent = document.getElementById("main-content");
    if (mainContent) mainContent.style.marginLeft = "0"; // reset margin-left
    [adminSidebar, openCreateModal, sidebarToggleBtn, adminProfileHeader].forEach(el => el?.classList.add("hidden"));
    if (studentProfileHeader) studentProfileHeader.classList.remove("hidden");

    // Update avatar check
    const avatar = document.getElementById("student-avatar-initial");
    if (avatar && user.name) {
      avatar.textContent = user.name.charAt(0).toUpperCase();
      avatar.classList.remove("hidden");
    }
    return;
  }
  // ===== ADMIN / ADVISOR / MANAGER =====
  if ([ROLES.ADMIN, ROLES.ADVISOR, ROLES.MANAGER].includes(user.role)) {
    adminHeader?.classList.remove("hidden");
    studentHeader?.classList.add("hidden");
    if (adminSidebar) adminSidebar.classList.remove("hidden"); // hiện sidebar
    if (openCreateModal) openCreateModal.classList.remove("hidden");
    if (sidebarToggleBtn) sidebarToggleBtn.classList.remove("hidden");
    if (adminProfileHeader) adminProfileHeader.classList.remove("hidden");
    if (studentProfileHeader) studentProfileHeader.classList.add("hidden");
    const mainContent = document.getElementById("main-content");
    if (mainContent) mainContent.style.marginLeft = "16rem"; // width sidebar mặc định
  }
}

/**
 * =========================
 * EVENT INITIALIZATION WITH SEARCH & PAGINATION
 * =========================
 */
function initEvents() {
  const grid = document.getElementById("events-grid");
  const searchInput = document.querySelector('input[placeholder*="Search"]');

  if (!grid) {
    console.error("Element #events-grid not found");
    return;
  }
  const filterButtons = document.querySelectorAll("[data-filter]");

  // ===== STATE =====
  let currentPage = 1;
  const eventsPerPage = 6;
  let currentFilter = "All";
  let searchQuery = "";

  /**
   * Filter events by category
   * @param {Array} events - Full events list
   * @param {string} filter - Category filter ("All" or specific category)
   * @returns {Array} Filtered events
   */
  function filterEventsByCategory(events, filter) {
    return filter === "All" ? events : events.filter(e => e.category === filter);
  }

  /**
   * Filter events by search query
   * @param {Array} events - Events list
   * @param {string} query - Search string
   * @returns {Array} Filtered events
   */
  function filterEventsBySearch(events, query) {
    if (!query) return events;
    const lowerQuery = query.toLowerCase();
    return events.filter(event =>
      event.title.toLowerCase().includes(lowerQuery) ||
      event.category.toLowerCase().includes(lowerQuery) ||
      event.location.toLowerCase().includes(lowerQuery) ||
      event.organizer.toLowerCase().includes(lowerQuery)
    );
  }

  /**
   * Paginate events
   * @param {Array} events - Filtered events
   * @param {number} page - Current page
   * @param {number} perPage - Events per page
   * @returns {Object} {events: slicedEvents, totalPages}
   */
  function paginateEvents(events, page, perPage) {
    const totalPages = Math.ceil(events.length / perPage);
    const startIndex = (page - 1) * perPage;
    return {
      events: events.slice(startIndex, startIndex + perPage),
      totalPages
    };
  }

  /**
   * Render empty state
   * @param {string} search - Search query for message
   */
  function renderEmptyState(search) {
    grid.innerHTML = `
      <div class="col-span-full flex flex-col items-center justify-center py-12">
        <span class="material-symbols-outlined text-6xl text-gray-400 mb-4">search_off</span>
        <p class="text-center text-gray-500 text-lg font-medium">
          ${search ? `No events found for "${search}"` : 'No events found'}
        </p>
        ${search ? '<p class="text-center text-gray-400 text-sm mt-2">Try different keywords or clear the search</p>' : ''}
      </div>
    `;
    renderPagination(0, currentPage);
  }

  /**
   * Render filtered/paginated events
   * @param {string} filter - Category filter
   * @param {number} page - Current page
   * @param {string} search - Search query
   */
  function renderEvents(filter = "All", page = 1, search = "") {
    currentFilter = filter;
    currentPage = page;
    searchQuery = search.toLowerCase();

    grid.innerHTML = "";

    let filteredEvents = filterEventsByCategory(EVENTS, filter);
    filteredEvents = filterEventsBySearch(filteredEvents, searchQuery);

    const { events: eventsToShow, totalPages } = paginateEvents(filteredEvents, page, eventsPerPage);

    console.log(`🔍 Filter: ${filter} | Search: "${search}" | Found: ${filteredEvents.length} events`);

    if (!eventsToShow.length) {
      renderEmptyState(search);
      return;
    }

    eventsToShow.forEach(event => {
      grid.insertAdjacentHTML("beforeend", createEventCard(event));
    });

    renderPagination(totalPages, page);
  }

  function renderPagination(totalPages, currentPage) {
    const paginationContainer = document.querySelector(".flex.items-center.justify-center.gap-2.py-8");
    if (!paginationContainer) return;
    if (totalPages <= 1) {
      paginationContainer.innerHTML = "";
      return;
    }
    let paginationHTML = `
      <button
        onclick="window.changePage(${currentPage - 1})"
        ${currentPage === 1 ? 'disabled' : ''}
        class="w-10 h-10 flex items-center justify-center rounded-lg border border-slate-200 dark:border-[#2a3630] hover:bg-primary hover:text-background-dark transition-all ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}"
      >
        <span class="material-symbols-outlined text-[20px]">chevron_left</span>
      </button>
    `;
    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - 1 && i <= currentPage + 1)
      ) {
        paginationHTML += `
          <button
            onclick="window.changePage(${i})"
            class="w-10 h-10 flex items-center justify-center rounded-lg ${i === currentPage
            ? 'bg-primary text-background-dark font-bold shadow-glow'
            : 'border border-slate-200 dark:border-[#2a3630] hover:border-primary/50 hover:text-primary transition-all font-medium text-slate-600 dark:text-slate-400'
          }"
          >
            ${i}
          </button>
        `;
      } else if (i === currentPage - 2 || i === currentPage + 2) {
        paginationHTML += `<span class="px-2 text-slate-400">...</span>`;
      }
    }
    paginationHTML += `
      <button
        onclick="window.changePage(${currentPage + 1})"
        ${currentPage === totalPages ? 'disabled' : ''}
        class="w-10 h-10 flex items-center justify-center rounded-lg border border-slate-200 dark:border-[#2a3630] hover:bg-primary hover:text-background-dark transition-all ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''}"
      >
        <span class="material-symbols-outlined text-[20px]">chevron_right</span>
      </button>
    `;
    paginationContainer.innerHTML = paginationHTML;
  }

  // Global function for pagination buttons
  window.changePage = function (page) {
    // Recalculate based on current filter and search
    let filteredEvents = filterEventsByCategory(EVENTS, currentFilter);
    filteredEvents = filterEventsBySearch(filteredEvents, searchQuery);

    const totalPages = Math.ceil(filteredEvents.length / eventsPerPage);
    if (page < 1 || page > totalPages) return;

    renderEvents(currentFilter, page, searchInput?.value || "");
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Search input handler
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      renderEvents(currentFilter, 1, e.target.value); // Reset to page 1 on search
    });
  }
  // Filter button handlers
  filterButtons.forEach(button => {
    button.addEventListener("click", () => {
      filterButtons.forEach(btn =>
        btn.classList.remove("bg-primary", "text-background-dark")
      );
      button.classList.add("bg-primary", "text-background-dark");
      renderEvents(button.dataset.filter, 1, searchInput?.value || ""); // Reset to page 1
    });
  });
  // Initial render
  renderEvents("All", 1, "");
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
          src="${getBasePath()}${event.image}"
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
          
          <a 
            href="event-detail.html?id=${event.id}" 
            class="ml-auto h-10 px-5 flex items-center rounded-full bg-slate-100 dark:bg-[#2a3630] group-hover:bg-primary text-slate-900 dark:text-white group-hover:text-background-dark font-bold text-sm transition-colors"
          >
            View Detail
          </a>
        </div>
      </div>
    </div>
  `;
}