// js/components/ticket/ticket-info.component.js
export function renderTicketInfo(event) {
  return `
    <div class="p-4 space-y-2.5 border-b-2 border-dashed border-gray-200 dark:border-gray-600">
      <div class="text-center">
        <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-1.5">${event.title}</h3>
        <span class="inline-flex items-center px-2.5 py-1 rounded-full bg-primary/20 text-primary text-xs font-bold border border-primary/30">
          ${event.category}
        </span>
      </div>

      <div class="grid grid-cols-2 gap-2.5 mt-2.5">
        <div class="flex items-start gap-2">
          <span class="material-symbols-outlined text-primary text-lg mt-0.5">calendar_month</span>
          <div class="flex-1 min-w-0">
            <p class="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide font-bold mb-0.5">Ngày & Giờ</p>
            <p class="text-sm font-bold text-gray-900 dark:text-white leading-tight">${event.date}</p>
            <p class="text-xs text-gray-600 dark:text-gray-300">${event.time}</p>
          </div>
        </div>

        <div class="flex items-start gap-2">
          <span class="material-symbols-outlined text-primary text-lg mt-0.5">location_on</span>
          <div class="flex-1 min-w-0">
            <p class="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide font-bold mb-0.5">Địa điểm</p>
            <p class="text-sm font-bold text-gray-900 dark:text-white leading-tight">${event.location}</p>
            <p class="text-xs text-gray-600 dark:text-gray-300">${event.room || 'N/A'}</p>
          </div>
        </div>
      </div>
    </div>
  `;
}