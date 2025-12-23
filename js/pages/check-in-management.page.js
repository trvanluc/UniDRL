/**
 * ==========================================
 * CHECK-IN MANAGEMENT - Admin Page
 * ==========================================
 * Xử lý quét QR Code và check-in sinh viên
 * ==========================================
 */

// Key để lưu trữ đăng ký trong localStorage (phải khớp với event-detail.page.js)
const STORAGE_KEY_REGISTRATIONS = "event_registrations";

// Biến để quản lý scanner
let html5QrCode = null;
let isScanning = false;
let selectedEventId = null;

// Danh sách events (7 events)
const EVENTS = [
    { id: "hackathon-2024", title: "Annual Hackathon 2024" },
    { id: "career-fair", title: "Career Fair Prep Workshop" },
    { id: "jazz-night", title: "Campus Jazz Night" },
    { id: "robotics", title: "Intro to Robotics" },
    { id: "yoga-week", title: "Wellness Week: Yoga" },
    { id: "leadership-summit", title: "Student Leadership Summit" },
    { id: "blockchain-workshop", title: "Blockchain & Web3 Workshop" }
];

// ================================
// ADMIN EVENT MAPPING (FIX CỨNG)
// ================================
const ADMIN_EVENT_MAP = {
    "ADMIN_EVENT_1": [
      "hackathon-2024",
      "career-fair",
      "jazz-night"
    ],
    "ADMIN_EVENT_2": [
      "blockchain-workshop",
      "robotics",
      "yoga-week",
      "leadership-summit"
    ]
  };
  
  function resolveAdminEventId(eventId) {
    for (const adminId in ADMIN_EVENT_MAP) {
      if (ADMIN_EVENT_MAP[adminId].includes(eventId)) {
        return adminId;
      }
    }
    return null;
  }
  

/**
 * Lấy danh sách tất cả đăng ký từ localStorage
 */
function getAllRegistrations() {
    try {
        const data = localStorage.getItem(STORAGE_KEY_REGISTRATIONS);
        if (!data) return [];
        
        const parsed = JSON.parse(data);
        return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
        console.warn('Invalid registrations data in localStorage, resetting to empty array');
        return [];
    }
}

/**
 * Tìm đăng ký theo QR Code string (format: MSSV_EVENTID)
 */
function findRegistrationByQRCode(qrCodeString) {
    const allRegistrations = getAllRegistrations();
    
    // Tìm exact match
    let registration = allRegistrations.find(reg => reg.qrCode === qrCodeString);
    
    // Nếu không tìm thấy, thử tìm với case-insensitive
    if (!registration) {
        registration = allRegistrations.find(reg => 
            reg.qrCode.toLowerCase() === qrCodeString.toLowerCase()
        );
    }
    
    // Nếu vẫn không tìm thấy, thử tìm bằng cách so sánh từng phần (MSSV_EVENTID)
    if (!registration && qrCodeString.includes('_')) {
        const parts = qrCodeString.split('_');
        if (parts.length >= 2) {
            const mssv = parts[0];
            const eventId = parts.slice(1).join('_');
            registration = allRegistrations.find(reg => 
                reg.mssv === mssv && reg.eventId === eventId
            );
        }
    }
    
    return registration;
}

/**
 * Cập nhật đăng ký trong localStorage (check-in)
 */
function updateRegistrationStatus(qrCodeString, updates) {
    let allRegistrations = getAllRegistrations();
    
    // Ensure allRegistrations is always an array
    if (!Array.isArray(allRegistrations)) {
        allRegistrations = [];
    }
    
    const index = allRegistrations.findIndex(reg =>
        reg.qrCode === qrCodeString ||
        reg.qrCode.toLowerCase() === qrCodeString.toLowerCase()
      );
    
    if (index !== -1) {
        allRegistrations[index] = { ...allRegistrations[index], ...updates };
        localStorage.setItem(STORAGE_KEY_REGISTRATIONS, JSON.stringify(allRegistrations));
        return allRegistrations[index];
    }
    return null;
}

/**
 * Xử lý khi quét được QR Code
 */
