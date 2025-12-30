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
import { setupThemeToggle, getBasePath } from "../utils/ui-helpers.js";
import { RegistrationService } from "../services/registration.service.js";
import { renderTicketDesign, renderTicketDesignForModal } from "../components/ticket/ticket.component.js";
import { openModal, closeModal, setupModalListeners } from "../components/modal/modal-manager.component.js";
import { FormValidator } from "../utils/validation.js";
import { Toast } from "../components/toast/toast.js";
import { Dialog } from "../components/dialog/dialog.js";

document.addEventListener("DOMContentLoaded", () => {
  Theme.init();
  setupThemeToggle();
  const user = requireAuth();
  if (!user) return;
  console.log("User authenticated:", user.name, "| Role:", user.role);
  // TOGGLE LAYOUT THEO ROLE
  const studentLayout = document.getElementById("student-layout");
  const adminLayout = document.getElementById("admin-layout");
  const studentHeader = document.getElementById("student-header");
  const adminHeader = document.getElementById("admin-header");

  if (user.role === ROLES.STUDENT) {
    studentLayout?.classList.remove("hidden");
    adminLayout?.classList.add("hidden");
    document.body.classList.remove("is-admin");
    studentHeader?.classList.remove("hidden");
    adminHeader?.classList.add("hidden");
  } else {
    adminLayout?.classList.remove("hidden");
    studentLayout?.classList.add("hidden");
    adminHeader?.classList.remove("hidden");
    studentHeader?.classList.add("hidden");
    document.body.classList.add("is-admin");
  }
  // Get event ID from URL
  const urlParams = new URLSearchParams(window.location.search);
  const eventId = urlParams.get("id");
  if (!eventId) {
    console.error("Event ID not found in URL");
    alert("Event ID not found");
    window.location.href = "home.html";
    return;
  }
  // Find event
  let storedEvents = JSON.parse(localStorage.getItem("events")) || EVENTS;
  if (!storedEvents.length) {
    storedEvents = EVENTS;
    localStorage.setItem("events", JSON.stringify(EVENTS));
  }
  const event = storedEvents.find(e => e.id === eventId);
  if (!event) {
    console.error("Event not found:", eventId);
    Toast.error("Event not found");
    setTimeout(() => { window.location.href = "home.html"; }, 1500);
    return;
  }
  console.log("Event loaded:", event.title);
  // Render
  renderNavigation(user);
  renderEventInfo(event);
  renderTabContent(user, event);
  renderEventActions(user, event);
  setupSidebarToggle();
  if (user.role === ROLES.STUDENT) {
    setupRegisterModal(event);
  }
});

// Render Navigation
function renderNavigation(user) {
  const navMenu = document.getElementById("nav-menu");
  const adminSidebar = document.getElementById("admin-sidebar");
  const sidebarToggleBtn = document.getElementById("sidebar-toggle-btn");
  if (user.role === ROLES.STUDENT) {
    // Student Navigation
    if (navMenu) navMenu.classList.remove("hidden");
    if (navMenu) navMenu.innerHTML = `
      <a class="text-sm font-medium hover:text-primary transition-colors" href="home.html">Home</a>
      <a class="text-sm font-medium hover:text-primary transition-colors" href="student/my-event.html">My Tickets</a>
      <a class="text-sm font-medium hover:text-primary transition-colors" href="student/my-journey.html">My Journey</a>
      <a class="text-sm font-medium hover:text-primary transition-colors" href="student/profile.html">Profile</a>
    `;
    adminSidebar?.classList.add("hidden");
    sidebarToggleBtn?.classList.add("hidden");
  } else {
    // Admin Navigation
    if (navMenu) navMenu.classList.add("hidden");
    adminSidebar?.classList.remove("hidden");
    sidebarToggleBtn?.classList.remove("hidden");
  }
}

