import { Storage } from "../utils/storage.js";
import { ROLES } from "../config/constants.js";

export function requireAuth() {
  const currentUser = Storage.getCurrentUser();

  if (!currentUser) {
    window.location.href = "/login.html";
    return false;
  }

  return currentUser;
}

export function requireRole(allowedRoles = []) {
  const currentUser = requireAuth();

  if (!currentUser) return false;

  if (!allowedRoles.includes(currentUser.role)) {
    window.location.href = "/home.html";
    return false;
  }

  return currentUser;
}

export function studentGuard() {
  return requireRole([ROLES.STUDENT]);
}

export function adminGuard() {
  return requireRole([ROLES.MANAGER]);
}

export function multiRoleGuard(roles) {
  return requireRole(roles);
}