function handleQRCodeScanned(decodedText) {
    // Dừng scanner để tránh quét nhiều lần
    if (isScanning) {
        stopScanner();
    }

    // Làm sạch text (loại bỏ khoảng trắng, xuống dòng, ký tự đặc biệt)
    const cleanQRCode = decodedText.trim().replace(/\s+/g, '').replace(/[^\w\-_]/g, '');

    // Kiểm tra nếu đã chọn event
    if (!selectedEventId) {
        showNotification("Chưa chọn event", "Vui lòng chọn event từ dropdown trước khi quét QR Code", "error");
        return;
    }

    // Tìm đăng ký trong localStorage
    let registration = findRegistrationByQRCode(cleanQRCode);
    
    // Nếu không tìm thấy, thử tìm với text gốc (không làm sạch)
    if (!registration) {
        registration = findRegistrationByQRCode(decodedText.trim());
    }

    if (!registration) {
        // Không tìm thấy đăng ký
        showNotification("Mã không hợp lệ", "QR Code không tồn tại trong hệ thống", "error");
        return;
    }

    // Kiểm tra QR Code có thuộc event đã chọn không
    if (registration.eventId !== selectedEventId) {
        const event = EVENTS.find(e => e.id === registration.eventId);
        const selectedEvent = EVENTS.find(e => e.id === selectedEventId);
        showNotification(
            "QR Code không khớp", 
            `QR Code này thuộc event "${event?.title || registration.eventId}" nhưng bạn đang quét cho event "${selectedEvent?.title || selectedEventId}"`, 
            "error"
        );
        return;
    }

    // Kiểm tra trạng thái check-in
    if (registration.status === "checked-in") {
        // Đã check-in rồi
        showStudentInfo(registration, true);
        updateRecentCheckIns();
        showNotification("Đã check-in", `Sinh viên ${registration.name} (${registration.mssv}) đã check-in trước đó`, "warning");
        return;
    }

    // Chưa check-in - thực hiện check-in
    const checkInTime = new Date().toISOString();
    const qrCodeToUpdate = registration.qrCode;

    const adminEventId = resolveAdminEventId(registration.eventId);

    if (!adminEventId) {
    showNotification(
        "Event chưa được gán admin",
        "Event này chưa thuộc danh sách quản lý của admin",
        "error"
    );
    return;
    }

    const updatedRegistration = updateRegistrationStatus(qrCodeToUpdate, {
    status: "checked-in",
    checkInTime: checkInTime,
    adminEventId
    });

    if (updatedRegistration) {
        // Hiển thị thông tin sinh viên
        showStudentInfo(updatedRegistration, false);
        
        // Hiển thị thông báo thành công
        showNotification("Check-in thành công", `${updatedRegistration.name} đã được check-in`, "success");
        
        // Cập nhật danh sách recent check-ins
        updateRecentCheckIns();
    }
}

/**
 * Hiển thị thông tin sinh viên sau khi check-in
 * Giao diện đẹp và rõ ràng để giảng viên dễ nhìn
 */