// Render Event Info
function renderEventInfo(event) {
  const titleEl = document.getElementById("event-name");
  if (titleEl) titleEl.textContent = event.title;
  const descEl = document.getElementById("event-description");
  if (descEl) descEl.innerHTML = event.description;
  const dateEl = document.getElementById("event-date");
  const timeEl = document.getElementById("event-time");
  if (dateEl) dateEl.textContent = event.date;
  if (timeEl) timeEl.textContent = event.time;
  const categoryEl = document.getElementById("event-category");
  const bannerCategoryEl = document.getElementById("banner-category");
  if (categoryEl) categoryEl.textContent = event.category;
  if (bannerCategoryEl) bannerCategoryEl.textContent = event.category;
  const locationEl = document.getElementById("event-location");
  const roomEl = document.getElementById("event-room");
  if (locationEl) locationEl.textContent = event.location;
  if (roomEl) roomEl.textContent = event.room;
  const seatsEl = document.getElementById("event-seats");
  if (seatsEl && event.seats) {
    seatsEl.textContent = `${event.seats.left}/${event.seats.total} seats left`;
  }
  const organizerEl = document.getElementById("event-organizer");
  const organizerDeptEl = document.getElementById("event-organizer-dept");
  const organizerAvatarEl = document.getElementById("event-organizer-avatar");
  if (organizerEl) organizerEl.textContent = event.organizer;
  if (organizerDeptEl) organizerDeptEl.textContent = event.organizerDept || "";
  if (organizerAvatarEl) {
    organizerAvatarEl.style.backgroundImage = `url(${event.organizerAvatar || 'images/organizers/default.png'})`;
  }
  const bannerEl = document.getElementById("event-banner");
  if (bannerEl) {
    bannerEl.style.backgroundImage = `url(${getBasePath()}${event.image})`;
  }

  // Journey points
  const journeyBadgesEl = document.getElementById("journey-badges");
  if (journeyBadgesEl) {
    journeyBadgesEl.textContent = `Event badge added to your profile automatically.`;
  }
}

// Render Tab Content
function renderTabContent(user, event) {
  const tabQrLabel = document.getElementById("tab-qr-label");
  const tabQrContent = document.getElementById("tab-qr-content");
  if (!tabQrLabel || !tabQrContent) return;
  if (user.role === ROLES.STUDENT) {
    tabQrLabel.innerHTML = `
      <span class="material-symbols-outlined text-[18px]">confirmation_number</span>
      My Ticket
    `;
    const registrations = RegistrationService.getByEventId(event.id);
    const userRegistration = registrations.find(reg => {
      return reg.mssv === user.studentId || reg.email === user.email || reg.mssv === user.email;
    });
    if (!userRegistration) {
      tabQrContent.innerHTML = `
        <div class="w-full h-full min-h-[500px] flex flex-col items-center justify-center py-8 px-4 md:px-8">
          <div class="text-center max-w-md">
            <div class="w-20 h-20 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center mx-auto mb-6">
              <span class="material-symbols-outlined text-4xl text-gray-400">confirmation_number</span>
            </div>
            <h2 class="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
              You have not registered for this event
            </h2>
            <p class="text-gray-600 dark:text-gray-400 mb-6">
              Please register to receive your QR Code and event ticket.
            </p>
            <button id="register-from-ticket-btn" class="px-6 py-3 rounded-xl bg-primary hover:bg-[#2fd16d] text-black font-bold transition-all shadow-lg shadow-primary/25">
              Register Now
            </button>
          </div>
        </div>
      `;
      const registerFromTicketBtn = document.getElementById("register-from-ticket-btn");
      registerFromTicketBtn?.addEventListener("click", () => {
        openModal("register-modal");
      });
    } else {
      tabQrContent.innerHTML = `
        <div class="w-full h-full min-h-[500px] flex flex-col py-8 px-4 md:px-8 relative animate-in fade-in zoom-in duration-300">
          <h2 class="text-2xl font-bold text-center mb-8 text-gray-900 dark:text-white">
            My Ticket – ${event.title}
          </h2>
          <div class="flex-grow flex flex-col items-center justify-center gap-8 pb-10">
            <div id="ticket-container-myticket">
              <!-- Ticket sẽ được render vào đây -->
            </div>
          </div>
        </div>
      `;
      setTimeout(() => {
        renderTicketDesign(event, userRegistration, "ticket-container-myticket");
      }, 100);
    }
    setupStudentTicketActions();
  } else {
    tabQrLabel.innerHTML = `
      <span class="material-symbols-outlined text-[18px]">qr_code_scanner</span>
      Completion QR
    `;
    const storedQRs = Storage.get("completionQRs") || {};
    const completionQRCode = storedQRs[event.id] || generateCompletionQR(event.id);
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
    setupAdminQRActions(event);
  }
}

