/**
 * ==========================================
 * LOGIN PAGE CONTROLLER
 * ==========================================
 */

import { login } from "../services/auth.service.js";
import { Toast } from "../components/toast/toast.js";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");

  if (!form) return;

  form.addEventListener("submit", e => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const roleRadio = document.querySelector('input[name="role"]:checked');

    if (!email || !password || !roleRadio) {
      Toast.warning("Please fill in all information and select a role");
      return;
    }

    try {
      login(email, password, roleRadio.value);
      Toast.success("Login successful!");
      setTimeout(() => { window.location.href = "home.html"; }, 1000);
    } catch (err) {
      Toast.error(err.message);
    }
  });
});