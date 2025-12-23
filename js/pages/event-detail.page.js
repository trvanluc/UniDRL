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

  if (!eventId) {
    console.error("Event ID not found in URL");
    alert("Event ID not found");
    window.location.href = "home.html";
    return;
  }

  // 3. Find event in data
  const event = EVENTS.find(e => e.id === eventId);

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
  
  // 5. Setup register modal (chỉ cho student)
  if (user.role === ROLES.STUDENT) {
    setupRegisterModal(event);
  }
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

    // Kiểm tra xem sinh viên đã đăng ký chưa
    // Tìm đăng ký bằng MSSV (user.studentId) hoặc email
    const registrations = getEventRegistrations(event.id);
    const userRegistration = registrations.find(reg => {
      // Tìm theo MSSV (ưu tiên) hoặc email
      return reg.mssv === user.studentId || reg.email === user.email || reg.mssv === user.email;
    });

    if (!userRegistration) {
      // Chưa đăng ký - hiển thị thông báo
      tabQrContent.innerHTML = `
        <div class="w-full h-full min-h-[500px] flex flex-col items-center justify-center py-8 px-4 md:px-8">
          <div class="text-center max-w-md">
            <div class="w-20 h-20 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center mx-auto mb-6">
              <span class="material-symbols-outlined text-4xl text-gray-400">confirmation_number</span>
            </div>
            <h2 class="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
              Bạn chưa đăng ký sự kiện này
            </h2>
            <p class="text-gray-600 dark:text-gray-400 mb-6">
              Vui lòng đăng ký để nhận mã QR Code và vé tham dự sự kiện.
            </p>
            <button id="register-from-ticket-btn" class="px-6 py-3 rounded-xl bg-primary hover:bg-[#2fd16d] text-black font-bold transition-all shadow-lg shadow-primary/25">
              Đăng Ký Ngay
            </button>
          </div>
        </div>
      `;

      // Event listener cho nút đăng ký từ tab ticket
      const registerFromTicketBtn = document.getElementById("register-from-ticket-btn");
      registerFromTicketBtn?.addEventListener("click", () => {
        openRegisterModal(event);
      });
    } else {
      // Đã đăng ký - hiển thị QR Code
      const qrCodeString = userRegistration.qrCode;
      const statusText = userRegistration.status === "checked-in" ? "Đã Check-in" : "Chưa Check-in";
      const statusColor = userRegistration.status === "checked-in" ? "text-green-500" : "text-yellow-500";

      tabQrContent.innerHTML = `
        <div class="w-full h-full min-h-[500px] flex flex-col py-8 px-4 md:px-8 relative animate-in fade-in zoom-in duration-300">
          <h2 class="text-2xl font-bold text-center mb-8 text-gray-900 dark:text-white">
            My Ticket – ${event.title}
          </h2>
          <div class="flex-grow flex flex-col items-center justify-center gap-8 pb-10">
            <div class="bg-white dark:bg-[#1c2621] p-8 rounded-3xl shadow-2xl shadow-primary/30 border-4 border-primary/50 ticket-qr active max-w-md w-full">
              <!-- Container để hiển thị QR Code -->
              <div id="qr-code-container" class="w-full flex items-center justify-center mb-4">
                <!-- QR Code sẽ được render vào đây bằng JavaScript -->
              </div>
              <div class="relative mt-4">
                <input 
                  id="student-ticket-id" 
                  class="w-full text-center text-xl font-mono text-gray-900 dark:text-white placeholder-gray-400 bg-gray-100 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-lg p-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent cursor-default" 
                  readonly 
                  type="text"
                  value="${qrCodeString}"
                />
              </div>
              <p class="text-center text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-widest mt-3">
                Mã QR Code
              </p>
              <div class="mt-4 text-center">
                <span class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${statusColor} bg-gray-100 dark:bg-white/10">
                  <span class="w-2 h-2 rounded-full ${userRegistration.status === "checked-in" ? "bg-green-500" : "bg-yellow-500"}"></span>
                  ${statusText}
                </span>
              </div>
            </div>
          </div>
        </div>
      `;

      // Render QR Code sau khi DOM đã được tạo - với retry logic
      let retryCount = 0;
      const maxRetries = 5;
      
      const tryRenderQR = () => {
        const qrCodeContainer = document.getElementById("qr-code-container");
        if (!qrCodeContainer) {
          retryCount++;
          if (retryCount < maxRetries) {
            setTimeout(tryRenderQR, 200);
            return;
          }
          console.error("Không tìm thấy container QR Code sau nhiều lần thử");
          return;
        }

        // Kiểm tra xem thư viện QRCode đã load chưa
        if (typeof QRCode === "undefined") {
          retryCount++;
          if (retryCount < maxRetries) {
            console.log(`Đang chờ thư viện QRCode load... (lần thử ${retryCount}/${maxRetries})`);
            setTimeout(tryRenderQR, 300);
            return;
          }
          console.error("Thư viện QRCode không load được sau nhiều lần thử");
          // Fallback: sử dụng API online
          const registrations = getEventRegistrations(event.id);
          const userReg = registrations.find(reg => {
            return reg.mssv === user.studentId || reg.email === user.email || reg.mssv === user.email;
          });
          if (userReg) {
            renderQRCodeFallback(userReg.qrCode, qrCodeContainer);
          }
          return;
        }

        // Render QR Code
        const qrCodeResult = renderQRCode(event, user);
        if (!qrCodeResult) {
          console.warn("Không thể render QR Code. Kiểm tra lại đăng ký.");
          // Thử fallback nếu không render được
          const registrations = getEventRegistrations(event.id);
          const userReg = registrations.find(reg => {
            return reg.mssv === user.studentId || reg.email === user.email || reg.mssv === user.email;
          });
          if (userReg && qrCodeContainer) {
            renderQRCodeFallback(userReg.qrCode, qrCodeContainer);
          }
        }
      };

      // Bắt đầu thử render sau 100ms
      setTimeout(tryRenderQR, 100);
    }

    // Event listeners for student actions
    setupStudentTicketActions();

  } else {
    // ===== ADMIN: Completion QR =====
    tabQrLabel.innerHTML = `
      <span class="material-symbols-outlined text-[18px]">qr_code_scanner</span>
      Completion QR
    `;

    const completionQRCode = `EVT-${event.id.toUpperCase()}-COMPLETION`;

    tabQrContent.innerHTML = `
      <div class="w-full h-full min-h-[500px] flex flex-col py-8 px-4 md:px-8 relative animate-in fade-in zoom-in duration-300">
        <h2 class="text-2xl font-bold text-center mb-8 text-gray-900 dark:text-white">
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
    // Kiểm tra xem sinh viên đã đăng ký chưa
    const registrations = getEventRegistrations(event.id);
    const isRegistered = registrations.some(reg => reg.mssv === (user.studentId || user.email));
    
    if (isRegistered) {
      // Đã đăng ký rồi
      actionsContainer.innerHTML = `
        <button disabled class="w-full h-12 bg-green-600 cursor-not-allowed text-white font-bold text-base rounded-full shadow-lg flex items-center justify-center gap-2">
          <span class="material-symbols-outlined">check_circle</span>
          <span>Đã Đăng Ký</span>
        </button>
        <p class="text-center text-xs text-gray-400 mt-3">
          Bạn đã đăng ký sự kiện này
        </p>
      `;
    } else {
      // Chưa đăng ký
      actionsContainer.innerHTML = `
        <button id="register-event-btn" class="w-full h-12 bg-primary hover:bg-[#2fd16d] text-black font-bold text-base rounded-full shadow-lg shadow-primary/25 transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 group">
          Đăng Ký Ngay
          <span class="material-symbols-outlined text-[20px] transition-transform group-hover:translate-x-1">arrow_forward</span>
        </button>
        <p class="text-center text-xs text-gray-400 mt-3">
          Đăng ký sẽ đóng sau 2 ngày
        </p>
      `;

      // Event listener cho nút đăng ký
      const registerBtn = document.getElementById("register-event-btn");
      registerBtn?.addEventListener("click", () => {
        openRegisterModal(event);
      });
    }

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
      alert(`Opening event editor for: ${event.title}`);
      // TODO: Redirect to edit page or open modal
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
    alert(` QR Code OPENED for: ${event.title}\n\nStudents can now scan to complete the event.`);
  });

  closeBtn?.addEventListener("click", () => {
    alert(` QR Code CLOSED for: ${event.title}\n\nNo more completions accepted.`);
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
    if (confirm("Regenerate QR code?\n\nOld QR will be invalid.")) {
      alert(`QR Code regenerated for: ${event.title}`);
      // TODO: Generate new QR code
    }
  });
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

/**
 * =========================
 * LOCALSTORAGE FUNCTIONS
 * Quản lý đăng ký sự kiện trong localStorage
 * =========================
 */

// Key để lưu trữ đăng ký trong localStorage
const STORAGE_KEY_REGISTRATIONS = "event_registrations";

/**
 * Lấy danh sách tất cả đăng ký từ localStorage
 */
function getAllRegistrations() {
  const data = localStorage.getItem(STORAGE_KEY_REGISTRATIONS);
  return data ? JSON.parse(data) : [];
}

/**
 * Lấy danh sách đăng ký cho một event cụ thể
 */
function getEventRegistrations(eventId) {
  const allRegistrations = getAllRegistrations();
  return allRegistrations.filter(reg => reg.eventId === eventId);
}

/**
 * Lưu đăng ký mới vào localStorage
 */
function saveRegistration(registration) {
  const allRegistrations = getAllRegistrations();
  allRegistrations.push(registration);
  localStorage.setItem(STORAGE_KEY_REGISTRATIONS, JSON.stringify(allRegistrations));
}

/**
 * Cập nhật đăng ký trong localStorage (dùng để check-in)
 */
function updateRegistration(mssv, eventId, updates) {
  const allRegistrations = getAllRegistrations();
  const index = allRegistrations.findIndex(reg => reg.mssv === mssv && reg.eventId === eventId);
  
  if (index !== -1) {
    allRegistrations[index] = { ...allRegistrations[index], ...updates };
    localStorage.setItem(STORAGE_KEY_REGISTRATIONS, JSON.stringify(allRegistrations));
    return allRegistrations[index];
  }
  return null;
}

/**
 * Tìm đăng ký theo MSSV và Event ID
 */
function findRegistration(mssv, eventId) {
  const allRegistrations = getAllRegistrations();
  return allRegistrations.find(reg => reg.mssv === mssv && reg.eventId === eventId);
}

/**
 * =========================
 * REGISTER MODAL FUNCTIONS
 * Xử lý popup đăng ký
 * =========================
 */

/**
 * Mở popup đăng ký
 */
function openRegisterModal(event) {
  const modal = document.getElementById("register-modal");
  if (!modal) return;

  // Kiểm tra event có đóng đăng ký không
  if (event.status === "closed") {
    alert("Sự kiện này đã đóng đăng ký");
    return;
  }

  // Kiểm tra còn chỗ không
  if (event.seats && event.seats.left === 0) {
    alert("Sự kiện đã hết chỗ");
    return;
  }

  // Hiển thị modal
  modal.classList.remove("hidden");
  modal.classList.add("flex");

  // Reset form
  const form = document.getElementById("register-form");
  if (form) {
    form.reset();
    // Ẩn tất cả thông báo lỗi
    document.querySelectorAll('[id^="error-"]').forEach(el => {
      el.classList.add("hidden");
    });
  }

  // Lưu event ID vào data attribute để dùng khi submit
  modal.setAttribute("data-event-id", event.id);
}

/**
 * Đóng popup đăng ký
 */
function closeRegisterModal() {
  const modal = document.getElementById("register-modal");
  if (modal) {
    modal.classList.add("hidden");
    modal.classList.remove("flex");
  }
}

/**
 * Xử lý submit form đăng ký
 */
function handleRegisterSubmit(event, formEvent) {
  formEvent.preventDefault();

  // Lấy các giá trị từ form
  const name = document.getElementById("register-name").value.trim();
  const classValue = document.getElementById("register-class").value.trim();
  const email = document.getElementById("register-email").value.trim();
  const mssv = document.getElementById("register-mssv").value.trim();

  // Validation
  let hasError = false;

  // Validate Họ tên
  if (!name) {
    showError("error-name", "Vui lòng nhập họ và tên");
    hasError = true;
  } else {
    hideError("error-name");
  }

  // Validate Lớp
  if (!classValue) {
    showError("error-class", "Vui lòng nhập lớp");
    hasError = true;
  } else {
    hideError("error-class");
  }

  // Validate Email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) {
    showError("error-email", "Vui lòng nhập email");
    hasError = true;
  } else if (!emailRegex.test(email)) {
    showError("error-email", "Email không hợp lệ");
    hasError = true;
  } else {
    hideError("error-email");
  }

  // Validate MSSV
  if (!mssv) {
    showError("error-mssv", "Vui lòng nhập MSSV");
    hasError = true;
  } else {
    hideError("error-mssv");
  }

  if (hasError) {
    return;
  }

  // Kiểm tra MSSV đã đăng ký chưa
  const existingRegistration = findRegistration(mssv, event.id);
  if (existingRegistration) {
    alert("MSSV này đã đăng ký cho sự kiện này rồi!");
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
    status: "pending", // Trạng thái ban đầu là pending
    registrationDate: new Date().toISOString(),
    checkInTime: null // Chưa check-in
  };

  // Lưu vào localStorage
  saveRegistration(registration);
  console.log("Đã lưu đăng ký:", registration);

  // Đóng popup
  closeRegisterModal();

  // Lưu MSSV vào user object TRƯỚC KHI render để đảm bảo tìm được đăng ký
  const user = Storage.getCurrentUser();
  if (user) {
    user.studentId = mssv; // Lưu MSSV vào user để tìm lại đăng ký
    Storage.setCurrentUser(user);
    console.log("Đã cập nhật user.studentId:", mssv);
    
    // Hiển thị thông báo thành công
    alert(`Đăng ký thành công!\n\nBạn sẽ nhận được ${event.points} DRL điểm sau khi hoàn thành sự kiện.`);
    
    // Render lại tab content và chuyển sang tab "My Ticket"
    // Đợi một chút để đảm bảo localStorage đã được cập nhật
    setTimeout(() => {
      renderTabContent(user, event);
      renderEventActions(user, event);
      
      // Tự động chuyển sang tab "My Ticket" sau khi render xong
      setTimeout(() => {
        const tabQrRadio = document.getElementById("tab-qr");
        if (tabQrRadio) {
          tabQrRadio.checked = true;
          // Trigger click event trên label để đảm bảo CSS được áp dụng
          const tabQrLabel = document.getElementById("tab-qr-label");
          if (tabQrLabel) {
            tabQrLabel.click();
          }
        }
      }, 500);
    }, 100);
  } else {
    // Nếu không có user, reload trang
    alert(`Đăng ký thành công!\n\nBạn sẽ nhận được ${event.points} DRL điểm sau khi hoàn thành sự kiện.`);
    window.location.reload();
  }
}

/**
 * Hiển thị thông báo lỗi
 */
function showError(errorId, message) {
  const errorEl = document.getElementById(errorId);
  if (errorEl) {
    errorEl.textContent = message;
    errorEl.classList.remove("hidden");
  }
}

/**
 * Ẩn thông báo lỗi
 */
function hideError(errorId) {
  const errorEl = document.getElementById(errorId);
  if (errorEl) {
    errorEl.classList.add("hidden");
  }
}

/**
 * =========================
 * SETUP REGISTER MODAL
 * Thiết lập event listeners cho popup đăng ký
 * =========================
 */
function setupRegisterModal(event) {
  const modal = document.getElementById("register-modal");
  if (!modal) return;

  const form = document.getElementById("register-form");
  const closeBtn = document.getElementById("close-register-modal-btn");
  const cancelBtn = document.getElementById("cancel-register-btn");
  const overlay = document.getElementById("register-modal-overlay");

  // Submit form
  form?.addEventListener("submit", (e) => {
    handleRegisterSubmit(event, e);
  });

  // Đóng khi click nút X
  closeBtn?.addEventListener("click", closeRegisterModal);

  // Đóng khi click nút Hủy
  cancelBtn?.addEventListener("click", closeRegisterModal);

  // Đóng khi click overlay
  overlay?.addEventListener("click", closeRegisterModal);
}

/**
 * =========================
 * RENDER QR CODE
 * Hiển thị QR Code trên tab My Ticket sau khi đăng ký
 * =========================
 */
function renderQRCode(event, user) {
  const registrations = getEventRegistrations(event.id);
  console.log("Tìm đăng ký cho event:", event.id);
  console.log("User info:", { studentId: user.studentId, email: user.email });
  console.log("Tất cả đăng ký:", registrations);
  
  // Tìm đăng ký bằng MSSV (user.studentId) hoặc email
  const userRegistration = registrations.find(reg => {
    const matchByMSSV = reg.mssv === user.studentId;
    const matchByEmail = reg.email === user.email;
    const matchByMSSVAsEmail = reg.mssv === user.email;
    
    if (matchByMSSV || matchByEmail || matchByMSSVAsEmail) {
      console.log("Tìm thấy đăng ký:", reg);
      return true;
    }
    return false;
  });

  if (!userRegistration) {
    // Chưa đăng ký
    console.error("Không tìm thấy đăng ký cho user:", user);
    console.error("Danh sách đăng ký hiện có:", registrations);
    console.error("Đang tìm với:", { 
      studentId: user.studentId, 
      email: user.email,
      eventId: event.id 
    });
    return null;
  }

  // Tạo QR Code bằng thư viện qrcode.js
  const qrCodeContainer = document.getElementById("qr-code-container");
  if (!qrCodeContainer) {
    console.error("Không tìm thấy container QR Code");
    return null;
  }

  // Xóa QR Code cũ nếu có
  qrCodeContainer.innerHTML = "";

  // Kiểm tra xem thư viện QRCode đã load chưa
  // Nếu chưa load, dùng API online ngay lập tức (nhanh hơn)
  if (typeof QRCode === "undefined") {
    console.log("Thư viện QRCode chưa load, sử dụng API online (nhanh hơn)");
    
    // Sử dụng API online - nhanh và không cần chờ thư viện
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(userRegistration.qrCode)}&bgcolor=ffffff&color=000000`;
    
    qrCodeContainer.innerHTML = `
      <div class="text-center p-4">
        <div class="mb-4">
          <img 
            src="${qrCodeUrl}" 
            alt="QR Code" 
            class="mx-auto border-2 border-gray-300 dark:border-gray-600 rounded-lg shadow-lg bg-white p-2"
            style="max-width: 300px; height: auto; display: block;"
            loading="eager"
            onload="console.log('QR Code đã tải thành công')"
            onerror="this.onerror=null; this.src='https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(userRegistration.qrCode)}'; console.error('Lỗi tải QR Code, đã thử lại')"
          />
        </div>
        <p class="text-xs text-gray-500 dark:text-gray-400 font-mono break-all mt-2">${userRegistration.qrCode}</p>
      </div>
    `;
    return userRegistration.qrCode;
  }

  // Tạo canvas để render QR Code
  const canvas = document.createElement("canvas");
  qrCodeContainer.appendChild(canvas);

  // Generate QR Code với cấu hình tối ưu
  QRCode.toCanvas(canvas, userRegistration.qrCode, {
    width: 300,
    margin: 2,
    color: {
      dark: "#000000",
      light: "#FFFFFF"
    },
    errorCorrectionLevel: 'M' // Mức độ sửa lỗi (Medium)
  }, (error) => {
    if (error) {
      console.error("Lỗi khi tạo QR Code:", error);
      qrCodeContainer.innerHTML = `
        <div class="text-center p-4">
          <p class="text-red-500 mb-2">Lỗi khi tạo QR Code</p>
          <p class="text-sm text-gray-500 font-mono">${userRegistration.qrCode}</p>
        </div>
      `;
    } else {
      console.log("QR Code đã được tạo thành công:", userRegistration.qrCode);
      // Thêm style cho canvas để responsive
      canvas.style.maxWidth = "100%";
      canvas.style.height = "auto";
    }
  });

  return userRegistration.qrCode;
}

/**
 * =========================
 * RENDER QR CODE FALLBACK
 * Sử dụng API online nếu thư viện không load được
 * =========================
 */
function renderQRCodeFallback(qrCodeString, container) {
  if (!container) return;
  
  container.innerHTML = `
    <div class="text-center p-4">
      <div class="mb-4">
        <img 
          src="https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrCodeString)}" 
          alt="QR Code" 
          class="mx-auto border-2 border-gray-300 dark:border-gray-600 rounded-lg shadow-lg"
          style="max-width: 300px; height: auto;"
          onerror="this.parentElement.innerHTML='<p class=\\'text-red-500 mb-2\\'>Không thể tạo QR Code</p><p class=\\'text-sm text-gray-500 font-mono break-all\\'>${qrCodeString}</p>'"
        />
      </div>
      <p class="text-xs text-gray-500 dark:text-gray-400 font-mono break-all mt-2">${qrCodeString}</p>
    </div>
  `;
}