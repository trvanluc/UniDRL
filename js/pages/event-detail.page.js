/**
 * ==========================================
 * EVENT DETAIL PAGE CONTROLLER
 * ==========================================
 * Features:
 * - 2 tabs: General Overview + My Ticket/Completion QR
 * - Role-based content (Student vs Admin/Advisor/Manager)
 * - Event data from URL parameter
 * ==========================================
 */

import { requireAuth } from "../guards/auth.guard.js";
import { ROLES } from "../config/constants.js";
import { EVENTS } from "../data/events.data.js";
import { Storage } from "../utils/storage.js";
import { Theme } from "../utils/theme.js";
// import {
//   createCompletionQR,
//   regenerateCompletionQR
// } from "./event-detail.js";


/**
 * =========================
 * MAIN INITIALIZATION
 * =========================
 */
document.addEventListener("DOMContentLoaded", () => {

  Theme.init();
  setupThemeToggle();

  // 1. Check authentication
  const user = requireAuth();
  if (!user) return;

  console.log("User authenticated:", user.name, "| Role:", user.role);

  // 2. Get event ID from URL
  const urlParams = new URLSearchParams(window.location.search);
  const eventId = urlParams.get("id");

  const tab = urlParams.get("tab");

  if (tab === "qr") {
    const qrTabRadio = document.getElementById("tab-qr");
    if (qrTabRadio) {
      qrTabRadio.checked = true;
    }
  }


  if (!eventId) {
    console.error("Event ID not found in URL");
    alert("Event ID not found");
    window.location.href = "home.html";
    return;
  }

  // 3. Find event in data
  // Load events from localStorage first
  let storedEvents = JSON.parse(localStorage.getItem("events"));

  // Seed events nếu chưa có
  if (!storedEvents) {
    storedEvents = EVENTS;
    localStorage.setItem("events", JSON.stringify(EVENTS));
  }

  // Find current event
  const event = storedEvents.find(e => e.id === eventId);


  if (!event) {
    console.error("Event not found:", eventId);
    alert("Event not found");
    window.location.href = "home.html";
    return;
  }

  console.log("Event loaded:", event.title);

  // 4. Render everything
  renderNavigation(user);
  renderEventInfo(event);
  renderTabContent(user, event);
  renderEventActions(user, event);
  setupSidebarToggle();
});

/**
 * =========================
 * RENDER NAVIGATION
 * =========================
 */
function renderNavigation(user) {
  const navMenu = document.getElementById("nav-menu");
  const adminSidebar = document.getElementById("admin-sidebar");
  const sidebarToggleBtn = document.getElementById("sidebar-toggle-btn");

  if (user.role === ROLES.STUDENT) {
    // Student Navigation
    navMenu.classList.remove("hidden");
    navMenu.innerHTML = `
      <a class="text-sm font-medium hover:text-primary transition-colors" href="home.html">Home</a>
      <a class="text-sm font-medium hover:text-primary transition-colors" href="student/my-event.html">My Events</a>
      <a class="text-sm font-medium hover:text-primary transition-colors" href="student/my-journey.html">My Journey</a>
      <a class="text-sm font-medium hover:text-primary transition-colors" href="student/profile.html">Profile</a>
    `;
    adminSidebar?.classList.add("hidden");
    sidebarToggleBtn?.classList.add("hidden");
  } else {
    // Admin Navigation
    navMenu.classList.add("hidden");
    adminSidebar?.classList.remove("hidden");
    sidebarToggleBtn?.classList.remove("hidden");
  }
}

/**
 * =========================
 * RENDER EVENT INFO
 * =========================
 */
