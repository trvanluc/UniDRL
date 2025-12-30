/**
 * ==========================================
 * SIGNUP PAGE CONTROLLER
 * ==========================================
 */

import { signup } from "../services/auth.service.js";
import { Toast } from "../components/toast/toast.js";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("signupForm");
  if (!form) return;

  form.addEventListener("submit", e => {
    e.preventDefault();

    const name = document.getElementById("fullname").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const confirm = document.getElementById("confirm-password").value.trim();
    const role = document.getElementById("role").value;
    const terms = document.getElementById("terms");

    if (!name || !email || !password || !confirm) {
      Toast.warning("Please fill in all information");
      return;
    }

    if (password !== confirm) {
      Toast.error("Password confirmation does not match");
      return;
    }

    if (terms && !terms.checked) {
      Toast.warning("Please agree to the Terms of Service");
      return;
    }

    try {
      signup({ name, email, password, role });
      Toast.success("Registration successful! Redirecting to login page...");
      setTimeout(() => { window.location.href = "login.html"; }, 1500);
    } catch (err) {
      Toast.error(err.message);
    }
  });
});