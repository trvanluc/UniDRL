import { requireAuth } from "../guards/auth.guard.js";
import { ROLES, STORAGE_KEYS } from "../config/constants.js";
import { Theme } from "../utils/theme.js";
import { Storage } from "../utils/storage.js";
import { EVENTS } from "../data/events.data.js";
import { RegistrationService } from "../services/registration.service.js";
import { BadgeService } from "../services/badge.service.js";
import { renderTicketDesignForModal } from "../components/ticket/ticket.component.js";
import { openModal, closeModal, setupModalListeners } from "../components/modal/modal-manager.component.js";
import { setupSettingsDropdown, setupLogout, setupThemeToggle } from "../utils/ui-helpers.js";
import { Toast } from "../components/toast/toast.js";
import { Dialog } from "../components/dialog/dialog.js";

document.addEventListener("DOMContentLoaded", () => {
  const user = requireAuth();
  if (!user) return;

  if (user.role !== ROLES.STUDENT) {
    Toast.error('Access denied');
    setTimeout(() => { window.location.href = "../home.html"; }, 1500);
    return;
  }

  Theme.init();
  setupThemeToggle();
  setupSettingsDropdown();
  setupLogout();

  // Update avatar
  const avatar = document.getElementById("user-avatar-initial");
  if (avatar && user.name) {
    avatar.textContent = user.name.charAt(0).toUpperCase();
  }

  loadRegisteredTickets(user.studentId);

  setupTicketModal();
  setupCheckoutScanner(user);
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
  // Priority: Completed (checkout done) > Checked-in > Registered
  if (registration.status === "completed" || registration.checkoutTime) {
    return "Completed";
  }
  if (registration.status === "checked-in" || registration.checkInTime) {
    return "Checked-in";
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
    case "Checked-in":
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
    // Both Registered and Checked-in show Open Ticket
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

      // Check if this is a "View History" button (status = Completed)
      const buttonText = button.querySelector('span')?.textContent?.trim();
      if (buttonText === 'View History') {
        // Redirect to my-journey page
        window.location.href = 'my-journey.html';
        return;
      }

      // Otherwise open the ticket modal
      openTicketModal(eventId);
    }
  });

  setupModalListeners("qr-ticket-modal", "close-qr-ticket-modal-btn", "qr-ticket-modal-overlay");

  // Setup checkout success modal listener - Reload on close to update UI
  const closeSuccessBtn = document.getElementById('close-success-modal-btn');
  if (closeSuccessBtn) {
    closeSuccessBtn.addEventListener('click', () => {
      closeModal('checkout-success-modal');
      window.location.reload();
    });
  }
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
  const statusText = userRegistration.status === 'checked-in' ? 'Checked In' : 'Not Checked In';
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
              <p class="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wide font-bold">Date & Time</p>
              <p class="text-xs font-bold text-gray-900 dark:text-white leading-tight">${event.date}</p>
              <p class="text-[10px] text-gray-600 dark:text-gray-300">${event.time}</p>
            </div>
          </div>

          <div class="flex items-start gap-1.5">
            <span class="material-symbols-outlined text-primary text-base mt-0.5">location_on</span>
            <div class="flex-1 min-w-0">
              <p class="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wide font-bold">Location</p>
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
            <p class="text-[9px] text-gray-500 dark:text-gray-400 uppercase font-bold mb-0.5">Full Name</p>
            <p class="text-xs font-bold text-gray-900 dark:text-white truncate">${userRegistration.name}</p>
          </div>
          <div>
            <p class="text-[9px] text-gray-500 dark:text-gray-400 uppercase font-bold mb-0.5">MSSV</p>
            <p class="text-xs font-bold text-gray-900 dark:text-white font-mono">${userRegistration.mssv}</p>
          </div>
          <div>
            <p class="text-[9px] text-gray-500 dark:text-gray-400 uppercase font-bold mb-0.5">Class</p>
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

// ================================
// CHECKOUT QR SCANNER FUNCTIONS
// ================================

let checkoutScanner = null;
let isCheckoutScanning = false;
let currentUser = null;
let currentCheckoutEvent = null;
let currentQAPairs = [];
let currentBadgeRules = null;