function showStudentInfo(registration, isAlreadyCheckedIn) {
    const studentInfoCard = document.getElementById('student-info-card');
    if (!studentInfoCard) return;

    // Badge trạng thái ở góc trên bên phải
    const statusBadge = isAlreadyCheckedIn 
        ? '<div class="absolute top-4 right-4 flex items-center gap-2 px-3 py-1.5 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 text-xs font-bold rounded-full border border-yellow-500/20 animate-pulse"><span class="material-symbols-outlined text-[16px]">warning</span>Đã check-in trước đó</div>'
        : '<div class="absolute top-4 right-4 flex items-center gap-2 px-3 py-1.5 bg-green-500/10 text-green-600 dark:text-green-400 text-xs font-bold rounded-full border border-green-500/20 animate-bounce"><span class="material-symbols-outlined text-[16px]">check_circle</span>Check-in thành công!</div>';

    // Format thời gian check-in
    const checkInTime = registration.checkInTime 
        ? new Date(registration.checkInTime).toLocaleTimeString('vi-VN', { 
            hour: '2-digit', 
            minute: '2-digit', 
            second: '2-digit' 
          })
        : new Date().toLocaleTimeString('vi-VN', { 
            hour: '2-digit', 
            minute: '2-digit', 
            second: '2-digit' 
          });

    // Format ngày đăng ký
    const registrationDate = registration.registrationDate
        ? new Date(registration.registrationDate).toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          })
        : 'N/A';

    // Tên sự kiện
    const eventTitle = registration.eventTitle || 'Sự kiện';

    studentInfoCard.innerHTML = `
        <div class="bg-surface-light dark:bg-surface-dark rounded-3xl p-6 shadow-lg border-2 ${isAlreadyCheckedIn ? 'border-yellow-500/30' : 'border-green-500/30'} relative overflow-hidden animate-in fade-in zoom-in">
            ${statusBadge}
            
            <!-- Header với icon lớn -->
            <div class="text-center mb-6">
                <div class="w-20 h-20 rounded-full ${isAlreadyCheckedIn ? 'bg-yellow-500/10' : 'bg-green-500/10'} flex items-center justify-center mx-auto mb-4">
                    <span class="material-symbols-outlined text-4xl ${isAlreadyCheckedIn ? 'text-yellow-500' : 'text-green-500'}">${isAlreadyCheckedIn ? 'warning' : 'check_circle'}</span>
                </div>
                <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-1">${registration.name}</h3>
                <p class="text-sm text-gray-500 dark:text-gray-400">${eventTitle}</p>
            </div>

            <!-- Thông tin chi tiết -->
            <div class="space-y-3 mb-6">
                <div class="flex items-center gap-3 p-3 bg-surface-dark/5 dark:bg-white/5 rounded-xl">
                    <span class="material-symbols-outlined text-primary">badge</span>
                    <div class="flex-1">
                        <p class="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold">MSSV</p>
                        <p class="text-lg font-mono font-bold text-gray-900 dark:text-white">${registration.mssv}</p>
                    </div>
                </div>
                
                <div class="flex items-center gap-3 p-3 bg-surface-dark/5 dark:bg-white/5 rounded-xl">
                    <span class="material-symbols-outlined text-primary">school</span>
                    <div class="flex-1">
                        <p class="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold">Lớp</p>
                        <p class="text-base font-medium text-gray-900 dark:text-white">${registration.class}</p>
                    </div>
                </div>
                
                <div class="flex items-center gap-3 p-3 bg-surface-dark/5 dark:bg-white/5 rounded-xl">
                    <span class="material-symbols-outlined text-primary">email</span>
                    <div class="flex-1">
                        <p class="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold">Email</p>
                        <p class="text-sm text-gray-700 dark:text-gray-300 break-all">${registration.email}</p>
                    </div>
                </div>
            </div>

            <!-- Grid thông tin check-in -->
            <div class="grid grid-cols-2 gap-4 mb-4">
                <div class="bg-gradient-to-br ${isAlreadyCheckedIn ? 'from-yellow-500/10 to-yellow-600/5' : 'from-green-500/10 to-green-600/5'} rounded-xl p-4 border ${isAlreadyCheckedIn ? 'border-yellow-500/20' : 'border-green-500/20'}">
                    <p class="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold mb-2">Trạng thái</p>
                    <p class="${isAlreadyCheckedIn ? 'text-yellow-600 dark:text-yellow-400' : 'text-green-600 dark:text-green-400'} font-bold text-lg flex items-center gap-2">
                        <span class="size-3 rounded-full ${isAlreadyCheckedIn ? 'bg-yellow-500' : 'bg-green-500'} animate-pulse"></span>
                        Đã check-in
                    </p>
                </div>
                
                <div class="bg-gradient-to-br from-blue-500/10 to-blue-600/5 rounded-xl p-4 border border-blue-500/20">
                    <p class="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold mb-2">Thời gian</p>
                    <p class="text-gray-900 dark:text-white font-bold text-lg">${checkInTime}</p>
                </div>
            </div>

            <!-- Thông tin đăng ký -->
            <div class="pt-4 border-t border-gray-200 dark:border-white/5">
                <div class="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span class="flex items-center gap-1">
                        <span class="material-symbols-outlined text-[14px]">calendar_today</span>
                        Đăng ký: ${registrationDate}
                    </span>
                    <span class="flex items-center gap-1">
                        <span class="material-symbols-outlined text-[14px]">qr_code</span>
                        ${registration.qrCode}
                    </span>
                </div>
            </div>
        </div>
    `;
}

