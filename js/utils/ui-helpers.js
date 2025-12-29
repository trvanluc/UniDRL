// js/utils/ui-helpers.js
import { Theme } from "./theme.js";
import { Storage } from "./storage.js";

/**
 * =========================
 * SETTINGS DROPDOWN (Student + Admin)
 * =========================
 */
export function setupSettingsDropdown() {
  const configs = [
    {
      btnId: "settings-btn",
      dropdownId: "settings-dropdown",
    },
    {
      btnId: "admin-settings-btn",
      dropdownId: "admin-settings-dropdown",
    },
  ];

  configs.forEach(({ btnId, dropdownId }) => {
    const settingsBtn = document.getElementById(btnId);
    const dropdown = document.getElementById(dropdownId);

    if (!settingsBtn || !dropdown) return;

    settingsBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const isVisible =
        dropdown.style.display === "block" ||
        !dropdown.classList.contains("hidden");

      dropdown.style.display = isVisible ? "none" : "block";
      dropdown.style.opacity = isVisible ? "0" : "1";
      dropdown.classList.toggle("hidden", isVisible);
    });

    document.addEventListener("click", (e) => {
      if (!settingsBtn.contains(e.target) && !dropdown.contains(e.target)) {
        dropdown.style.display = "none";
        dropdown.style.opacity = "0";
        dropdown.classList.add("hidden");
      }
    });

    dropdown.addEventListener("click", (e) => {
      e.stopPropagation();
    });
  });
}

/**
 * =========================
 * LOGOUT (Student + Admin)
 * =========================
 */
export function setupLogout() {
  const logoutBtnIds = ["logout-btn", "admin-logout-btn"];

  logoutBtnIds.forEach((id) => {
    const logoutBtn = document.getElementById(id);
    if (!logoutBtn) return;

    logoutBtn.addEventListener("click", () => {
      if (confirm("Are you sure you want to logout?")) {
        Storage.clearSession();
        window.location.href = "/login.html";
      }
    });
  });
}

/**
 * =========================
 * THEME TOGGLE (UNCHANGED)
 * =========================
 */
export function setupThemeToggle() {
  const themeButtons = document.querySelectorAll(
    'button:has(.theme-toggle-icon)'
  );

  themeButtons.forEach((button) => {
    const icon = button.querySelector(".material-symbols-outlined");
    if (icon && !icon.classList.contains("theme-toggle-icon")) {
      icon.classList.add("theme-toggle-icon");
    }

    button.addEventListener("click", () => {
      const newTheme = Theme.toggleTheme();
      Theme.updateIcon(newTheme);
    });
  });
}
