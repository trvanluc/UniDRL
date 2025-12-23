# Hướng dẫn tải thư viện QRCode về local

## Cách 1: Tải trực tiếp từ CDN

1. Mở trình duyệt và vào link sau:
   https://cdn.jsdelivr.net/npm/qrcode@1.5.3/build/qrcode.min.js

2. Click chuột phải > "Save As" hoặc Ctrl+S
3. Lưu file với tên: `qrcode.min.js` vào thư mục `js/libs/`

## Cách 2: Sử dụng PowerShell (Windows)

Mở PowerShell trong thư mục project và chạy:

```powershell
Invoke-WebRequest -Uri "https://cdn.jsdelivr.net/npm/qrcode@1.5.3/build/qrcode.min.js" -OutFile "js\libs\qrcode.min.js"
```

## Cách 3: Sử dụng curl (nếu có)

```bash
curl -o js/libs/qrcode.min.js https://cdn.jsdelivr.net/npm/qrcode@1.5.3/build/qrcode.min.js
```

Sau khi tải xong, file sẽ ở: `js/libs/qrcode.min.js`

