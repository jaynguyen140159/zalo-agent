import fs from "node:fs";
import path from "node:path";
import { db } from "../conversation/database.js";
import { dataDir } from "../config/env.js";
import { createLogger } from "../shared/logger.js";
import type { ParsedMessage } from "../zalo/zalo-message-parser.js";

const log = createLogger("asset-collector");

const MAX_FILE_BYTES = 25 * 1024 * 1024; // 25MB

function sanitizeSegment(raw: string): string {
  return (raw || "unknown").replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 80) || "unknown";
}

function guessMimeFromExt(ext: string): string {
  const e = ext.toLowerCase().replace(/^\./, "");
  switch (e) {
    case "pdf":
      return "application/pdf";
    case "doc":
      return "application/msword";
    case "docx":
      return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    case "xls":
      return "application/vnd.ms-excel";
    case "xlsx":
      return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    case "ppt":
      return "application/vnd.ms-powerpoint";
    case "pptx":
      return "application/vnd.openxmlformats-officedocument.presentationml.presentation";
    case "zip":
      return "application/zip";
    case "png":
      return "image/png";
    case "webp":
      return "image/webp";
    case "gif":
      return "image/gif";
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    default:
      return "application/octet-stream";
  }
}

export async function downloadRemoteFile(
  url: string,
): Promise<{ data: Buffer; contentType: string } | null> {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(20_000) });
    if (!res.ok) return null;
    const lenHeader = res.headers.get("content-length");
    if (lenHeader && Number(lenHeader) > MAX_FILE_BYTES) {
      log.warn({ url, lenHeader }, "File vượt quá 25MB, bỏ qua tải cục bộ");
      return null;
    }
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length > MAX_FILE_BYTES) return null;
    return {
      data: buf,
      contentType: res.headers.get("content-type") || "application/octet-stream",
    };
  } catch (err) {
    log.debug({ url, err }, "Không tải được file từ URL");
    return null;
  }
}

export async function persistIncomingFiles(
  accountId: string,
  msg: ParsedMessage,
): Promise<void> {
  if (!msg.files || msg.files.length === 0) return;
  for (const [idx, file] of msg.files.entries()) {
    try {
      const downloaded = await downloadRemoteFile(file.url);
      if (!downloaded) continue;
      const safeName = sanitizeSegment(file.fileName || `file-${idx}`);
      const extSuffix =
        file.fileExt && !safeName.toLowerCase().endsWith(`.${file.fileExt.toLowerCase()}`)
          ? `.${sanitizeSegment(file.fileExt)}`
          : "";
      const relPath = [
        "assets",
        sanitizeSegment(accountId),
        sanitizeSegment(msg.threadId),
        `${sanitizeSegment(msg.msgId)}-${idx}-${safeName}${extSuffix}`,
      ].join("/");
      const absPath = path.join(dataDir, relPath);
      fs.mkdirSync(path.dirname(absPath), { recursive: true });
      fs.writeFileSync(absPath, downloaded.data);
      file.localPath = relPath;
      updateCollectedAssetLocalPath(msg.threadId, msg.msgId, "file", file.url, relPath);
    } catch (err) {
      log.debug({ accountId, msgId: msg.msgId, err }, "Lỗi lưu file đính kèm");
    }
  }
}

export function updateCollectedAssetLocalPath(
  threadId: string,
  msgId: string,
  assetType: "image" | "file",
  originalUrl: string,
  localPath: string,
): void {
  if (!localPath) return;
  try {
    db.prepare(
      `UPDATE pm_collected_assets
       SET local_path = ?
       WHERE thread_id = ? AND msg_id = ? AND asset_type = ? AND original_url = ?`,
    ).run(localPath, threadId, msgId, assetType, originalUrl);
  } catch {
    // Ignore DB update error in background
  }
}

function resolveThreadDisplayName(accountId: string, threadId: string): string {
  try {
    const row = db
      .prepare("SELECT display_name FROM threads WHERE account_id = ? AND thread_id = ?")
      .get(accountId, threadId) as { display_name?: string } | undefined;
    return row?.display_name || "";
  } catch {
    return "";
  }
}

export function recordCollectedAssetsFromMessage(
  accountId: string,
  msg: ParsedMessage,
  options: { threadName?: string; downloadFiles?: boolean } = {},
): void {
  const hasImages = msg.images && msg.images.length > 0;
  const hasFiles = msg.files && msg.files.length > 0;
  const hasLinks = msg.links && msg.links.length > 0;
  if (!hasImages && !hasFiles && !hasLinks) return;

  const threadName = options.threadName || resolveThreadDisplayName(accountId, msg.threadId);
  const insertStmt = db.prepare(`
    INSERT OR IGNORE INTO pm_collected_assets
      (account_id, thread_id, thread_name, msg_id, sender_id, sender_name, asset_type, title, original_url, local_path, mime_type, context_text, sent_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const [idx, img] of (msg.images ?? []).entries()) {
    const title = msg.text?.trim()
      ? `${msg.text.trim().slice(0, 60)} (Ảnh ${idx + 1})`
      : `Ảnh Zalo ${msg.senderName || "Nhóm"} #${idx + 1}`;
    insertStmt.run(
      accountId,
      msg.threadId,
      threadName,
      msg.msgId,
      msg.senderId,
      msg.senderName,
      "image",
      title,
      img.url,
      img.localPath || "",
      "image/jpeg",
      msg.text || "",
      msg.sentAt,
    );
  }

  for (const file of msg.files ?? []) {
    const ext = file.fileExt || (file.fileName.includes(".") ? file.fileName.split(".").pop() || "" : "");
    insertStmt.run(
      accountId,
      msg.threadId,
      threadName,
      msg.msgId,
      msg.senderId,
      msg.senderName,
      "file",
      file.fileName,
      file.url,
      file.localPath || "",
      guessMimeFromExt(ext),
      msg.text || "",
      msg.sentAt,
    );
  }

  for (const link of msg.links ?? []) {
    let host = link;
    try {
      host = new URL(link).hostname.replace(/^www\./, "");
    } catch {
      // Keep raw link
    }
    const title = msg.text && msg.text.trim() !== link
      ? `${msg.text.trim().slice(0, 70)} (${host})`
      : `Link: ${host}`;
    insertStmt.run(
      accountId,
      msg.threadId,
      threadName,
      msg.msgId,
      msg.senderId,
      msg.senderName,
      "link",
      title,
      link,
      "",
      "text/uri-list",
      msg.text || "",
      msg.sentAt,
    );
  }

  if (hasFiles && options.downloadFiles !== false) {
    void persistIncomingFiles(accountId, msg);
  }
}

export type CollectedAssetRow = {
  id: number;
  account_id: string;
  thread_id: string;
  thread_name: string;
  msg_id: string;
  sender_id: string;
  sender_name: string;
  asset_type: "image" | "file" | "link";
  title: string;
  original_url: string;
  local_path: string;
  mime_type: string;
  drive_file_id: string;
  drive_web_url: string;
  project_name: string;
  ai_summary: string;
  context_text: string;
  status: "pending" | "classified" | "synced" | "error";
  error_message: string;
  sent_at: string;
  created_at: string;
};
