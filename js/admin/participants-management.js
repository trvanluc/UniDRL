const EVENTS = {
  "hackathon-2024": {
    title: "Annual Hackathon 2024",
    code: "hackathon-2024",
    status: "Upcoming",
    statusClass: "bg-green-500/10 text-green-600 border-green-500/20"
  },
  "career-fair": {
    title: "Career Fair Prep Workshop",
    code: "career-fair",
    status: "Upcoming",
    statusClass: "bg-blue-500/10 text-blue-600 border-blue-500/20"
  },
  "jazz-night": {
    title: "Campus Jazz Night",
    code: "jazz-night",
    status: "Closed",
    statusClass: "bg-purple-500/10 text-purple-600 border-purple-500/20"
  },
  "robotics": {
    title: "Intro to Robotics",
    code: "robotics",
    status: "Upcoming",
    statusClass: "bg-green-500/10 text-green-600 border-green-500/20"
  },
  "yoga-week": {
    title: "Wellness Week: Yoga",
    code: "yoga-week",
    status: "Upcoming",
    statusClass: "bg-blue-500/10 text-blue-600 border-blue-500/20"
  },
  "leadership-summit": {
    title: "Student Leadership Summit",
    code: "leadership-summit",
    status: "Upcoming",
    statusClass: "bg-purple-500/10 text-purple-600 border-purple-500/20"
  },
  "blockchain-workshop": {
    title: "Blockchain & Web3 Workshop",
    code: "blockchain-workshop",
    status: "Upcoming",
    statusClass: "bg-green-500/10 text-green-600 border-green-500/20"
  }
};



let currentEventId = null;
let currentStudentId = null;

document.addEventListener("DOMContentLoaded", () => {
  currentEventId = new URLSearchParams(window.location.search).get("id");
  
  const event = EVENTS.find(e => e.id === currentEventId);
  const titleEl = document.getElementById("event-title");

  if (event && titleEl) {
    titleEl.textContent = event.title;
  }
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


function loadParticipants(eventId) {
  const all = JSON.parse(localStorage.getItem("event_registrations")) || [];
  return all.filter(r => r.eventId === eventId);
}



window.addEventListener("storage", (event) => {
  if (event.key === "event_registrations") {
    renderTable(loadParticipants(currentEventId));
  }
});



window.openParticipants = function (eventId) {
  currentEventId = eventId;

  const event = EVENTS[eventId];
  if (!event) return;

  // Update title
  document.getElementById("event-title").textContent = event.title;

  // Update event code
  document.querySelector(
    "#participant-table-view .font-mono"
  ).textContent = event.code;

  // Update status badge
  const badge = document.querySelector(
    "#participant-table-view .rounded-full"
  );
  badge.textContent = event.status;
  badge.className = `px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${event.statusClass}`;

  // Load participants
  const list = loadParticipants(eventId);
  renderTable(list);

  toggleView("participant-table-view");
};


function getAdminEventIdFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

// ===== View Toggle =====
function toggleView(viewId) {
  const selectionView = document.getElementById('event-selection-view');
  const tableView = document.getElementById('participant-table-view');

  if (!selectionView || !tableView) return;

  if (viewId === 'participant-table-view') {
    selectionView.classList.add('hidden');
    tableView.classList.remove('hidden');
  } else {
    tableView.classList.add('hidden');
    selectionView.classList.remove('hidden');
  }
}

// ===== Modal Logic =====
function openModal(modalId) {
  document.getElementById(modalId)?.classList.remove('hidden');
}

function closeModal(modalId) {
  document.getElementById(modalId)?.classList.add('hidden');
}

// ===== Toast Notification =====
function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');

  let icon = 'check_circle';
  let iconColor = 'text-primary dark:text-green-600';

  if (type === 'error') {
    icon = 'error';
    iconColor = 'text-red-500';
  }

  toast.className = `
    bg-surface-dark dark:bg-surface-light
    text-white dark:text-black
    px-4 py-3 rounded-xl shadow-2xl
    flex items-center gap-3
    animate-[slideIn_0.3s_ease-out]
    pointer-events-auto min-w-[300px]
  `;

  toast.innerHTML = `
    <span class="material-symbols-outlined ${iconColor}">${icon}</span>
    <div class="flex-1">
      <p class="font-bold text-sm">Action Successful</p>
      <p class="text-xs opacity-80">${message}</p>
    </div>
    <button class="ml-2 hover:bg-white/10 dark:hover:bg-black/10 rounded-full p-1">
      <span class="material-symbols-outlined text-[16px]">close</span>
    </button>
  `;

  toast.querySelector('button').onclick = () => toast.remove();

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(20px)';
    toast.style.transition = 'all 0.3s ease-out';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// Expose functions for HTML onclick
window.toggleView = toggleView;
window.openModal = openModal;
window.closeModal = closeModal;
window.showToast = showToast;

