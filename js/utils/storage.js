/**
 * ==========================================
 * STORAGE - LocalStorage Wrapper
 * ==========================================
 * BACKWARD COMPATIBLE: Sử dụng key "currentUser"
 */

import { STORAGE_KEYS } from "../config/constants.js";

export const Storage = {
  /* =====================
   * GENERIC HANDLERS (DÙNG CHUNG CHO BADGE, EVENT, ETC.)
   * ===================== */
  get(key) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.error("Storage.get error:", e);
      return null;
    }
  },

  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error("Storage.set error:", e);
    }
  },

  remove(key) {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.error("Storage.remove error:", e);
    }
  },

  /* =====================
   * USERS (DATABASE)
   * ===================== */
  getUsers() {
    const data = localStorage.getItem(STORAGE_KEYS.USERS);
    return data ? JSON.parse(data) : [];
  },

  saveUsers(users) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  },

  /* =====================
   * SESSION
   * ===================== */
  setCurrentUser(user) {
    localStorage.setItem("currentUser", JSON.stringify(user));
  },

  getCurrentUser() {
    const data = localStorage.getItem("currentUser");
    if (!data) return null;

    const user = JSON.parse(data);

    // BACKWARD COMPATIBILITY
    if (!user.profile) {
      user.profile = {
        phone: "",
        department: "",
        year: "",
        bio: ""
      };
      this.setCurrentUser(user);
    }

    return user;
  },

  clearSession() {
    localStorage.removeItem("currentUser");
  },

  /* =====================
   * PROFILE UPDATE
   * ===================== */
  updateCurrentUserProfile(profileData) {
    const user = this.getCurrentUser();
    if (!user) return false;

    // 1. Update session
    user.profile = {
      ...user.profile,
      ...profileData
    };
    this.setCurrentUser(user);

    // 2. Update database
    const users = this.getUsers();
    const index = users.findIndex(u => u.email === user.email);

    if (index !== -1) {
      users[index] = {
        ...users[index],
        ...user,
        profile: user.profile
      };
      this.saveUsers(users);
    }

    return true;
  },
};