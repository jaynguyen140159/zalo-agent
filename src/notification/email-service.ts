import nodemailer from "nodemailer";
import { createLogger } from "../shared/logger.js";

const log = createLogger("email-service");

export type EmailNhacViecInput = {
  to: string;
  name?: string;
  taskTitle: string;
  projectName?: string;
  stageName?: string;
  deadline?: string;
  progress?: number;
  portalUrl?: string;
};

/**
 * Lấy cấu hình SMTP từ biến môi trường (hoặc thiết lập runtime)
 */
export function getSmtpConfig() {
  const host = process.env.SMTP_HOST || "";
  const port = parseInt(process.env.SMTP_PORT || "587", 10);
  const user = process.env.SMTP_USER || "";
  const pass = process.env.SMTP_PASS || "";
  const from = process.env.SMTP_FROM || user || "zalo-agent@local.test";
  const secure = process.env.SMTP_SECURE === "true" || port === 465;

  const isConfigured = Boolean(host && user && pass);
  return { host, port, user, pass, from, secure, isConfigured };
}

/**
 * Gửi email nhắc việc tiến độ dự án
 */
export async function guiEmailNhacViec(input: EmailNhacViecInput): Promise<{ ok: boolean; message?: string }> {
  const cfg = getSmtpConfig();
  if (!cfg.isConfigured) {
    log.debug({ to: input.to }, "SMTP chưa được cấu hình, bỏ qua gửi email");
    return { ok: false, message: "SMTP chưa cấu hình trong .env (cần SMTP_HOST, SMTP_USER, SMTP_PASS)" };
  }

  try {
    const transporter = nodemailer.createTransport({
      host: cfg.host,
      port: cfg.port,
      secure: cfg.secure,
      auth: {
        user: cfg.user,
        pass: cfg.pass,
      },
    });

    const deadlineFormatted = input.deadline
      ? new Date(input.deadline).toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })
      : "Chưa đặt hạn chót";

    const portalUrl = input.portalUrl || "http://127.0.0.1:3901/portal";

    const subject = `⏰ [NHẮC VIỆC DỰ ÁN] ${input.taskTitle}`;

    const html = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h2 style="color: #0068FF; margin: 0;">Zalo Agent Project Portal</h2>
        <p style="color: #64748b; font-size: 14px; margin: 4px 0 0;">Thông báo nhắc nhở tiến độ công việc</p>
      </div>

      <div style="background: #f8fafc; border-left: 4px solid #0068FF; padding: 16px; border-radius: 6px; margin-bottom: 20px;">
        <h3 style="margin: 0 0 10px; color: #0f172a; font-size: 17px;">📌 ${input.taskTitle}</h3>
        <p style="margin: 4px 0; color: #334155; font-size: 14px;"><strong>Dự án:</strong> ${input.projectName || "Dự án hiện tại"}</p>
        ${input.stageName ? `<p style="margin: 4px 0; color: #334155; font-size: 14px;"><strong>Giai đoạn:</strong> ${input.stageName}</p>` : ""}
        <p style="margin: 4px 0; color: #334155; font-size: 14px;"><strong>Người phụ trách:</strong> ${input.name || input.to}</p>
        <p style="margin: 4px 0; color: #dc2626; font-size: 14px;"><strong>Hạn chót (Deadline):</strong> ${deadlineFormatted}</p>
        <p style="margin: 4px 0; color: #334155; font-size: 14px;"><strong>Tiến độ hiện tại:</strong> ${input.progress ?? 0}%</p>
      </div>

      <p style="color: #475569; font-size: 14px; line-height: 1.5;">
        Bạn nhận được email này vì đã được phân công phụ trách nhiệm vụ trên. Vui lòng kiểm tra và cập nhật tiến độ công việc kịp thời.
      </p>

      <div style="text-align: center; margin-top: 24px;">
        <a href="${portalUrl}" style="background: #0068FF; color: #ffffff; text-decoration: none; padding: 11px 24px; border-radius: 8px; font-weight: bold; font-size: 14px; display: inline-block;">
          Xem & Cập nhật trên Portal
        </a>
      </div>

      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 28px 0 16px;" />
      <p style="color: #94a3b8; font-size: 12px; text-align: center; margin: 0;">
        Hệ thống Quản lý Dự án & Trợ lý AI Đa Kênh — Zalo Agent
      </p>
    </div>
    `;

    await transporter.sendMail({
      from: `"${cfg.user}" <${cfg.from}>`,
      to: input.to,
      subject,
      html,
    });

    log.info({ to: input.to, taskTitle: input.taskTitle }, "Đã gửi email nhắc việc thành công");
    return { ok: true, message: `Đã gửi email nhắc việc tới ${input.to}` };
  } catch (err) {
    log.error({ err, to: input.to }, "Gửi email nhắc việc thất bại");
    return { ok: false, message: `Lỗi gửi email: ${err instanceof Error ? err.message : String(err)}` };
  }
}
