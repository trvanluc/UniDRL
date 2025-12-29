import { requireAuth } from "../guards/auth.guard.js";
import { ROLES } from "../config/constants.js";
import { Theme } from "../utils/theme.js";
import { Storage } from "../utils/storage.js";
import { EVENTS } from "../data/events.data.js";
import { RegistrationService } from "../services/registration.service.js";
import { renderTicketDesignForModal } from "../components/ticket/ticket.component.js";
import { openModal, closeModal, setupModalListeners } from "../components/modal/modal-manager.component.js";
import { setupSettingsDropdown, setupLogout, setupThemeToggle } from "../utils/ui-helpers.js";

document.addEventListener("DOMContentLoaded", () => {
  const user = requireAuth();
  if (!user) return;

  if (user.role !== ROLES.STUDENT) {
    alert("Access denied");
    window.location.href = "../home.html";
    return;
  }

  Theme.init();
  setupThemeToggle();
  setupSettingsDropdown();
  setupLogout();

  loadRegisteredTickets(user.studentId);

  setupTicketModal();
});

function loadRegisteredTickets(mssv) {
  const registrations = RegistrationService.getByStudentId(mssv);
  const registeredEvents = getRegisteredEvents(registrations);

  renderTickets(registeredEvents, registrations);
}

function getRegisteredEvents(registrations) {
  const eventMap = new Map();

  registrations.forEach(reg => {
    const event = EVENTS.find(e => e.id === reg.eventId);
    if (event) {
      eventMap.set(reg.eventId, { ...event, registration: reg });
    }
  });

  return Array.from(eventMap.values());
}

function renderTickets(events, registrations) {
  const grid = document.getElementById("tickets-grid");
  if (!grid) return;

  if (events.length === 0) {
    grid.innerHTML = `
      <div class="col-span-full text-center py-12">
        <div class="text-gray-400 mb-4">
          <span class="material-symbols-outlined text-6xl">confirmation_number</span>
        </div>
        <h3 class="text-xl font-bold text-gray-300 mb-2">No tickets yet</h3>
        <p class="text-gray-500 mb-6">You haven't registered for any events yet.</p>
        <a href="../home.html" class="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-background-dark font-bold rounded-full transition-colors">
          <span>Browse Events</span>
          <span class="material-symbols-outlined text-[18px]">arrow_forward</span>
        </a>
      </div>
    `;
    return;
  }

  grid.innerHTML = events.map(event => createTicketCard(event)).join("");
}

function createTicketCard(event) {
  const status = getEventStatus(event.registration);
  const statusColor = getStatusColor(status);
  const buttonConfig = getButtonConfig(event, status);

  return `
    <div class="bg-card-dark rounded-2xl border border-[#29382f] overflow-hidden flex flex-col hover:border-primary/50 transition-colors group">
      <div class="h-36 bg-cover bg-center relative" style="background-image: url('${event.image}');">
        <div class="absolute inset-0 bg-gradient-to-t from-card-dark to-transparent opacity-90"></div>
        <div class="absolute bottom-3 left-4 right-4">
          <p class="text-primary text-[10px] font-bold uppercase tracking-wider mb-1">${event.category}</p>
          <h3 class="text-white text-lg font-bold leading-tight line-clamp-2">${event.title}</h3>
        </div>
      </div>

      <div class="p-5 flex flex-col flex-1">
        <div class="flex justify-between items-start mb-4">
          <div class="flex flex-col gap-1">
            <span class="flex items-center gap-1.5 text-xs text-gray-300">
              <span class="material-symbols-outlined text-[16px] text-primary">calendar_today</span>
              ${event.date} • ${event.time}
            </span>
            <span class="flex items-center gap-1.5 text-xs text-gray-300">
              <span class="material-symbols-outlined text-[16px] text-primary">location_on</span>
              ${event.location}
            </span>
          </div>
          <span class="inline-flex items-center gap-1 text-[10px] font-bold ${statusColor.text} ${statusColor.bg} px-2 py-0.5 rounded-full border ${statusColor.border}">
            ${status}
          </span>
        </div>

        <div class="mt-auto pt-4 border-t border-[#29382f]">
          <button data-event-id="${event.id}" class="open-ticket-btn flex items-center justify-center gap-2 w-full h-10 rounded-xl ${buttonConfig.classes} text-sm font-bold transition-all shadow-lg hover:shadow-primary/25">
            <span>${buttonConfig.text}</span>
            <span class="material-symbols-outlined text-[18px]">${buttonConfig.icon}</span>
          </button>
        </div>
      </div>
    </div>
  `;
}