/**
 * Setup checkout scanner and all related event listeners
 */
function setupCheckoutScanner(user) {
  currentUser = user;

  // Open scanner button
  document.getElementById('scan-checkout-btn')?.addEventListener('click', openCheckoutScanner);

  // Close scanner button
  document.getElementById('close-checkout-scanner-btn')?.addEventListener('click', closeCheckoutScanner);
  document.getElementById('checkout-scanner-modal-overlay')?.addEventListener('click', closeCheckoutScanner);

  // Start/Stop scanner buttons
  document.getElementById('start-checkout-scanner-btn')?.addEventListener('click', startCheckoutScanning);
  document.getElementById('stop-checkout-scanner-btn')?.addEventListener('click', stopCheckoutScanning);

  // Q&A submit button
  document.getElementById('submit-qa-btn')?.addEventListener('click', submitQAAnswers);

  // Success modal close button
  document.getElementById('close-success-modal-btn')?.addEventListener('click', () => {
    closeModal('checkout-success-modal');
    // Reload tickets to show updated status
    if (currentUser) {
      loadRegisteredTickets(currentUser.studentId || currentUser.email);
    }
  });
}

/**
 * Open the checkout scanner modal
 */
function openCheckoutScanner() {
  openModal('checkout-scanner-modal');
}

/**
 * Close the checkout scanner modal
 */
function closeCheckoutScanner() {
  stopCheckoutScanning();
  closeModal('checkout-scanner-modal');
}

/**
 * Start QR code scanning
 */
function startCheckoutScanning() {
  if (isCheckoutScanning) return;

  if (typeof Html5Qrcode === 'undefined') {
    alert('QR library not loaded. Please reload the page.');
    return;
  }

  const qrReader = document.getElementById('checkout-qr-reader');
  if (!qrReader) return;

  qrReader.innerHTML = '';

  try {
    checkoutScanner = new Html5Qrcode('checkout-qr-reader');

    checkoutScanner.start(
      { facingMode: 'environment' },
      { fps: 10, qrbox: { width: 250, height: 250 } },
      (decodedText) => {
        // QR code scanned successfully
        stopCheckoutScanning();
        handleCheckoutQRScanned(decodedText);
      },
      (errorMessage) => {
        // Ignore scan errors
      }
    ).then(() => {
      isCheckoutScanning = true;
      document.getElementById('start-checkout-scanner-btn')?.classList.add('hidden');
      document.getElementById('stop-checkout-scanner-btn')?.classList.remove('hidden');
    }).catch((err) => {
      alert('Cannot start camera. Please grant camera permission.');
      console.error('Camera error:', err);
    });
  } catch (error) {
    alert('Scanner initialization error.');
    console.error('Scanner error:', error);
  }
}

/**
 * Stop QR code scanning
 */
function stopCheckoutScanning() {
  if (!isCheckoutScanning || !checkoutScanner) return;

  checkoutScanner.stop().then(() => {
    checkoutScanner.clear();
    isCheckoutScanning = false;
    document.getElementById('start-checkout-scanner-btn')?.classList.remove('hidden');
    document.getElementById('stop-checkout-scanner-btn')?.classList.add('hidden');
  }).catch((err) => {
    console.error('Error stopping scanner:', err);
    isCheckoutScanning = false;
  });
}

/**
 * Handle scanned checkout QR code
 */
