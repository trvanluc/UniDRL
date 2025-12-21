import { STORAGE_KEYS } from "../config/constants.js";

export const Storage = {
  getUsers() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS)) || [];
  },

  saveUsers(users) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  },

  setCurrentUser(user) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  },

  getCurrentUser() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.CURRENT_USER));
  },

  clearSession() {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  }
};
