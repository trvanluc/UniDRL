/**
 * ==========================================
 * AUTH SERVICE - Authentication Logic
 * ==========================================
 */

import { Storage } from "../utils/storage.js";
import { ROLES } from "../config/constants.js";

/**
 * Login function
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
 * STUDENT PROFILE SERVICE
 * =========================
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

export function updateStudentProfile(profileData) {
  return Storage.updateCurrentUserProfile(profileData);
}

