/**
 * ==========================================
 * EVENT DETAIL PAGE CONTROLLER
 * ==========================================
 * Compatible with existing HTML structure
 * - Uses localStorage "currentUser" key
 * - Works with 2-tab structure from old code
 * - Role-based rendering (Student vs Admin)
 * ==========================================
 */

import { EVENTS } from "../data/events.data.js";

/**
 * =========================
 * MAIN INITIALIZATION
 * =========================
 */
document.addEventListener("DOMContentLoaded", () => {
  // 1. Check authentication using OLD key
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const role = currentUser ? currentUser.role : null;

  console.log("✅ Current user:", currentUser);
  console.log("✅ Role:", role);

  if (!role) {
    alert("Please login first");
    window.location.href = "login.html";
    return;
  }

  // 2. Get event ID from URL
  const params = new URLSearchParams(window.location.search);
  const eventId = params.get("id");

  if (!eventId) {
    console.error("❌ Event ID not found in URL");
    alert("Event ID not found");
    window.location.href = "home.html";
    return;
  }

  // 3. Find event in data
  const event = EVENTS.find(e => e.id === eventId);

  if (!event) {
    console.error("❌ Event not found:", eventId);
    alert("Event not found");
    window.location.href = "home.html";
    return;
  }

  console.log("✅ Event loaded:", event.title);

  // 4. Render everything
  renderNavigation(role);
  renderEventInfo(event);
  renderTabContent(role, event, currentUser);
  renderEventActions(role, event);
  setupSidebarToggle();
});

/**
 * =========================
 * RENDER NAVIGATION
 * =========================
 */
function renderNavigation(role) {
  const navMenu = document.getElementById("nav-menu");
  const adminSidebar = document.getElementById("admin-sidebar");
  const sidebarToggleBtn = document.getElementById("sidebar-toggle-btn");

  if (role === "student") {
    // Student Navigation
    if (navMenu) {
      navMenu.classList.remove("hidden");
      navMenu.innerHTML = `
        <a class="text-sm font-medium hover:text-primary transition-colors" href="home.html">Home</a>
        <a class="text-sm font-medium hover:text-primary transition-colors" href="student/my-event.html">My Events</a>
        <a class="text-sm font-medium hover:text-primary transition-colors" href="student/my-journey.html">My Journey</a>
        <a class="text-sm font-medium hover:text-primary transition-colors" href="student/profile.html">Profile</a>
      `;
    }
    
    if (adminSidebar) adminSidebar.classList.add("hidden");
    if (sidebarToggleBtn) sidebarToggleBtn.classList.add("hidden");
    
  } else {
    // Admin Navigation
    if (navMenu) navMenu.classList.add("hidden");
    if (adminSidebar) adminSidebar.classList.remove("hidden");
    if (sidebarToggleBtn) sidebarToggleBtn.classList.remove("hidden");
  }
}

/**
 * =========================
 * RENDER EVENT INFO
 * (Tab 1: General Overview)
 * =========================
 */
function renderEventInfo(event) {
  // Event Name/Title
  const nameEl = document.getElementById("event-name");
  if (nameEl) nameEl.textContent = event.title;

  // Description
  const descEl = document.getElementById("event-description");
  if (descEl) descEl.innerHTML = event.description;

  // Date & Time
  const dateEl = document.getElementById("event-date");
  const timeEl = document.getElementById("event-time");
  if (dateEl) dateEl.textContent = event.date;
  if (timeEl) timeEl.textContent = event.time;

  // Category
  const categoryEl = document.getElementById("event-category");
  if (categoryEl) categoryEl.textContent = event.category;

  const bannerCategoryEl = document.getElementById("banner-category");
  if (bannerCategoryEl) bannerCategoryEl.textContent = event.category;

  // Points
  const pointsEl = document.getElementById("event-points");
  if (pointsEl) pointsEl.textContent = `${event.points} DRL Points`;

  // Location
  const locationEl = document.getElementById("event-location");
  const roomEl = document.getElementById("event-room");
  if (locationEl) locationEl.textContent = event.location;
  if (roomEl) roomEl.textContent = event.room;

  // Seats
  const seatsEl = document.getElementById("event-seats");
  if (seatsEl && event.seats) {
    seatsEl.textContent = `${event.seats.left}/${event.seats.total} seats left`;
  }

  // Organizer
  const organizerEl = document.getElementById("event-organizer");
  const organizerDeptEl = document.getElementById("event-organizer-dept");
  const organizerAvatarEl = document.getElementById("event-organizer-avatar");
  
  if (organizerEl) organizerEl.textContent = event.organizer;
  if (organizerDeptEl) organizerDeptEl.textContent = event.organizerDept || "";
  
  if (organizerAvatarEl) {
    organizerAvatarEl.style.backgroundImage = `url(${event.organizerAvatar || 'images/organizers/default.png'})`;
  }

  // Banner
  const bannerEl = document.getElementById("event-banner");
  if (bannerEl) {
    bannerEl.style.backgroundImage = `url(${event.image})`;
  }

  // Journey points
  const journeyPointsEl = document.getElementById("journey-points");
  if (journeyPointsEl) {
    journeyPointsEl.textContent = `${event.points} DRL points added to your profile automatically.`;
  }
}