function handleCheckoutQRScanned(qrCode) {
  console.log('🔥 [1] Scanned QR:', qrCode);

  // Verify QR code format
  if (!qrCode || !qrCode.startsWith('CHECKOUT_')) {
    console.log('❌ [2] Invalid QR format');
    Toast.error('Invalid QR code. Please scan the Checkout QR from your instructor.');
    return;
  }
  console.log('✅ [2] QR format valid');

  // Get checkout QR data from localStorage
  const allCheckoutQR = JSON.parse(localStorage.getItem('vnuk_checkout_qr') || '{}');
  console.log('📦 [3] All Checkout QR in storage:', allCheckoutQR);

  // Parse QR code to get eventId
  const parts = qrCode.split('_');
  const eventId = parts.slice(1, -1).join('_'); // CHECKOUT_eventId_timestamp
  console.log('🔑 [4] Parsed eventId:', eventId);

  const storedQR = allCheckoutQR[eventId];
  console.log('📋 [5] Stored QR for this event:', storedQR);

  if (!storedQR || storedQR.qrCode !== qrCode) {
    console.log('❌ [6] QR mismatch - storedQR:', storedQR?.qrCode, 'vs scanned:', qrCode);
    Toast.error('QR code does not match or does not exist.');
    return;
  }
  console.log('✅ [6] QR matches');

  // Check expiration
  if (new Date() > new Date(storedQR.expiresAt)) {
    console.log('❌ [7] QR expired at:', storedQR.expiresAt);
    Toast.warning('QR code has expired. Please contact your instructor.');
    return;
  }
  console.log('✅ [7] QR not expired');

  // Check if student registered for this event
  const studentId = currentUser?.studentId || currentUser?.email;
  console.log('👤 [8] Current user studentId:', studentId);

  const registration = RegistrationService.findByMSSVAndEventId(studentId, eventId);
  console.log('📝 [9] Registration found:', registration);

  if (!registration) {
    console.log('❌ [10] Not registered');
    Toast.error('You have not registered for this event.');
    return;
  }
  console.log('✅ [10] User is registered');

  // Check if already checked in
  console.log('📌 [11] Registration status:', registration.status, 'checkInTime:', registration.checkInTime);
  if (registration.status !== 'checked-in' && !registration.checkInTime) {
    console.log('❌ [12] Not checked in yet');
    Toast.warning('You need to check-in before checkout.');
    return;
  }
  console.log('✅ [12] User is checked in');

  // Check if already checked out
  if (registration.status === 'completed' || registration.checkoutTime) {
    console.log('❌ [13] Already checked out');
    Toast.info('You have already checked out of this event.');
    return;
  }
  console.log('✅ [13] Not checked out yet');

  // Get event and badge config
  const event = BadgeService.getById(eventId);
  console.log('🎯 [14] Event from BadgeService:', event);

  if (!event) {
    console.log('❌ [15] Event not found');
    Toast.error('Event information not found.');
    return;
  }
  console.log('✅ [15] Event found, badgeConfig:', event.badgeConfig);

  // Close scanner modal - wrap in try-catch to ensure flow continues
  try {
    closeCheckoutScanner();
    console.log('✅ [16] Scanner modal closed');
  } catch (err) {
    console.error('⚠️ [16] Error closing scanner (continuing anyway):', err);
  }

  // Check if badge Q&A is enabled
  console.log('🎖️ [17] Checking badge config - isClaimable:', event.badgeConfig?.isClaimable, 'qa_pairs:', event.badgeConfig?.qa_pairs);

  try {
    if (event.badgeConfig && event.badgeConfig.isClaimable && event.badgeConfig.qa_pairs?.length > 0) {
      // Show Q&A quiz
      console.log('🎉 [18] Showing Q&A quiz with', event.badgeConfig.qa_pairs.length, 'questions');
      currentCheckoutEvent = event;
      currentQAPairs = event.badgeConfig.qa_pairs;
      currentBadgeRules = event.badgeConfig.rules;
      showQAQuiz(event);
    } else {
      // No Q&A, just complete checkout
      console.log('⏭️ [18] No Q&A configured, completing checkout directly');
      completeCheckoutProcess(eventId, null, 0);
    }
  } catch (err) {
    console.error('❌ [19] Error showing Q&A or completing checkout:', err);
    Toast.error('An error occurred: ' + err.message);
  }
}

/**
 * Show Q&A quiz modal
 */
