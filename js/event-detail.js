document.addEventListener('DOMContentLoaded', () => {
    // 1. Mock Authentication (Lấy user từ localStorage hoặc tạo giả)
    // Trong thực tế, bạn sẽ lấy từ auth.js
    let user = JSON.parse(localStorage.getItem('currentUser'));
   
    // Fallback nếu chưa có user để test (XÓA KHI PROD)
    if (!user) {
        // Change role to 'student' to test student view
        user = { role: 'admin', fullname: 'Master Admin', email: 'admin@vnuk.edu.vn', avatar: 'https://ui-avatars.com/api/?name=Admin' };
        // user = { role: 'student', fullname: 'Nguyen Van A', avatar: 'https://ui-avatars.com/api/?name=Nguyen+Van+A' };
        localStorage.setItem('currentUser', JSON.stringify(user));
    }
    // 2. Lấy eventId từ URL
    const urlParams = new URLSearchParams(window.location.search);
    const eventId = urlParams.get('eventId') || '1'; // Mock eventId
    // 3. Render UI dựa trên Role
    if (user.role === 'admin') {
        renderAdminLayout(user, eventId);
    } else {
        renderStudentLayout(user, eventId);
    }
    // 4. Load event data (mock từ data.js hoặc localStorage)
    // Giả sử events từ data.js
    // const event = events.find(e => e.id == eventId);
    // Cập nhật title, description, etc. nếu cần dynamic
});
// --- RENDER FUNCTIONS ---
function renderAdminLayout(user, eventId) {
    // Thay đổi body class để flex row full height
    document.body.classList.remove('flex-col', 'min-h-screen', 'overflow-x-hidden');
    document.body.classList.add('flex', 'h-screen', 'overflow-hidden');
    // Sử dụng sidebar hiện có và cập nhật
    const sidebar = document.getElementById('sidebar');
    sidebar.innerHTML = `
        <div class="h-16 flex items-center px-6 border-b border-white/5 shrink-0">
            <div class="flex items-center gap-3">
                <div class="size-8 text-primary">
                    <svg class="w-full h-full" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                        <path d="M42.1739 20.1739L27.8261 5.82609C29.1366 7.13663 28.3989 10.1876 26.2002 13.7654C24.8538 15.9564 22.9595 18.3449 20.6522 20.6522C18.3449 22.9595 15.9564 24.8538 13.7654 26.2002C10.1876 28.3989 7.13663 29.1366 5.82609 27.8261L20.1739 42.1739C21.4845 43.4845 24.5355 42.7467 28.1133 40.548C30.3042 39.2016 32.6927 37.3073 35 35C37.3073 32.6927 39.2016 30.3042 40.548 28.1133C42.7467 24.5355 43.4845 21.4845 42.1739 20.1739Z" fill="currentColor"></path>
                        <path clip-rule="evenodd" d="M7.24189 26.4066C7.31369 26.4411 7.64204 26.5637 8.52504 26.3738C9.59462 26.1438 11.0343 25.5311 12.7183 24.4963C14.7583 23.2426 17.0256 21.4503 19.238 19.238C21.4503 17.0256 23.2426 14.7583 24.4963 12.7183C25.5311 11.0343 26.1438 9.59463 26.3738 8.52504C26.5637 7.64204 26.4411 7.31369 26.4066 7.24189C26.345 7.21246 26.143 7.14535 25.6664 7.1918C24.9745 7.25925 23.9954 7.5498 22.7699 8.14278C20.3369 9.32007 17.3369 11.4915 14.4142 14.4142C11.4915 17.3369 9.32007 20.3369 8.14278 22.7699C7.5498 23.9954 7.25925 24.9745 7.1918 25.6664C7.14534 26.143 7.21246 26.345 7.24189 26.4066ZM29.9001 10.7285C29.4519 12.0322 28.7617 13.4172 27.9042 14.8126C26.465 17.1544 24.4686 19.6641 22.0664 22.0664C19.6641 24.4686 17.1544 26.465 14.8126 27.9042C13.4172 28.7617 12.0322 29.4519 10.7285 29.9001L21.5754 40.747C21.6001 40.7606 21.8995 40.931 22.8729 40.7217C23.9424 40.4916 25.3821 39.879 27.0661 38.8441C29.1062 37.5904 31.3734 35.7982 33.5858 33.5858C35.7982 31.3734 37.5904 29.1062 38.8441 27.0661C39.879 25.3821 40.4916 23.9425 40.7216 22.8729C40.931 21.8995 40.7606 21.6001 40.747 21.5754L29.9001 10.7285ZM29.2403 4.41187L43.5881 18.7597C44.9757 20.1473 44.9743 22.1235 44.6322 23.7139C44.2714 25.3919 43.4158 27.2666 42.252 29.1604C40.8128 31.5022 38.8165 34.012 36.4142 36.4142C34.012 38.8165 31.5022 40.8128 29.1604 42.252C27.2666 43.4158 25.3919 44.2714 23.7139 44.6322C22.1235 44.9743 20.1473 44.9757 18.7597 43.5881L4.41187 29.2403C3.29027 28.1187 3.08209 26.5973 3.21067 25.2783C3.34099 23.9415 3.8369 22.4852 4.54214 21.0277C5.96129 18.0948 8.43335 14.7382 11.5858 11.5858C14.7382 8.43335 18.0948 5.9613 21.0277 4.54214C22.4852 3.8369 23.9415 3.34099 25.2783 3.21067C26.5973 3.08209 28.1187 3.29028 29.2403 4.41187Z" fill="currentColor" fill-rule="evenodd"></path>
                    </svg>
                </div>
                <span class="text-lg font-bold tracking-tight text-white">Campus Connect</span>
            </div>
        </div>
        <nav class="flex-1 px-3 py-6 space-y-2 overflow-y-auto">
            <a class="flex items-center gap-3 px-4 py-3 text-sm font-medium text-primary bg-primary/10 rounded-xl border-l-2 border-primary transition-all" href="home.html">
                <span class="material-symbols-outlined text-[20px]">home</span> Home
            </a>
            <a class="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-all" href="admin/participants-management.html">
                <span class="material-symbols-outlined text-[20px]">groups</span> Participant Management
            </a>
            <a class="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-all" href="admin/check-in-management.html">
                <span class="material-symbols-outlined text-[20px]">fact_check</span> Check-in Management
            </a>
            <a class="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-all" href="admin/completion-qr-management.html">
                <span class="material-symbols-outlined text-[20px]">qr_code_scanner</span> Completion QR
            </a>
            <a class="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-all" href="admin/report.html">
                <span class="material-symbols-outlined text-[20px]">bar_chart</span> Reports
            </a>
            <a class="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-all" href="student/profile.html">
                <span class="material-symbols-outlined text-[20px]">person</span> Profile
            </a>
        </nav>
        <div class="p-4 border-t border-white/5 bg-black/20 shrink-0">
            <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full bg-cover bg-center border border-white/10" style="background-image: url('${user.avatar}');"></div>
                <div class="flex flex-col overflow-hidden">
                    <span class="text-sm font-bold text-white truncate">${user.fullname}</span>
                    <span class="text-xs text-gray-500 truncate">${user.email || 'admin@vnuk.edu.vn'}</span>
                </div>
            </div>
        </div>
    `;
    sidebar.classList.remove('hidden');
    sidebar.style.display = 'flex';
    // Thay đổi nav-header thành header admin
    const navHeader = document.getElementById('nav-header');
    navHeader.className = 'h-16 flex items-center justify-between px-6 sm:px-8 bg-background-light/90 dark:bg-background-dark/80 backdrop-blur-md border-b border-gray-200 dark:border-white/5 sticky top-0 z-40 shrink-0';
    navHeader.innerHTML = `
        <div class="flex items-center">
            <button class="md:hidden mr-4 text-gray-500 hover:text-primary">
                <span class="material-symbols-outlined">menu</span>
            </button>
            <h1 class="text-xl font-bold tracking-tight">Event Detail</h1>
        </div>
        <div class="flex items-center gap-2">
            <button class="flex items-center justify-center size-9 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-gray-500 dark:text-gray-400">
                <span class="material-symbols-outlined text-[20px]">notifications</span>
            </button>
            <button class="flex items-center justify-center size-9 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-gray-500 dark:text-gray-400">
                <span class="material-symbols-outlined text-[20px]">settings</span>
            </button>
            <button class="flex items-center justify-center size-9 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-gray-500 dark:text-gray-400">
                <span class="material-symbols-outlined text-[20px]">dark_mode</span>
            </button>
            <div class="h-6 w-px bg-gray-300 dark:bg-white/10 mx-2"></div>
            <button class="flex items-center justify-center size-9 rounded-full hover:bg-red-500/10 text-gray-500 hover:text-red-500 transition-colors">
                <span class="material-symbols-outlined text-[20px]">logout</span>
            </button>
        </div>
    `;
    // Thay đổi main class cho admin
    const mainContent = document.getElementById('main-content');
    mainContent.className = 'flex-1 overflow-y-auto custom-scrollbar p-6 lg:p-10 w-full max-w-[1600px] mx-auto';
    // Thêm back link
    const tabsNav = document.querySelector('.tabs-nav');
    const backLink = document.createElement('a');
    backLink.className = 'inline-flex items-center text-sm font-medium text-gray-500 hover:text-primary mb-6 transition-colors gap-2 group';
    backLink.href = 'home.html';
    backLink.innerHTML = `
        <span class="material-symbols-outlined text-lg transition-transform group-hover:-translate-x-1">arrow_back</span> Back to Event List
    `;
    mainContent.insertBefore(backLink, tabsNav.previousSibling);
    // Update sidebar action cho admin
    const actionButtons = document.getElementById('action-buttons');
    actionButtons.innerHTML = `
        <div class="flex items-center justify-between mb-6">
            <h3 class="text-xl font-bold">Event Details</h3>
            <span class="inline-flex items-center px-2 py-1 rounded-md bg-green-500/10 text-green-500 text-xs font-bold border border-green-500/20">Published</span>
        </div>
        <div class="space-y-6">
            <!-- Giữ nguyên event details -->
        </div>
        <div class="mt-8 pt-6 border-t border-gray-100 dark:border-white/5 grid grid-cols-2 gap-3">
            <button id="edit-event" class="col-span-1 h-12 bg-white/5 hover:bg-white/10 text-white font-medium text-sm rounded-xl border border-white/10 transition-all flex items-center justify-center gap-2">
                <span class="material-symbols-outlined text-[18px]">edit</span> Edit Event
            </button>
            <button id="delete-event" class="col-span-1 h-12 bg-red-500/10 hover:bg-red-500/20 text-red-500 font-medium text-sm rounded-xl border border-red-500/20 transition-all flex items-center justify-center gap-2">
                <span class="material-symbols-outlined text-[18px]">delete</span> Delete
            </button>
            <div class="col-span-2 mt-2">
                <p class="text-center text-xs text-gray-500">
                    Last edited by Admin User on Oct 20
                </p>
            </div>
        </div>
    `;
    document.getElementById('edit-event').addEventListener('click', () => {
        alert('Edit event (mock popup or redirect)');
    });
    document.getElementById('delete-event').addEventListener('click', () => {
        if (confirm('Delete this event?')) {
            alert('Event deleted (mock)');
            window.location.href = 'home.html';
        }
    });
    // Render tab QR cho admin
    const tabQrLabel = document.getElementById('tab-qr-label');
    tabQrLabel.innerHTML = `
        <span class="material-symbols-outlined text-[18px]">qr_code_2</span> Completion QR
    `;
    const qrContent = document.getElementById('qr-content');
    qrContent.innerHTML = `
        <div class="w-full h-full min-h-[600px] bg-gray-800 dark:bg-[#151c18] rounded-[2.5rem] flex flex-col items-center justify-center py-12 px-8 relative overflow-hidden animate-in fade-in zoom-in duration-300 border border-gray-700 dark:border-white/5 shadow-inner">
            <div class="flex-grow flex flex-col items-center justify-center gap-8 w-full z-10">
                <div class="bg-white p-6 rounded-3xl border-8 border-white shadow-2xl transition-transform hover:scale-105 duration-500">
                    <div id="qr-container"></div>
                </div>
                <div class="text-center space-y-4">
                    <div class="inline-flex items-center gap-3 bg-black/40 backdrop-blur-md px-6 py-3 rounded-full border border-white/10 shadow-lg">
                        <div class="relative flex items-center justify-center size-3">
                            <span class="absolute inline-flex h-full w-full rounded-full bg-primary opacity-75 animate-ping"></span>
                            <span class="relative inline-flex rounded-full size-2.5 bg-primary"></span>
                        </div>
                        <span class="text-white text-lg font-bold tracking-wide font-mono">Checked-in: 12 / 50 Students</span>
                    </div>
                    <h2 class="text-2xl sm:text-3xl font-bold text-white max-w-lg mx-auto leading-tight">
                        Scan this code using the Campus App to complete attendance.
                    </h2>
                </div>
            </div>
            <div class="w-full mt-10 z-10">
                <div class="bg-black/30 backdrop-blur-md border-t border-white/10 p-4 sm:p-6 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div class="flex items-center gap-3 text-white/80">
                        <span class="material-symbols-outlined text-orange-400">timer</span>
                        <span class="font-mono text-lg font-medium">Code refreshes in: <span class="text-white font-bold">04:59</span></span>
                    </div>
                    <div class="flex items-center gap-6">
                        <button id="regenerate-qr" class="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-5 py-2.5 rounded-xl transition-all shadow-lg hover:shadow-orange-500/20 active:scale-95">
                            <span class="material-symbols-outlined text-[20px] animate-spin-slow">sync</span> Regenerate Code
                        </button>
                        <div class="h-8 w-px bg-white/20 hidden sm:block"></div>
                        <label class="inline-flex items-center cursor-pointer gap-3 group">
                            <input class="sr-only peer" type="checkbox" value="" />
                            <div class="relative w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-red-500"></div>
                            <span class="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">Lock Attendance</span>
                        </label>
                    </div>
                </div>
            </div>
            <div class="absolute inset-0 z-0 opacity-30 pointer-events-none">
                <div class="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/5 to-transparent"></div>
            </div>
        </div>
    `;
    // Logic cho QR admin
    const qrContainer = document.getElementById('qr-container');
    let qrInstance = null;
    qrInstance = new QRCode(qrContainer, {
        text: `Completion-${eventId}-${Date.now()}`,
        width: 300,
        height: 300,
        colorDark: "#1c2620",
        colorLight: "#ffffff"
    });
    document.getElementById('regenerate-qr').addEventListener('click', () => {
        if (qrInstance) qrInstance.clear();
        qrInstance = new QRCode(qrContainer, {
            text: `Completion-${eventId}-${Date.now()}`,
            width: 300,
            height: 300,
            colorDark: "#1c2620",
            colorLight: "#ffffff"
        });
        alert('QR regenerated (mock)');
    });
    // Ẩn footer cho admin
    const footer = document.querySelector('footer');
    if (footer) footer.style.display = 'none';
}
function renderStudentLayout(user, eventId) {
    // Giữ nguyên render cho student
    renderNavigation(user);
    renderSidebarAction(user, eventId);
    renderTabQr(user, eventId);
}
// Các hàm render khác giữ nguyên từ code gốc
function renderNavigation(user) {
    const navLinks = document.getElementById('nav-links');
    let linksHTML = '';
    if (user.role === 'admin') {
        linksHTML = `
            <a class="text-sm font-medium hover:text-primary transition-colors" href="admin/participants-management.html">Participants Management</a>
            <a class="text-sm font-medium hover:text-primary transition-colors" href="admin/check-in-management.html">Check-in Management</a>
            <a class="text-sm font-medium hover:text-primary transition-colors" href="admin/completion-qr-management.html">Completion QR</a>
            <a class="text-sm font-medium hover:text-primary transition-colors" href="admin/report.html">Report</a>
        `;
    } else {
        linksHTML = `
            <a class="text-sm font-medium hover:text-primary transition-colors" href="home.html">Home</a>
            <a class="text-sm font-medium hover:text-primary transition-colors" href="student/my-event.html">My Events</a>
            <a class="text-sm font-medium hover:text-primary transition-colors" href="student/my-journey.html">My Journey</a>
            <a class="text-sm font-medium hover:text-primary transition-colors" href="student/profile.html">Profile</a>
        `;
    }
    navLinks.innerHTML = linksHTML;
}
function renderSidebarAction(user, eventId) {
    const actionButtons = document.getElementById('action-buttons');
   
    if (user.role === 'admin') {
        actionButtons.innerHTML = `
            <button id="edit-event" class="w-full h-12 bg-blue-500 hover:bg-blue-400 text-white font-bold text-base rounded-full shadow-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 group mb-2">
                Edit Event
                <span class="material-symbols-outlined text-[20px]">edit</span>
            </button>
            <button id="delete-event" class="w-full h-12 bg-red-500 hover:bg-red-400 text-white font-bold text-base rounded-full shadow-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 group mb-2">
                Delete Event
                <span class="material-symbols-outlined text-[20px]">delete</span>
            </button>
            <a href="admin/participants-management.html?eventId=${eventId}" class="w-full h-12 bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-base rounded-full shadow-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 group mb-2">
                Manage Participants
                <span class="material-symbols-outlined text-[20px]">group</span>
            </a>
            <a href="admin/check-in-management.html?eventId=${eventId}" class="w-full h-12 bg-green-600 hover:bg-green-500 text-white font-bold text-base rounded-full shadow-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 group">
                Check-in Management
                <span class="material-symbols-outlined text-[20px]">qr_code_scanner</span>
            </a>
            <p class="text-center text-xs text-gray-400 mt-3">
                Admin Controls
            </p>
        `;
        document.getElementById('edit-event').addEventListener('click', () => {
            alert('Edit event (mock popup or redirect)');
        });
        document.getElementById('delete-event').addEventListener('click', () => {
            if (confirm('Delete this event?')) {
                alert('Event deleted (mock)');
                window.location.href = 'home.html';
            }
        });
    } else {
        let registeredEvents = JSON.parse(localStorage.getItem('registeredEvents')) || [];
        const isRegistered = registeredEvents.includes(eventId);
        if (isRegistered) {
            actionButtons.innerHTML = `
                <div class="w-full py-4 bg-primary/10 border border-primary/20 rounded-2xl text-center">
                    <p class="text-primary font-bold text-lg flex items-center justify-center gap-2">
                        <span class="material-symbols-outlined">check_circle</span> Registered
                    </p>
                    <p class="text-xs text-gray-400 mt-1">See you at the event!</p>
                </div>
                <a href="student/my-event.html?eventId=${eventId}" class="mt-3 block text-center text-sm text-gray-500 hover:text-primary underline">View Ticket</a>
            `;
        } else {
            actionButtons.innerHTML = `
                <button id="openRegisterBtn" class="w-full h-12 bg-primary hover:bg-[#2fd16d] text-black font-bold text-base rounded-full shadow-lg shadow-primary/25 transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 group">
                    Register for Event
                    <span class="material-symbols-outlined text-[20px] transition-transform group-hover:translate-x-1">arrow_forward</span>
                </button>
                <p class="text-center text-xs text-gray-400 mt-3">
                    Registration closes in 2 days
                </p>
            `;
            document.getElementById('openRegisterBtn').addEventListener('click', () => {
                showModal('registerModal');
            });
        }
    }
}
function renderTabQr(user, eventId) {
    const tabQrLabel = document.getElementById('tab-qr-label');
    const qrContent = document.getElementById('qr-content');
    if (user.role === 'admin') {
        tabQrLabel.innerHTML = `
            <span class="material-symbols-outlined text-[18px]">qr_code</span>
            Completion QR
        `;
        qrContent.innerHTML = `
            <div class="w-full h-full min-h-[600px] bg-gray-800 dark:bg-[#151c18] rounded-[2.5rem] flex flex-col items-center justify-center py-12 px-8 relative overflow-hidden animate-in fade-in zoom-in duration-300 border border-gray-700 dark:border-white/5 shadow-inner">
                <div class="flex-grow flex flex-col items-center justify-center gap-8 w-full z-10">
                    <div class="bg-white p-6 rounded-3xl border-8 border-white shadow-2xl transition-transform hover:scale-105 duration-500">
                        <div id="qr-container"></div>
                    </div>
                    <div class="text-center space-y-4">
                        <div class="inline-flex items-center gap-3 bg-black/40 backdrop-blur-md px-6 py-3 rounded-full border border-white/10 shadow-lg">
                            <div class="relative flex items-center justify-center size-3">
                                <span class="absolute inline-flex h-full w-full rounded-full bg-primary opacity-75 animate-ping"></span>
                                <span class="relative inline-flex rounded-full size-2.5 bg-primary"></span>
                            </div>
                            <span class="text-white text-lg font-bold tracking-wide font-mono">Checked-in: 12 / 50 Students</span>
                        </div>
                        <h2 class="text-2xl sm:text-3xl font-bold text-white max-w-lg mx-auto leading-tight">
                            Scan this code using the Campus App to complete attendance.
                        </h2>
                    </div>
                </div>
                <div class="w-full mt-10 z-10">
                    <div class="bg-black/30 backdrop-blur-md border-t border-white/10 p-4 sm:p-6 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-6">
                        <div class="flex items-center gap-3 text-white/80">
                            <span class="material-symbols-outlined text-orange-400">timer</span>
                            <span class="font-mono text-lg font-medium">Code refreshes in: <span class="text-white font-bold">04:59</span></span>
                        </div>
                        <div class="flex items-center gap-6">
                            <button id="regenerate-qr" class="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-5 py-2.5 rounded-xl transition-all shadow-lg hover:shadow-orange-500/20 active:scale-95">
                                <span class="material-symbols-outlined text-[20px] animate-spin-slow">sync</span> Regenerate Code
                            </button>
                            <div class="h-8 w-px bg-white/20 hidden sm:block"></div>
                            <label class="inline-flex items-center cursor-pointer gap-3 group">
                                <input class="sr-only peer" type="checkbox" value="" />
                                <div class="relative w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-red-500"></div>
                            <span class="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">Lock Attendance</span>
                            </label>
                        </div>
                    </div>
                </div>
                <div class="absolute inset-0 z-0 opacity-30 pointer-events-none">
                    <div class="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/5 to-transparent"></div>
                </div>
            </div>
        `;
        const qrContainer = document.getElementById('qr-container');
        let qrInstance = null;
        let qrTimer = null;
        qrInstance = new QRCode(qrContainer, {
            text: `Completion-${eventId}-${Date.now()}`,
            width: 300,
            height: 300,
            colorDark: "#1c2620",
            colorLight: "#ffffff"
        });
        document.getElementById('regenerate-qr').addEventListener('click', () => {
            if (qrInstance) qrInstance.clear();
            qrInstance = new QRCode(qrContainer, {
                text: `Completion-${eventId}-${Date.now()}`,
                width: 300,
                height: 300,
                colorDark: "#1c2620",
                colorLight: "#ffffff"
            });
            alert('QR regenerated (mock)');
        });
    } else {
        // STUDENT TAB QR
        // Giữ nguyên code gốc
        const qrContent = document.getElementById('qr-content');
        // Add logic if needed
    }
}
// --- MODAL LOGIC (Dành cho Student Register) ---
function showModal(id) {
    document.getElementById(id).style.display = 'block';
}
function closeModal(id) {
    document.getElementById(id).style.display = 'none';
}
function handleRegistrationSubmit(eventId) {
    // Mock submit
    const submitBtn = document.getElementById('submitBtn');
    submitBtn.innerHTML = `<span class="material-symbols-outlined animate-spin">progress_activity</span> Processing...`;
    setTimeout(() => {
        // Hide form, show success
        document.getElementById('registerFormContent').classList.add('hidden');
        document.getElementById('successMessage').classList.remove('hidden');
        submitBtn.classList.add('hidden');
        // Update localStorage registered
        let registeredEvents = JSON.parse(localStorage.getItem('registeredEvents')) || [];
        registeredEvents.push(eventId);
        localStorage.setItem('registeredEvents', JSON.stringify(registeredEvents));
        // Update sidebar UI
        renderSidebarAction(JSON.parse(localStorage.getItem('currentUser')), eventId);
    }, 1000);
}
// Giả sử HTML có modal registerModal với form, successMessage, submitBtn
// document.getElementById('registerForm').addEventListener('submit', (e) => { e.preventDefault(); handleRegistrationSubmit(eaventId); });