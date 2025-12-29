import { requireAuth } from "../guards/auth.guard.js";
import { ROLES } from "../config/constants.js";
import { Theme } from "../utils/theme.js";
import { setupSettingsDropdown, setupLogout, setupThemeToggle } from "../utils/ui-helpers.js";
import {
  getStudentProfile,
  updateStudentProfile
} from "../services/auth.service.js";

document.addEventListener("DOMContentLoaded", () => {
  const user = requireAuth();
  if (!user) return;

  if (user.role !== ROLES.STUDENT) {
    alert("Access denied");
    window.location.href = "../home.html";
    return;
  }

  Theme.init();
  setupThemeToggle();
  setupSettingsDropdown();
  setupLogout();

  loadStudentProfile();
  setupProfileSave();
});

function loadStudentProfile() {
  const profile = getStudentProfile();
  if (!profile) return;

  document.getElementById("email").value = profile.email || "";
  document.getElementById("phone").value = profile.phone || "";
  document.getElementById("department").value = profile.department || "";
  document.getElementById("year").value = profile.year || "";
  document.getElementById("bio").value = profile.bio || "";
}

function setupProfileSave() {
  const btn = document.getElementById("save-profile-btn");
  if (!btn) return;

  btn.addEventListener("click", (e) => {
    e.preventDefault();

    updateStudentProfile({
      phone: document.getElementById("phone").value.trim(),
      department: document.getElementById("department").value.trim(),
      year: document.getElementById("year").value.trim(),
      bio: document.getElementById("bio").value.trim()
    });

    alert("Profile updated successfully");
  });
}