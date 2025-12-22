/**
 * ==========================================
 * AUTH GUARD - Route Protection
 * ==========================================
 * Nhiệm vụ:
 * - Bảo vệ các trang private (student / admin)
 * - Kiểm tra đăng nhập
 * - Kiểm tra role
 * - Redirect hợp lý
 * ==========================================
 */

import { Storage } from "../utils/storage.js";
import { ROLES } from "../config/constants.js";

/**
 * =========================
 * 1. REQUIRE AUTH (GUARD CHUNG)
 * =========================
 * Kiểm tra user đã đăng nhập chưa
 */
export function requireAuth() {
  const currentUser = Storage.getCurrentUser();

  if (!currentUser) {
    alert("Bạn cần đăng nhập để tiếp tục");
    window.location.href = "/login.html";
    return false;
  }

  return currentUser;
}

/**
 * =========================
 * 2. REQUIRE ROLE (GUARD THEO VAI TRÒ)
 * =========================
 * Kiểm tra user có role phù hợp không
 */
export function requireRole(allowedRoles = []) {
  const currentUser = requireAuth();

  if (!currentUser) return false;

  if (!allowedRoles.includes(currentUser.role)) {
    alert(`Bạn không có quyền truy cập trang này (Yêu cầu: ${allowedRoles.join(", ")})`);
    redirectByRole(currentUser.role);
    return false;
  }

  return currentUser;
}

/**
 * =========================
 * 3. STUDENT GUARD
 * =========================
 * Chỉ cho phép student truy cập
 */
export function studentGuard() {
  const user = requireRole([ROLES.STUDENT]);
  
  if (!user) {
    console.log("❌ Access denied: Not a student");
  }
  
  return user;
}

/**
 * =========================
 * 4. ADMIN GUARD
 * =========================
 * Cho phép manager, advisor truy cập
 */
export function adminGuard() {
  const user = requireRole([
    ROLES.ADMIN,
    ROLES.MANAGER,
    ROLES.ADVISOR
  ]);

  if (!user) {
    console.log("❌ Access denied: Not an admin");
  }

  return user;
}

/**
 * =========================
 * 5. MULTI-ROLE GUARD
 * =========================
 * Cho phép nhiều role truy cập
 */
export function multiRoleGuard(roles) {
  return requireRole(roles);
}

/**
 * =========================
 * HELPER: REDIRECT BY ROLE
 * =========================
 * Chuyển hướng về trang phù hợp với role
 */
function redirectByRole(role) {
  switch (role) {
    case ROLES.STUDENT:
      window.location.href = "/home.html";
      break;
    case ROLES.ADVISOR:
    case ROLES.MANAGER:
      window.location.href = "/home.html";
      break;
    default:
      window.location.href = "/login.html";
  }
}