/**
 * =========================
 * RENDER TAB CONTENT
 * (Tab 2: My Ticket / Completion QR)
 * =========================
 */
function renderTabContent(role, event, currentUser) {
  const tabQrLabel = document.getElementById("tab-qr-label");
  const tabQrContent = document.getElementById("tab-qr-content");

  if (!tabQrLabel || !tabQrContent) return;

  if (role === "student") {
    // ===== STUDENT: My Ticket =====
    tabQrLabel.innerHTML = `
      <span class="material-symbols-outlined text-[18px]">confirmation_number</span>
      My Ticket
    `;

    // Generate ticket ID
    const uid = currentUser.studentId || currentUser.email || "USER";
    const ticketId = `TICKET-${event.id.toUpperCase()}-${uid}`;

    tabQrContent.innerHTML = `
      <div class="w-full h-full min-h-[500px] flex flex-col py-8 px-4 md:px-8 relative animate-in fade-in zoom-in duration-300">
        <h2 id="ticket-header" class="text-2xl font-bold text-center mb-8 text-gray-900 dark:text-white">
          My Ticket – ${event.title}
        </h2>
        <div class="flex-grow flex flex-col items-center justify-center gap-8 pb-10">
          <div class="bg-white dark:bg-[#1c2621] p-8 rounded-3xl shadow-2xl shadow-primary/30 border-4 border-primary/50 ticket-qr active max-w-md w-full">
            <svg class="w-full h-auto max-w-[300px] max-h-[300px] mx-auto" fill="none" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
              <rect fill="white" height="100" width="100" x="0" y="0"></rect>
              <path fill="currentColor" d="M10 10h20v20h-20zM70 10h20v20h-20zM10 70h20v20h-20zM35 10h5v5h-5zM45 10h5v5h-5zM55 10h5v5h-5zM35 20h5v5h-5zM45 20h5v5h-5zM55 20h5v5h-5zM10 35h5v5h-5zM20 35h5v5h-5zM35 35h30v30h-30zM70 35h5v5h-5zM80 35h5v5h-5zM70 45h5v5h-5zM80 45h5v5h-5zM35 70h5v5h-5zM45 70h5v5h-5zM55 70h5v5h-5zM70 70h20v20h-20z"/>
            </svg>
            <div class="relative mt-4">
              <input 
                id="student-ticket-id" 
                class="w-full text-center text-xl font-mono text-gray-900 dark:text-white placeholder-gray-400 bg-gray-100 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg p-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent cursor-default" 
                readonly 
                type="text"
                value="${ticketId}"
              />
            </div>
            <p class="text-center text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-widest mt-3">
              Student Ticket ID
            </p>
          </div>
        </div>
        <div class="w-full flex flex-col items-center gap-6 mb-6 max-w-md mx-auto">
          <button class="group flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary hover:bg-[#2fd16d] text-black font-bold text-base tracking-wide transition-all transform hover:scale-105 shadow-lg shadow-primary/25">
            <span class="material-symbols-outlined text-[24px] group-hover:rotate-45 transition-transform">qr_code_scanner</span>
            Scan QR to Finish
          </button>
          <p class="text-sm text-gray-500 dark:text-gray-400">If camera not working, enter code manually</p>
          <div class="flex w-full gap-2">
            <input type="text" placeholder="Enter code" class="flex-grow rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-black/20 p-3 text-sm focus:border-primary focus:ring-primary placeholder-gray-400">
            <button class="px-6 py-3 rounded-lg bg-primary text-black font-bold text-sm hover:bg-[#2fd16d] transition-all shadow-md">Submit</button>
          </div>
        </div>
      </div>
    `;

  } else {
    // ===== ADMIN: Completion QR =====
    tabQrLabel.innerHTML = `
      <span class="material-symbols-outlined text-[18px]">qr_code_scanner</span>
      Completion QR
    `;

    const completionQRCode = `EVT-${event.id.toUpperCase()}-8829`;

    tabQrContent.innerHTML = `
      <div class="w-full h-full min-h-[500px] flex flex-col py-8 px-4 md:px-8 relative animate-in fade-in zoom-in duration-300">
        <h2 id="admin-qr-header" class="text-2xl font-bold text-center mb-8 text-gray-900 dark:text-white">
          Completion QR Management: ${event.title}
        </h2>
        <div class="flex-grow flex flex-col items-center justify-center gap-8 pb-10">
          <div class="bg-white dark:bg-[#1c2621] p-8 rounded-3xl shadow-2xl shadow-primary/30 border-4 border-primary/50 ticket-qr active max-w-md w-full">
            <svg class="w-full h-auto max-w-[300px] max-h-[300px] mx-auto" fill="none" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
              <rect fill="white" height="100" width="100" x="0" y="0"></rect>
              <path fill="currentColor" d="M10 10h20v20h-20zM70 10h20v20h-20zM10 70h20v20h-20zM35 10h5v5h-5zM45 10h5v5h-5zM55 10h5v5h-5zM35 20h5v5h-5zM45 20h5v5h-5zM55 20h5v5h-5zM10 35h5v5h-5zM20 35h5v5h-5zM35 35h30v30h-30zM70 35h5v5h-5zM80 35h5v5h-5zM70 45h5v5h-5zM80 45h5v5h-5zM35 70h5v5h-5zM45 70h5v5h-5zM55 70h5v5h-5zM70 70h20v20h-20z"/>
            </svg>
            <div class="relative mt-4">
              <input 
                class="w-full text-center text-xl font-mono text-gray-900 dark:text-white placeholder-gray-400 bg-gray-100 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg p-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent cursor-default" 
                readonly 
                type="text"
                value="${completionQRCode}"
              />
            </div>
            <p class="text-center text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-widest mt-3">
              Event Completion QR
            </p>
          </div>
        </div>
        <div class="w-full flex flex-col items-center gap-6 mb-6 max-w-md mx-auto">
          <div class="flex w-full gap-2">
            <button class="flex-grow px-6 py-3 rounded-lg bg-primary text-black font-bold text-sm hover:bg-[#2fd16d] transition-all shadow-md">Open QR</button>
            <button class="flex-grow px-6 py-3 rounded-lg bg-red-500 text-white font-bold text-sm hover:bg-red-600 transition-all shadow-md">Close QR</button>
          </div>
          <div class="flex w-full gap-2">
            <input type="number" placeholder="Validity Time (minutes)" class="flex-grow rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-black/20 p-3 text-sm focus:border-primary focus:ring-primary placeholder-gray-400">
            <button class="px-6 py-3 rounded-lg bg-primary text-black font-bold text-sm hover:bg-[#2fd16d] transition-all shadow-md">Set Time</button>
          </div>
          <button class="w-full px-6 py-3 rounded-lg bg-blue-500 text-white font-bold text-sm hover:bg-blue-600 transition-all shadow-md">Regenerate QR</button>
        </div>
      </div>
    `;
  }
}

