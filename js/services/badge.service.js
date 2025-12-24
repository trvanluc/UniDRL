// js/services/badge.service.js
import { Storage } from "../utils/storage.js";
import { STORAGE_KEYS } from "../config/constants.js";
import { EVENTS } from "../data/events.data.js";
/**
 * ===============================
 * LẤY DANH SÁCH SỰ KIỆN THẬT
 * ===============================
 * Nếu localStorage chưa có "events" (lần đầu load) → tự động khởi tạo từ EVENTS.
 */
function getEventList() {
  let events = Storage.get(STORAGE_KEYS.EVENTS);
  if (!events || !Array.isArray(events) || events.length === 0) {
    Storage.set(STORAGE_KEYS.EVENTS, EVENTS);
    events = EVENTS;
  }
  return events;
}

/**
 * ===============================
 * BADGE SERVICE
 * ===============================
 */
export const BadgeService = {
  // Lấy tất cả sự kiện (kèm theo cấu hình badge nếu có)
  getAll() {
    const badgeConfigs = Storage.get(STORAGE_KEYS.BADGES) || {};
    const events = getEventList();

    return events.map(evt => ({
      ...evt,
      badgeConfig: badgeConfigs[evt.id] || {
        isClaimable: false,
        qa_pairs: [],
        rules: { bronze: 1, silver: 3, gold: 5 },
      },
    }));
  },

  // Lưu cấu hình badge cho từng sự kiện
  updateBadge(eventId, config) {
    const all = Storage.get(STORAGE_KEYS.BADGES) || {};
    all[eventId] = config;
    Storage.set(STORAGE_KEYS.BADGES, all);
  },

  // Lấy một sự kiện cụ thể
  getById(eventId) {
    const events = this.getAll();
    return events.find(e => e.id === eventId);
  },

  // Reset toàn bộ cấu hình badge (không ảnh hưởng danh sách sự kiện)
  reset() {
    Storage.remove(STORAGE_KEYS.BADGES);
  },
};
