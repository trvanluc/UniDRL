/**
 * ==========================================
 * FORM VALIDATOR - Reusable validation class
 * ==========================================
 * Usage: new FormValidator().required(value, msg, errorId).isValid()
 */
export class FormValidator {
  constructor() {
    this.errors = [];
  }

  /**
   * Check required field
   * @param {string} value - Field value
   * @param {string} message - Error message
   * @param {string} errorId - DOM error element ID
   * @returns {FormValidator} this
   */
  required(value, message, errorId) {
    if (!value || value.trim() === "") {
      this.errors.push({ message, errorId });
      showError(errorId, message);
    } else {
      hideError(errorId);
    }
    return this;
  }

  /**
   * Check email format
   * @param {string} value - Email value
   * @param {string} message - Error message
   * @param {string} errorId - DOM error element ID
   * @returns {FormValidator} this
   */
  email(value, message, errorId) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      this.errors.push({ message, errorId });
      showError(errorId, message);
    } else {
      hideError(errorId);
    }
    return this;
  }

  /**
   * Check if form is valid
   * @returns {boolean} True if no errors
   */
  isValid() {
    return this.errors.length === 0;
  }
}

// Helper functions
function showError(errorId, message) {
  const errorEl = document.getElementById(errorId);
  if (errorEl) {
    errorEl.textContent = message;
    errorEl.classList.remove("hidden");
  }
}

function hideError(errorId) {
  const errorEl = document.getElementById(errorId);
  if (errorEl) {
    errorEl.classList.add("hidden");
  }
}