// js/components/ticket/ticket.component.js
import { renderTicketHeader } from "./ticket-header.component.js";
import { renderTicketInfo } from "./ticket-info.component.js";
import { renderTicketStudent } from "./ticket-student.component.js";
import { renderTicketQR } from "./ticket-qr.component.js";
import { renderTicketFooter } from "./ticket-footer.component.js";
import { formatDate } from "../../utils/helpers.js";

/**
 * Renders complete ticket design with QR code
 * @param {Object} event - Event object with title, date, location
 * @param {Object} userRegistration - User registration data
 * @param {string} containerId - DOM container ID
 * @param {boolean} isModal - Whether rendering in modal (smaller scale)
 * @returns {void}
 * @example
 * renderTicketDesign(event, registration, "ticket-container", false);
 */
export function renderTicketDesign(event, userRegistration, containerId, isModal = false) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const qrCodeString = userRegistration.qrCode;
  const statusText = userRegistration.status === "checked-in" ? "Đã Check-in" : "Chưa Check-in";
  const statusColor = userRegistration.status === "checked-in" ? "bg-green-500" : "bg-yellow-500";
  const statusTextColor = userRegistration.status === "checked-in" ? "text-green-600 dark:text-green-400" : "text-yellow-600 dark:text-yellow-400";
  // Format registration date
  const registrationDate = new Date(userRegistration.registrationDate);
  const formattedRegDate = formatDate(registrationDate); // Sử dụng helper
  const scaleClass = isModal ? "scale-90" : ""; // Scale nhỏ cho modal
  container.innerHTML = `
    <div class="bg-white dark:bg-[#1c2621] rounded-2xl shadow-2xl shadow-primary/30 border-4 border-primary/50 ticket-qr active max-w-md w-full overflow-hidden animate-scale-in ${scaleClass}">
      ${renderTicketHeader()}
      ${renderTicketInfo(event)}
      ${renderTicketStudent(userRegistration)}
      ${renderTicketQR(qrCodeString, isModal)}
      ${renderTicketFooter(statusText, statusColor, statusTextColor, event.points, formattedRegDate)}
    </div>
  `;
}

/**
 * Renders ticket for modal view
 * @param {Object} event - Event data
 * @param {Object} userRegistration - Registration data
 * @param {string} containerId - Container ID
 * @returns {void}
 */
export function renderTicketDesignForModal(event, userRegistration, containerId) {
  renderTicketDesign(event, userRegistration, containerId, true);
}