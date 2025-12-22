/**
 * ==========================================
 * STORAGE - LocalStorage Wrapper
 * ==========================================
 * BACKWARD COMPATIBLE: Sử dụng key "currentUser" thay vì "vnuk_currentUser"
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
    localStorage.setItem("currentUser", JSON.stringify(user));
  },


  getCurrentUser() {
    const data = localStorage.getItem("currentUser");
    return data ? JSON.parse(data) : null;
  },


  clearSession() {
    localStorage.removeItem("currentUser");
  }
};