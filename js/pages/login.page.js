import { login } from "../services/auth.service.js";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");

  if (!form) return;

  form.addEventListener("submit", e => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const roleRadio = document.querySelector('input[name="role"]:checked');

    if (!email || !password || !roleRadio) {
      alert("Please fill all fields and select role");
      return;
    }

    try {
      login(email, password, roleRadio.value);
      window.location.href = "home.html";
    } catch (err) {
      alert(err.message);
    }
  });
});
