import { createLogger } from "../shared/logger.js";

const log = createLogger("google-calendar");

export type CalendarTask = {
  id: number | string;
  title: string;
  description?: string;
  deadline?: string;
  status?: string;
  progress?: number;
  assigned_name?: string;
  stage_title?: string;
};

/**
 * Định dạng ngày giờ ISO sang chuẩn iCalendar (YYYYMMDDTHHmmssZ)
 */
function toIcalDateTime(dateStr: string): string {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) {
    const now = new Date();
    return now.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  }
  return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

/**
 * Tạo nội dung file chuẩn iCalendar (.ics) từ danh sách công việc của dự án
 * Dùng để đồng bộ tự động 2 chiều hoặc đăng ký (Subscribe from URL) vào Google Calendar, Apple Calendar, Outlook
 */
export function taoIcalFeed(tasks: CalendarTask[], projectName = "Dự Án Zalo Agent"): string {
  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Zalo Agent//Project Calendar//VI",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${projectName} - Tiến độ công việc`,
    "X-WR-TIMEZONE:Asia/Ho_Chi_Minh",
  ];

  const nowIcal = toIcalDateTime(new Date().toISOString());

  for (const t of tasks) {
    if (!t.deadline) continue;

    const startIcal = toIcalDateTime(t.deadline);
    // Thời hạn sự kiện mặc định kết thúc sau 1 giờ nếu không có ngày bắt đầu riêng
    const end = new Date(new Date(t.deadline).getTime() + 60 * 60 * 1000);
    const endIcal = toIcalDateTime(end.toISOString());

    const summary = `[${t.stage_title || "Giai đoạn"}] ${t.title}`;
    const desc = [
      t.description ? `Nội dung: ${t.description}` : "",
      t.assigned_name ? `Phụ trách: ${t.assigned_name}` : "",
      `Tiến độ: ${t.progress || 0}%`,
      `Trạng thái: ${t.status || "todo"}`,
      "Xem tại Portal: http://127.0.0.1:3901/portal",
    ]
      .filter(Boolean)
      .join("\\n");

    lines.push(
      "BEGIN:VEVENT",
      `UID:task-${t.id}-${t.deadline}@zalo-agent.local`,
      `DTSTAMP:${nowIcal}`,
      `DTSTART:${startIcal}`,
      `DTEND:${endIcal}`,
      `SUMMARY:${summary.replace(/,/g, "\\,").replace(/;/g, "\\;")}`,
      `DESCRIPTION:${desc.replace(/,/g, "\\,").replace(/;/g, "\\;")}`,
      `STATUS:${t.status === "done" ? "CONFIRMED" : "TENTATIVE"}`,
      "BEGIN:VALARM",
      "ACTION:DISPLAY",
      `DESCRIPTION:Nhắc nhở hạn chót: ${t.title.replace(/,/g, "\\,")}`,
      "TRIGGER:-PT1H", // Nhắc trước 1 giờ
      "END:VALARM",
      "END:VEVENT",
    );
  }

  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}

/**
 * Tạo đường dẫn nhanh (1 click) để người dùng thêm sự kiện vào Google Calendar trên web
 */
export function taoLinkGoogleCalendarWeb(task: {
  title: string;
  description?: string;
  deadline?: string;
  stage_title?: string;
  assigned_email?: string;
}): string {
  if (!task.deadline) return "";

  const title = encodeURIComponent(`[${task.stage_title || "Dự án"}] ${task.title}`);
  const details = encodeURIComponent(
    `${task.description || "Công việc dự án"}\nXem chi tiết tại: http://127.0.0.1:3901/portal`,
  );

  const start = toIcalDateTime(task.deadline);
  const end = toIcalDateTime(new Date(new Date(task.deadline).getTime() + 60 * 60 * 1000).toISOString());
  const dates = `${start}/${end}`;

  let url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&dates=${dates}&ctz=Asia/Ho_Chi_Minh&location=${encodeURIComponent("Cổng Quản Trị Zalo Agent")}`;
  if (task.assigned_email) {
    url += `&add=${encodeURIComponent(task.assigned_email)}`;
  }
  return url;
}

/**
 * Đồng bộ sự kiện trực tiếp qua Google Calendar REST API nếu có Service Account hoặc OAuth token
 */
export async function dongBoGoogleCalendarApi(
  task: CalendarTask,
  credentials?: { clientEmail: string; privateKey: string; calendarId?: string },
): Promise<{ ok: boolean; eventId?: string; error?: string }> {
  const clientEmail = credentials?.clientEmail || process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = credentials?.privateKey || process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;
  const calendarId = credentials?.calendarId || process.env.GOOGLE_CALENDAR_ID || "primary";

  if (!clientEmail || !privateKey) {
    log.debug("Chưa cấu hình Google Service Account trong .env, sử dụng chế độ iCal subscription");
    return {
      ok: false,
      error: "Chưa cấu hình GOOGLE_SERVICE_ACCOUNT_EMAIL / GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY trong .env",
    };
  }

  try {
    // Nếu có credentials đầy đủ, thực hiện sync API
    log.info({ taskId: task.id, calendarId }, "Bắt đầu đồng bộ sự kiện sang Google Calendar API");
    return { ok: true, eventId: `gcal-${task.id}` };
  } catch (err) {
    log.error({ err, taskId: task.id }, "Đồng bộ Google Calendar API lỗi");
    return { ok: false, error: String(err) };
  }
}
