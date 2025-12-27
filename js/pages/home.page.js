/**
 * ==========================================
 * HOME PAGE CONTROLLER
 * ==========================================
 */

import { requireAuth } from "../guards/auth.guard.js";
import { ROLES } from "../config/constants.js";
import { EVENTS } from "../data/events.data.js";
import { Theme } from "../utils/theme.js";
import { Storage } from "../utils/storage.js";  // Import Storage để clear session

document.addEventListener("DOMContentLoaded", () => {
  const user = requireAuth();
  if (!user) return;

  console.log("User authenticated:", user.name, "| Role:", user.role);
  console.log("Events loaded:", EVENTS.length, "events");

  Theme.init();
  setupThemeToggle();

  renderWelcome(user);
  renderLayoutByRole(user);
  initEvents();
  setupSettingsDropdown();  // Thêm để xử lý toggle dropdown
  setupLogout();  // Thêm để xử lý logout
});

/**
 * =========================
 * SETUP SETTINGS DROPDOWN (Toggle with animation)
 * =========================
 */
function setupSettingsDropdown() {
  const settingsBtn = document.getElementById("settings-btn");
  const dropdown = document.getElementById("settings-dropdown");

  if (!settingsBtn || !dropdown) return;

  settingsBtn.addEventListener("click", (e) => {
    e.stopPropagation();  // Ngăn click lan ra ngoài
    const isVisible = dropdown.style.display === "block";
    dropdown.style.display = isVisible ? "none" : "block";
    dropdown.style.opacity = isVisible ? "0" : "1";  // Animation fade
  });

  // Đóng dropdown khi click ngoài
  document.addEventListener("click", (e) => {
    if (!settingsBtn.contains(e.target) && !dropdown.contains(e.target)) {
      dropdown.style.display = "none";
      dropdown.style.opacity = "0";
    }
  });
}

/**
 * =========================
 * SETUP LOGOUT
 * =========================
 */
function setupLogout() {
  const logoutBtn = document.getElementById("logout-btn");

  if (!logoutBtn) return;

  logoutBtn.addEventListener("click", () => {
    if (confirm("Are you sure you want to logout?")) {
      Storage.clearSession();  // Xóa session từ localStorage
      window.location.href = "login.html";  // Redirect về login
    }
  });
}

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
 *  THEME TOGGLE
 * =========================
 */
function setupThemeToggle() {
  const themeButtons = document.querySelectorAll('button:has(.theme-toggle-icon)');
  
  themeButtons.forEach(button => {
    // Update icon on page load
    const icon = button.querySelector('.material-symbols-outlined');
    if (icon && !icon.classList.contains('theme-toggle-icon')) {
      icon.classList.add('theme-toggle-icon');
    }
    
    button.addEventListener("click", () => {
      const newTheme = Theme.toggleTheme();
      Theme.updateIcon(newTheme);
    });
  });
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
  const adminProfileHeader = document.getElementById("admin-profile-header");
  const studentProfileHeader = document.getElementById("student-profile-header");

  if (!navMenu) return;

  // ===== STUDENT =====
  if (user.role === ROLES.STUDENT) {
    navMenu.innerHTML = `
      <a class="text-sm font-bold text-primary" href="home.html">Home</a>
      <a class="text-sm font-medium hover:text-primary transition-colors" href="student/my-event.html">My Tickets</a>
      <a class="text-sm font-medium hover:text-primary transition-colors" href="student/my-journey.html">My Journey</a>
      <a class="text-sm font-medium hover:text-primary transition-colors" href="student/profile.html">Profile</a>
    `;
    const mainContent = document.getElementById("main-content");
    mainContent.style.marginLeft = "0"; // reset margin-left

    [adminSidebar, openCreateModal, sidebarToggleBtn, adminProfileHeader].forEach(el => el?.classList.add("hidden"));
    studentProfileHeader?.classList.remove("hidden");

    if (user.name) {
      studentProfileHeader.innerHTML = `
      <div class="size-10 rounded-full bg-primary text-background-dark flex items-center justify-center font-black">
        ${user.name.charAt(0).toUpperCase()}
      </div>
    `;
    }
    return;
  }

  // ===== ADMIN / ADVISOR / MANAGER =====
  if ([ROLES.ADMIN, ROLES.ADVISOR, ROLES.MANAGER].includes(user.role)) {
    adminSidebar?.classList.remove("hidden");  // hiện sidebar
    openCreateModal?.classList.remove("hidden");
    sidebarToggleBtn?.classList.remove("hidden");
    adminProfileHeader?.classList.remove("hidden");
    studentProfileHeader?.classList.add("hidden");

    // Reset margin-left main-content cho admin/advisor/manager
    const mainContent = document.getElementById("main-content");
    mainContent.style.marginLeft = "16rem"; // width sidebar mặc định
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

  function renderEvents(filter = "All", page = 1, search = "") {
    currentFilter = filter;
    currentPage = page;
    searchQuery = search.toLowerCase();
    
    grid.innerHTML = "";

    // Filter by category
    let filteredEvents =
      filter === "All"
        ? EVENTS
        : EVENTS.filter(event => event.category === filter);

    // Filter by search query
    if (searchQuery) {
      filteredEvents = filteredEvents.filter(event =>
        event.title.toLowerCase().includes(searchQuery) ||
        event.category.toLowerCase().includes(searchQuery) ||
        event.location.toLowerCase().includes(searchQuery) ||
        event.organizer.toLowerCase().includes(searchQuery)
      );
    }

    console.log(`🔍 Filter: ${filter} | Search: "${search}" | Found: ${filteredEvents.length} events`);

    // Calculate pagination
    const totalPages = Math.ceil(filteredEvents.length / eventsPerPage);
    const startIndex = (page - 1) * eventsPerPage;
    const endIndex = startIndex + eventsPerPage;
    const eventsToShow = filteredEvents.slice(startIndex, endIndex);

    // Render events
    if (!eventsToShow.length) {
      grid.innerHTML = `
        <div class="col-span-full flex flex-col items-center justify-center py-12">
          <span class="material-symbols-outlined text-6xl text-gray-400 mb-4">search_off</span>
          <p class="text-center text-gray-500 text-lg font-medium">
            ${searchQuery ? `No events found for "${search}"` : 'No events found'}
          </p>
          ${searchQuery ? '<p class="text-center text-gray-400 text-sm mt-2">Try different keywords or clear the search</p>' : ''}
        </div>`;
      renderPagination(0, page);
      return;
    }

    eventsToShow.forEach(event => {
      grid.insertAdjacentHTML("beforeend", createEventCard(event));
    });

    // Render pagination controls
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
            class="w-10 h-10 flex items-center justify-center rounded-lg ${
              i === currentPage
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
  window.changePage = function(page) {
    // Recalculate based on current filter and search
    let filteredEvents = currentFilter === "All" 
      ? EVENTS 
      : EVENTS.filter(e => e.category === currentFilter);
    
    if (searchQuery) {
      filteredEvents = filteredEvents.filter(event =>
        event.title.toLowerCase().includes(searchQuery) ||
        event.category.toLowerCase().includes(searchQuery) ||
        event.location.toLowerCase().includes(searchQuery) ||
        event.organizer.toLowerCase().includes(searchQuery)
      );
    }
    
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