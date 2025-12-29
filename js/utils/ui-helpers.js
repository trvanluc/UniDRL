// js/utils/ui-helpers.js
import { Theme } from "./theme.js";
import { Storage } from "./storage.js";
import { Dialog } from "../components/dialog/dialog.js";

// Reuse cho settings dropdown
export function setupSettingsDropdown() {
  const settingsBtn = document.getElementById("settings-btn");
  const dropdown = document.getElementById("settings-dropdown");

  if (!settingsBtn || !dropdown) return;

  settingsBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    const isVisible = dropdown.style.display === "block";
    dropdown.style.display = isVisible ? "none" : "block";
    dropdown.style.opacity = isVisible ? "0" : "1";
  });

  document.addEventListener("click", (e) => {
    if (!settingsBtn.contains(e.target) && !dropdown.contains(e.target)) {
      dropdown.style.display = "none";
      dropdown.style.opacity = "0";
    }
  });
}

// Reuse cho logout
export function setupLogout() {
  const logoutBtn = document.getElementById("logout-btn");

  if (!logoutBtn) return;

  logoutBtn.addEventListener("click", async () => {
    const confirmed = await Dialog.confirm(
      "Đăng xuất",
      "Bạn có chắc chắn muốn đăng xuất?",
      "Đăng xuất",
      "Hủy"
    );
    if (confirmed) {
      Storage.clearSession();
      window.location.href = "/login.html";
    }
  });
}

// Reuse cho theme toggle
export function setupThemeToggle() {
  const themeButtons = document.querySelectorAll('button:has(.theme-toggle-icon)');

  themeButtons.forEach(button => {
    const icon = button.querySelector('.material-symbols-outlined');
    if (icon && !icon.classList.contains('theme-toggle-icon')) {
      icon.classList.add('theme-toggle-icon');
    }

    button.addEventListener("click", () => {
      const newTheme = Theme.toggleTheme();
      Theme.updateIcon(newTheme);
    });
  });
}