/**
 * ==========================================
 * AUTH SERVICE - Authentication Logic
 * ==========================================
 */
import { Storage } from "../utils/storage.js";
import { ROLES } from "../config/constants.js";

/**
 * Login function
 * @param {string} email - User email
 * @param {string} password - User password
 * @param {string} role - User role
 * @returns {Object} User object
 * @throws {Error} If invalid credentials or role mismatch
 */
export function login(email, password, role) {
  const users = Storage.getUsers();
  const user = users.find(
    u => u.email === email && u.password === password
  );
  if (!user) {
    throw new Error("Invalid email or password");
  }
  if (user.role !== role) {
    throw new Error(
      `This account is registered as ${user.role.toUpperCase()}`
    );
  }
  Storage.setCurrentUser(user);
  return user;
}

/**
 * Signup function
 * @param {Object} data - {name, email, password, role}
 * @returns {Object} New user object
 * @throws {Error} If email exists
 */
export function signup({ name, email, password, role }) {
  const users = Storage.getUsers();
  if (users.some(u => u.email === email)) {
    throw new Error("Email already exists");
  }
  const newUser = {
    name,
    email,
    password,
    role,
    studentId: null,
    createdAt: new Date().toISOString()
  };
  users.push(newUser);
  Storage.saveUsers(users);
  return newUser;
}

/**
 * =========================
 *  STUDENT PROFILE SERVICE
 * =========================
 */

/**
 * Get student profile
 * @returns {Object|null} Profile data or null
 */
export function getStudentProfile() {
  const user = Storage.getCurrentUser();
  if (!user || user.role !== ROLES.STUDENT) return null;
  return {
    name: user.name,
    email: user.email,
    studentId: user.studentId,
    ...user.profile
  };
}

/**
 * Update student profile
 * @param {Object} profileData - Profile fields to update
 * @returns {boolean} Success status
 */
export function updateStudentProfile(profileData) {
  return Storage.updateCurrentUserProfile(profileData);
}