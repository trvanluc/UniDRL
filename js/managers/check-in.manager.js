// js/managers/check-in.manager.js
import { EVENTS } from "../data/events.data.js";
import { QR_SCANNER_CONFIG } from "../config/constants.js";
import { RegistrationService } from "../services/registration.service.js";
import { Storage } from "../utils/storage.js";

let html5QrCode = null;
let isScanning = false;
let selectedEventId = null;

function getAllRegistrations() {
  return RegistrationService.getAll();
}

function findRegistrationByQRCode(qrCode) {
  return RegistrationService.findByQRCode(qrCode);
}

function updateRegistrationStatus(registration, status) {
  RegistrationService.updateByQRCode(registration.qrCode, { status });
}

function handleQRCodeScanned(decodedText, decodedResult) {
  // Handle the scanned QR code
  const registration = findRegistrationByQRCode(decodedText);
  if (registration) {
    updateRegistrationStatus(registration, 'checked-in');
    showStudentInfo(registration);
    showNotification('Check-in successful!', 'success');
  } else {
    showNotification('Invalid QR code', 'error');
  }
}

function showStudentInfo(registration) {
  // Update UI with student info
  const card = document.getElementById('student-info-card');
  if (card) {
    card.innerHTML = `
      <div class="flex flex-col items-center text-center">
        <div class="w-24 h-24 rounded-full bg-gray-200 mb-4"></div>
        <h3 class="text-xl font-bold">${registration.name}</h3>
        <p class="text-gray-500">${registration.mssv}</p>
        <p class="text-green-500 font-bold mt-2">Checked In</p>
      </div>
    `;
  }
}

function showNotification(message, type) {
  // Show toast notification
  console.log(`${type}: ${message}`);
}

function startScanner() {
  if (isScanning) return;
  html5QrCode = new Html5Qrcode("qr-reader");
  const config = {
    fps: QR_SCANNER_CONFIG.FPS,
    qrbox: { width: QR_SCANNER_CONFIG.QR_BOX_SIZE, height: QR_SCANNER_CONFIG.QR_BOX_SIZE },
    aspectRatio: QR_SCANNER_CONFIG.ASPECT_RATIO
  };
  html5QrCode.start({ facingMode: "environment" }, config, handleQRCodeScanned)
    .then(() => {
      isScanning = true;
      document.getElementById('start-scanner-btn').classList.add('hidden');
      document.getElementById('stop-scanner-btn').classList.remove('hidden');
    })
    .catch((err) => {
      console.error("Unable to start scanning", err);
    });
}

function stopScanner() {
  if (!isScanning) return;
  html5QrCode.stop()
    .then(() => {
      isScanning = false;
      document.getElementById('start-scanner-btn').classList.remove('hidden');
      document.getElementById('stop-scanner-btn').classList.add('hidden');
    })
    .catch((err) => {
      console.error("Unable to stop scanning", err);
    });
}

function handleManualCheckIn() {
  const code = document.getElementById('ticket-code').value.trim();
  if (!code) {
    showNotification('Please enter a code', 'error');
    return;
  }
  const registration = findRegistrationByQRCode(code);
  if (registration) {
    updateRegistrationStatus(registration, 'checked-in');
    showStudentInfo(registration);
    showNotification('Manual check-in successful!', 'success');
  } else {
    showNotification('Invalid code', 'error');
  }
  document.getElementById('ticket-code').value = '';
}

function loadEventsToDropdown() {
  const select = document.getElementById('event-select');
  if (!select) return;
  select.innerHTML = '<option value="">Select an event...</option>';
  EVENTS.forEach(event => {
    const option = document.createElement('option');
    option.value = event.id;
    option.textContent = event.title;
    select.appendChild(option);
  });
}

function handleEventSelect(eventId) {
  selectedEventId = eventId;
  const event = EVENTS.find(e => e.id === eventId);
  if (event) {
    document.getElementById('selected-event-info').classList.remove('hidden');
    document.getElementById('selected-event-name').textContent = event.title;
  }
  updateRecentCheckIns();
}

function updateRecentCheckIns() {
  const tableBody = document.querySelector('#recent-checkins-table tbody');
  if (!tableBody) return;
  tableBody.innerHTML = '';
  // Mock data for recent check-ins
  const mockCheckIns = [
    { mssv: '20230001', name: 'Nguyen Van A', time: '10:30 AM', status: 'Checked-in' },
    { mssv: '20230002', name: 'Tran Thi B', time: '10:25 AM', status: 'Checked-in' }
  ];
  mockCheckIns.forEach(checkIn => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td class="py-3 px-2 font-mono text-sm">${checkIn.mssv}</td>
      <td class="py-3 px-2 text-sm">${checkIn.name}</td>
      <td class="py-3 px-2 text-sm text-gray-500">${checkIn.time}</td>
      <td class="py-3 px-2 text-right"><span class="text-green-500">${checkIn.status}</span></td>
    `;
    tableBody.appendChild(row);
  });
}

function switchMode(mode) {
  const qrContent = document.getElementById('content-qr');
  const manualContent = document.getElementById('content-manual');
  const qrTab = document.getElementById('tab-qr');
  const manualTab = document.getElementById('tab-manual');
  
  if (mode === 'qr') {
    qrContent.classList.remove('hidden');
    manualContent.classList.add('hidden');
    qrTab.classList.add('text-primary', 'border-primary', 'bg-primary/5');
    qrTab.classList.remove('text-gray-500', 'dark:text-gray-400', 'hover:text-gray-900', 'dark:hover:text-white');
    manualTab.classList.remove('text-primary', 'border-primary', 'bg-primary/5');
    manualTab.classList.add('text-gray-500', 'dark:text-gray-400', 'hover:text-gray-900', 'dark:hover:text-white');
  } else {
    manualContent.classList.remove('hidden');
    qrContent.classList.add('hidden');
    manualTab.classList.add('text-primary', 'border-primary', 'bg-primary/5');
    manualTab.classList.remove('text-gray-500', 'dark:text-gray-400', 'hover:text-gray-900', 'dark:hover:text-white');
    qrTab.classList.remove('text-primary', 'border-primary', 'bg-primary/5');
    qrTab.classList.add('text-gray-500', 'dark:text-gray-400', 'hover:text-gray-900', 'dark:hover:text-white');
  }
}

export function initCheckInManager() {
  document.addEventListener('DOMContentLoaded', () => {
    loadEventsToDropdown();
    document.getElementById('start-scanner-btn')?.addEventListener('click', startScanner);
    document.getElementById('stop-scanner-btn')?.addEventListener('click', stopScanner);
    document.getElementById('manual-checkin-btn')?.addEventListener('click', handleManualCheckIn);
    document.getElementById('ticket-code')?.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') handleManualCheckIn();
    });
    const eventSelect = document.getElementById('event-select');
    if (eventSelect) {
      eventSelect.addEventListener('change', (e) => {
        const eventId = e.target.value;
        if (eventId) {
          handleEventSelect(eventId);
        } else {
          selectedEventId = null;
          const eventInfoEl = document.getElementById('selected-event-info');
          if (eventInfoEl) eventInfoEl.classList.add('hidden');
          updateRecentCheckIns();
        }
      });
    }
    updateRecentCheckIns();
    window.addEventListener('beforeunload', () => {
      if (isScanning) stopScanner();
    });
  });
}