function getEventStatus(registration) {
  if (registration.status === "checked-in" || registration.checkInTime) {
    return "Completed";
  }
  return "Registered";
}

function getStatusColor(status) {
  switch (status) {
    case "Completed":
      return {
        text: "text-green-500",
        bg: "bg-green-500/10",
        border: "border-green-500/20"
      };
    case "Registered":
    default:
      return {
        text: "text-yellow-500",
        bg: "bg-yellow-500/10",
        border: "border-yellow-500/20"
      };
  }
}

function getButtonConfig(event, status) {
  if (status === "Completed") {
    return {
      text: "View History",
      icon: "history",
      classes: "border border-[#29382f] text-gray-400 hover:text-white hover:bg-[#29382f]"
    };
  } else {
    return {
      text: "Open Ticket",
      icon: "confirmation_number",
      classes: "bg-[#29382f] hover:bg-primary hover:text-background-dark text-white"
    };
  }
}

function setupTicketModal() {
  document.addEventListener('click', (e) => {
    if (e.target.closest('.open-ticket-btn')) {
      e.preventDefault();
      const button = e.target.closest('.open-ticket-btn');
      const eventId = button.getAttribute('data-event-id');
      openTicketModal(eventId);
    }
  });

  setupModalListeners("qr-ticket-modal", "close-qr-ticket-modal-btn", "qr-ticket-modal-overlay");
}

function openTicketModal(eventId) {
  const user = Storage.getCurrentUser();
  if (!user) return;

  const registrations = RegistrationService.getByStudentId(user.studentId || user.email);
  const registration = registrations.find(reg => reg.eventId === eventId);

  if (!registration) {
    alert('Registration not found for this event.');
    return;
  }

  const event = EVENTS.find(e => e.id === eventId);
  if (!event) {
    alert('Event details not found.');
    return;
  }

  openModal("qr-ticket-modal");

  const modalContent = document.getElementById('qr-ticket-modal-content');
  if (modalContent) {
    modalContent.innerHTML = `<div id="modal-ticket-container"></div>`;

    setTimeout(() => {
      renderTicketDesignForModal(event, registration, "modal-ticket-container");
    }, 50);
  }
}

/**
 * Render ticket design for modal
 */
