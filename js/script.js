/**
 * SCRIPT.JS - Main Authentication & Application Logic
 * Handles: Login, Signup, Session Management, Role-based Navigation
 */

// ==================== CONFIGURATION ====================
const CONFIG = {
    STORAGE_KEYS: {
        USERS: 'vnuk_users',
        CURRENT_USER: 'vnuk_currentUser',
        EVENTS: 'vnuk_events'
    },
    ROLES: {
        STUDENT: 'student',
        ADVISOR: 'advisor',
        MANAGER: 'manager'
    },
    ROUTES: {
        student: 'student/home.html',
        advisor: 'admin/home.html',
        manager: 'admin/home.html'
    }
};

// ==================== UTILITY FUNCTIONS ====================
const Utils = {
    // Validate email format
    isValidEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },

    // Generate student ID with current year
    generateStudentId() {
        const year = new Date().getFullYear();
        return 'SV' + year + String(Math.floor(Math.random() * 1000)).padStart(3, '0');
    },

    // Show toast notification
    showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `fixed bottom-6 right-6 z-50 px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-[slideIn_0.3s_ease-out] ${
            type === 'success' 
                ? 'bg-primary text-black' 
                : 'bg-red-500 text-white'
        }`;
        
        toast.innerHTML = `
            <span class="material-symbols-outlined">${type === 'success' ? 'check_circle' : 'error'}</span>
            <p class="font-bold">${message}</p>
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(20px)';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    },

    // Get current user from session
    getCurrentUser() {
        const userJson = localStorage.getItem(CONFIG.STORAGE_KEYS.CURRENT_USER);
        return userJson ? JSON.parse(userJson) : null;
    },

    // Check if user is logged in
    isLoggedIn() {
        return this.getCurrentUser() !== null;
    },

    // Logout user
    logout() {
        localStorage.removeItem(CONFIG.STORAGE_KEYS.CURRENT_USER);
        window.location.href = '../login.html';
    }
};

// ==================== STORAGE MANAGER ====================
const StorageManager = {
    // Get all users
    getUsers() {
        const usersJson = localStorage.getItem(CONFIG.STORAGE_KEYS.USERS);
        return usersJson ? JSON.parse(usersJson) : [];
    },

    // Save users
    saveUsers(users) {
        localStorage.setItem(CONFIG.STORAGE_KEYS.USERS, JSON.stringify(users));
    },

    // Add new user
    addUser(userData) {
        const users = this.getUsers();
        users.push(userData);
        this.saveUsers(users);
    },

    // Find user by email
    findUserByEmail(email) {
        const users = this.getUsers();
        return users.find(u => u.email.toLowerCase() === email.toLowerCase());
    },

    // Save current user session
    saveCurrentUser(user) {
        localStorage.setItem(CONFIG.STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    },

    // Initialize demo data (for testing)
    initializeDemoData() {
        const users = this.getUsers();
        if (users.length === 0) {
            // Add demo users with updated year
            const currentYear = new Date().getFullYear();
            const demoUsers = [
                {
                    name: 'Alex Johnson',
                    email: 'student@vnuk.edu.vn',
                    password: '123456',
                    role: CONFIG.ROLES.STUDENT,
                    studentId: 'SV' + currentYear + '05',
                    class: 'CS-' + currentYear + '-A',
                    createdAt: new Date().toISOString()
                },
                {
                    name: 'Admin User',
                    email: 'admin@vnuk.edu.vn',
                    password: 'admin123',
                    role: CONFIG.ROLES.MANAGER,
                    studentId: null,
                    createdAt: new Date().toISOString()
                }
            ];
            this.saveUsers(demoUsers);
            console.log('Demo data initialized');
        }
    }
};

// ==================== SIGNUP HANDLER ====================
const SignupHandler = {
    init() {
        const form = document.querySelector('.signup-form');
        if (form) {
            form.addEventListener('submit', this.handleSubmit.bind(this));
        }
    },

    handleSubmit(e) {
        e.preventDefault();

        // Get form elements
        const nameInput = document.getElementById('fullname');
        const emailInput = document.getElementById('email');
        const passwordInput = document.getElementById('password');
        const confirmPasswordInput = document.getElementById('confirm-password');
        const roleSelect = document.getElementById('role');
        const termsCheckbox = document.getElementById('terms');

        // Validate elements exist
        if (!nameInput || !emailInput || !passwordInput || !confirmPasswordInput || !roleSelect) {
            Utils.showToast('Form elements missing. Please check HTML.', 'error');
            return;
        }

        // Get values
        const name = nameInput.value.trim();
        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();
        const confirmPassword = confirmPasswordInput.value.trim();
        const role = roleSelect.value;

        // Validate inputs
        if (!name || !email || !password || !confirmPassword) {
            Utils.showToast('Please fill in all fields!', 'error');
            return;
        }

        if (!Utils.isValidEmail(email)) {
            Utils.showToast('Please enter a valid email address!', 'error');
            return;
        }

        if (password.length < 6) {
            Utils.showToast('Password must be at least 6 characters!', 'error');
            return;
        }

        if (password !== confirmPassword) {
            Utils.showToast('Passwords do not match!', 'error');
            return;
        }

        if (termsCheckbox && !termsCheckbox.checked) {
            Utils.showToast('Please accept Terms and Privacy Policy!', 'error');
            return;
        }

        // Check if email already exists
        if (StorageManager.findUserByEmail(email)) {
            Utils.showToast('This email is already registered!', 'error');
            return;
        }

        // Create new user
        const currentYear = new Date().getFullYear();
        const newUser = {
            name,
            email,
            password,
            role,
            studentId: role === CONFIG.ROLES.STUDENT ? Utils.generateStudentId() : null,
            class: role === CONFIG.ROLES.STUDENT ? 'CS-' + currentYear + '-A' : null,
            createdAt: new Date().toISOString()
        };

        // Save to storage
        StorageManager.addUser(newUser);

        // Success
        Utils.showToast(`Account created successfully! Your ID: ${newUser.studentId || 'N/A'}`, 'success');
        
        // Redirect to login after 2 seconds
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 2000);
    }
};

// ==================== LOGIN HANDLER ====================
const LoginHandler = {
    init() {
        const form = document.querySelector('form');
        if (form && document.querySelector('input[name="role"]')) {
            form.addEventListener('submit', this.handleSubmit.bind(this));
        }
    },

    handleSubmit(e) {
        e.preventDefault();

        // Get form values
        const emailInput = document.getElementById('email');
        const passwordInput = document.getElementById('password');
        const roleRadio = document.querySelector('input[name="role"]:checked');

        if (!emailInput || !passwordInput) {
            Utils.showToast('Form elements missing!', 'error');
            return;
        }

        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();
        const selectedRole = roleRadio ? roleRadio.value : null;

        // Validate
        if (!email || !password) {
            Utils.showToast('Please enter email and password!', 'error');
            return;
        }

        if (!selectedRole) {
            Utils.showToast('Please select your role!', 'error');
            return;
        }

        // Find user
        const user = StorageManager.findUserByEmail(email);

        if (!user) {
            Utils.showToast('Email not found!', 'error');
            return;
        }

        if (user.password !== password) {
            Utils.showToast('Incorrect password!', 'error');
            return;
        }

        // Check role match
        if (user.role !== selectedRole) {
            Utils.showToast(`This account is registered as "${user.role.toUpperCase()}", cannot login as "${selectedRole.toUpperCase()}"`, 'error');
            return;
        }

        // Success - save session
        StorageManager.saveCurrentUser(user);
        Utils.showToast(`Welcome back, ${user.name}!`, 'success');

        // Redirect based on role
        setTimeout(() => {
            const route = CONFIG.ROUTES[user.role] || 'home.html';
            window.location.href = route;
        }, 1000);
    }
};

// ==================== HOME PAGE HANDLER ====================
const HomeHandler = {
    init() {
        // Check if user is logged in
        if (!Utils.isLoggedIn()) {
            window.location.href = '../login.html';
            return;
        }

        const user = Utils.getCurrentUser();
        this.renderUserInfo(user);
        this.setupLogoutButton();
    },

    renderUserInfo(user) {
        // Update welcome message
        const welcomeElement = document.querySelector('h1');
        if (welcomeElement && welcomeElement.textContent.includes('Welcome back')) {
            welcomeElement.innerHTML = `Welcome back, <span class="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">${user.name}</span>.`;
        }

        // Update profile links
        const profileLinks = document.querySelectorAll('a[href*="profile"]');
        profileLinks.forEach(link => {
            link.href = link.href.replace('profile.html', `${user.role}/profile.html`);
        });
    },

    setupLogoutButton() {
        // Add logout button to settings dropdown if exists
        const settingsBtn = document.querySelector('button[aria-label*="settings"], .settings-button');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', (e) => {
                e.preventDefault();
                if (confirm('Are you sure you want to logout?')) {
                    Utils.logout();
                }
            });
        }
    }
};

// ==================== NAVIGATION PROTECTION ====================
const NavigationProtection = {
    init() {
        const currentPath = window.location.pathname;
        
        // Skip protection for public pages
        const publicPages = ['index.html', 'login.html', 'signup.html', ''];
        const isPublicPage = publicPages.some(page => currentPath.includes(page) || currentPath === '/');
        
        if (isPublicPage) return;

        // Check authentication
        if (!Utils.isLoggedIn()) {
            window.location.href = '/login.html';
            return;
        }

        // Check role-based access
        const user = Utils.getCurrentUser();
        const isStudentPage = currentPath.includes('/student/');
        const isAdminPage = currentPath.includes('/admin/');

        if (isStudentPage && user.role !== CONFIG.ROLES.STUDENT) {
            Utils.showToast('Access denied! Student area only.', 'error');
            setTimeout(() => window.location.href = CONFIG.ROUTES[user.role], 2000);
        }

        if (isAdminPage && (user.role !== CONFIG.ROLES.ADVISOR && user.role !== CONFIG.ROLES.MANAGER)) {
            Utils.showToast('Access denied! Admin area only.', 'error');
            setTimeout(() => window.location.href = CONFIG.ROUTES[user.role], 2000);
        }
    }
};

// ==================== INITIALIZE ====================
document.addEventListener('DOMContentLoaded', () => {
    // Initialize demo data
    StorageManager.initializeDemoData();

    // Initialize handlers based on page
    const currentPath = window.location.pathname;

    if (currentPath.includes('signup.html')) {
        SignupHandler.init();
    } else if (currentPath.includes('login.html')) {
        LoginHandler.init();
    } else if (currentPath.includes('home.html')) {
        HomeHandler.init();
    }

    // Always run navigation protection
    NavigationProtection.init();
});

// Export for use in other scripts
window.VNUKApp = {
    Utils,
    StorageManager,
    CONFIG
};


/**
 * SCRIPT.JS - Xử lý logic hiển thị Home dựa trên Role
 */

document.addEventListener("DOMContentLoaded", () => {
    const user = requireAuth(); // Từ utils.js
    if (!user) return;

    // Khởi tạo giao diện dựa trên Role
    if (user.role === 'student') {
        renderStudentLayout(user);
    } else if (user.role === 'admin' || user.role === 'manager') {
        renderAdminLayout(user);
    }

    // Render danh sách sự kiện (Dữ liệu chung)
    renderEvents(mockEvents);
});

// --- DỮ LIỆU MOCK (Giả lập Database) ---
const mockEvents = [
    {
        id: 1,
        title: "Annual Hackathon 2024",
        date: { month: "Oct", day: "12" },
        time: "09:00 AM - 06:00 PM",
        location: "Main Auditorium",
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCYuxKZpNL3M3ZDYyFOgP7kGbw0c-Rm_ZYHeJDxPy8sHhP2qZijAxKBgqXC8QliLvTuC1TpH49ss4Ev7lz4uh3BEjAhoysHzJVad4-Jg60btCAbcNzDF6EhCauJJvCFgzVLdLb-3rdZ5KP1cDXqT-qudHlxZbeapYFqlZZwUPYJdu7Jjz_sjiFyvTqnXjDQXTERItPMCiDMFPoOpCz1sSig-C13ihjJ0p0V7IFVknSbguLFA9lXPDzJbEhDm2-hcbsjPN5Tf-wuJOA",
        status: "Filling Fast",
        drl: 20,
        type: "academic"
    },
    {
        id: 2,
        title: "Career Fair Prep Workshop",
        date: { month: "Oct", day: "14" },
        time: "02:00 PM - 04:00 PM",
        location: "Room 302, Student Center",
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBSfBWbBT-g_Tj-yJeK3EEycgX7ilyt6P6PfGxhoY35bONyuNY3g6jjqUrECALnaX9pBWFTNIg0vgce_Mbb66FNre_b_srYWzQElaZIEyS7yydqTRF_SyGaXkHOm1k6iRX0lRYFBUtAOuZJaHxE-Q-5_vygyl3aQPcR1NlgxCYxJ-tvdjZW8H9_dsX9yLwChG6SmzBiS4EaMRf7N4SUvq7k3c4ZUar1DD0clXZVZE-WPN8f7DDRTsB6bx11dJXWjjuCtveuoJ5jaks",
        status: "Open",
        drl: 5,
        type: "workshop"
    },
    {
        id: 3,
        title: "Campus Jazz Night",
        date: { month: "Oct", day: "20" },
        time: "07:00 PM - 10:00 PM",
        location: "Student Lawn",
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDK3phR3nxr5XkO9UfTTe38m4SKdBbl2XGTu0cfBGz3MbaA2SqOZgPyqi7aFiCrgRb8PWDRyP0yvW5XWJz7Fim2qDTdpgBeSSQfpWN-NSPUgLw4WxFGu-B0N40kM-KGTjppnlgAw7dFV6tVqkzWn-a9Gj0-nsf64Ze9WPczIAaeSv-EljWsYR4FGVM4ElEHoO912uZ64gxkeJBCZNh7A4AR_fx44NQUMzme89sefFXrglUFtk5X_SIc7IczlK6fmxSd6xKXcg01-T0",
        status: "Closed",
        drl: 10,
        type: "social"
    }
];

// ==========================================
// 1. LAYOUT CHO STUDENT
// ==========================================
function renderStudentLayout(user) {
    // A. Navbar Student (Top Navigation)
    const navbarHTML = `
        <div class="flex items-center justify-between border-b border-slate-200 dark:border-[#29382f] bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md px-6 py-4 lg:px-10">
            <div class="flex items-center gap-4">
                <div class="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-background-dark">
                    <span class="material-symbols-outlined">school</span>
                </div>
                <h2 class="text-lg font-bold hidden sm:block">VN-UK Student</h2>
            </div>
            
            <nav class="hidden md:flex items-center gap-8">
                <a class="text-sm font-bold text-primary" href="home.html">Home</a>
                <a class="text-sm font-medium hover:text-primary transition-colors" href="student/my-event.html">My Events</a>
                <a class="text-sm font-medium hover:text-primary transition-colors" href="student/my-journey.html">My Journey</a>
                <a class="text-sm font-medium hover:text-primary transition-colors" href="student/profile.html">Profile</a>
            </nav>

            <div class="flex gap-3">
                <button onclick="logout()" class="flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 dark:bg-[#29382f] hover:text-red-500 transition-colors">
                    <span class="material-symbols-outlined text-[20px]">logout</span>
                </button>
            </div>
        </div>
    `;
    document.getElementById('navbar-container').innerHTML = navbarHTML;

    // B. Hero Section Student
    const heroHTML = `
        <div class="relative flex flex-col justify-end overflow-hidden rounded-xl bg-cover bg-center min-h-[300px] p-8 md:p-12 shadow-2xl mb-8" 
             style='background-image: linear-gradient(180deg, rgba(17, 33, 23, 0) 0%, rgba(17, 33, 23, 0.9) 100%), url("https://lh3.googleusercontent.com/aida-public/AB6AXuAPxLQp92aSOGUIgxoO8m_NmGxdx8kpS3JnbnUPgCpAci7EyiYsVjh8qrJgkjONLubshfxhUWfDEnhsVNVbU84sn6qhV_Mt-KUjup26NQw3MKqdTd4l86ZR-o33Efwq-Ey3Bm6EKPJw0JiXXB7LQfy86smYpLaG2qTt5LIA5U8eC4n2TD8WcVKfNYeo2D2IbGW0tnggxkweF6a51AktkAJPZeR73pE023Y-1i2l-aF4ZJg-abyzYCUMHrZ4og_e5HWYqqx_nSYDQB4");'>
            <div class="relative z-10 flex flex-col gap-4 max-w-2xl">
                <h1 class="text-3xl md:text-5xl font-black text-white">Welcome back, ${user.name}.</h1>
                <p class="text-base text-slate-200 font-medium">Don't miss out on the Annual Hackathon. Registration closes in 24 hours!</p>
                <div class="flex gap-4 pt-2">
                    <button class="h-10 px-6 rounded-full bg-primary hover:bg-[#2ec569] text-background-dark font-bold text-sm">Register Now</button>
                </div>
            </div>
        </div>
        
        <div class="flex flex-col lg:flex-row gap-6 items-center justify-between">
             <label class="flex items-center h-12 w-full lg:w-[400px] bg-white dark:bg-[#29382f] rounded-xl px-4 shadow-sm border border-slate-100 dark:border-transparent">
                <span class="material-symbols-outlined text-slate-400">search</span>
                <input class="w-full bg-transparent border-none text-sm ml-2 focus:ring-0" placeholder="Search events..." />
            </label>
            <div class="flex gap-3 overflow-x-auto w-full lg:w-auto">
                <button class="h-10 px-5 rounded-full bg-primary text-background-dark font-bold text-sm">All Events</button>
                <button class="h-10 px-5 rounded-full bg-white dark:bg-[#29382f] text-sm border border-slate-200 dark:border-transparent">Academic</button>
            </div>
        </div>
    `;
    document.getElementById('hero-section').innerHTML = heroHTML;
}

// ==========================================
// 2. LAYOUT CHO ADMIN
// ==========================================
function renderAdminLayout(user) {
    // A. Sidebar Admin (Left Menu)
    const sidebarContainer = document.getElementById('admin-sidebar-container');
    sidebarContainer.classList.remove('hidden'); // Hiển thị sidebar
    sidebarContainer.classList.add('fixed', 'left-0', 'top-0', 'h-screen', 'w-64', 'bg-background-light', 'dark:bg-background-dark', 'border-r', 'border-gray-200', 'dark:border-[#29382f]', 'flex', 'flex-col');
    
    // Đẩy content chính sang phải
    document.getElementById('main-wrapper').classList.add('lg:ml-64');

    sidebarContainer.innerHTML = `
        <div class="p-6 flex items-center gap-3">
            <div class="size-8 text-primary"><svg viewBox="0 0 48 48" class="w-full h-full fill-current"><path d="M42 20L28 6..."/></svg></div>
            <span class="text-lg font-bold dark:text-white">VNUK Admin</span>
        </div>
        <div class="p-4 space-y-2 flex-1">
            <a href="#" class="flex items-center gap-3 px-4 py-3 rounded-xl bg-primary/10 text-primary font-bold"><span class="material-symbols-outlined">dashboard</span> Home</a>
            <a href="admin/participants-management.html" class="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-500 hover:bg-white/5"><span class="material-symbols-outlined">groups</span> Participants</a>
            <a href="admin/check-in-management.html" class="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-500 hover:bg-white/5"><span class="material-symbols-outlined">fact_check</span> Check-in</a>
        </div>
        <div class="p-4 border-t border-gray-800">
            <button onclick="logout()" class="flex items-center gap-2 text-red-500 font-bold text-sm"><span class="material-symbols-outlined">logout</span> Logout</button>
        </div>
    `;

    // B. Navbar Admin (Simplified Top Header)
    const navbarHTML = `
        <div class="flex items-center justify-between h-16 px-8 bg-background-light/90 dark:bg-background-dark/90 backdrop-blur-md border-b border-gray-200 dark:border-[#29382f]">
            <div class="text-xl font-bold dark:text-white">Event Dashboard</div>
            <div class="flex items-center gap-3">
                <div class="text-right hidden sm:block">
                    <p class="text-sm font-bold dark:text-white">${user.name}</p>
                    <p class="text-xs text-gray-500">Super Admin</p>
                </div>
                <div class="size-10 rounded-full bg-gray-600"></div>
            </div>
        </div>
    `;
    document.getElementById('navbar-container').innerHTML = navbarHTML;

    // C. Create Event Button (FAB)
    const fabHTML = `
        <button onclick="document.getElementById('create-modal').classList.remove('hidden')" 
                class="fixed bottom-8 right-8 z-40 flex items-center gap-2 px-5 py-4 bg-primary hover:bg-primary-hover text-surface-dark font-bold rounded-full shadow-lg transition-transform hover:scale-105">
            <span class="material-symbols-outlined">add</span> Create Event
        </button>
    `;
    document.getElementById('admin-fab-container').innerHTML = fabHTML;

    // D. Inject Modal Create Event
    injectCreateEventModal();
}

// ==========================================
// 3. RENDER EVENTS CARD (CHUNG)
-ee
function renderEvents(events) {
    const grid = document.getElementById('event-grid');
    grid.innerHTML = events.map(event => `
        <div class="group flex flex-col bg-white dark:bg-card-dark rounded-xl overflow-hidden border border-slate-100 dark:border-[#2a3630] hover:border-primary/50 transition-all hover:-translate-y-1 hover:shadow-glow">
            <div class="relative h-48 w-full overflow-hidden">
                <img alt="${event.title}" class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" src="${event.image}" />
                <div class="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                    <span class="text-xs font-bold text-primary uppercase">${event.status}</span>
                </div>
            </div>
            <div class="p-6 flex flex-col flex-1 gap-4">
                <div class="flex justify-between items-start gap-4">
                    <h3 class="text-xl font-bold text-slate-900 dark:text-white leading-tight">${event.title}</h3>
                    <div class="flex flex-col items-center justify-center bg-primary/10 rounded-lg p-2 min-w-[60px]">
                        <span class="text-xs font-bold text-primary uppercase">${event.date.month}</span>
                        <span class="text-xl font-black text-primary">${event.date.day}</span>
                    </div>
                </div>
                <div class="flex flex-col gap-2 text-slate-500 dark:text-slate-400 text-sm">
                    <div class="flex items-center gap-2">
                        <span class="material-symbols-outlined text-[18px]">location_on</span>
                        <span>${event.location}</span>
                    </div>
                    <div class="flex items-center gap-2">
                        <span class="material-symbols-outlined text-[18px]">schedule</span>
                        <span>${event.time}</span>
                    </div>
                </div>
                <div class="mt-auto pt-4 flex items-center justify-between border-t border-slate-100 dark:border-[#2a3630]">
                    <div class="flex items-center gap-2">
                        <span class="material-symbols-outlined text-primary text-[20px]">stars</span>
                        <span class="text-sm font-bold text-slate-900 dark:text-white">${event.drl} DRL</span>
                    </div>
                    <a href="event-detail.html?id=${event.id}" class="h-10 px-5 flex items-center rounded-full bg-slate-100 dark:bg-[#2a3630] group-hover:bg-primary text-slate-900 dark:text-white group-hover:text-background-dark font-bold text-sm transition-colors">
                        View Detail
                    </a>
                </div>
            </div>
        </div>
    `).join('');
}

// 4. Helper: Inject Modal Code (Chỉ cho Admin)
function injectCreateEventModal() {
    const modalHTML = `
    <div id="create-modal" class="hidden fixed inset-0 z-[60] items-center justify-center p-4 sm:p-6 flex">
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" onclick="document.getElementById('create-modal').classList.add('hidden')"></div>
        <div class="relative w-full max-w-2xl bg-surface-dark rounded-3xl shadow-2xl p-6 border border-white/10">
            <h3 class="text-xl font-bold text-white mb-4">Create New Event</h3>
            <div class="space-y-4">
                <input class="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white" placeholder="Event Title" />
                <div class="grid grid-cols-2 gap-4">
                    <input type="date" class="bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white" />
                    <input type="text" class="bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white" placeholder="DRL Points" />
                </div>
            </div>
            <div class="flex justify-end gap-3 mt-6">
                <button onclick="document.getElementById('create-modal').classList.add('hidden')" class="px-6 py-2 rounded-full text-gray-300 hover:bg-white/10">Cancel</button>
                <button class="px-6 py-2 rounded-full bg-primary text-black font-bold">Create</button>
            </div>
        </div>
    </div>
    `;
    document.getElementById('create-event-modal-container').innerHTML = modalHTML;
}