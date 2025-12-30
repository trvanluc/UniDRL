/**
 * ==========================================
 * TOAST NOTIFICATION SERVICE
 * ==========================================
 * Replace browser alerts with beautiful toast messages
 * 
 * Usage:
 * - Toast.success('Thành công!')
 * - Toast.error('Có lỗi xảy ra!')
 * - Toast.warning('Cảnh báo!')
 * - Toast.info('Thông tin')
 */

const Toast = {
    container: null,

    /**
     * Initialize toast container
     */
    init() {
        if (this.container) return;

        this.container = document.createElement('div');
        this.container.id = 'toast-container';
        this.container.className = 'fixed top-4 right-4 z-[9999] flex flex-col gap-3 pointer-events-none';
        document.body.appendChild(this.container);
    },

    /**
     * Show a toast notification
     */
    show(message, type = 'info', duration = 3000) {
        this.init();

        const icons = {
            success: 'check_circle',
            error: 'error',
            warning: 'warning',
            info: 'info'
        };

        const colors = {
            success: 'bg-green-500',
            error: 'bg-red-500',
            warning: 'bg-yellow-500',
            info: 'bg-blue-500'
        };

        const toast = document.createElement('div');
        toast.className = `
      pointer-events-auto
      flex items-center gap-3 
      px-5 py-4 
      rounded-xl 
      ${colors[type] || colors.info} 
      text-white 
      shadow-2xl 
      min-w-[300px] max-w-[400px]
      transform translate-x-full
      transition-all duration-300 ease-out
      backdrop-blur-sm
    `;

        toast.innerHTML = `
      <span class="material-symbols-outlined text-2xl">${icons[type] || icons.info}</span>
      <span class="flex-1 text-sm font-medium">${message}</span>
      <button class="toast-close hover:opacity-70 transition-opacity">
        <span class="material-symbols-outlined text-lg">close</span>
      </button>
    `;

        this.container.appendChild(toast);

        // Animate in
        requestAnimationFrame(() => {
            toast.classList.remove('translate-x-full');
            toast.classList.add('translate-x-0');
        });

        // Close button
        toast.querySelector('.toast-close').addEventListener('click', () => {
            this.dismiss(toast);
        });

        // Auto dismiss
        if (duration > 0) {
            setTimeout(() => {
                this.dismiss(toast);
            }, duration);
        }

        return toast;
    },

    /**
     * Dismiss a toast
     */
    dismiss(toast) {
        toast.classList.remove('translate-x-0');
        toast.classList.add('translate-x-full', 'opacity-0');
        setTimeout(() => {
            toast.remove();
        }, 300);
    },

    /**
     * Success toast
     */
    success(message, duration = 3000) {
        return this.show(message, 'success', duration);
    },

    /**
     * Error toast
     */
    error(message, duration = 4000) {
        return this.show(message, 'error', duration);
    },

    /**
     * Warning toast
     */
    warning(message, duration = 3500) {
        return this.show(message, 'warning', duration);
    },

    /**
     * Info toast
     */
    info(message, duration = 3000) {
        return this.show(message, 'info', duration);
    }
};

export { Toast };
