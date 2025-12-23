let currentEventId = null;
let currentStudentId = null;

document.addEventListener("DOMContentLoaded", () => {
  currentEventId = new URLSearchParams(window.location.search).get("id");

  const list = loadParticipants(currentEventId);
  renderTable(list);

  document
    .getElementById("export-csv-btn")
    ?.addEventListener("click", exportCSV);

  document
    .getElementById("save-status-btn")
    ?.addEventListener("click", saveStatus);
});



function renderTable(list) {
  const tbody = document.getElementById("participants-body");
  tbody.innerHTML = "";

  list.forEach(student => {
    tbody.innerHTML += `
      <tr class="group hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
        <td class="py-4 px-6 font-medium text-gray-900 dark:text-white">
          ${student.name}
        </td>

        <td class="py-4 px-6 text-sm text-gray-600 dark:text-gray-300 font-mono">
          ${student.mssv}
        </td>

        <td class="py-4 px-6">
          ${renderStatusBadge(student.status)}
        </td>

        <td class="py-4 px-6 text-right">
          <div class="flex items-center justify-end gap-2">
            <button
              class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10"
              onclick="openEditModal('${student.mssv}')">
              <span class="material-symbols-outlined text-[20px]">edit</span>
            </button>

            <button
              class="p-2 rounded-lg hover:bg-red-500/10 text-red-500"
              onclick="removeParticipant('${student.mssv}')">
              <span class="material-symbols-outlined text-[20px]">delete</span>
            </button>
          </div>
        </td>
      </tr>
    `;
  });

  updateTotalParticipants(list.length);
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

  const all = JSON.parse(localStorage.getItem("event_registrations")) || [];
  const student = all.find(
    s => s.eventId === currentEventId && s.mssv === studentId
  );

  if (student) {
    document.getElementById("edit-status").value = student.status;
  }

  document.getElementById("edit-modal").classList.remove("hidden");
}


function saveStatus() {
  const newStatus = document.getElementById("edit-status").value;
  const all = JSON.parse(localStorage.getItem("event_registrations")) || [];

  const student = all.find(
    s => s.eventId === currentEventId && s.mssv === currentStudentId
  );

  if (student) {
    student.status = newStatus;

    if (newStatus === "checked-in") {
      student.checkInTime = new Date().toISOString();
    }

    localStorage.setItem("event_registrations", JSON.stringify(all));
    renderTable(loadParticipants(currentEventId));
  }

  closeModal("edit-modal");
  showToast("Status updated successfully");
}


function removeParticipant(studentId) {
  const confirmed = confirm("Remove this participant?");
  if (!confirmed) return;

  let all = JSON.parse(localStorage.getItem("event_registrations")) || [];

  all = all.filter(
    s => !(s.eventId === currentEventId && s.mssv === studentId)
  );

  localStorage.setItem("event_registrations", JSON.stringify(all));
  renderTable(loadParticipants(currentEventId));
  showToast("Participant removed");
}




function exportCSV() {
  const list = loadParticipants(currentEventId);

  let csv = "Student Name,Student ID,Status,Check-in Time\n";
  list.forEach(s => {
    csv += `${s.name},${s.mssv},${s.status},${s.checkInTime || ""}\n`;
  });

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `participants-${currentEventId}.csv`;
  a.click();

  URL.revokeObjectURL(url);
}



function updateTotalParticipants(count) {
  const el = document.getElementById("total-participants");
  if (el) el.textContent = count;
}


window.openEditModal = openEditModal;
window.removeParticipant = removeParticipant;


function loadParticipants(adminEventId) {
  const all = JSON.parse(localStorage.getItem("event_registrations")) || [];
  return all.filter(r => r.adminEventId === adminEventId);
}


window.addEventListener("storage", (event) => {
  if (event.key === "event_registrations") {
    renderTable(loadParticipants(currentEventId));
  }
});

function openParticipants(adminEventId) {
  window.location.href =
    `participants-management.html?id=${adminEventId}`;
}

window.openParticipants = function (adminEventId) {
  currentEventId = adminEventId;

  const list = loadParticipants(adminEventId);
  renderTable(list);

  toggleView('participant-table-view');
};