/**
 * Hiển thị thông báo
 */
function showNotification(title, message, type = "success") {
    const notificationContainer = document.querySelector('.fixed.bottom-6.right-6');
    if (!notificationContainer) return;

    const icon = type === "success" ? "check_circle" : type === "error" ? "error" : "warning";

    const notification = document.createElement('div');
    notification.className = `bg-surface-light dark:bg-surface-dark border-l-4 ${type === "success" ? "border-green-500" : type === "error" ? "border-red-500" : "border-yellow-500"} text-gray-900 dark:text-white px-4 py-3 rounded shadow-lg flex items-center gap-3 transform transition-all translate-y-0 opacity-100 mb-2`;
    notification.innerHTML = `
        <span class="material-symbols-outlined ${type === "success" ? "text-green-500" : type === "error" ? "text-red-500" : "text-yellow-500"}">${icon}</span>
        <div>
            <p class="font-bold text-sm">${title}</p>
            <p class="text-xs text-gray-500">${message}</p>
        </div>
    `;

    notificationContainer.appendChild(notification);

    // Tự động xóa sau 5 giây
    setTimeout(() => {
        notification.style.opacity = "0";
        notification.style.transform = "translateY(-20px)";
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 5000);
}

/**
 * Bắt đầu quét QR Code bằng camera
 */
function startScanner() {
    if (isScanning) {
        return;
    }

    // Kiểm tra thư viện đã load chưa
    if (typeof Html5Qrcode === "undefined") {
        alert("Thư viện quét QR Code chưa được tải. Vui lòng reload trang hoặc sử dụng chế độ nhập thủ công.");
        return;
    }

    const qrReader = document.getElementById('qr-reader');
    if (!qrReader) {
        return;
    }

    // Xóa nội dung cũ nếu có
    qrReader.innerHTML = "";

    try {
        // Khởi tạo html5-qrcode
        html5QrCode = new Html5Qrcode("qr-reader");

        // Cấu hình scanner
        const config = {
            fps: 10, // Frames per second
            qrbox: { width: 250, height: 250 }, // Kích thước khung quét
            aspectRatio: 1.0
        };

        // Bắt đầu quét từ camera
        html5QrCode.start(
            { 
                facingMode: "environment" // Camera sau (ưu tiên) hoặc "user" (camera trước)
            }, 
            config,
            (decodedText, decodedResult) => {
                // Callback khi quét được QR Code
                // Dừng scanner ngay để tránh quét nhiều lần
                if (isScanning) {
                    stopScanner();
                }
                
                // Xử lý QR Code - dùng setTimeout để đảm bảo scanner đã dừng
                setTimeout(() => {
                    handleQRCodeScanned(decodedText);
                }, 100);
            },
            (errorMessage) => {
                // Callback khi có lỗi
            }
        ).then(() => {
            isScanning = true;
            const startBtn = document.getElementById('start-scanner-btn');
            const stopBtn = document.getElementById('stop-scanner-btn');
            if (startBtn) startBtn.classList.add('hidden');
            if (stopBtn) stopBtn.classList.remove('hidden');
        }).catch((err) => {
            // Hiển thị thông báo lỗi chi tiết hơn
            let errorMsg = "Không thể khởi động camera.\n\n";
            
            if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
                errorMsg += "Vui lòng cho phép truy cập camera trong cài đặt trình duyệt.";
            } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
                errorMsg += "Không tìm thấy camera. Vui lòng kiểm tra camera đã được kết nối chưa.";
            } else if (err.name === "NotReadableError" || err.name === "TrackStartError") {
                errorMsg += "Camera đang được sử dụng bởi ứng dụng khác. Vui lòng đóng ứng dụng đó.";
            } else {
                errorMsg += `Lỗi: ${err.message || err}\n\nVui lòng sử dụng chế độ nhập thủ công.`;
            }
            
            alert(errorMsg);
            isScanning = false;
        });
    } catch (error) {
        alert("Lỗi khi khởi tạo scanner. Vui lòng reload trang hoặc sử dụng chế độ nhập thủ công.");
        isScanning = false;
    }
}

