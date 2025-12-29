// js/components/ticket/ticket-qr.component.js
export function renderTicketQR(qrCodeString, isModal = false) {
  const size = isModal ? 180 : 240;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(qrCodeString)}&bgcolor=ffffff&color=000000&margin=1`;

  return `
    <div class="p-4">
      <div class="w-full flex items-center justify-center mb-3 bg-white p-3 rounded-xl">
        <img src="${qrCodeUrl}" alt="QR Code" class="w-full max-w-[${size}px] h-auto" loading="eager" />
      </div>
      <div class="text-center mb-2">
        <input class="w-full text-center text-xs font-mono text-gray-900 dark:text-white bg-gray-100 dark:bg-black/30 border border-gray-200 dark:border-white/10 rounded-lg p-1.5 shadow-sm focus:outline-none cursor-default" readonly type="text" value="${qrCodeString}" />
        <p class="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-widest mt-1.5">Ticket ID</p>
      </div>
    </div>
  `;
}