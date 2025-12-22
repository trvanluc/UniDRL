import { requireAuth } from "../guards/auth.guard.js";
import { ROLES } from "../config/constants.js";
import { Theme } from "../utils/theme.js";
import { Storage } from "../utils/storage.js";  // Import Storage để clear session

document.addEventListener("DOMContentLoaded", () => {
  const user = requireAuth();
  if (!user) return;

  if (user.role !== ROLES.STUDENT) {
    alert("Access denied");
    window.location.href = "../home.html";
    return;
  }

  Theme.init();
  setupSettingsDropdown();  // Xử lý toggle dropdown
  setupLogout();  // Xử lý logout
});

document.querySelectorAll(".theme-toggle-icon").forEach(icon => {
  icon.closest("button")?.addEventListener("click", () => {
    const newTheme = Theme.toggleTheme();
    Theme.updateIcon(newTheme);
  });
});

/**
 * =========================
 * SETUP SETTINGS DROPDOWN (Toggle with animation)
 * =========================
 */
function setupSettingsDropdown() {
  const settingsBtn = document.getElementById("settings-btn");
  const dropdown = document.getElementById("settings-dropdown");

  if (!settingsBtn || !dropdown) return;

  settingsBtn.addEventListener("click", (e) => {
    e.stopPropagation();  // Ngăn click lan ra ngoài
    const isVisible = dropdown.style.display === "block";
    dropdown.style.display = isVisible ? "none" : "block";
    dropdown.style.opacity = isVisible ? "0" : "1";  // Animation fade
  });

  // Đóng dropdown khi click ngoài
  document.addEventListener("click", (e) => {
    if (!settingsBtn.contains(e.target) && !dropdown.contains(e.target)) {
      dropdown.style.display = "none";
      dropdown.style.opacity = "0";
    }
  });
}

/**
 * =========================
 * SETUP LOGOUT
 * =========================
 */
function setupLogout() {
  const logoutBtn = document.getElementById("logout-btn");

  if (!logoutBtn) return;

  logoutBtn.addEventListener("click", () => {
    if (confirm("Are you sure you want to logout?")) {
      Storage.clearSession();  // Xóa session từ localStorage
      window.location.href = "/login.html";  // Redirect về login (điều chỉnh path nếu cần)
    }
  });
}