// Render Event Actions
function renderEventActions(user, event) {
  const actionsContainer = document.getElementById("event-actions");
  if (!actionsContainer) return;
  if (user.role === ROLES.STUDENT) {
    const registrations = RegistrationService.getByEventId(event.id);
    const isRegistered = registrations.some(reg => reg.mssv === user.studentId || reg.email === user.email || reg.mssv === user.email);
    if (isRegistered) {
      actionsContainer.innerHTML = `
        <button id="show-my-qr-btn" class="w-full h-12 bg-primary hover:bg-[#2fd16d] text-black font-bold text-base rounded-full shadow-lg shadow-primary/25 transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 group">
          <span class="material-symbols-outlined">qr_code_2</span>
          <span>Show My Ticket</span>
        </button>
        <p class="text-center text-xs text-gray-400 mt-3">
          View your QR Code
        </p>
      `;
      const showQRBtn = document.getElementById("show-my-qr-btn");
      showQRBtn?.addEventListener("click", () => {
        openQRCodeModal(user, event);
      });
    } else {
      actionsContainer.innerHTML = `
        <button id="register-event-btn" class="w-full h-12 bg-primary hover:bg-[#2fd16d] text-black font-bold text-base rounded-full shadow-lg shadow-primary/25 transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 group">
          Register Now
          <span class="material-symbols-outlined text-[20px] transition-transform group-hover:translate-x-1">arrow_forward</span>
        </button>
        <p class="text-center text-xs text-gray-400 mt-3">
          Registration closes in 2 days
        </p>
      `;
      const registerBtn = document.getElementById("register-event-btn");
      registerBtn?.addEventListener("click", () => {
        openModal("register-modal");
      });
    }
  } else {
    // ADMIN/ADVISOR/MANAGER - Show Edit, Delete, and Checkout QR buttons
    actionsContainer.innerHTML = `
      <div class="space-y-3 mb-3">
        <!-- Checkout QR Button - Main action -->
        <button id="checkout-qr-btn" class="w-full h-12 bg-primary hover:bg-[#2fd16d] text-black font-bold text-base rounded-full shadow-lg shadow-primary/25 transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2">
          <span class="material-symbols-outlined">qr_code_2</span>
          <span>Create Checkout QR</span>
        </button>
        
        <!-- Edit & Delete buttons -->
        <div class="grid grid-cols-2 gap-2">
          <button id="edit-event-btn" class="h-10 bg-blue-500 hover:bg-blue-600 text-white font-bold text-sm rounded-full shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-1">
            <span class="material-symbols-outlined text-[18px]">edit</span>
            Edit
          </button>
          <button id="delete-event-btn" class="h-10 bg-red-500 hover:bg-red-600 text-white font-bold text-sm rounded-full shadow-lg shadow-red-500/25 transition-all flex items-center justify-center gap-1">
            <span class="material-symbols-outlined text-[18px]">delete</span>
            Delete
          </button>
        </div>
      </div>
      <p class="text-center text-xs text-gray-400">
        Create QR code for students to checkout at the end of the event
      </p>
    `;

    // Checkout QR button handler
    const checkoutQRBtn = document.getElementById("checkout-qr-btn");
    checkoutQRBtn?.addEventListener("click", () => {
      openCheckoutQRModal(event);
    });

    const editBtn = document.getElementById("edit-event-btn");
    editBtn?.addEventListener("click", () => {
      enableInlineEdit(event);
    });
    const deleteBtn = document.getElementById("delete-event-btn");
    deleteBtn?.addEventListener("click", async () => {
      const confirmed = await Dialog.confirm(
        "Delete Event",
        `Are you sure you want to delete "${event.title}"?`,
        "Delete",
        "Cancel"
      );
      if (confirmed) {
        Toast.success(`Deleted event: ${event.title}`);
        // TODO: Delete event from database
        setTimeout(() => { window.location.href = "home.html"; }, 1500);
      }
    });
  }
}

