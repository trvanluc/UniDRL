// js/script.js
// =====================
// MOCK BACKEND – MEMBER 4
// =====================

// ---------- Storage keys ----------
const STORAGE_KEYS = {
    USERS: "users",
    EVENTS: "vnuk_events",
    CURRENT_USER: "currentUser"
};

// ---------- Utils ----------
function generateId(prefix = "id") {
    return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
}

function generateCode() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// ---------- Init data ----------
function initData() {
    // ===== USERS =====
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
        const users = [
            {
                id: "advisor_1",
                name: "System Advisor",
                email: "advisor@demo.com",
                password: "123",
                role: "advisor"
            },
            {
                id: "manager_1",
                name: "System Manager",
                email: "manager@demo.com",
                password: "123",
                role: "manager"
            },
            {
                id: "student_1",
                name: "Nguyễn Văn A",
                email: "sv01@demo.com",
                password: "123",
                role: "student",
                drl: 80
            }
        ];
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    }

    // ===== EVENTS =====
    if (!localStorage.getItem(STORAGE_KEYS.EVENTS)) {
        const events = [
            {
                id: generateId("event"),
                title: "Hiến máu nhân đạo",
                description: "Sự kiện cộng đồng do ĐH VN-UK tổ chức",
                date: "2024-10-20",
                drlPoint: 5,
                status: "open", // open | closed
                checkinCode: generateCode(),
                completionCode: generateCode(),
                participants: [] // { userId, status }
            }
        ];
        localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
    }
}

// ---------- User ----------
function getCurrentUser() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.CURRENT_USER));
}

function getUsers() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS)) || [];
}

function saveUsers(users) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
}

// ---------- Event APIs ----------
function getEvents() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.EVENTS)) || [];
}

function saveEvents(events) {
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
}

function createEvent(eventData) {
    const events = getEvents();
    events.push({
        id: generateId("event"),
        title: eventData.title,
        description: eventData.description || "",
        date: eventData.date,
        drlPoint: Number(eventData.drlPoint) || 0,
        status: "open",
        checkinCode: generateCode(),
        completionCode: generateCode(),
        participants: []
    });
    saveEvents(events);
}

function updateEvent(eventId, updatedData) {
    const events = getEvents().map(event =>
        event.id === eventId ? { ...event, ...updatedData } : event
    );
    saveEvents(events);
}

function deleteEvent(eventId) {
    const events = getEvents().filter(event => event.id !== eventId);
    saveEvents(events);
}

// ---------- Student / Participant flow ----------
function registerEvent(eventId, userId) {
    const events = getEvents();
    const event = events.find(e => e.id === eventId);
    if (!event || event.status !== "open") return false;

    if (event.participants.some(p => p.userId === userId)) return false;

    event.participants.push({
        userId,
        status: "registered" // registered | checked-in | completed
    });

    saveEvents(events);
    return true;
}

function checkInEvent(eventId, code) {
    const user = getCurrentUser();
    if (!user) return false;

    const events = getEvents();
    const event = events.find(e => e.id === eventId);
    if (!event || event.checkinCode !== code) return false;

    const participant = event.participants.find(p => p.userId === user.id);
    if (!participant) return false;

    participant.status = "checked-in";
    saveEvents(events);
    return true;
}

function completeEvent(eventId, code) {
    const user = getCurrentUser();
    if (!user) return false;

    const events = getEvents();
    const users = getUsers();

    const event = events.find(e => e.id === eventId);
    if (!event || event.completionCode !== code) return false;

    const participant = event.participants.find(p => p.userId === user.id);
    if (!participant || participant.status !== "checked-in") return false;

    participant.status = "completed";

    // cộng DRL cho student
    const student = users.find(u => u.id === user.id);
    if (student && student.role === "student") {
        student.drl = (student.drl || 0) + event.drlPoint;
        saveUsers(users);
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(student));
    }

    saveEvents(events);
    return true;
}

// ---------- Admin helpers ----------
function getParticipants(eventId) {
    const event = getEvents().find(e => e.id === eventId);
    return event ? event.participants : [];
}

// ---------- Auto init ----------
document.addEventListener("DOMContentLoaded", initData);

// ---------- Export (debug / dùng chung) ----------
window.MockAPI = {
    getUsers,
    getEvents,
    createEvent,
    updateEvent,
    deleteEvent,
    registerEvent,
    checkInEvent,
    completeEvent,
    getParticipants
};