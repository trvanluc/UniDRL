// js/components/ticket/ticket-footer.component.js
export function renderTicketFooter(statusText, statusColor, statusTextColor) {
  return `
    <div class="px-4 py-3 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-black/30 dark:to-black/40 border-t-2 border-dashed border-gray-200 dark:border-gray-600">
      <div class="flex items-center justify-center gap-2">
        <span class="w-2.5 h-2.5 rounded-full ${statusColor}"></span>
        <span class="text-sm font-bold ${statusTextColor}">${statusText}</span>
      </div>
    </div>
  `;
}