// Setup Student Ticket Actions
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

// Setup Admin QR Actions
function setupAdminQRActions(event) {
  const openBtn = document.getElementById("open-qr-btn");
  const closeBtn = document.getElementById("close-qr-btn");
  const setTimeBtn = document.getElementById("set-time-btn");
  const regenerateBtn = document.getElementById("regenerate-qr-btn");
  const validityInput = document.getElementById("validity-time-input");
  openBtn?.addEventListener("click", () => {
    const store = Storage.get("completionQRStatus") || {};
    const qrData = store[event.id];
    if (!qrData?.code) {
      alert("No QR available. Please Regenerate first.");
      return;
    }
    const qrImg = document.getElementById("completion-qr-img");
    if (!qrImg) return;
    qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(qrData.code)}`;
    qrImg.classList.remove("hidden", "qr-closed");
    saveQRStatus(event.id, { active: true });
    alert("QR opened");
  });
  closeBtn?.addEventListener("click", () => {
    const qrImg = document.getElementById("completion-qr-img");
    if (!qrImg) return;
    qrImg.classList.remove("hidden");
    qrImg.classList.add("qr-closed");
    saveQRStatus(event.id, { active: false });
    alert("QR has been CLOSED");
  });
  setTimeBtn?.addEventListener("click", () => {
    const minutes = validityInput?.value;
    if (!minutes || minutes <= 0) {
      alert("Please enter a valid time");
      return;
    }
    alert(`QR validity set to: ${minutes} minutes\nQR will auto-close after this time.`);
  });
  regenerateBtn?.addEventListener("click", () => {
    const newQR = `COMPLETION_${event.id}_${Date.now()}`;
    const qrImg = document.getElementById("completion-qr-img");
    if (!qrImg) return;
    qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(newQR)}`;
    qrImg.classList.remove("hidden", "qr-closed");
    saveQRStatus(event.id, { active: true, code: newQR });
    alert("QR regenerated");
  });
  function saveQRStatus(eventId, data) {
    const store = Storage.get("completionQRStatus") || {};
    store[eventId] = { ...store[eventId], ...data };
    Storage.set("completionQRStatus", store);
  }
}

// Setup Sidebar Toggle
function setupSidebarToggle() {
  const sidebarToggleBtn = document.getElementById("sidebar-toggle-btn");
  const adminSidebar = document.getElementById("admin-sidebar");
  if (sidebarToggleBtn && adminSidebar) {
    sidebarToggleBtn.addEventListener("click", () => {
      adminSidebar.classList.toggle("open");
    });
  }
}

// Setup Register Modal
function setupRegisterModal(event) {
  const form = document.getElementById("register-form");
  form?.addEventListener("submit", (e) => {
    handleRegisterSubmit(event, e);
  });
  setupModalListeners("register-modal", "close-register-modal-btn", "register-modal-overlay");
}

// Open QR Code Modal
function openQRCodeModal(user, event) {
  openModal("qr-ticket-modal");
  const registrations = RegistrationService.getByEventId(event.id);
  const userRegistration = registrations.find(reg => reg.mssv === user.studentId || reg.email === user.email || reg.mssv === user.email);
  if (!userRegistration) {
    alert("Registration information not found");
    return;
  }
  const modalContent = document.getElementById("qr-ticket-modal-content");
  if (modalContent) {
    modalContent.innerHTML = `<div id="modal-ticket-container"></div>`;
    setTimeout(() => {
      renderTicketDesignForModal(event, userRegistration, "modal-ticket-container");
    }, 50);
  }
  setupQRCodeModal();
}

// Close QR Code Modal
function closeQRCodeModal() {
  closeModal("qr-ticket-modal");
}

