/**
 * ==========================================
 * CONSTANTS - Application Configuration
 * ==========================================
 */
export const STORAGE_KEYS = {
  USERS: "vnuk_users",
  CURRENT_USER: "vnuk_currentUser",
  EVENTS: "events",
  BADGES: "vnuk_badge_config",
  REGISTRATIONS: "event_registrations",
  CHECKOUT_QR: "vnuk_checkout_qr", // Checkout QR codes for events
};

export const ROLES = {
  STUDENT: "student",
  ADVISOR: "advisor",
  MANAGER: "manager",
  ADMIN: "admin"
};

export const QR_SCANNER_CONFIG = {
  FPS: 10,
  QR_BOX_SIZE: 250,
  ASPECT_RATIO: 1.0,
  CAMERA_FACING: "environment"
};