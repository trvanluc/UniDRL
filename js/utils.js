// js/utils.js

// 1. Cấu hình Tailwind (Dùng chung cho cả app)
const tailwindConfig = {
    darkMode: "class",
    theme: {
        extend: {
            colors: {
                "primary": "#36e27b",           // Màu xanh chủ đạo Student
                "primary-hover": "#2ec569",
                "admin-primary": "#19e66b",     // Màu xanh chủ đạo Admin (nếu muốn khác biệt)
                "background-light": "#f6f8f7",
                "background-dark": "#112117",
                "card-dark": "#1c2620",
                "surface-dark": "#2a3630",
                "danger": "#ef4444"
            },
            fontFamily: {
                "display": ["Spline Sans", "sans-serif"],
                "body": ["Noto Sans", "sans-serif"]
            },
            borderRadius: {
                "DEFAULT": "1rem",
                "lg": "1.5rem",
                "xl": "2rem",
                "2xl": "2.5rem",
            },
            boxShadow: {
                "glow": "0 0 20px -5px rgba(54, 226, 123, 0.3)",
            }
        },
    },
};

// Export config ra window để script của Tailwind CDN đọc được
window.tailwindConfig = tailwindConfig;

// 2. Hàm kiểm tra đăng nhập (Mock)
function requireAuth() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (!user) {
        window.location.href = 'login.html';
        return null;
    }
    return user;
}

// 3. Hàm đăng xuất
function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'login.html';
}