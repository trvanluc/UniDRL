// js/utils/ui-helpers.js
import { Theme } from "./theme.js";
import { Storage } from "./storage.js";
import { Dialog } from "../components/dialog/dialog.js";

/**
 * =========================
 * SETTINGS DROPDOWN (Student + Admin)
 * =========================
 */
export function setupSettingsDropdown() {
  const configs = [
    { btnId: "settings-btn", dropdownId: "settings-dropdown" },
    { btnId: "admin-settings-btn", dropdownId: "admin-settings-dropdown" },
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

    dropdown.addEventListener("click", (e) => e.stopPropagation());
  });
}

/**
 * =========================
 * LOGOUT (Student + Admin, DÙNG DIALOG CHUNG)
 * =========================
 */
export function setupLogout() {
  const logoutBtnIds = ["logout-btn", "admin-logout-btn"];

  logoutBtnIds.forEach((id) => {
    const logoutBtn = document.getElementById(id);
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
  });
}

/**
 * =========================
 * THEME TOGGLE (UNCHANGED)
 * =========================
 */
export function setupThemeToggle() {
  const themeButtons = document.querySelectorAll(
    'button:has(.theme-toggle-icon), #theme-toggle-btn'
  );

  themeButtons.forEach((button) => {
    // Ensure icon has the class if selected by ID
    const icon = button.querySelector(".material-symbols-outlined");
    if (icon && !icon.classList.contains("theme-toggle-icon")) {
      icon.classList.add("theme-toggle-icon");
    }

    // Remove old listeners (if any) to prevent duplicates isn't easy without weakmaps, 
    // but assuming this runs once per page load.
    button.addEventListener("click", (e) => {
      e.stopPropagation(); // Prevent bubbling issues
      const newTheme = Theme.toggleTheme();
      Theme.updateIcon(newTheme);
    });
  });
}