// Setup QR Code Modal
function setupQRCodeModal() {
  setupModalListeners("qr-ticket-modal", "close-qr-ticket-modal-btn", "qr-ticket-modal-overlay");
}

// Generate Completion QR
function generateCompletionQR(eventId) {
  const qrs = Storage.get("completionQRs") || {};
  if (qrs[eventId]) return qrs[eventId];
  const newQR = `COMPLETION_${eventId}_${Date.now()}`;
  qrs[eventId] = newQR;
  Storage.set("completionQRs", qrs);
  return newQR;
}

// Enable Inline Edit
function enableInlineEdit(event) {
  const nameEl = document.getElementById("event-name");
  const descEl = document.getElementById("event-description");
  const organizerEl = document.getElementById("event-organizer");
  const actionsContainer = document.getElementById("event-actions");
  if (!nameEl || !descEl || !organizerEl) return;
  const original = {
    name: nameEl.textContent,
    description: descEl.innerHTML,
    organizer: organizerEl.textContent
  };
  nameEl.innerHTML = `
    <input id="edit-name"
      class="w-full text-3xl font-bold p-3 rounded-xl
             bg-gray-900 text-white
             border border-gray-600
             focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
      value="${original.name}">
  `;
  descEl.innerHTML = `
    <textarea id="edit-description"
      class="w-full min-h-[180px] p-4 rounded-xl
             bg-gray-900 text-white
             border border-gray-600
             focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary">${original.description}</textarea>
  `;
  organizerEl.innerHTML = `
    <input id="edit-organizer"
      class="w-full p-3 rounded-xl
             bg-gray-900 text-white
             border border-gray-600
             focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
      value="${original.organizer}">
  `;
  actionsContainer.innerHTML = `
    <div class="grid grid-cols-2 gap-3">
      <button id="save-event-btn"
        class="h-12 bg-primary text-black font-bold rounded-full hover:bg-[#2fd16d] transition-all">
        Save
      </button>
      <button id="cancel-event-btn"
        class="h-12 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded-full transition-all">
        Cancel
      </button>
    </div>
  `;
  document.getElementById("save-event-btn")?.addEventListener("click", () => saveEventEdit(event));
  document.getElementById("cancel-event-btn")?.addEventListener("click", () => cancelEventEdit(original));
}

// Save Event Edit
function saveEventEdit(event) {
  const newName = document.getElementById("edit-name")?.value.trim();
  const newDesc = document.getElementById("edit-description")?.value.trim();
  const newOrganizer = document.getElementById("edit-organizer")?.value.trim();
  if (!newName || !newDesc || !newOrganizer) {
    alert("Information cannot be empty");
    return;
  }
  event.title = newName;
  event.description = newDesc;
  event.organizer = newOrganizer;
  let events = Storage.get("events") || [];
  const index = events.findIndex(e => e.id === event.id);
  if (index !== -1) {
    events[index] = event;
    Storage.set("events", events);
  }
  alert("Event updated successfully");
  location.reload();
}

// Cancel Event Edit
function cancelEventEdit(original) {
  document.getElementById("event-name").textContent = original.name;
  document.getElementById("event-description").innerHTML = original.description;
  document.getElementById("event-organizer").textContent = original.organizer;
  location.reload();
}

/**
 * Handle Register Submit
 * @param {Object} event - Event data
 * @param {Event} formEvent - Form submit event
 */
