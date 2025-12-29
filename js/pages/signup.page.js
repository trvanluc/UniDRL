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
      Toast.warning("Vui lòng điền đầy đủ thông tin");
      return;
    }

    if (password !== confirm) {
      Toast.error("Mật khẩu xác nhận không khớp");
      return;
    }

    if (terms && !terms.checked) {
      Toast.warning("Vui lòng đồng ý với Điều khoản sử dụng");
      return;
    }

    try {
      signup({ name, email, password, role });
      Toast.success("Đăng ký thành công! Đang chuyển đến trang đăng nhập...");
      setTimeout(() => { window.location.href = "login.html"; }, 1500);
    } catch (err) {
      Toast.error(err.message);
    }
  });
});