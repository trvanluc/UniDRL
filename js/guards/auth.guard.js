/**
 * ==========================================
 * AUTH GUARD - Route Protection
 * ==========================================
 * Purpose:
 * - Protect private pages (student / admin)
 * - Check authentication
 * - Check role
 * - Redirect appropriately
 * ==========================================
 */

import { Storage } from "../utils/storage.js";
import { ROLES } from "../config/constants.js";
import { Toast } from "../components/toast/toast.js";

/**
 * =========================
 * 1. REQUIRE AUTH (GENERAL GUARD)
 * =========================
 * Check if user is logged in
 */
export function requireAuth() {
  const currentUser = Storage.getCurrentUser();

  if (!currentUser) {
    Toast.warning("You need to login to continue");
    setTimeout(() => {
      const basePath = window.location.hostname.includes('github.io') ? '/UniDRL' : '';
      window.location.href = `${basePath}/login.html`;
    }, 1500);
    return false;
  }

  return currentUser;
}

/**
 * =========================
 * 2. REQUIRE ROLE (ROLE-BASED GUARD)
 * =========================
 * Check if user has the appropriate role
 */
export function requireRole(allowedRoles = []) {
  const currentUser = requireAuth();

  if (!currentUser) return false;

  if (!allowedRoles.includes(currentUser.role)) {
    Toast.error(`You don't have permission to access this page`);
    setTimeout(() => { redirectByRole(currentUser.role); }, 1500);
    return false;
  }

  return currentUser;
}

/**
 * =========================
 * 3. STUDENT GUARD
 * =========================
 * Only allow students to access
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
 * Allow manager, advisor to access
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
 * Allow multiple roles to access
 */
export function multiRoleGuard(roles) {
  return requireRole(roles);
}

/**
 * =========================
 * HELPER: REDIRECT BY ROLE
 * =========================
 * Redirect to appropriate page based on role
 */
function getBasePath() {
  return window.location.hostname.includes('github.io') ? '/UniDRL' : '';
}

function redirectByRole(role) {
  const basePath = getBasePath();
  switch (role) {
    case ROLES.STUDENT:
      window.location.href = `${basePath}/home.html`;
      break;
    case ROLES.ADVISOR:
    case ROLES.MANAGER:
      window.location.href = `${basePath}/home.html`;
      break;
    default:
      window.location.href = `${basePath}/login.html`;
  }
}