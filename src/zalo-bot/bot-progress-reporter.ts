import { db } from "../conversation/database.js";

export type ChecklistItem = {
  id: string;
  text: string;
  done: boolean;
  cancelled?: boolean;
};

function normalizeVi(raw: string): string {
  return (raw || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim();
}

const STOPWORDS = new Set([
  "va", "cua", "cho", "voi", "cac", "nhung", "theo", "ve", "da", "xong", "lam",
  "hoan", "thanh", "len", "du", "va", "phan", "con", "lai", "gui", "khach", "hang",
  "kiem", "tra", "duyet", "chinh", "thuc", "bao", "cao", "tien", "do", "muc", "viec",
]);

const HIGH_SIGNAL_TOKENS = new Set([
  "moodboard", "concept", "2d", "3d", "mockup", "in", "an", "hop", "dong",
  "bbnt", "dntt", "qc", "tam", "ung", "bao", "gia", "khuon", "mau", "tem", "nhan",
  "van", "chuyen", "chot", "file", "san", "xuat", "dong", "goi", "ngoai", "quan",
]);

export function kiemTraLaTinBaoCaoTienDo(rawText?: string): boolean {
  if (!rawText) return false;
  const norm = normalizeVi(rawText);
  return (
    norm.startsWith("bao cao") ||
    norm.startsWith("bc:") ||
    norm.startsWith("bc ") ||
    norm.startsWith("tien do") ||
    norm.includes("da lam xong") ||
    norm.includes("da hoan thanh") ||
    norm.includes("cap nhat tien do") ||
    norm.includes("bao bot") ||
    norm.includes("xong muc") ||
    norm.includes("xong dau muc")
  );
}

export function matchChecklistItemsFromReport(
  reportText: string,
  checklist: ChecklistItem[],
): string[] {
  if (!checklist || checklist.length === 0) return [];
  const normReport = normalizeVi(reportText);
  if (!normReport) return [];

  // Complete-all phrases
  if (
    normReport.includes("xong het") ||
    normReport.includes("xong toan bo") ||
    normReport.includes("hoan thanh tat ca") ||
    normReport.includes("100%")
  ) {
    return checklist.map((i) => i.id);
  }

  const matchedIds = new Set<string>();

  // Explicit numbered references like "mục 1", "đầu mục 2", "mục 1 và 2", "mục 1, 2"
  const explicitNumRegex = /(?:muc|buoc|y|phan)\s+([0-9]+(?:\s*(?:,|va|&|-)\s*[0-9]+)*)/g;
  let m: RegExpExecArray | null;
  while ((m = explicitNumRegex.exec(normReport)) !== null) {
    const nums = m[1]!.match(/[0-9]+/g) ?? [];
    for (const numStr of nums) {
      const idx = Number(numStr) - 1;
      if (idx >= 0 && idx < checklist.length) {
        matchedIds.add(checklist[idx]!.id);
      }
    }
  }

  const reportTokens = new Set(
    normReport
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((t) => t.length >= 2 && !STOPWORDS.has(t)),
  );

  for (const item of checklist) {
    const normItem = normalizeVi(item.text);
    const itemTokens = normItem
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((t) => t.length >= 2 && !STOPWORDS.has(t));

    let hits = 0;
    let highSignalHits = 0;
    for (const tok of itemTokens) {
      if (reportTokens.has(tok) || normReport.includes(tok)) {
        hits++;
        if (HIGH_SIGNAL_TOKENS.has(tok)) highSignalHits++;
      }
    }

    if (hits >= 2 || (highSignalHits >= 1 && hits >= 1) || (itemTokens.length <= 2 && hits >= 1)) {
      matchedIds.add(item.id);
    }
  }

  return Array.from(matchedIds);
}

export type BotReportResult = {
  ok: boolean;
  taskId?: number;
  taskTitle?: string;
  newlyCompletedTexts: string[];
  checklist: ChecklistItem[];
  doneCount: number;
  totalCount: number;
  progress: number;
  replyMessage: string;
  error?: string;
};

function findBestTaskForReport(reportText: string, projectId?: number): { id: number; title: string; checklist?: string; progress: number; status: string } | undefined {
  const norm = normalizeVi(reportText);
  const rows = (
    projectId
      ? db
          .prepare(
            `SELECT t.id, t.title, t.checklist, t.progress, t.status, s.title as stage_title, p.name as project_name
             FROM pm_tasks t
             LEFT JOIN pm_stages s ON t.stage_id = s.id
             LEFT JOIN pm_projects p ON t.project_id = p.id
             WHERE t.project_id = ?`,
          )
          .all(projectId)
      : db
          .prepare(
            `SELECT t.id, t.title, t.checklist, t.progress, t.status, s.title as stage_title, p.name as project_name
             FROM pm_tasks t
             LEFT JOIN pm_stages s ON t.stage_id = s.id
             LEFT JOIN pm_projects p ON t.project_id = p.id
             WHERE t.status != 'completed' AND t.progress < 100`,
          )
          .all()
  ) as Array<{
    id: number;
    title: string;
    checklist?: string;
    progress: number;
    status: string;
    stage_title?: string;
    project_name?: string;
  }>;

  let bestRow: (typeof rows)[0] | undefined;
  let bestScore = 0;

  for (const r of rows) {
    let cl: ChecklistItem[] = [];
    try {
      cl = r.checklist ? (JSON.parse(r.checklist) as ChecklistItem[]) : [];
    } catch {
      cl = [];
    }
    const clMatches = matchChecklistItemsFromReport(reportText, cl).filter((id) => {
      const it = cl.find((x) => x.id === id);
      return it && !it.done;
    }).length;
    let score = clMatches * 5;

    const hay = normalizeVi(`${r.project_name || ""} ${r.stage_title || ""} ${r.title || ""}`);
    const normProj = normalizeVi(r.project_name || "");
    const normStage = normalizeVi(r.stage_title || "");
    if (normProj && norm.includes(normProj.slice(0, 12))) score += 4;
    if (normStage && norm.includes(normStage)) score += 3;
    for (const tok of hay.split(/\s+/)) {
      if (tok.length >= 3 && !STOPWORDS.has(tok) && norm.includes(tok)) {
        score += 1;
      }
    }

    if (score > bestScore) {
      bestScore = score;
      bestRow = r;
    }
  }

  return bestScore > 0 ? bestRow : undefined;
}

export function applyBotProgressReport(params: {
  taskId?: number;
  projectId?: number;
  senderName?: string;
  reportText: string;
}): BotReportResult {
  const reportText = (params.reportText || "").trim();
  if (!reportText) {
    return {
      ok: false,
      newlyCompletedTexts: [],
      checklist: [],
      doneCount: 0,
      totalCount: 0,
      progress: 0,
      replyMessage: "Bạn vui lòng nhập nội dung báo cáo các đầu mục đã làm nhé.",
      error: "Nội dung báo cáo trống",
    };
  }

  const task = params.taskId
    ? (db
        .prepare("SELECT id, title, checklist, progress, status FROM pm_tasks WHERE id = ?")
        .get(params.taskId) as
        | { id: number; title: string; checklist?: string; progress: number; status: string }
        | undefined)
    : findBestTaskForReport(reportText, params.projectId);

  if (!task) {
    return {
      ok: false,
      newlyCompletedTexts: [],
      checklist: [],
      doneCount: 0,
      totalCount: 0,
      progress: 0,
      replyMessage:
        "Bot chưa tìm thấy công việc nào khớp với báo cáo của bạn. Hãy nêu rõ tên dự án hoặc đầu mục công việc nhé.",
      error: "Không tìm thấy công việc phù hợp",
    };
  }

  let checklist: ChecklistItem[] = [];
  try {
    checklist = task.checklist ? (JSON.parse(task.checklist) as ChecklistItem[]) : [];
  } catch {
    checklist = [];
  }

  const matchedIds = matchChecklistItemsFromReport(reportText, checklist);
  const newlyCompletedTexts: string[] = [];

  for (const item of checklist) {
    if (matchedIds.includes(item.id) && (!item.done || item.cancelled)) {
      item.done = true;
      item.cancelled = false;
      newlyCompletedTexts.push(item.text);
    }
  }

  const activeItems = checklist.filter((i) => !i.cancelled);
  const totalCount = activeItems.length;
  const doneCount = activeItems.filter((i) => i.done).length;
  const newProgress =
    totalCount > 0
      ? Math.round((doneCount / totalCount) * 100)
      : checklist.length > 0
        ? 100
        : task.progress;
  const newStatus = newProgress >= 100 ? "completed" : newProgress > 0 ? "in_progress" : "pending";

  const now = new Date();
  const timeTag = `${String(now.getDate()).padStart(2, "0")}/${String(now.getMonth() + 1).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  const who = params.senderName?.trim() || "Phụ trách";
  const lastReport = `${who}: "${reportText}" (${timeTag})`;

  db.prepare(
    `UPDATE pm_tasks
     SET checklist = ?, progress = ?, status = ?, last_report = ?, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
     WHERE id = ?`,
  ).run(JSON.stringify(checklist), newProgress, newStatus, lastReport, task.id);

  const remaining = activeItems.filter((i) => !i.done).map((i) => `• ${i.text}`);
  let replyMessage = `🤖 [CẬP NHẬT TIẾN ĐỘ TỪ BOT]\n📌 Công việc: ${task.title}\n`;
  if (newlyCompletedTexts.length > 0) {
    replyMessage += `✅ Bot đã đánh dấu xong (${newlyCompletedTexts.length} đầu mục):\n${newlyCompletedTexts.map((t) => `• ${t}`).join("\n")}\n`;
  } else if (totalCount > 0 && matchedIds.length > 0) {
    replyMessage += `ℹ️ Các đầu mục này đã được đánh dấu trước đó.\n`;
  } else {
    replyMessage += `📝 Đã ghi nhận báo cáo vào hệ thống (chưa khớp tên đầu mục con nào mới).\n`;
  }
  replyMessage += `📊 Thanh tiến độ hiện tại: ${doneCount}/${totalCount} đầu mục (${newProgress}%)`;
  if (remaining.length > 0) {
    replyMessage += `\n⏳ Đầu mục còn lại:\n${remaining.join("\n")}`;
  } else if (totalCount > 0) {
    replyMessage += `\n🎉 Đầu việc này đã hoàn thành 100%!`;
  }

  return {
    ok: true,
    taskId: task.id,
    taskTitle: task.title,
    newlyCompletedTexts,
    checklist,
    doneCount,
    totalCount,
    progress: newProgress,
    replyMessage,
  };
}
