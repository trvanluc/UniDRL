import { getEvents, saveEvents } from "./admin-events.service.js";

const eventId = new URLSearchParams(location.search).get("eventId");
const events = getEvents();
const event = events.find(e => e.id === eventId);

export function renderParticipants() {
  const tbody = document.querySelector("tbody");
  document.getElementById("total").innerText = event.participants.length;

  tbody.innerHTML = "";

  event.participants.forEach((p, i) => {
    tbody.innerHTML += `
      <tr>
        <td>${p.studentId}</td>
        <td>${p.name}</td>
        <td>${p.email}</td>
        <td>
          <select onchange="updateStatus(${i}, this.value)">
            <option ${p.status==="pending"?"selected":""}>pending</option>
            <option ${p.status==="approved"?"selected":""}>approved</option>
            <option ${p.status==="checked-in"?"selected":""}>checked-in</option>
          </select>
        </td>
        <td>
          <button onclick="removeParticipant(${i})">Delete</button>
        </td>
      </tr>
    `;
  });
}

function exportParticipantsCSV(eventId) {
    const data = JSON.parse(localStorage.getItem("eventParticipants")) || {};
    const participants = data[eventId] || [];
  
    if (participants.length === 0) {
      alert("No participants to export");
      return;
    }
  
    const headers = ["ID", "Name", "Email", "Status"];
    const rows = participants.map(p =>
      [p.id, p.name, p.email, p.status].join(",")
    );
  
    const csvContent = [headers.join(","), ...rows].join("\n");
  
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
  
    const link = document.createElement("a");
    link.href = url;
    link.download = `event_${eventId}_participants.csv`;
    link.click();
  }
  



