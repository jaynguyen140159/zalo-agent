import fs from "node:fs";
import path from "node:path";
import { generateText, type ModelMessage } from "ai";
import { resolveLanguageModel } from "../agent/llm-provider.js";
import { dataDir } from "../config/env.js";
import { db } from "../conversation/database.js";
import { createLogger } from "../shared/logger.js";
import type { CollectedAssetRow } from "./asset-collector-store.js";

const log = createLogger("ai-project-classifier");

export type ClassificationItem = {
  id: number;
  projectName: string;
  cleanTitle: string;
  summary: string;
};

export function parseClassificationJson(raw: string): ClassificationItem[] {
  const cleaned = raw
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
  const start = cleaned.indexOf("[");
  const end = cleaned.lastIndexOf("]");
  if (start === -1 || end === -1 || end <= start) return [];
  try {
    const parsed = JSON.parse(cleaned.slice(start, end + 1)) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((x): x is Record<string, unknown> => Boolean(x && typeof x === "object"))
      .map((x) => ({
        id: Number(x.id),
        projectName: String(x.projectName || "Chờ phân loại").trim() || "Chờ phân loại",
        cleanTitle: String(x.cleanTitle || "").trim(),
        summary: String(x.summary || "").trim(),
      }))
      .filter((x) => Number.isFinite(x.id) && x.id > 0);
  } catch {
    return [];
  }
}

function getKnownProjectNames(): string[] {
  const names = new Set<string>();
  try {
    const wtTasks = db.prepare("SELECT title FROM pm_work_tracker_tasks").all() as { title: string }[];
    for (const t of wtTasks) {
      if (t.title?.trim()) names.add(t.title.trim());
    }
    const pmProjects = db.prepare("SELECT name FROM pm_projects").all() as { name: string }[];
    for (const p of pmProjects) {
      if (p.name?.trim()) names.add(p.name.trim());
    }
  } catch {
    // Ignore if table not ready
  }
  return Array.from(names);
}

export async function classifyPendingAssetsWithAI(limit = 20): Promise<{
  processed: number;
  classified: number;
}> {
  const pending = db
    .prepare(
      `SELECT * FROM pm_collected_assets
       WHERE status = 'pending'
       ORDER BY sent_at DESC, id DESC
       LIMIT ?`,
    )
    .all(limit) as CollectedAssetRow[];

  if (pending.length === 0) return { processed: 0, classified: 0 };

  const knownProjects = getKnownProjectNames();
  const model = resolveLanguageModel();

  // Process in batches of 8 items
  let classifiedCount = 0;
  for (let i = 0; i < pending.length; i += 8) {
    const batch = pending.slice(i, i + 8);
    const itemsText = batch
      .map(
        (a) =>
          `- ID=${a.id} | Loại=${a.asset_type} | Người gửi=${a.sender_name || "?"} | Nhóm=${a.thread_name || a.thread_id} | Tên gốc=${a.title} | URL=${a.original_url} | Ngữ cảnh=${(a.context_text || "").slice(0, 220)}`,
      )
      .join("\n");

    const promptText = [
      "Bạn là trợ lý phân loại tài liệu dự án của Khởi Minh.",
      "Hãy phân tích các tài liệu/ảnh/link thu thập từ nhóm Zalo dưới đây và xếp vào đúng tên Công việc / Dự án.",
      knownProjects.length > 0
        ? `Danh sách Công việc / Dự án đang có:\n${knownProjects.map((n) => `* ${n}`).join("\n")}`
        : "Chưa có danh sách dự án cố định, hãy đặt tên công việc/dự án ngắn gọn, rõ ràng bằng tiếng Việt.",
      "Quy tắc:",
      "1. Nếu khớp với 1 Công việc/Dự án trong danh sách trên, dùng CHÍNH XÁC tên đó cho `projectName`.",
      "2. Nếu không khớp rõ ràng, tự đặt tên dự án ngắn gọn (vd: 'Báo giá vật tư', 'Hồ sơ nghiệm thu') hoặc 'Chờ phân loại' nếu hoàn toàn thiếu ngữ cảnh.",
      "3. `cleanTitle`: đặt lại tên file/mục thật gọn gàng dễ hiểu (giữ đuôi file nếu có, không dùng ký tự đặc biệt).",
      "4. `summary`: tóm tắt 1 câu ngắn nội dung tài liệu/ảnh/link này.",
      "5. Chỉ trả về MỘT mảng JSON hợp lệ dạng: [{\"id\": 1, \"projectName\": \"...\", \"cleanTitle\": \"...\", \"summary\": \"...\"}]",
      "",
      "Danh sách cần phân loại:",
      itemsText,
    ].join("\n");

    const contentParts: Array<{ type: "text"; text: string } | { type: "image"; image: Buffer; mediaType?: string }> = [
      { type: "text", text: promptText },
    ];

    // Attach up to 3 local images for vision inspection
    let attachedImages = 0;
    for (const a of batch) {
      if (a.asset_type === "image" && a.local_path && attachedImages < 3) {
        const abs = path.join(dataDir, a.local_path);
        if (fs.existsSync(abs)) {
          try {
            const buf = fs.readFileSync(abs);
            if (buf.length > 0 && buf.length < 4 * 1024 * 1024) {
              contentParts.push({ type: "text", text: `[Ảnh đính kèm của ID=${a.id}]:` });
              contentParts.push({ type: "image", image: buf, mediaType: a.mime_type || "image/jpeg" });
              attachedImages++;
            }
          } catch {
            // Skip unreadable image
          }
        }
      }
    }

    const messages: ModelMessage[] = [{ role: "user", content: contentParts }];

    let rawText = "";
    try {
      const res = await generateText({ model, messages });
      rawText = res.text;
    } catch (err) {
      // Fallback to text-only if model does not support vision
      if (attachedImages > 0) {
        log.debug({ err }, "Thử lại phân loại chỉ dùng văn bản (model không nhận ảnh)");
        const res = await generateText({ model, prompt: promptText });
        rawText = res.text;
      } else {
        throw err;
      }
    }

    const results = parseClassificationJson(rawText);
    const updateStmt = db.prepare(
      `UPDATE pm_collected_assets
       SET project_name = ?, title = COALESCE(NULLIF(?, ''), title), ai_summary = ?, status = 'classified'
       WHERE id = ?`,
    );

    for (const item of results) {
      const target = batch.find((b) => b.id === item.id);
      if (!target) continue;
      updateStmt.run(item.projectName, item.cleanTitle, item.summary, item.id);
      classifiedCount++;
    }
  }

  return { processed: pending.length, classified: classifiedCount };
}
