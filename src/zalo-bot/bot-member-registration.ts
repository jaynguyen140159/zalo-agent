import { db } from "../conversation/database.js";
import { createLogger } from "../shared/logger.js";
import type { ParsedMessage } from "../zalo/zalo-message-parser.js";
import type { KenhLuot } from "../zalo/kenh-luot.js";

const log = createLogger("bot-member-registration");

export function kiemTraLaTinDangKy(rawText?: string): boolean {
  if (!rawText) return false;
  const text = rawText.trim().toLowerCase();
  return (
    text.startsWith("đăng ký") ||
    text.startsWith("dang ky") ||
    text.startsWith("dk ") ||
    text === "dk" ||
    text.includes("đăng ký sđt") ||
    text.includes("dang ky sdt") ||
    text.includes("đăng ký nhận việc") ||
    text.includes("dang ky nhan viec")
  );
}

/**
 * Xử lý khi thành viên gửi tin nhắn đăng ký số điện thoại để nhận việc 1-1 từ Bot.
 * Hỗ trợ các cú pháp:
 * - "Đăng ký 0912345678 Nguyễn Văn A"
 * - "Dang ky 0912345678 Nguyen Van A"
 * - "DK 0912345678"
 * - "Đăng ký" (hướng dẫn cú pháp)
 */
export async function xuLyDangKyThanhVien(
  kenh: KenhLuot,
  msg: ParsedMessage,
): Promise<boolean> {
  const text = (msg.text || "").trim();
  if (!kiemTraLaTinDangKy(text)) return false;

  // Tìm số điện thoại Việt Nam (10 số, bắt đầu bằng 03, 05, 07, 08, 09 hoặc +84)
  const phoneMatch = text.match(/(?:\+84|0)(3[2-9]|5[689]|7[06-9]|8[1-9]|9\d)\d{7}/);

  if (!phoneMatch) {
    const guideMsg =
      `👋 Chào ${msg.senderName || "bạn"}!\n\n` +
      `Để đăng ký tài khoản và nhận thông báo nhắc việc 1-1 trực tiếp qua Zalo từ Bot, bạn vui lòng nhắn theo cú pháp:\n\n` +
      `👉 Đăng ký [Số điện thoại] [Họ và tên]\n\n` +
      `Ví dụ: Đăng ký 0912345678 ${msg.senderName || "Nguyễn Văn A"}`;

    try {
      await kenh.duongGui(msg.threadId, msg.threadType)({ text: guideMsg });
    } catch (err) {
      log.error({ err, threadId: msg.threadId }, "Lỗi gửi hướng dẫn đăng ký");
    }
    return true;
  }

  let phone = phoneMatch[0];
  if (phone.startsWith("+84")) {
    phone = "0" + phone.slice(3);
  }

  let name = text
    .replace(/(?:đăng ký|dang ky|dk|sđt|sdt|nhận việc|nhan viec|tài khoản|tai khoan)/gi, "")
    .replace(phoneMatch[0], "")
    .replace(/[:\-–]/g, "")
    .trim();

  if (!name || name.length < 2) {
    name = msg.senderName || "Thành viên";
  }

  const targetUserThread = msg.isGroup ? (msg.senderId || msg.threadId) : msg.threadId;

  try {
    const existing = db.prepare("SELECT * FROM pm_members WHERE phone = ?").get(phone) as any;
    if (existing) {
      db.prepare(
        "UPDATE pm_members SET thread_id = ?, name = COALESCE(NULLIF(?, ''), name) WHERE phone = ?",
      ).run(targetUserThread, name, phone);
      log.info({ phone, name, threadId: targetUserThread, isGroup: msg.isGroup }, "Cập nhật thread_id cho thành viên đã có");
    } else {
      db.prepare(
        "INSERT INTO pm_members (phone, name, role, thread_id) VALUES (?, ?, 'member', ?)",
      ).run(phone, name, targetUserThread);
      log.info({ phone, name, threadId: targetUserThread, isGroup: msg.isGroup }, "Đăng ký thành viên mới kèm thread_id");
    }

    const successMsg = msg.isGroup
      ? `🎉 [ĐĂNG KÝ THÀNH CÔNG]\n\n` +
        `Chào anh/chị ${name}!\n` +
        `📱 Số điện thoại liên kết: ${phone}\n` +
        `👥 Đã liên kết tài khoản từ nhóm chat thành công!\n\n` +
        `👉 Để Bot có thể gửi tin nhắn nhắc việc riêng tư 1-1 mà không làm phiền nhóm, anh/chị hãy mở khung chat riêng với Bot Trợ Lý Jay và nhắn 'Chào' một lần nhé!\n\n` +
        `💻 Bạn có thể xem bảng công việc được giao tại Cổng Quản Lý Dự Án bất cứ lúc nào.`
      : `🎉 [ĐĂNG KÝ THÀNH CÔNG]\n\n` +
        `Chào anh/chị ${name}!\n` +
        `📱 Số điện thoại liên kết: ${phone}\n` +
        `🆔 Kênh Zalo cá nhân: Đã kết nối 1-1 thành công!\n\n` +
        `👉 Từ bây giờ, khi bạn được giao việc mới hoặc đến hạn Deadline, Bot Trợ Lý sẽ tự động nhắn tin nhắc việc trực tiếp 1-1 cho bạn tại đây.\n\n` +
        `💻 Bạn có thể xem bảng công việc được giao tại Cổng Quản Lý Dự Án bất cứ lúc nào.`;

    await kenh.duongGui(msg.threadId, msg.threadType)({ text: successMsg });
    return true;
  } catch (err) {
    log.error({ err, threadId: msg.threadId }, "Lỗi khi lưu đăng ký thành viên");
    try {
      await kenh.duongGui(msg.threadId, msg.threadType)({
        text: `⚠️ Đã xảy ra lỗi trong quá trình lưu thông tin đăng ký. Vui lòng thử lại sau!`,
      });
    } catch {}
    return true;
  }
}
