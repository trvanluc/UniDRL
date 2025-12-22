import { requireAuth } from "../guards/auth.guard.js";
import { ROLES } from "../config/constants.js";
import { Theme } from "../utils/theme.js";

document.addEventListener("DOMContentLoaded", () => {
  const user = requireAuth();
  if (!user) return;

  if (user.role !== ROLES.STUDENT) {
    alert("Access denied");
    window.location.href = "../home.html";
    return;
  }

  Theme.init();
});
document.querySelectorAll(".theme-toggle-icon").forEach(icon => {
  icon.closest("button")?.addEventListener("click", () => {
    const newTheme = Theme.toggleTheme();
    Theme.updateIcon(newTheme);
  });
});
