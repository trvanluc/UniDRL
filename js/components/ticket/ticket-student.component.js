// js/components/ticket/ticket-student.component.js
export function renderTicketStudent(userRegistration) {
  return `
    <div class="px-4 py-2.5 border-b-2 border-dashed border-gray-200 dark:border-gray-600 bg-gray-50/50 dark:bg-black/20">
      <div class="grid grid-cols-3 gap-2 text-center">
        <div>
          <p class="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-bold mb-0.5">Họ tên</p>
          <p class="text-xs font-bold text-gray-900 dark:text-white truncate">${userRegistration.name}</p>
        </div>
        <div>
          <p class="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-bold mb-0.5">MSSV</p>
          <p class="text-xs font-bold text-gray-900 dark:text-white font-mono">${userRegistration.mssv}</p>
        </div>
        <div>
          <p class="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-bold mb-0.5">Lớp</p>
          <p class="text-xs font-bold text-gray-900 dark:text-white">${userRegistration.class}</p>
        </div>
      </div>
    </div>
  `;
}