function handleRegisterSubmit(event, formEvent) {
  formEvent.preventDefault();

  // Lấy các giá trị từ form
  const name = document.getElementById("register-name")?.value.trim();
  const classValue = document.getElementById("register-class")?.value.trim();
  const email = document.getElementById("register-email")?.value.trim();
  const mssv = document.getElementById("register-mssv")?.value.trim();

  // Validation sử dụng FormValidator
  const validator = new FormValidator()
    .required(name, "Please enter your full name", "error-name")
    .required(classValue, "Please enter your class", "error-class")
    .required(email, "Please enter your email", "error-email")
    .email(email, "Invalid email format", "error-email")
    .required(mssv, "Please enter your Student ID", "error-mssv");

  if (!validator.isValid()) {
    return;
  }

  // Kiểm tra MSSV đã đăng ký chưa
  if (RegistrationService.isRegistered(mssv, event.id)) {
    Toast.warning("This Student ID has already registered for this event!");
    return;
  }

  // Tạo QR Code string (format: MSSV_EVENTID)
  const qrCodeString = `${mssv}_${event.id}`;

  // Tạo object đăng ký
  const registration = {
    name: name,
    class: classValue,
    email: email,
    mssv: mssv,
    eventId: event.id,
    eventTitle: event.title,
    qrCode: qrCodeString,
    status: "registered", // Trạng thái ban đầu
    registrationDate: new Date().toISOString(),
    checkInTime: null // Chưa check-in
  };

  // Lưu vào localStorage thông qua RegistrationService
  const success = RegistrationService.save(registration);

  if (!success) {
    Toast.error("An error occurred during registration. Please try again!");
    return;
  }

  console.log("Đã lưu đăng ký:", registration);

  // Đóng popup
  closeModal("register-modal");

  // Cập nhật MSSV vào user object
  const user = Storage.getCurrentUser();
  if (user) {
    user.studentId = mssv;
    const users = Storage.getUsers();
    const userIndex = users.findIndex(u => u.email === user.email);
    if (userIndex !== -1) {
      users[userIndex].studentId = mssv;
      Storage.saveUsers(users);
    }
    Storage.setCurrentUser(user);
    console.log("Đã cập nhật user.studentId:", mssv);

    // Hiển thị thông báo thành công
    Toast.success(`Registration successful! You will receive a badge after completing the event.`);

    // Render lại tab content và button actions
    setTimeout(() => {
      renderTabContent(user, event);
      renderEventActions(user, event);
    }, 100);
  } else {
    Toast.success(`Registration successful! You will receive a badge after completing the event.`);
    setTimeout(() => { window.location.reload(); }, 1500);
  }
}

// ================================
// CHECKOUT QR MODAL FUNCTIONS
// ================================

let checkoutQRTimerInterval = null;
let currentCheckoutEvent = null;

/**
 * Open Checkout QR Modal for Admin
 * Shows time selector first, creates QR when button is clicked
 */
function openCheckoutQRModal(event) {
  currentCheckoutEvent = event;

  // Update modal content
  const eventNameEl = document.getElementById('checkout-qr-event-name');
  if (eventNameEl) eventNameEl.textContent = event.title;

  // Check if there's an existing active QR for this event
  const allCheckoutQR = JSON.parse(localStorage.getItem('vnuk_checkout_qr') || '{}');
  const qrData = allCheckoutQR[event.id];

  const setupSection = document.getElementById('checkout-qr-setup-section');
  const displaySection = document.getElementById('checkout-qr-display-section');

  if (qrData && new Date() < new Date(qrData.expiresAt)) {
    // QR exists and not expired - show it directly
    setupSection?.classList.add('hidden');
    displaySection?.classList.remove('hidden');

    // Update QR image
    const qrImageEl = document.getElementById('checkout-qr-image-large');
    if (qrImageEl) {
      qrImageEl.src = `https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=${encodeURIComponent(qrData.qrCode)}&bgcolor=ffffff&color=000000`;
    }

    // Start countdown timer
    startCheckoutQRTimer(qrData.expiresAt);
  } else {
    // No QR or expired - show setup section
    setupSection?.classList.remove('hidden');
    displaySection?.classList.add('hidden');
  }

  // Show modal
  openModal('checkout-qr-modal');

  // Setup modal event listeners
  setupCheckoutQRModalListeners();
}

/**
 * Create Checkout QR with selected time
 */
