/**
 * AUTH.JS - Xử lý Đăng ký & Đăng nhập
 * Tương thích: Signup dùng Select box, Login dùng Radio button
 */

// ===== 1. XỬ LÝ ĐĂNG KÝ (SIGN UP) =====
function handleSignup(e) {
    e.preventDefault();

    // Lấy dữ liệu từ form
    const nameInput = document.getElementById("fullname");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const roleInput = document.getElementById("role"); // Thẻ Select

    // Kiểm tra các element có tồn tại không để tránh lỗi null
    if (!nameInput || !emailInput || !passwordInput || !roleInput) {
        alert("Lỗi: Không tìm thấy trường nhập liệu. Vui lòng kiểm tra lại file HTML.");
        return;
    }

    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    const confirmPassword = document.getElementById("confirm-password").value.trim();
    if (password !== confirmPassword) {
        alert("Mật khẩu xác nhận không khớp!");
        return;
    }

    const role = roleInput.value; // Lấy giá trị từ thẻ select (student/advisor/manager)

    // Validate dữ liệu trống
    if (!name || !email || !password) {
        alert("Vui lòng điền đầy đủ thông tin!");
        return;
    }

    // Lấy danh sách user cũ từ LocalStorage
    const users = JSON.parse(localStorage.getItem("users")) || [];

    // Kiểm tra trùng email
    if (users.find(u => u.email === email)) {
        alert("Email này đã được đăng ký!");
        return;
    }

    // Tạo user mới
    const newUser = {
        name,
        email,
        password,
        role, 
        // Chỉ tạo mã sinh viên nếu role là student
        studentId: role === "student" ? "SV" + Math.floor(100000 + Math.random() * 900000) : null,
        createdAt: new Date().toISOString()
    };

    // Lưu vào LocalStorage
    users.push(newUser);
    localStorage.setItem("users", JSON.stringify(users));

    alert(`Đăng ký ${role.toUpperCase()} thành công! Vui lòng đăng nhập.`);
    window.location.href = "login.html";
}

// ===== 2. XỬ LÝ ĐĂNG NHẬP (LOGIN) =====
function handleLogin(e) {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    // Lấy Role từ Radio Button (Dành riêng cho trang Login)
    const roleRadio = document.querySelector('input[name="role"]:checked');
    const selectedRole = roleRadio ? roleRadio.value : null;

    if (!email || !password) {
        alert("Vui lòng nhập Email và Mật khẩu!");
        return;
    }

    if (!selectedRole) {
        alert("Vui lòng chọn vai trò (Student, Advisor hoặc Manager)!");
        return;
    }

    // Lấy danh sách user
    const users = JSON.parse(localStorage.getItem("users")) || [];

    // Tìm user khớp email và mật khẩu
    const user = users.find(u => u.email === email && u.password === password);

    if (!user) {
        alert("Email hoặc mật khẩu không chính xác!");
        return;
    }

    // --- QUAN TRỌNG: KIỂM TRA ROLE ---
    // So sánh Role trong database với Role người dùng chọn trên màn hình
    if (user.role !== selectedRole) {
        alert(`Lỗi: Tài khoản này đăng ký là "${user.role.toUpperCase()}", bạn không thể đăng nhập ở mục "${selectedRole.toUpperCase()}".`);
        return;
    }

    // Đăng nhập thành công -> Lưu session
    localStorage.setItem("currentUser", JSON.stringify(user));

    // Chuyển hướng đến home chung cho tất cả role
    window.location.href = "home.html";
}

// ===== 3. TỰ ĐỘNG GẮN SỰ KIỆN (AUTO BINDING) =====
document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector("form");

    if (form) {
        // Cách nhận biết trang Login: Có nút Radio chọn role
        if (document.querySelector('input[name="role"]')) {
            console.log("Detected: Login Page");
            form.addEventListener("submit", handleLogin);
        } 
        // Cách nhận biết trang Signup: Có ô nhập Fullname
        else if (document.getElementById("fullname")) {
            console.log("Detected: Signup Page");
            form.addEventListener("submit", handleSignup);
        }
    }
});