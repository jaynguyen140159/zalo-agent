# 📋 BIÊN BẢN BÀN GIAO HỆ THỐNG ZALO & FACEBOOK AI AGENT

> **Dự án**: Hệ thống Trợ lý AI Đa Kênh (Zalo Bot & Facebook Fanpage Messenger)  
> **Trạng thái hiện tại**: ✅ **Đang hoạt động trên bản gốc (Trợ lý mặc định)**

---

## 1. 📌 TỔNG QUAN HỆ THỐNG ĐÃ XÂY DỰNG

Hệ thống là một giải pháp AI Agent tự vận hành (Self-hosted), đa tài khoản và đa kênh với các năng lực:
* **Đa kênh tương tác**: Kết nối chính thức với **Zalo Bot API** và đã sẵn sàng tích hợp **Facebook Fanpage Messenger Webhook**.
* **Đa Agent (Não bộ AI linh hoạt)**: Hỗ trợ tạo, nhân bản và tùy chỉnh nhiều Persona (tính cách, nhiệm vụ bot) khác nhau mà không can thiệp vào mã nguồn lõi.
* **Tự động nhắc việc & Lên lịch hẹn (`schedule_task`)**: Bot có khả năng ghi nhớ công việc, nhận diện thời gian từ tin nhắn và tự động gửi tin nhắc hẹn đúng ngày giờ vào nhóm hoặc chat riêng.
* **Giao diện Dashboard Quản trị**: Bảng điều khiển trực quan quản lý Tài khoản, Agent, Công cụ (Tools), Lịch hẹn (Scheduler), và Lịch sử hội thoại.
* **Tối ưu tốc độ cao**: Sử dụng mô hình **Gemini 3.8 Flash** với cơ chế vô hiệu hóa reasoning effort (`off`), cho tốc độ phản hồi tức thì chỉ từ **1 - 2 giây**.

---

## 2. 🔐 THÔNG TIN TRUY CẬP & CẤU HÌNH VẬN HÀNH

| Hạng mục | Giá trị / Đường dẫn | Ghi chú |
| :--- | :--- | :--- |
| **Thư mục mã nguồn** | `/Users/m1/.gemini/antigravity/scratch/zalo-agent` | Nơi chứa toàn bộ mã nguồn |
| **Địa chỉ Dashboard** | http://127.0.0.1:3901 | Cổng `3901` |
| **Mật khẩu Dashboard** | `Admin@123456` | Có thể đổi trong giao diện web |
| **Cơ sở dữ liệu (SQLite)** | `/Users/m1/.gemini/antigravity/scratch/zalo-agent/data/zalo-agent.db` | Lưu tài khoản, agent, lịch hẹn |
| **Môi trường thực thi** | Node.js `v22.23.4`, Package Manager: `pnpm` | Cài đặt tại `~/.local/opt/node` |
| **AI Model đang chạy** | Google Gemini (`gemini-3.8-flash`) | Nhiệt độ và tuning tối ưu độ trễ thấp |

---

## 3. 🤖 DANH SÁCH AGENT & TRẠNG THÁI HIỆN TẠI

Hệ thống hiện tại gồm **2 Agent song song độc lập**:

### 3.1. Bản gốc: `tro-ly-mac-dinh` (Trợ lý mặc định) - ⭐ ĐANG HOẠT ĐỘNG
* **Mã định danh**: `tro-ly-mac-dinh`
* **Vai trò**: Trợ lý thông minh đa năng, trả lời tin nhắn Zalo tự nhiên, tra cứu web, giải đáp thắc mắc chung.
* **Tình trạng**: **Được giữ nguyên bản gốc 100%**, tài khoản `bot-tro-ly` hiện đang gắn vào Agent này theo đúng yêu cầu của bạn.

### 3.2. Bản sao chép: `tro-ly-nhac-viec` (Trợ lý Nhắc việc) - ⏰ SẴN SÀNG KÍCH HOẠT
* **Mã định danh**: `tro-ly-nhac-viec`
* **Vai trò**: Chuyên gia quản lý lịch làm việc, phân công nhiệm vụ và tự động nhắc việc.
* **Tính năng chuyên biệt**:
  * Đọc thông tin công việc, nhận diện hạn chót và gọi công cụ `schedule_task` tạo lịch nhắc tự động.
  * Tích hợp Menu phím tắt nhanh 1, 2, 3 ở cuối mỗi câu trả lời (Người dùng chỉ cần gõ số `1` để xem lịch, `2` để xem hướng dẫn đặt lịch).
* **Cách chuyển đổi**: Vào Dashboard -> Menu **Accounts** -> Bấm **Sửa** tài khoản `Bot Trợ Lý` -> Đổi ô **Agent** sang *Trợ lý Nhắc việc* -> Bấm **Lưu**. Hệ thống sẽ áp dụng ngay lập tức mà không cần khởi động lại.

---

## 4. 🚀 HƯỚNG DẪN QUẢN TRỊ & VẬN HÀNH

### 4.1. Khởi động / Dừng hệ thống từ Terminal
Khi mở Terminal mới trên máy, sử dụng các lệnh sau:

```bash
# Khai báo đường dẫn môi trường (bắt buộc)
export PATH="/Users/m1/.local/bin:/Users/m1/.local/opt/node/bin:$PATH"
cd /Users/m1/.gemini/antigravity/scratch/zalo-agent

# Khởi động hệ thống
pnpm start

# Hoặc chạy ở chế độ nền (Background)
nohup pnpm start > /dev/null 2>&1 &
```

### 4.2. Sao lưu dữ liệu (Backup)
Để sao lưu toàn bộ cấu hình, chỉ cần copy 2 mục:
1. File `.env` (Chứa khóa giải mã và port).
2. Thư mục `data/` (Chứa file database `zalo-agent.db`).

---

## 5. 🌐 KẾ HOẠCH NÂNG CẤP LÊN VPS / HOSTING & TÊN MIỀN RIÊNG

Khi bạn muốn triển khai hệ thống lên máy chủ thực tế (cùng với website WordPress hiện có):

1. **Về tên miền**:
   * Khuyên dùng một **Subdomain riêng** (ví dụ: `bot.yourdomain.com` hoặc `api.yourdomain.com`).
   * Trỏ bản ghi DNS: `bot.yourdomain.com` -> IP của VPS/Hosting.
   * **Không ảnh hưởng đến website WordPress**: WordPress vẫn chạy ở `yourdomain.com` bình thường.
2. **Đối với Shared Hosting cPanel thông thường**:
   * Shared Hosting cPanel truyền thống thường tối ưu cho PHP/WordPress, thường bị giới hạn chạy tiến trình nền Node.js lâu dài (daemon background polling Zalo Bot dễ bị cPanel tự động ngắt).
   * **Khuyến nghị tốt nhất**: Sử dụng một VPS giá rẻ (như Linode, DigitalOcean, Hetzner, Vietnix... từ $4-5/tháng) chuyên để chạy Node.js bot 24/7.
3. **Đối với Facebook Fanpage Messenger**:
   * Mã nguồn tích hợp Facebook đã có sẵn tại thư mục `src/facebook/`.
   * Khi đưa lên VPS có domain HTTPS (SSL), bạn chỉ cần vào Meta for Developers, tạo Webhook trỏ về `https://bot.yourdomain.com/api/webhook/facebook`, điền Verify Token và Page Access Token trên Dashboard là kích hoạt thành công.
