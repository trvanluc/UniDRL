/**
 * ==========================================
 * CHECKOUT SERVICE - Checkout QR Logic
 * ==========================================
 * Manages checkout QR codes for events
 * - Create checkout QR with expiration
 * - Verify QR codes
 * - Process student checkout
 * ==========================================
 */

import { Storage } from "../utils/storage.js";
import { STORAGE_KEYS } from "../config/constants.js";
import { RegistrationService } from "./registration.service.js";
import { BadgeService } from "./badge.service.js";

const CHECKOUT_QR_KEY = "vnuk_checkout_qr";

export const CheckoutService = {
    /**
     * Create a checkout QR code for an event
     * @param {string} eventId - Event ID
     * @param {number} expireMinutes - Minutes until QR expires (default: 15)
     * @param {string} createdBy - Admin email who created
     * @returns {Object} QR code data
     */
    createCheckoutQR(eventId, expireMinutes = 15, createdBy = "admin") {
        const now = new Date();
        const expiresAt = new Date(now.getTime() + expireMinutes * 60 * 1000);

        const qrData = {
            qrCode: `CHECKOUT_${eventId}_${now.getTime()}`,
            eventId: eventId,
            createdAt: now.toISOString(),
            expiresAt: expiresAt.toISOString(),
            createdBy: createdBy
        };

        // Save to localStorage
        const allQR = this.getAllCheckoutQR();
        allQR[eventId] = qrData;
        Storage.set(CHECKOUT_QR_KEY, allQR);

        console.log(`✅ Checkout QR created for event: ${eventId}, expires in ${expireMinutes} minutes`);
        return qrData;
    },

    /**
     * Get all checkout QR codes
     * @returns {Object} All QR codes by eventId
     */
    getAllCheckoutQR() {
        return Storage.get(CHECKOUT_QR_KEY) || {};
    },

    /**
     * Get active checkout QR for an event
     * @param {string} eventId - Event ID
     * @returns {Object|null} QR data or null if not found/expired
     */
    getActiveCheckoutQR(eventId) {
        const allQR = this.getAllCheckoutQR();
        const qrData = allQR[eventId];

        if (!qrData) return null;

        // Check if expired
        if (this.isExpired(qrData.expiresAt)) {
            return null;
        }

        return qrData;
    },

    /**
     * Check if QR code is expired
     * @param {string} expiresAt - ISO date string
     * @returns {boolean} True if expired
     */
    isExpired(expiresAt) {
        return new Date() > new Date(expiresAt);
    },

    /**
     * Verify a scanned QR code
     * @param {string} qrCode - Scanned QR code string
     * @returns {Object} { valid: boolean, eventId: string, error: string }
     */
    verifyCheckoutQR(qrCode) {
        // Check format
        if (!qrCode || !qrCode.startsWith("CHECKOUT_")) {
            return { valid: false, error: "Mã QR không hợp lệ" };
        }

        // Parse QR code: CHECKOUT_eventId_timestamp
        const parts = qrCode.split("_");
        if (parts.length < 3) {
            return { valid: false, error: "Định dạng mã QR không đúng" };
        }

        // Get eventId (could have underscores in it)
        const eventId = parts.slice(1, -1).join("_");

        // Find matching QR in storage
        const allQR = this.getAllCheckoutQR();
        const storedQR = allQR[eventId];

        if (!storedQR) {
            return { valid: false, error: "Không tìm thấy mã checkout cho sự kiện này" };
        }

        if (storedQR.qrCode !== qrCode) {
            return { valid: false, error: "Mã QR không khớp" };
        }

        // Check expiration
        if (this.isExpired(storedQR.expiresAt)) {
            return { valid: false, error: "Mã QR đã hết hạn" };
        }

        return { valid: true, eventId: eventId, qrData: storedQR };
    },

    /**
     * Process student checkout
     * @param {string} qrCode - Scanned QR code
     * @param {string} studentId - Student MSSV
     * @returns {Object} { success: boolean, error: string, event: Object }
     */
    processCheckout(qrCode, studentId) {
        // 1. Verify QR code
        const verification = this.verifyCheckoutQR(qrCode);
        if (!verification.valid) {
            return { success: false, error: verification.error };
        }

        const eventId = verification.eventId;

        // 2. Check if student registered for this event
        const registration = RegistrationService.findByMSSVAndEventId(studentId, eventId);
        if (!registration) {
            return { success: false, error: "Bạn chưa đăng ký sự kiện này" };
        }

        // 3. Check if student has checked in
        if (registration.status !== "checked-in" && !registration.checkInTime) {
            return { success: false, error: "Bạn cần check-in trước khi checkout" };
        }

        // 4. Check if already checked out
        if (registration.status === "completed" || registration.checkoutTime) {
            return { success: false, error: "Bạn đã checkout sự kiện này rồi" };
        }

        // 5. Get event info for Q&A
        const event = BadgeService.getById(eventId);
        if (!event) {
            return { success: false, error: "Không tìm thấy thông tin sự kiện" };
        }

        // 6. Check if badge claiming is enabled
        if (!event.badgeConfig || !event.badgeConfig.isClaimable) {
            // Still allow checkout, just without badge Q&A
            this.completeCheckout(studentId, eventId, null);
            return {
                success: true,
                event: event,
                hasBadgeQuiz: false,
                message: "Checkout thành công!"
            };
        }

        // Return event with Q&A for the quiz
        return {
            success: true,
            event: event,
            hasBadgeQuiz: true,
            qa_pairs: event.badgeConfig.qa_pairs,
            rules: event.badgeConfig.rules
        };
    },

    /**
     * Complete the checkout process after Q&A
     * @param {string} studentId - Student MSSV
     * @param {string} eventId - Event ID
     * @param {string} badgeEarned - Badge type (bronze/silver/gold/null)
     * @param {number} correctAnswers - Number of correct answers
     * @returns {boolean} Success status
     */
    completeCheckout(studentId, eventId, badgeEarned, correctAnswers = 0) {
        const checkoutTime = new Date().toISOString();

        // Update registration
        const registration = RegistrationService.findByMSSVAndEventId(studentId, eventId);
        if (!registration) return false;

        const updates = {
            status: "completed",
            checkoutTime: checkoutTime,
            badgeEarned: badgeEarned,
            correctAnswers: correctAnswers
        };

        // Use updateByQRCode or direct update
        const allRegistrations = RegistrationService.getAll();
        const index = allRegistrations.findIndex(r => r.mssv === studentId && r.eventId === eventId);

        if (index !== -1) {
            allRegistrations[index] = { ...allRegistrations[index], ...updates };
            localStorage.setItem(STORAGE_KEYS.REGISTRATIONS, JSON.stringify(allRegistrations));
            console.log(`✅ Checkout completed: ${studentId} for ${eventId}, badge: ${badgeEarned}`);
            return true;
        }

        return false;
    },

    /**
     * Calculate badge based on correct answers
     * @param {number} correctAnswers - Number of correct answers
     * @param {Object} rules - Badge rules {bronze, silver, gold}
     * @returns {string|null} Badge type or null
     */
    calculateBadge(correctAnswers, rules) {
        if (!rules) return null;

        if (correctAnswers >= rules.gold) {
            return "gold";
        } else if (correctAnswers >= rules.silver) {
            return "silver";
        } else if (correctAnswers >= rules.bronze) {
            return "bronze";
        }

        return null;
    },

    /**
     * Get remaining time for QR code
     * @param {string} expiresAt - ISO date string
     * @returns {Object} { minutes, seconds, expired }
     */
    getRemainingTime(expiresAt) {
        const now = new Date();
        const expires = new Date(expiresAt);
        const diff = expires - now;

        if (diff <= 0) {
            return { minutes: 0, seconds: 0, expired: true };
        }

        const minutes = Math.floor(diff / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);

        return { minutes, seconds, expired: false };
    },

    /**
     * Delete checkout QR for an event
     * @param {string} eventId - Event ID
     */
    deleteCheckoutQR(eventId) {
        const allQR = this.getAllCheckoutQR();
        delete allQR[eventId];
        Storage.set(CHECKOUT_QR_KEY, allQR);
    }
};
