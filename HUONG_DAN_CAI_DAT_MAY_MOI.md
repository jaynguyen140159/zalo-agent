# HƯỚNG DẪN MỞ VÀ TIẾP TỤC SỬ DỤNG TRÊN MÁY TÍNH MỚI

Gói này đã bao gồm toàn bộ:
1. Toàn bộ mã nguồn mới nhất (Cổng Quản Lý Dự Án `/portal`, Kho Tải Lên `/upload`, Bot Trợ Lý Jay tự động đăng ký 1-1 theo số điện thoại).
2. Toàn bộ dữ liệu SQLite hiện tại trong `data/zalo-agent.db` (Dự án, các bước giai đoạn, nhiệm vụ, chi phí, tài khoản bot đã kết nối).
3. File cấu hình môi trường `.env`.

---

## 3 BƯỚC ĐỂ CHẠY TRÊN MÁY TÍNH MỚI

### Bước 1: Cài đặt Node.js & pnpm (nếu máy mới chưa có)
- Tải và cài đặt Node.js phiên bản LTS (khuyến nghị Node 20 hoặc 22) tại: https://nodejs.org
- Cài đặt `pnpm` (mở Terminal / Command Prompt):
  ```bash
  npm install -g pnpm
  ```

### Bước 2: Cài đặt thư viện dependencies
Mở Terminal trong thư mục `zalo-agent` này và chạy lệnh:
```bash
pnpm install
```

### Bước 3: Khởi động hệ thống
Chạy lệnh:
```bash
pnpm start
```

Sau khi chạy:
- Cổng Quản Lý Dự Án & Phân Quyền: **http://127.0.0.1:3901/portal**
- Trang Tải Lên & Kho Tài Liệu: **http://127.0.0.1:3901/upload**
- Bot Trợ Lý Jay: Tự động kết nối Zalo và lắng nghe tin nhắn đăng ký 1-1.

---

## DÙNG VỚI ANTIGRAVITY TRÊN MÁY MỚI
1. Mở phần mềm **Antigravity**.
2. Chọn **File ➔ Open Folder...** (hoặc mở thư mục này).
3. Bây giờ bạn có thể chat trực tiếp với Antigravity trên máy mới để yêu cầu chỉnh sửa, nâng cấp tính năng tiếp tục bình thường!