function renderEventInfo(event) {
  // Title
  const titleEl = document.getElementById("event-name");
  if (titleEl) titleEl.textContent = event.title;

  // Description
  const descEl = document.getElementById("event-description");
  if (descEl) descEl.innerHTML = event.description;

  // Date & Time
  const dateEl = document.getElementById("event-date");
  const timeEl = document.getElementById("event-time");
  if (dateEl) dateEl.textContent = event.date;
  if (timeEl) timeEl.textContent = event.time;

  // Category & Points
  const categoryEl = document.getElementById("event-category");
  const pointsEl = document.getElementById("event-points");
  const bannerCategoryEl = document.getElementById("banner-category");
  
  if (categoryEl) categoryEl.textContent = event.category;
  if (pointsEl) pointsEl.textContent = `${event.points} DRL Points`;
  if (bannerCategoryEl) bannerCategoryEl.textContent = event.category;

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
 *   THEME TOGGLE
 * =========================
 */
function setupThemeToggle() {
  const themeButtons = document.querySelectorAll('button:has(.theme-toggle-icon)');
  
  themeButtons.forEach(button => {
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
 * RENDER TAB CONTENT
 * (Student vs Admin)
 * =========================
 */
function renderTabContent(user, event) {
  const tabQrLabel = document.getElementById("tab-qr-label");
  const tabQrContent = document.getElementById("tab-qr-content");

  if (!tabQrLabel || !tabQrContent) return;

  if (user.role === ROLES.STUDENT) {
    // ===== STUDENT: My Ticket =====
    tabQrLabel.innerHTML = `
      <span class="material-symbols-outlined text-[18px]">confirmation_number</span>
      My Ticket
    `;

    // Generate student ticket ID
    const uid = user.studentId || user.email || "USER";
    const ticketId = `TICKET-${event.id.toUpperCase()}-${uid}`;

    tabQrContent.innerHTML = `
      <div class="w-full h-full min-h-[500px] flex flex-col py-8 px-4 md:px-8 relative animate-in fade-in zoom-in duration-300">
        <h2 class="text-2xl font-bold text-center mb-8 text-gray-900 dark:text-white">
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
          <button id="scan-qr-btn" class="group flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary hover:bg-[#2fd16d] text-black font-bold text-base tracking-wide transition-all transform hover:scale-105 shadow-lg shadow-primary/25">
            <span class="material-symbols-outlined text-[24px] group-hover:rotate-45 transition-transform">qr_code_scanner</span>
            Scan QR to Finish
          </button>
          <p class="text-sm text-gray-500 dark:text-gray-400">If camera not working, enter code manually</p>
          <div class="flex w-full gap-2">
            <input id="manual-code-input" type="text" placeholder="Enter code" class="flex-grow rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-black/20 p-3 text-sm focus:border-primary focus:ring-primary placeholder-gray-400">
            <button id="submit-code-btn" class="px-6 py-3 rounded-lg bg-primary text-black font-bold text-sm hover:bg-[#2fd16d] transition-all shadow-md">
              Submit
            </button>
          </div>
        </div>
      </div>
    `;

    // Event listeners for student actions
    setupStudentTicketActions();

  } else {
    // ===== ADMIN: Completion QR =====
    tabQrLabel.innerHTML = `
      <span class="material-symbols-outlined text-[18px]">qr_code_scanner</span>
      Completion QR
    `;

    const storedQRs = JSON.parse(localStorage.getItem("completionQRs")) || {};
    const completionQRCode =
    storedQRs[event.id] || generateCompletionQR(event.id);


    tabQrContent.innerHTML = `
      <div class="w-full h-full min-h-[500px] flex flex-col py-8 px-4 md:px-8 relative animate-in fade-in zoom-in duration-300">
        <h2 class="text-2xl font-bold text-center mb-8 text-gray-900 dark:text-white">
          Completion QR Management: ${event.title}
        </h2>
        <div class="flex-grow flex flex-col items-center justify-center gap-8 pb-10">
          <div class="bg-white dark:bg-[#1c2621] p-8 rounded-3xl shadow-2xl shadow-primary/30 border-4 border-primary/50 ticket-qr active max-w-md w-full">
            <div class="w-[260px] h-[260px] flex items-center justify-center bg-white rounded-xl mx-auto">
              <img
                id="completion-qr-img"
                class="w-full h-full object-contain hidden"
                alt="Completion QR Code"
              />
            </div>
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
            <button id="open-qr-btn" class="flex-grow px-6 py-3 rounded-lg bg-primary text-black font-bold text-sm hover:bg-[#2fd16d] transition-all shadow-md">
              Open QR
            </button>
            <button id="close-qr-btn" class="flex-grow px-6 py-3 rounded-lg bg-red-500 text-white font-bold text-sm hover:bg-red-600 transition-all shadow-md">
              Close QR
            </button>
          </div>
          <div class="flex w-full gap-2">
            <input id="validity-time-input" type="number" placeholder="Validity Time (minutes)" class="flex-grow rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-black/20 p-3 text-sm focus:border-primary focus:ring-primary placeholder-gray-400">
            <button id="set-time-btn" class="px-6 py-3 rounded-lg bg-primary text-black font-bold text-sm hover:bg-[#2fd16d] transition-all shadow-md">
              Set Time
            </button>
          </div>
          <button id="regenerate-qr-btn" class="w-full px-6 py-3 rounded-lg bg-blue-500 text-white font-bold text-sm hover:bg-blue-600 transition-all shadow-md">
            Regenerate QR
          </button>
        </div>
      </div>
    `;
    const openBtn = document.getElementById("open-qr-btn");
    const regenerateBtn = document.getElementById("regenerate-qr-btn");

    // Event listeners for admin actions
    setupAdminQRActions(event);
  }
}

/**
 * =========================
 * RENDER EVENT ACTIONS
 * (Register button for Student / Edit/Delete for Admin)
 * =========================
 */
function renderEventActions(user, event) {
  const actionsContainer = document.getElementById("event-actions");
  if (!actionsContainer) return;

  if (user.role === ROLES.STUDENT) {
    // ===== STUDENT: Register Button =====
    actionsContainer.innerHTML = `
      <button id="register-event-btn" class="w-full h-12 bg-primary hover:bg-[#2fd16d] text-black font-bold text-base rounded-full shadow-lg shadow-primary/25 transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 group">
        Register for Event
        <span class="material-symbols-outlined text-[20px] transition-transform group-hover:translate-x-1">arrow_forward</span>
      </button>
      <p class="text-center text-xs text-gray-400 mt-3">
        Registration closes in 2 days
      </p>
    `;

    // Register event listener
    const registerBtn = document.getElementById("register-event-btn");
    registerBtn?.addEventListener("click", () => {
      if (event.status === "closed") {
        alert("This event is closed for registration");
        return;
      }
      
      if (event.seats && event.seats.left === 0) {
        alert("No seats available");
        return;
      }

      alert(`Successfully registered for: ${event.title}\n\nYou will earn ${event.points} DRL points after completing this event.`);
      
      // Change button state
      registerBtn.innerHTML = `
        <span class="material-symbols-outlined">check_circle</span>
        <span>Registered</span>
      `;
      registerBtn.disabled = true;
      registerBtn.classList.remove("bg-primary", "hover:bg-[#2fd16d]");
      registerBtn.classList.add("bg-green-600", "cursor-not-allowed");
    });

  } else {
    // ===== ADMIN: Edit/Delete Buttons =====
    actionsContainer.innerHTML = `
      <div class="grid grid-cols-2 gap-2 mb-3">
        <button id="edit-event-btn" class="h-12 bg-blue-500 hover:bg-blue-600 text-white font-bold text-base rounded-full shadow-lg shadow-blue-500/25 transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 group">
          Edit
          <span class="material-symbols-outlined text-[20px]">edit</span>
        </button>
        <button id="delete-event-btn" class="h-12 bg-red-500 hover:bg-red-600 text-white font-bold text-base rounded-full shadow-lg shadow-red-500/25 transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 group">
          Delete
          <span class="material-symbols-outlined text-[20px]">delete</span>
        </button>
      </div>
      <p class="text-center text-xs text-gray-400 mt-3">
        Event management available for administrators
      </p>
    `;

    // Edit event listener
    const editBtn = document.getElementById("edit-event-btn");
    editBtn?.addEventListener("click", () => {
      const newDesc = prompt("Edit event description:", event.description);
      if (!newDesc) return;

      event.description = newDesc;

      // Lưu mock vào localStorage
      let events = JSON.parse(localStorage.getItem("events")) || [];
      const index = events.findIndex(e => e.id === event.id);
      if (index !== -1) {
        events[index].description = newDesc;
        localStorage.setItem("events", JSON.stringify(events));
      }

      alert("Description updated (mock)");
      location.reload();
    });


    // Delete event listener
    const deleteBtn = document.getElementById("delete-event-btn");
    deleteBtn?.addEventListener("click", () => {
      if (confirm(`Are you sure you want to delete "${event.title}"?`)) {
        alert(`Event deleted: ${event.title}`);
        // TODO: Delete event from database
        window.location.href = "home.html";
      }
    });
  }
}

/**
 * =========================
 * STUDENT TICKET ACTIONS
 * =========================
 */
function setupStudentTicketActions() {
  const scanBtn = document.getElementById("scan-qr-btn");
  const submitBtn = document.getElementById("submit-code-btn");
  const manualInput = document.getElementById("manual-code-input");

  scanBtn?.addEventListener("click", () => {
    alert("Opening camera to scan QR code...\n\n(Camera feature will be implemented later)");
  });

  submitBtn?.addEventListener("click", () => {
    const code = manualInput?.value.trim();
    if (!code) {
      alert("Please enter a code");
      return;
    }
    alert(`Code submitted: ${code}\n\nVerifying completion...`);
    // TODO: Verify code with backend
  });
}

/**
 * =========================
 * ADMIN QR ACTIONS
 * =========================
 */
function setupAdminQRActions(event) {
  const openBtn = document.getElementById("open-qr-btn");
  const closeBtn = document.getElementById("close-qr-btn");
  const setTimeBtn = document.getElementById("set-time-btn");
  const regenerateBtn = document.getElementById("regenerate-qr-btn");
  const validityInput = document.getElementById("validity-time-input");

  openBtn?.addEventListener("click", () => {
    const qrText = generateCompletionQR(event.id); // ✅ BẮT BUỘC
  
    const qrImg = document.getElementById("completion-qr-img");
    if (!qrImg) return;
  
    qrImg.src =
      `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(qrText)}`;
  
    qrImg.classList.remove("hidden"); // ✅ QUAN TRỌNG

    saveQRStatus(event.id, {
      active: true,
      code: qrText,
      expiresAt: null
    });
  
    alert("Completion QR opened (mock)");
  });
  

  closeBtn?.addEventListener("click", () => {
    saveQRStatus(event.id, {
      active: false
    });
  
    alert("QR has been CLOSED");
  });
  

  setTimeBtn?.addEventListener("click", () => {
    const minutes = validityInput?.value;
    if (!minutes || minutes <= 0) {
      alert(" Please enter a valid time in minutes");
      return;
    }
    alert(`⏱ QR validity set to: ${minutes} minutes\n\nQR will auto-close after this time.`);
  });

  regenerateBtn?.addEventListener("click", () => {
    const newQR = generateCompletionQR(event.id);

    saveQRStatus(event.id, {
      active: true,
      code: newQR,
      expiresAt: null
    });
  
    const qrs = JSON.parse(localStorage.getItem("completionQRs")) || {};
    qrs[event.id] = newQR;
    localStorage.setItem("completionQRs", JSON.stringify(qrs));
  
    const qrImg = document.getElementById("completion-qr-img");
    if (!qrImg) return;
  
    qrImg.src =
      `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(newQR)}`;
  
    qrImg.classList.remove("hidden"); // ✅ BẮT BUỘC
  
    alert("QR regenerated successfully");
  });
  function saveQRStatus(eventId, data) {
    const store = JSON.parse(localStorage.getItem("completionQRStatus")) || {};
    store[eventId] = {
      ...store[eventId],
      ...data
    };
    localStorage.setItem("completionQRStatus", JSON.stringify(store));
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

function generateCompletionQR(eventId) {
  return `EVT-${eventId}-COMPLETION-${Date.now()}`;
}
