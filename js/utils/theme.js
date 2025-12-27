/**
 * ==========================================
 * THEME UTILITY - Dark/Light Mode Switcher
 * ==========================================
 */

const THEME_KEY = "vnuk_theme";

export const Theme = {
  /**
   * Get current theme from localStorage or system preference
   */
  getCurrentTheme() {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved) return saved;

    // Check system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  },

  /**
   * Apply theme to HTML element
   */
  applyTheme(theme) {
    const html = document.documentElement;
    
    if (theme === 'dark') {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
    
    localStorage.setItem(THEME_KEY, theme);
  },

  /**
   * Toggle between dark and light
   */
  toggleTheme() {
    const current = this.getCurrentTheme();
    const newTheme = current === 'dark' ? 'light' : 'dark';
    this.applyTheme(newTheme);
    return newTheme;
  },

  /**
   * Initialize theme on page load
   */
  init() {
    const theme = this.getCurrentTheme();
    this.applyTheme(theme);
    this.updateIcon(theme);
  },

  /**
   * Update theme icon
   */
  updateIcon(theme) {
    const icons = document.querySelectorAll('.theme-toggle-icon');
    icons.forEach(icon => {
      icon.textContent = theme === 'dark' ? 'light_mode' : 'dark_mode';
    });
  }
};