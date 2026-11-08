import { getAccount, layBotTokenGiaiMa } from "../config/account-store.js";
import { db } from "../conversation/database.js";
import { createLogger } from "../shared/logger.js";
import { taoZaloBotClient } from "../zalo-bot/zalo-bot-api-client.js";
import { guiEmailNhacViec } from "./email-service.js";

const log = createLogger("auto-reminder-worker");

let intervalTimer: NodeJS.Timeout | undefined;

/**
 * Quét các nhiệm vụ sắp tới hạn deadline hoặc quá hạn để tự động phát cảnh báo
 */
export async function quetVaGuiNhacViecTuDong(): Promise<{ checked: number; reminded: number }> {
  try {
    const tasks = db
      .prepare(
        `SELECT t.*, s.title as stage_title, p.name as project_name
         FROM pm_tasks t
         LEFT JOIN pm_stages s ON t.stage_id = s.id
         LEFT JOIN pm_projects p ON t.project_id = p.id
         WHERE t.deadline IS NOT NULL 
           AND t.deadline != '' 
           AND t.status != 'done' 
           AND t.progress < 100`,
      )
      .all() as any[];

    if (!tasks || tasks.length === 0) {
      return { checked: 0, reminded: 0 };
    }

    const now = Date.now();
    let remindedCount = 0;

    // Tìm cấu hình bot để gửi tin
    const botAccount = getAccount("bot-tro-ly-jay") ?? getAccount("bot-tro-ly");
    const botToken = botAccount ? layBotTokenGiaiMa(botAccount.id) : null;
    const botClient = botToken ? taoZaloBotClient({ token: botToken }) : null;

    // Đọc danh sách members
    const members = db.prepare("SELECT * FROM pm_members").all() as any[];
    const adminMember = members.find((m) => m.role === "admin" && m.thread_id);
    const adminThreadId = adminMember?.thread_id || "c06034026e41871fde50";

    for (const t of tasks) {
      const deadlineDate = new Date(t.deadline).getTime();
      if (isNaN(deadlineDate)) continue;

      const diffMs = deadlineDate - now;
      const diffHours = diffMs / (1000 * 60 * 60);

      // Điều kiện kích hoạt nhắc:
      // 1. Quá hạn (diffHours <= 0)
      // 2. Sắp đến hạn trong vòng 24 giờ (diffHours > 0 && diffHours <= 24)
      const isDueSoon = diffHours <= 24;
      if (!isDueSoon) continue;

      // Kiểm tra lần nhắc trước (chỉ nhắc lại nếu chưa nhắc hoặc lần nhắc trước > 12 giờ)
      if (t.reminded_at) {
        const lastReminded = new Date(t.reminded_at).getTime();
        const hoursSinceLastReminder = (now - lastReminded) / (1000 * 60 * 60);
        if (hoursSinceLastReminder < 12) {
          // Chưa đủ 12 giờ từ lần nhắc gần nhất -> bỏ qua để không spam
          continue;
        }
      }

      const assignedMember = members.find((m) => m.phone === t.assigned_phone);
      const isOverdue = diffHours < 0;

      const deadlineStr = new Date(t.deadline).toLocaleString("vi-VN", {
        timeZone: "Asia/Ho_Chi_Minh",
      });

      const tieuDe = isOverdue
        ? `⚠️ [CẢNH BÁO QUÁ HẠN DEADLINE]`
        : `⏰ [NHẮC VIỆC TIẾN ĐỘ - SẮP ĐẾN HẠN]`;

      const noiDungTinZalo = `${tieuDe}\n👤 Người phụ trách: ${assignedMember ? assignedMember.name : t.assigned_phone || "Chưa gán"}\n📌 Công việc: ${t.title}\n📂 Giai đoạn: ${t.stage_title || "Dự án"}\n⏳ Hạn chót: ${deadlineStr} (${isOverdue ? "ĐÃ QUÁ HẠN!" : `còn khoảng ${Math.max(1, Math.round(diffHours))} giờ`})\n📊 Tiến độ: ${t.progress || 0}%\n👉 Truy cập Cổng Portal để cập nhật: http://127.0.0.1:3901/portal`;

      // 1. Gửi qua Zalo Bot
      if (botClient) {
        let targetThread = assignedMember?.thread_id;
        if (!targetThread) {
          targetThread = adminThreadId;
        }

        try {
          await botClient.sendMessage(targetThread, noiDungTinZalo);
          log.info({ taskId: t.id, targetThread }, "Đã tự động gửi tin nhắn Zalo nhắc việc");
        } catch (err) {
          log.error({ err, taskId: t.id }, "Gửi tin Zalo nhắc việc tự động thất bại");
        }
      }

      // 2. Gửi qua Email (nếu thành viên có email)
      if (assignedMember?.email) {
        try {
          await guiEmailNhacViec({
            to: assignedMember.email,
            name: assignedMember.name,
            taskTitle: t.title,
            projectName: t.project_name,
            stageName: t.stage_title,
            deadline: t.deadline,
            progress: t.progress,
            portalUrl: "http://127.0.0.1:3901/portal",
          });
        } catch (err) {
          log.error({ err, email: assignedMember.email }, "Gửi email nhắc việc tự động thất bại");
        }
      }

      // Đánh dấu đã nhắc
      db.prepare(
        "UPDATE pm_tasks SET reminded_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE id = ?",
      ).run(t.id);

      remindedCount++;
    }

    return { checked: tasks.length, reminded: remindedCount };
  } catch (err) {
    log.error({ err }, "Lỗi trong chu kỳ quét nhắc việc tự động");
    return { checked: 0, reminded: 0 };
  }
}

/**
 * Khởi động tiến trình quét định kỳ (mỗi 60 giây)
 */
export function batDauAutoReminderWorker(intervalMs = 60_000): () => void {
  if (intervalTimer) return () => {};

  log.info({ intervalMs }, "Khởi động worker tự động nhắc việc Zalo & Email");
  // Chạy ngay lần đầu sau 5 giây boot
  const initialTimeout = setTimeout(() => {
    void quetVaGuiNhacViecTuDong();
  }, 5000);
  initialTimeout.unref?.();

  intervalTimer = setInterval(() => {
    void quetVaGuiNhacViecTuDong();
  }, intervalMs);
  intervalTimer.unref?.();

  return () => {
    if (intervalTimer) {
      clearInterval(intervalTimer);
      intervalTimer = undefined;
      log.info("Đã dừng worker tự động nhắc việc");
    }
  };
}