/**
 * =========================
 * RENDER EVENT ACTIONS
 * (Sidebar actions)
 * =========================
 */
function renderEventActions(role, event) {
  const actionsContainer = document.getElementById("event-actions");
  if (!actionsContainer) return;

  if (role === "student") {
    // ===== STUDENT: Register Button =====
    actionsContainer.innerHTML = `
      <button id="openRegisterBtn" class="w-full h-12 bg-primary hover:bg-[#2fd16d] text-black font-bold text-base rounded-full shadow-lg shadow-primary/25 transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 group">
        Register for Event
        <span class="material-symbols-outlined text-[20px] transition-transform group-hover:translate-x-1">arrow_forward</span>
      </button>
      <p class="text-center text-xs text-gray-400 mt-3">
        Registration closes in 2 days
      </p>
    `;

    const registerBtn = document.getElementById("openRegisterBtn");
    if (registerBtn) {
      registerBtn.addEventListener("click", () => {
        alert(`✅ Successfully registered for: ${event.title}\n\nYou will earn ${event.points} DRL points!`);
      });
    }

  } else {
    // ===== ADMIN: Edit/Delete Buttons =====
    actionsContainer.innerHTML = `
      <div class="grid grid-cols-2 gap-2 mb-3">
        <button class="h-12 bg-blue-500 hover:bg-blue-600 text-white font-bold text-base rounded-full shadow-lg shadow-blue-500/25 transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 group">
          Edit
          <span class="material-symbols-outlined text-[20px]">edit</span>
        </button>
        <button class="h-12 bg-red-500 hover:bg-red-600 text-white font-bold text-base rounded-full shadow-lg shadow-red-500/25 transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 group">
          Delete
          <span class="material-symbols-outlined text-[20px]">delete</span>
        </button>
      </div>
      <p class="text-center text-xs text-gray-400 mt-3">
        Event management available for administrators
      </p>
    `;
  }
}

/**
 * =========================
 * SIDEBAR TOGGLE (Mobile)
 * =========================
 */
function setupSidebarToggle() {
  const sidebarToggleBtn = document.getElementById("sidebar-toggle-btn");
  const adminSidebar = document.getElementById("admin-sidebar");

  if (sidebarToggleBtn && adminSidebar) {
    sidebarToggleBtn.addEventListener("click", () => {
      adminSidebar.classList.toggle("open");
    });
  }
}