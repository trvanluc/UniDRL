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
        <div class="absolute top-3 left-3">
          <span class="bg-black/60 backdrop-blur text-primary text-[10px] font-bold px-2 py-1 rounded-full border border-primary/20">+${event.points} DRL</span>
        </div>
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

function closeTicketModal() {
  closeModal("qr-ticket-modal");
}