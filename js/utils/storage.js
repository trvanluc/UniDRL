/**
 * ==========================================
 * STORAGE - LocalStorage Wrapper
 * ==========================================
 */

import { STORAGE_KEYS } from "../config/constants.js";

export const Storage = {
  getUsers() {
    const data = localStorage.getItem(STORAGE_KEYS.USERS);
    return data ? JSON.parse(data) : [];
  },

  saveUsers(users) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  },

  setCurrentUser(user) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  },

  getCurrentUser() {
    const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return data ? JSON.parse(data) : null;
  },

  clearSession() {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  }
};