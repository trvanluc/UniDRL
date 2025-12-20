const currentUser = JSON.parse(localStorage.getItem('currentUser'));
const role = currentUser ? currentUser.role : 'student';

const studentNav = document.getElementById("student-nav");
const adminNav = document.getElementById("admin-nav");

if (role === "admin" || role === "manager" || role === "advisor") {
  studentNav.classList.add("hidden");
  adminNav.classList.remove("hidden");
} else {
  adminNav.classList.add("hidden");
  studentNav.classList.remove("hidden");
}