function createCheckoutQRWithTime() {
  if (!currentCheckoutEvent) return;

  const expireMinutes = parseInt(document.getElementById('checkout-qr-expire-time')?.value || '15');
  const now = new Date();
  const expiresAt = new Date(now.getTime() + expireMinutes * 60 * 1000);

  const qrData = {
    qrCode: `CHECKOUT_${currentCheckoutEvent.id}_${now.getTime()}`,
    eventId: currentCheckoutEvent.id,
    createdAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
    createdBy: 'admin'
  };

  // Save to localStorage
  const allCheckoutQR = JSON.parse(localStorage.getItem('vnuk_checkout_qr') || '{}');
  allCheckoutQR[currentCheckoutEvent.id] = qrData;
  localStorage.setItem('vnuk_checkout_qr', JSON.stringify(allCheckoutQR));

  console.log(`✅ Checkout QR created for event: ${currentCheckoutEvent.id}, expires in ${expireMinutes} minutes`);

  // Switch to display section
  const setupSection = document.getElementById('checkout-qr-setup-section');
  const displaySection = document.getElementById('checkout-qr-display-section');

  setupSection?.classList.add('hidden');
  displaySection?.classList.remove('hidden');

  // Update QR image
  const qrImageEl = document.getElementById('checkout-qr-image-large');
  if (qrImageEl) {
    qrImageEl.src = `https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=${encodeURIComponent(qrData.qrCode)}&bgcolor=ffffff&color=000000`;
  }

  // Start countdown timer
  startCheckoutQRTimer(qrData.expiresAt);
}

/**
 * Start countdown timer for checkout QR
 */
function startCheckoutQRTimer(expiresAt) {
  // Clear existing timer
  if (checkoutQRTimerInterval) {
    clearInterval(checkoutQRTimerInterval);
  }

  const countdownEl = document.getElementById('checkout-qr-countdown');

  function updateTimer() {
    const now = new Date();
    const expires = new Date(expiresAt);
    const diff = expires - now;

    if (diff <= 0) {
      // Timer expired
      clearInterval(checkoutQRTimerInterval);
      if (countdownEl) countdownEl.textContent = '00:00';
      alert('QR has expired! Please create a new one.');
      closeCheckoutQRModal();
      return;
    }

    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);

    if (countdownEl) {
      countdownEl.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
  }

  // Update immediately
  updateTimer();

  // Update every second
  checkoutQRTimerInterval = setInterval(updateTimer, 1000);
}

/**
 * Close Checkout QR Modal
 */
function closeCheckoutQRModal() {
  if (checkoutQRTimerInterval) {
    clearInterval(checkoutQRTimerInterval);
    checkoutQRTimerInterval = null;
  }
  closeModal('checkout-qr-modal');
}

/**
 * Stop/Delete Checkout QR
 */
function stopCheckoutQR() {
  if (!currentCheckoutEvent) return;

  const allCheckoutQR = JSON.parse(localStorage.getItem('vnuk_checkout_qr') || '{}');
  delete allCheckoutQR[currentCheckoutEvent.id];
  localStorage.setItem('vnuk_checkout_qr', JSON.stringify(allCheckoutQR));

  // Switch back to setup section
  const setupSection = document.getElementById('checkout-qr-setup-section');
  const displaySection = document.getElementById('checkout-qr-display-section');

  setupSection?.classList.remove('hidden');
  displaySection?.classList.add('hidden');

  if (checkoutQRTimerInterval) {
    clearInterval(checkoutQRTimerInterval);
    checkoutQRTimerInterval = null;
  }

  alert('Checkout QR cancelled');
}

/**
 * Setup Checkout QR Modal event listeners
 */
function setupCheckoutQRModalListeners() {
  // Close button
  document.getElementById('close-checkout-qr-modal-btn')?.addEventListener('click', closeCheckoutQRModal);
  document.getElementById('close-checkout-qr-btn')?.addEventListener('click', closeCheckoutQRModal);
  document.getElementById('checkout-qr-modal-overlay')?.addEventListener('click', closeCheckoutQRModal);

  // Create QR button
  document.getElementById('create-checkout-qr-modal-btn')?.addEventListener('click', createCheckoutQRWithTime);

  // Stop/Cancel QR button
  document.getElementById('stop-checkout-qr-modal-btn')?.addEventListener('click', stopCheckoutQR);
}