/**
 * Dừng quét QR Code
 */
function stopScanner() {
    if (!isScanning || !html5QrCode) {
        return;
    }

    html5QrCode.stop().then(() => {
        html5QrCode.clear();
        isScanning = false;
        document.getElementById('start-scanner-btn').classList.remove('hidden');
        document.getElementById('stop-scanner-btn').classList.add('hidden');
        
        // Xóa nội dung camera
        const qrReader = document.getElementById('qr-reader');
        if (qrReader) {
            qrReader.innerHTML = "";
        }
    }).catch((err) => {
        // Force stop nếu có lỗi
        isScanning = false;
        document.getElementById('start-scanner-btn').classList.remove('hidden');
        document.getElementById('stop-scanner-btn').classList.add('hidden');
    });
}

/**
 * Xử lý check-in thủ công (nhập mã)
 */
function handleManualCheckIn() {
    // Kiểm tra nếu đã chọn event
    if (!selectedEventId) {
        showNotification("Chưa chọn event", "Vui lòng chọn event từ dropdown trước khi nhập mã", "error");
        return;
    }

    const ticketCodeInput = document.getElementById('ticket-code');
    const qrCodeString = ticketCodeInput.value.trim();

    if (!qrCodeString) {
        alert("Vui lòng nhập mã QR Code");
        return;
    }

    handleQRCodeScanned(qrCodeString);
    ticketCodeInput.value = "";
}

/**
 * Load danh sách events vào dropdown
 */
function loadEventsToDropdown() {
    const eventSelect = document.getElementById('event-select');
    if (!eventSelect) return;

    // Xóa options cũ (trừ option đầu tiên)
    while (eventSelect.children.length > 1) {
        eventSelect.removeChild(eventSelect.lastChild);
    }

    // Thêm 7 events
    EVENTS.forEach(event => {
        const option = document.createElement('option');
        option.value = event.id;
        option.textContent = event.title;
        eventSelect.appendChild(option);
    });
}

/**
 * Xử lý khi chọn event từ dropdown
 */
function handleEventSelect(eventId) {
    selectedEventId = eventId;
    const event = EVENTS.find(e => e.id === eventId);
    
    // Hiển thị thông tin event đã chọn
    const eventInfoEl = document.getElementById('selected-event-info');
    const eventNameEl = document.getElementById('selected-event-name');
    
    if (event && eventInfoEl && eventNameEl) {
        eventInfoEl.classList.remove('hidden');
        eventNameEl.textContent = event.title;
    }

    // Dừng scanner nếu đang chạy
    if (isScanning) {
        stopScanner();
    }

    // Cập nhật danh sách recent check-ins theo event
    updateRecentCheckIns();
}

/**
 * Cập nhật danh sách recent check-ins (filter theo event đã chọn)
 */
