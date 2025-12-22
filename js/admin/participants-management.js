let currentEventId = null;
let currentStudentId = null;

document.addEventListener("DOMContentLoaded", () => {
  currentEventId = new URLSearchParams(window.location.search).get("id");

  const store = JSON.parse(localStorage.getItem("participants")) || {};

  // ✅ RE-SEED MOCK STUDENT NẾU CHƯA CÓ HOẶC BỊ XÓA
  if (!store[currentEventId] || store[currentEventId].length === 0) {
    store[currentEventId] = [
      {
        id: "20230592",
        name: "Alex Johnson",
        status: "registered"
      }
    ];
    localStorage.setItem("participants", JSON.stringify(store));
  }

  renderTable(store[currentEventId]);

  document
    .getElementById("export-csv-btn")
    ?.addEventListener("click", exportCSV);

  document
    .getElementById("save-status-btn")
    ?.addEventListener("click", saveStatus);
});


function renderTable(list) {
  const tbody = document.querySelector("tbody");
  tbody.innerHTML = "";

  list.forEach(student => {
    tbody.innerHTML += `
      <tr class="group hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
        <td class="py-4 px-6 font-medium text-gray-900 dark:text-white">
          ${student.name}
        </td>

        <td class="py-4 px-6 text-sm text-gray-600 dark:text-gray-300 font-mono">
          ${student.id}
        </td>

        <td class="py-4 px-6">
          ${renderStatusBadge(student.status)}
        </td>

        <td class="py-4 px-6 text-right">
          <div class="flex items-center justify-end gap-2">
            <button
              class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500 dark:text-gray-400"
              onclick="openEditModal('${student.id}')">
              <span class="material-symbols-outlined text-[20px]">edit</span>
            </button>

            <button
              class="p-2 rounded-lg hover:bg-red-500/10 text-red-500"
              onclick="removeParticipant('${student.id}')">
              <span class="material-symbols-outlined text-[20px]">delete</span>
            </button>
          </div>
        </td>
      </tr>
    `;
  });
  tbody.querySelectorAll("button").forEach(btn => {
    btn.style.pointerEvents = "auto";
    btn.style.position = "relative";
    btn.style.zIndex = "10";
  });
}



function renderStatusBadge(status) {
  const map = {
    registered: ["Registered", "bg-gray-100 text-gray-600"],
    "checked-in": ["Checked-in", "bg-blue-100 text-blue-600"],
    completed: ["Completed", "bg-green-100 text-green-600"],
    absent: ["Absent", "bg-red-100 text-red-600"]
  };

  const [label, cls] = map[status] || map.registered;

  return `
    <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${cls}">
      <span class="size-1.5 rounded-full bg-current"></span>
      ${label}
    </span>
  `;
}

function openEditModal(studentId) {
  currentStudentId = studentId;

  const store = JSON.parse(localStorage.getItem("participants")) || {};
  const student = store[currentEventId].find(s => s.id === studentId);

  if (student) {
    document.getElementById("edit-status").value = student.status;
  }

  document.getElementById("edit-modal").classList.remove("hidden");
}

function saveStatus() {
  const newStatus = document.getElementById("edit-status").value;

  const store = JSON.parse(localStorage.getItem("participants")) || {};
  const list = store[currentEventId];

  const student = list.find(s => s.id === currentStudentId);
  if (student) {
    student.status = newStatus;
    localStorage.setItem("participants", JSON.stringify(store));
    renderTable(list);
  }

  closeModal("edit-modal");
  showToast("Status updated successfully");
}

function removeParticipant(studentId) {
  const store = JSON.parse(localStorage.getItem("participants")) || {};
  const student = store[currentEventId]?.find(s => s.id === studentId);

  if (!student) return;

  alert(
    `🧪 MOCK DELETE\n\n` +
    `Student: ${student.name}\n` +
    `ID: ${student.id}\n\n` +
    `This action is disabled in mock mode.`
  );
}


function exportCSV() {
  const store = JSON.parse(localStorage.getItem("participants")) || {};
  const list = store[currentEventId] || [];

  let csv = "Student Name,Student ID,Status\n";
  list.forEach(s => {
    csv += `${s.name},${s.id},${s.status}\n`;
  });

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `participants-${currentEventId}.csv`;
  a.click();

  URL.revokeObjectURL(url);
}

window.openEditModal = openEditModal;
window.removeParticipant = removeParticipant;

