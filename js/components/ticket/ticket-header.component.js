// js/components/ticket/ticket-header.component.js
export function renderTicketHeader() {
  return `
    <div class="bg-gradient-to-r from-primary to-[#2fd16d] p-4 text-center">
      <div class="flex items-center justify-center gap-2 mb-1">
        <div class="w-10 h-10 rounded-full bg-background-dark flex items-center justify-center">
          <span class="material-symbols-outlined text-primary text-xl">school</span>
        </div>
        <h2 class="text-xl font-black text-background-dark">VN-UK</h2>
      </div>
      <p class="text-xs font-bold text-background-dark/80">EVENT TICKET</p>
    </div>
  `;
}