function updateRecentCheckIns() {
    const allRegistrations = getAllRegistrations();
    
    // Filter theo event đã chọn (nếu có)
    let filteredRegistrations = allRegistrations;
    if (selectedEventId) {
        filteredRegistrations = allRegistrations.filter(reg => reg.eventId === selectedEventId);
    }
    
    const checkedInRegistrations = filteredRegistrations
        .filter(reg => reg.status === "checked-in")
        .sort((a, b) => new Date(b.checkInTime) - new Date(a.checkInTime))
        .slice(0, 5); // Lấy 5 check-in gần nhất

    const tbody = document.querySelector('#recent-checkins-table tbody');
    if (!tbody) return;

    if (checkedInRegistrations.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="4" class="py-8 text-center text-gray-500 dark:text-gray-400">
                    <div class="flex flex-col items-center gap-2">
                        <span class="material-symbols-outlined text-4xl text-gray-300 dark:text-gray-600">event_busy</span>
                        <p class="text-sm">Chưa có check-in nào cho event này</p>
                    </div>
                </td>
            </tr>
        `;
    } else {
        tbody.innerHTML = checkedInRegistrations.map(reg => {
            const checkInTime = reg.checkInTime 
                ? new Date(reg.checkInTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
                : 'N/A';
            
            return `
                <tr class="group hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                    <td class="py-3 pl-2 border-b border-gray-100 dark:border-white/5 font-mono text-gray-500 dark:text-gray-400">${reg.mssv}</td>
                    <td class="py-3 border-b border-gray-100 dark:border-white/5 font-medium">${reg.name}</td>
                    <td class="py-3 border-b border-gray-100 dark:border-white/5 text-gray-500">${checkInTime}</td>
                    <td class="py-3 pr-2 border-b border-gray-100 dark:border-white/5 text-right">
                        <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">Success</span>
                    </td>
                </tr>
            `;
        }).join('');
    }
}

/**
 * Chuyển đổi giữa QR Scan Mode và Manual Input Mode
 */
function switchMode(mode) {
    const tabQr = document.getElementById('tab-qr');
    const tabManual = document.getElementById('tab-manual');
    const contentQr = document.getElementById('content-qr');
    const contentManual = document.getElementById('content-manual');

    const activeClasses = ['text-primary', 'border-b-2', 'border-primary', 'bg-primary/5'];
    const inactiveClasses = ['text-gray-500', 'dark:text-gray-400', 'hover:text-gray-900', 'dark:hover:text-white', 'hover:bg-gray-50', 'dark:hover:bg-white/5'];

    if (mode === 'qr') {
        // Dừng scanner nếu đang chạy
        if (isScanning) {
            stopScanner();
        }

        contentQr.classList.remove('hidden');
        contentManual.classList.add('hidden');

        tabQr.classList.add(...activeClasses);
        tabQr.classList.remove(...inactiveClasses);

        tabManual.classList.remove(...activeClasses);
        tabManual.classList.add(...inactiveClasses);
    } else if (mode === 'manual') {
        // Dừng scanner nếu đang chạy
        if (isScanning) {
            stopScanner();
        }

        contentManual.classList.remove('hidden');
        contentQr.classList.add('hidden');

        tabManual.classList.add(...activeClasses);
        tabManual.classList.remove(...inactiveClasses);

        tabQr.classList.remove(...activeClasses);
        tabQr.classList.add(...inactiveClasses);
    }
}

/**
 * Khởi tạo khi trang load
 */
document.addEventListener('DOMContentLoaded', () => {
    // Load events vào dropdown
    loadEventsToDropdown();

    // Event listener cho nút Start Scanner
    document.getElementById('start-scanner-btn')?.addEventListener('click', startScanner);

    // Event listener cho nút Stop Scanner
    document.getElementById('stop-scanner-btn')?.addEventListener('click', stopScanner);

    // Event listener cho nút Manual Check-in
    document.getElementById('manual-checkin-btn')?.addEventListener('click', handleManualCheckIn);

    // Event listener cho Enter key trong input manual
    document.getElementById('ticket-code')?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleManualCheckIn();
        }
    });

    // Event listener cho dropdown chọn event
    const eventSelect = document.getElementById('event-select');
    if (eventSelect) {
        eventSelect.addEventListener('change', (e) => {
            const eventId = e.target.value;
            if (eventId) {
                handleEventSelect(eventId);
            } else {
                selectedEventId = null;
                const eventInfoEl = document.getElementById('selected-event-info');
                if (eventInfoEl) {
                    eventInfoEl.classList.add('hidden');
                }
                updateRecentCheckIns();
            }
        });
    }

    // Load danh sách recent check-ins ban đầu
    updateRecentCheckIns();

    // Dừng scanner khi đóng trang
    window.addEventListener('beforeunload', () => {
        if (isScanning) {
            stopScanner();
        }
    });
});

