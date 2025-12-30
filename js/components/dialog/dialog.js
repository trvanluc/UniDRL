/**
 * ==========================================
 * CUSTOM POPUP/DIALOG SERVICE
 * ==========================================
 * Replace browser alert/confirm with beautiful custom dialogs
 * 
 * Usage:
 * - await Dialog.alert('Thông báo', 'Nội dung thông báo')
 * - const result = await Dialog.confirm('Xác nhận', 'Bạn có chắc?')
 * - if (result) { ... }
 */

const Dialog = {
    /**
     * Create and show a dialog
     */
    create(options) {
        const {
            title = 'Thông báo',
            message = '',
            type = 'info', // info, success, warning, error, confirm
            confirmText = 'OK',
            cancelText = 'Hủy',
            showCancel = false
        } = options;

        return new Promise((resolve) => {
            const icons = {
                info: { icon: 'info', color: 'bg-blue-500' },
                success: { icon: 'check_circle', color: 'bg-green-500' },
                warning: { icon: 'warning', color: 'bg-yellow-500' },
                error: { icon: 'error', color: 'bg-red-500' },
                confirm: { icon: 'help', color: 'bg-primary' }
            };

            const { icon, color } = icons[type] || icons.info;

            const overlay = document.createElement('div');
            overlay.className = 'fixed inset-0 z-[9999] flex items-center justify-center p-4';
            overlay.innerHTML = `
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm dialog-backdrop"></div>
        <div class="relative z-10 w-full max-w-md transform scale-95 opacity-0 transition-all duration-200 dialog-content">
          <div class="bg-white dark:bg-[#1c2621] rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-white/10">
            <!-- Header -->
            <div class="p-6 text-center">
              <div class="w-16 h-16 ${color} rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <span class="material-symbols-outlined text-white text-3xl">${icon}</span>
              </div>
              <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">${title}</h3>
              <p class="text-gray-600 dark:text-gray-400">${message}</p>
            </div>
            
            <!-- Actions -->
            <div class="p-4 bg-gray-50 dark:bg-black/20 flex gap-3 ${showCancel ? '' : 'justify-center'}">
              ${showCancel ? `
                <button class="dialog-cancel flex-1 py-3 px-6 rounded-xl bg-gray-200 dark:bg-white/10 hover:bg-gray-300 dark:hover:bg-white/20 text-gray-700 dark:text-white font-bold transition-colors">
                  ${cancelText}
                </button>
              ` : ''}
              <button class="dialog-confirm flex-1 py-3 px-6 rounded-xl ${type === 'error' ? 'bg-red-500 hover:bg-red-600' : 'bg-primary hover:bg-[#2fd16f]'} text-white font-bold transition-colors shadow-lg">
                ${confirmText}
              </button>
            </div>
          </div>
        </div>
      `;

            document.body.appendChild(overlay);

            // Animate in
            requestAnimationFrame(() => {
                const content = overlay.querySelector('.dialog-content');
                content.classList.remove('scale-95', 'opacity-0');
                content.classList.add('scale-100', 'opacity-100');
            });

            // Handle confirm
            overlay.querySelector('.dialog-confirm').addEventListener('click', () => {
                this.dismiss(overlay, () => resolve(true));
            });

            // Handle cancel
            const cancelBtn = overlay.querySelector('.dialog-cancel');
            if (cancelBtn) {
                cancelBtn.addEventListener('click', () => {
                    this.dismiss(overlay, () => resolve(false));
                });
            }

            // Handle backdrop click (cancel)
            overlay.querySelector('.dialog-backdrop').addEventListener('click', () => {
                if (showCancel) {
                    this.dismiss(overlay, () => resolve(false));
                }
            });

            // Handle Escape key
            const handleEscape = (e) => {
                if (e.key === 'Escape') {
                    document.removeEventListener('keydown', handleEscape);
                    this.dismiss(overlay, () => resolve(showCancel ? false : true));
                }
            };
            document.addEventListener('keydown', handleEscape);
        });
    },

    /**
     * Dismiss dialog with animation
     */
    dismiss(overlay, callback) {
        const content = overlay.querySelector('.dialog-content');
        content.classList.remove('scale-100', 'opacity-100');
        content.classList.add('scale-95', 'opacity-0');

        setTimeout(() => {
            overlay.remove();
            if (callback) callback();
        }, 200);
    },

    /**
     * Show alert dialog (replacement for window.alert)
     */
    alert(title, message, type = 'info') {
        return this.create({
            title,
            message,
            type,
            confirmText: 'OK',
            showCancel: false
        });
    },

    /**
     * Show confirm dialog (replacement for window.confirm)
     */
    confirm(title, message, confirmText = 'Xác nhận', cancelText = 'Hủy') {
        return this.create({
            title,
            message,
            type: 'confirm',
            confirmText,
            cancelText,
            showCancel: true
        });
    },

    /**
     * Show success dialog
     */
    success(title, message = '') {
        return this.create({
            title,
            message,
            type: 'success',
            confirmText: 'Tuyệt vời!',
            showCancel: false
        });
    },

    /**
     * Show error dialog
     */
    error(title, message = '') {
        return this.create({
            title,
            message,
            type: 'error',
            confirmText: 'Đóng',
            showCancel: false
        });
    },

    /**
     * Show warning dialog
     */
    warning(title, message = '') {
        return this.create({
            title,
            message,
            type: 'warning',
            confirmText: 'Đã hiểu',
            showCancel: false
        });
    }
};

export { Dialog };
