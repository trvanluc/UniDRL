// js/components/ticket/ticket-footer.component.js
export function renderTicketFooter(statusText, statusColor, statusTextColor, points, formattedRegDate) {
  return `
    <div class="px-4 py-2.5 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-black/30 dark:to-black/40 border-t-2 border-dashed border-gray-200 dark:border-gray-600">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-1.5">
          <span class="w-2.5 h-2.5 rounded-full ${statusColor}"></span>
          <span class="text-xs font-bold ${statusTextColor}">${statusText}</span>
        </div>
        
      </div>
    </div>
  `;
}