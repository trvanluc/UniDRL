const currentUser = JSON.parse(localStorage.getItem('currentUser'));
const role = currentUser ? currentUser.role : 'student';

const studentNav = document.getElementById("student-nav");
const adminNav = document.getElementById("admin-nav");

// Lấy thêm các element của phần Admin Profile mới
const adminProfileHeader = document.getElementById("admin-profile-header");
const adminName = document.getElementById("admin-name");
const adminRoleLabel = document.getElementById("admin-role-label");
const adminAvatar = document.getElementById("admin-avatar");

if (role === "admin" || role === "manager" || role === "advisor") {
  // 1. Điều hướng Nav cho phía Admin/Advisor
  if (studentNav) studentNav.classList.add("hidden");
  if (adminNav) adminNav.classList.remove("hidden");

  // 2. HIỂN THỊ thông tin Admin trên Header
  if (adminProfileHeader) {
    adminProfileHeader.classList.remove("hidden");
    adminProfileHeader.classList.add("flex"); // Chuyển từ hidden sang flex để hiển thị

    // Đổ dữ liệu từ currentUser vào
    if (adminName) adminName.textContent = currentUser.name || "Admin User";
    if (adminRoleLabel) {
      adminRoleLabel.textContent = role === "advisor" ? "Advisor" : (role === "manager" ? "Manager" : "Super Admin");
    }

    if (adminAvatar && currentUser.avatar) {
      adminAvatar.style.backgroundImage = `url('${currentUser.avatar}')`;
    }
  }
} else {
  // 1. Điều hướng Nav cho phía Student
  if (adminNav) adminNav.classList.add("hidden");
  if (studentNav) studentNav.classList.remove("hidden");

  // 2. ẨN hoàn toàn phần Admin Profile đối với Student
  if (adminProfileHeader) {
    adminProfileHeader.classList.add("hidden");
    adminProfileHeader.classList.remove("flex");
  }
}