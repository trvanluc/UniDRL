/**
 * ==========================================
 * SIGNUP PAGE CONTROLLER
 * ==========================================
 */

import { signup } from "../services/auth.service.js";

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
      alert("Please fill all required fields");
      return;
    }

    if (password !== confirm) {
      alert("Passwords do not match");
      return;
    }

    if (terms && !terms.checked) {
      alert("Please accept Terms and Privacy Policy");
      return;
    }

    try {
      signup({ name, email, password, role });
      alert("Signup successful. Please login.");
      window.location.href = "login.html";
    } catch (err) {
      alert(err.message);
    }
  });
});