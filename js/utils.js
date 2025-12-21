// js/utils.js

// =====================
// 1. Tailwind config (GIỮ NGUYÊN)
// =====================
const tailwindConfig = {
    darkMode: "class",
    theme: {
        extend: {
            colors: {
                "primary": "#36e27b",
                "primary-hover": "#2ec569",
                "admin-primary": "#19e66b",
                "background-light": "#f6f8f7",
                "background-dark": "#112117",
                "card-dark": "#1c2620",
                "surface-dark": "#2a3630",
                "danger": "#ef4444"
            },
            fontFamily: {
                "display": ["Spline Sans", "sans-serif"],
                "body": ["Noto Sans", "sans-serif"]
            },
            borderRadius: {
                "DEFAULT": "1rem",
                "lg": "1.5rem",
                "xl": "2rem",
                "2xl": "2.5rem",
            },
            boxShadow: {
                "glow": "0 0 20px -5px rgba(54, 226, 123, 0.3)",
            }
        },
    },
};
window.tailwindConfig = tailwindConfig;

// =====================
// 2. Auth helpers
// =====================
function requireAuth() {
    const user = JSON.parse(localStorage.getItem("currentUser"));
    if (!user) {
        window.location.href = "login.html";
        return null;
    }
    return user;
}

function logout() {
    localStorage.removeItem("currentUser");
    window.location.href = "login.html";
}

// =====================
// 3. System utilities (Member 4)
// =====================

// Generate ID (event, participant…)
function generateId(prefix = "id") {
    return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
}

// Generate check-in / completion code
function generateCode(length = 6) {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

// Format date/time (demo)
function formatDateTime(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleString("vi-VN");
}

// Export CSV (report)
function exportCSV(filename, rows) {
    if (!rows || !rows.length) return;

    const headers = Object.keys(rows[0]);
    const csvContent = [
        headers.join(","),
        ...rows.map(r => headers.map(h => `"${r[h] ?? ""}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
}