function renderTicketForModal(event, userRegistration) {
  const modalContent = document.getElementById('qr-ticket-modal-content');
  if (!modalContent) return;

  const qrCodeString = userRegistration.qrCode;
  const statusText = userRegistration.status === 'checked-in' ? 'Đã Check-in' : 'Chưa Check-in';
  const statusColor = userRegistration.status === 'checked-in' ? 'bg-green-500' : 'bg-yellow-500';
  const statusTextColor = userRegistration.status === 'checked-in' ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400';

  // Format registration date
  const registrationDate = new Date(userRegistration.registrationDate);
  const formattedRegDate = registrationDate.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
  const formattedRegTime = registrationDate.toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit'
  });

  modalContent.innerHTML = `
    <div class="bg-white dark:bg-[#1c2621] rounded-2xl shadow-2xl shadow-primary/30 border-4 border-primary/50 ticket-qr active w-full origin-center animate-scale-in-modal" style="padding: 16px;">
      <!-- Header với logo VN-UK -->
      <div class="bg-gradient-to-r from-primary to-[#2fd16d] p-3 text-center">
        <div class="flex items-center justify-center gap-2 mb-0.5">
          <div class="w-8 h-8 rounded-full bg-background-dark flex items-center justify-center">
            <span class="material-symbols-outlined text-primary text-lg">school</span>
          </div>
          <h2 class="text-lg font-black text-background-dark">VN-UK</h2>
        </div>
        <p class="text-[10px] font-bold text-background-dark/80">EVENT TICKET</p>
      </div>

      <!-- Thông tin sự kiện -->
      <div class="p-3 space-y-2 border-b-2 border-dashed border-gray-200 dark:border-gray-600">
        <div class="text-center">
          <h3 class="text-base font-bold text-gray-900 dark:text-white mb-1 line-clamp-2">${event.title}</h3>
          <span class="inline-flex items-center px-2 py-0.5 rounded-full bg-primary/20 text-primary text-[10px] font-bold border border-primary/30">
            ${event.category}
          </span>
        </div>

        <div class="grid grid-cols-2 gap-2 mt-2">
          <div class="flex items-start gap-1.5">
            <span class="material-symbols-outlined text-primary text-base mt-0.5">calendar_month</span>
            <div class="flex-1 min-w-0">
              <p class="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wide font-bold">Ngày & Giờ</p>
              <p class="text-xs font-bold text-gray-900 dark:text-white leading-tight">${event.date}</p>
              <p class="text-[10px] text-gray-600 dark:text-gray-300">${event.time}</p>
            </div>
          </div>

          <div class="flex items-start gap-1.5">
            <span class="material-symbols-outlined text-primary text-base mt-0.5">location_on</span>
            <div class="flex-1 min-w-0">
              <p class="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wide font-bold">Địa điểm</p>
              <p class="text-xs font-bold text-gray-900 dark:text-white leading-tight">${event.location}</p>
              <p class="text-[10px] text-gray-600 dark:text-gray-300">${event.room || 'N/A'}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Thông tin người tham gia - Compact -->
      <div class="px-3 py-2 border-b-2 border-dashed border-gray-200 dark:border-gray-600 bg-gray-50/50 dark:bg-black/20">
        <div class="grid grid-cols-3 gap-2 text-center">
          <div>
            <p class="text-[9px] text-gray-500 dark:text-gray-400 uppercase font-bold mb-0.5">Họ tên</p>
            <p class="text-xs font-bold text-gray-900 dark:text-white truncate">${userRegistration.name}</p>
          </div>
          <div>
            <p class="text-[9px] text-gray-500 dark:text-gray-400 uppercase font-bold mb-0.5">MSSV</p>
            <p class="text-xs font-bold text-gray-900 dark:text-white font-mono">${userRegistration.mssv}</p>
          </div>
          <div>
            <p class="text-[9px] text-gray-500 dark:text-gray-400 uppercase font-bold mb-0.5">Lớp</p>
            <p class="text-xs font-bold text-gray-900 dark:text-white">${userRegistration.class}</p>
          </div>
        </div>
      </div>

      <!-- QR Code Section -->
      <div class="p-3">
        <div id="modal-ticket-qr-code" class="w-full flex items-center justify-center mb-2 bg-white p-2 rounded-xl">
          <!-- QR Code sẽ được render vào đây -->
        </div>
        <div class="text-center mb-1.5">
          <input 
            class="w-full text-center text-[10px] font-mono text-gray-900 dark:text-white bg-gray-100 dark:bg-black/30 border border-gray-200 dark:border-white/10 rounded-lg p-1 shadow-sm focus:outline-none cursor-default" 
            readonly 
            type="text"
            value="${qrCodeString}"
          />
          <p class="text-[9px] text-gray-500 dark:text-gray-400 font-medium uppercase tracking-widest mt-1">
            Ticket ID
          </p>
        </div>
      </div>

      <!-- Footer với thông tin bổ sung -->
      <div class="px-3 py-2 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-black/30 dark:to-black/40 border-t-2 border-dashed border-gray-200 dark:border-gray-600">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-1">
            <span class="w-2 h-2 rounded-full ${statusColor}"></span>
            <span class="text-[10px] font-bold ${statusTextColor}">${statusText}</span>
          </div>
        </div>
      </div>
    </div>
  `;

  // Render QR Code
  const qrCodeContainer = document.getElementById('modal-ticket-qr-code');
  if (qrCodeContainer) {
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(qrCodeString)}&bgcolor=ffffff&color=000000&margin=1`;
    qrCodeContainer.innerHTML = `
      <img 
        src="${qrCodeUrl}" 
        alt="QR Code" 
        class="w-full max-w-[180px] h-auto"
        loading="eager"
      />
    `;
  }
}

function closeTicketModal() {
  closeModal("qr-ticket-modal");
}