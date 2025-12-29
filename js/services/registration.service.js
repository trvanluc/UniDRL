// js/services/registration.service.js
import { STORAGE_KEYS } from "../config/constants.js";

/**
 * Registration Service - Manage event registrations
 */
export const RegistrationService = {
  STORAGE_KEY: STORAGE_KEYS.REGISTRATIONS,

  /**
   * Get all registrations
   * @returns {Array} Registrations array
   */
  getAll() {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      if (!data) return [];
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.error('RegistrationService.getAll error:', error);
      return [];
    }
  },

  /**
   * Get registrations by event ID
   * @param {string} eventId - Event ID
   * @returns {Array} Filtered registrations
   */
  getByEventId(eventId) {
    return this.getAll().filter(reg => reg.eventId === eventId);
  },

  /**
   * Get registrations by student ID
   * @param {string} studentId - Student ID
   * @returns {Array} Filtered registrations
   */
  getByStudentId(studentId) {
    return this.getAll().filter(reg => reg.mssv === studentId);
  },

  /**
   * Find registration by QR code
   * @param {string} qrCode - QR code string
   * @returns {Object|null} Registration or null
   */
  findByQRCode(qrCode) {
    const all = this.getAll();
    let registration = all.find(reg => reg.qrCode === qrCode);
    if (!registration) registration = all.find(reg => reg.qrCode.toLowerCase() === qrCode.toLowerCase());
    if (!registration && qrCode.includes('_')) {
      const [mssv, ...eventIdParts] = qrCode.split('_');
      const eventId = eventIdParts.join('_');
      registration = all.find(reg => reg.mssv === mssv && reg.eventId === eventId);
    }
    return registration || null;
  },

  /**
   * Find registration by MSSV and event ID
   * @param {string} mssv - Student MSSV
   * @param {string} eventId - Event ID
   * @returns {Object|null} Registration or null
   */
  findByMSSVAndEventId(mssv, eventId) {
    return this.getAll().find(reg => reg.mssv === mssv && reg.eventId === eventId) || null;
  },

  /**
   * Save or update registration
   * @param {Object} registration - Registration data
   * @returns {boolean} Success status
   */
  save(registration) {
    try {
      let all = this.getAll();
      const existingIndex = all.findIndex(reg => reg.mssv === registration.mssv && reg.eventId === registration.eventId);
      if (existingIndex !== -1) {
        all[existingIndex] = { ...all[existingIndex], ...registration };
      } else {
        all.push(registration);
      }
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(all));
      return true;
    } catch (error) {
      console.error('RegistrationService.save error:', error);
      return false;
    }
  },

  /**
   * Update registration by QR code
   * @param {string} qrCode - QR code
   * @param {Object} updates - Fields to update
   * @returns {Object|null} Updated registration or null
   */
  updateByQRCode(qrCode, updates) {
    try {
      let all = this.getAll();
      const index = all.findIndex(reg => reg.qrCode === qrCode || reg.qrCode.toLowerCase() === qrCode.toLowerCase());
      if (index !== -1) {
        all[index] = { ...all[index], ...updates, updatedAt: new Date().toISOString() };
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(all));
        return all[index];
      }
      return null;
    } catch (error) {
      console.error('RegistrationService.updateByQRCode error:', error);
      return null;
    }
  },

  /**
   * Delete registration
   * @param {string} mssv - Student MSSV
   * @param {string} eventId - Event ID
   * @returns {boolean} Success status
   */
  delete(mssv, eventId) {
    try {
      let all = this.getAll();
      all = all.filter(reg => !(reg.mssv === mssv && reg.eventId === eventId));
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(all));
      return true;
    } catch (error) {
      console.error('RegistrationService.delete error:', error);
      return false;
    }
  },

  /**
   * Check if student is registered for event
   * @param {string} mssv - Student MSSV
   * @param {string} eventId - Event ID
   * @returns {boolean} Registered status
   */
  isRegistered(mssv, eventId) {
    return this.findByMSSVAndEventId(mssv, eventId) !== null;
  },

  /**
   * Get registration statistics
   * @param {string} [eventId] - Optional event ID
   * @returns {Object} Stats {total, checkedIn, pending, completed, absent}
   */
  getStatistics(eventId) {
    const registrations = eventId ? this.getByEventId(eventId) : this.getAll();
    return {
      total: registrations.length,
      checkedIn: registrations.filter(r => r.status === 'checked-in').length,
      pending: registrations.filter(r => r.status === 'pending' || r.status === 'registered').length,
      completed: registrations.filter(r => r.status === 'completed').length,
      absent: registrations.filter(r => r.status === 'absent').length
    };
  }
};