function showQAQuiz(event) {
  const container = document.getElementById('qa-questions-container');
  const titleEl = document.getElementById('qa-event-title');

  if (titleEl) titleEl.textContent = event.title;

  if (container && currentQAPairs.length > 0) {
    container.innerHTML = currentQAPairs.map((qa, index) => `
      <div class="bg-surface-dark rounded-xl p-4 border border-[#29382f]">
        <p class="text-white font-medium mb-3">
          <span class="text-primary font-bold">Question ${index + 1}:</span> ${qa.q}
        </p>
        <input 
          type="text" 
          class="qa-answer w-full px-4 py-3 rounded-xl bg-[#112117] border border-[#29382f] text-white placeholder-gray-500 focus:border-primary focus:outline-none"
          data-index="${index}"
          placeholder="Enter your answer..."
        />
      </div>
    `).join('');
  }

  openModal('qa-quiz-modal');
}

/**
 * Submit Q&A answers and calculate badge
 */
function submitQAAnswers() {
  const answerInputs = document.querySelectorAll('.qa-answer');
  let correctCount = 0;

  answerInputs.forEach((input, index) => {
    const userAnswer = input.value.trim().toLowerCase();
    const correctAnswer = currentQAPairs[index]?.a?.toLowerCase();

    if (userAnswer === correctAnswer) {
      correctCount++;
      input.classList.add('border-green-500');
    } else {
      input.classList.add('border-red-500');
    }
  });

  // Calculate badge
  const badge = calculateBadge(correctCount, currentBadgeRules);

  // Close Q&A modal
  closeModal('qa-quiz-modal');

  // Complete checkout
  completeCheckoutProcess(currentCheckoutEvent.id, badge, correctCount);
}

/**
 * Calculate badge based on correct answers
 */
function calculateBadge(correctAnswers, rules) {
  if (!rules) return null;

  if (correctAnswers >= rules.gold) {
    return 'gold';
  } else if (correctAnswers >= rules.silver) {
    return 'silver';
  } else if (correctAnswers >= rules.bronze) {
    return 'bronze';
  }

  return null;
}

/**
 * Complete the checkout process
 */
function completeCheckoutProcess(eventId, badge, correctAnswers) {
  const studentId = currentUser?.studentId || currentUser?.email;
  const checkoutTime = new Date().toISOString();

  // Update registration in localStorage
  const allRegistrations = RegistrationService.getAll();
  const index = allRegistrations.findIndex(r => r.mssv === studentId && r.eventId === eventId);

  if (index !== -1) {
    allRegistrations[index] = {
      ...allRegistrations[index],
      status: 'completed',
      checkoutTime: checkoutTime,
      badgeEarned: badge,
      correctAnswers: correctAnswers
    };
    localStorage.setItem(STORAGE_KEYS.REGISTRATIONS, JSON.stringify(allRegistrations));
  }

  // Show success modal
  showCheckoutSuccess(badge, correctAnswers);
}

/**
 * Show checkout success modal
 */
function showCheckoutSuccess(badge, correctAnswers) {
  const messageEl = document.getElementById('success-message');
  const badgeDisplay = document.getElementById('success-badge-display');
  const badgeNameEl = document.getElementById('success-badge-name');

  if (badge) {
    const badgeNames = {
      gold: '🥇 Gold Badge',
      silver: '🥈 Silver Badge',
      bronze: '🥉 Bronze Badge'
    };
    const badgeColors = {
      gold: 'bg-yellow-500/20 border-yellow-500/30 text-yellow-500',
      silver: 'bg-gray-400/20 border-gray-400/30 text-gray-400',
      bronze: 'bg-orange-500/20 border-orange-500/30 text-orange-500'
    };

    if (messageEl) messageEl.textContent = `You answered ${correctAnswers} questions correctly and earned:`;
    if (badgeNameEl) badgeNameEl.textContent = badgeNames[badge] || badge;
    if (badgeDisplay) {
      badgeDisplay.className = `inline-flex items-center gap-2 px-4 py-2 rounded-full ${badgeColors[badge] || 'bg-primary/20 border-primary/30 text-primary'} mb-6`;
      badgeDisplay.classList.remove('hidden');
    }
  } else {
    if (messageEl) messageEl.textContent = 'Checkout successful! Thank you for participating.';
    if (badgeDisplay) badgeDisplay.classList.add('hidden');
  }

  openModal('checkout-success-modal');
}