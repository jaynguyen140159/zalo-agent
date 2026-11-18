import fs from "node:fs";
import path from "node:path";
import { db } from "../conversation/database.js";
import { dataDir } from "../config/env.js";
import { createLogger } from "../shared/logger.js";
import { downloadRemoteFile, type CollectedAssetRow } from "./asset-collector-store.js";

const log = createLogger("google-drive");

export type DriveSettings = {
  root_folder_name: string;
  root_folder_id: string;
  access_token: string;
  refresh_token: string;
  client_id: string;
  client_secret: string;
  token_expires_at: number;
  auto_sync: number;
  default_account_id: string;
  default_group_id: string;
};

export function getDriveSettings(): DriveSettings {
  const row = db.prepare("SELECT * FROM pm_drive_settings WHERE id = 1").get() as DriveSettings | undefined;
  return (
    row ?? {
      root_folder_name: "Khởi Minh Drive",
      root_folder_id: "",
      access_token: "",
      refresh_token: "",
      client_id: "",
      client_secret: "",
      token_expires_at: 0,
      auto_sync: 0,
      default_account_id: "",
      default_group_id: "",
    }
  );
}

export function updateDriveSettings(patch: Partial<DriveSettings>): DriveSettings {
  const allowed: (keyof DriveSettings)[] = [
    "root_folder_name",
    "root_folder_id",
    "access_token",
    "refresh_token",
    "client_id",
    "client_secret",
    "token_expires_at",
    "auto_sync",
    "default_account_id",
    "default_group_id",
  ];
  const entries = allowed
    .filter((k) => patch[k] !== undefined)
    .map((k) => [k, patch[k] as string | number] as const);
  if (entries.length > 0) {
    const sets = entries.map(([k]) => `${k} = ?`).join(", ");
    const values = entries.map(([, v]) => v);
    db.prepare(`UPDATE pm_drive_settings SET ${sets}, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE id = 1`).run(
      ...values,
    );
  }
  return getDriveSettings();
}

async function resolveAccessToken(fetchImpl: typeof fetch = fetch): Promise<string> {
  const s = getDriveSettings();
  if (!s.access_token && !s.refresh_token) {
    throw new Error("Chưa cấu hình Google Drive Access Token hoặc Refresh Token trong Cài đặt kết nối");
  }

  const nowSec = Math.floor(Date.now() / 1000);
  if (s.access_token && (!s.token_expires_at || s.token_expires_at > nowSec + 60)) {
    return s.access_token;
  }

  if (s.refresh_token && s.client_id && s.client_secret) {
    const res = await fetchImpl("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: s.client_id,
        client_secret: s.client_secret,
        refresh_token: s.refresh_token,
        grant_type: "refresh_token",
      }),
    });
    const data = (await res.json()) as { access_token?: string; expires_in?: number; error_description?: string };
    if (!res.ok || !data.access_token) {
      throw new Error(`Làm mới Google Drive token thất bại: ${data.error_description || res.status}`);
    }
    updateDriveSettings({
      access_token: data.access_token,
      token_expires_at: nowSec + (data.expires_in ?? 3500),
    });
    return data.access_token;
  }

  if (s.access_token) return s.access_token;
  throw new Error("Token Google Drive đã hết hạn và chưa có Refresh Token để tự gia hạn");
}

function escapeDriveQuery(val: string): string {
  return val.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
}

export async function ensureDriveFolder(
  name: string,
  parentId?: string,
  fetchImpl: typeof fetch = fetch,
): Promise<string> {
  const token = await resolveAccessToken(fetchImpl);
  const safeName = name.trim() || "Khởi Minh Drive";
  const parentClause = parentId ? ` and '${escapeDriveQuery(parentId)}' in parents` : "";
  const q = `mimeType = 'application/vnd.google-apps.folder' and name = '${escapeDriveQuery(safeName)}' and trashed = false${parentClause}`;
  const searchUrl = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}&fields=files(id,name)&pageSize=1`;

  const searchRes = await fetchImpl(searchUrl, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const searchJson = (await searchRes.json()) as { files?: { id: string; name: string }[]; error?: { message: string } };
  if (!searchRes.ok) {
    throw new Error(searchJson.error?.message || `Drive search lỗi ${searchRes.status}`);
  }
  if (searchJson.files && searchJson.files.length > 0) {
    return searchJson.files[0]!.id;
  }

  const createRes = await fetchImpl("https://www.googleapis.com/drive/v3/files?fields=id,name", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: safeName,
      mimeType: "application/vnd.google-apps.folder",
      ...(parentId ? { parents: [parentId] } : {}),
    }),
  });
  const createJson = (await createRes.json()) as { id?: string; error?: { message: string } };
  if (!createRes.ok || !createJson.id) {
    throw new Error(createJson.error?.message || `Không tạo được thư mục Drive "${safeName}"`);
  }
  return createJson.id;
}

export async function uploadBufferToDrive(
  params: {
    buffer: Buffer;
    fileName: string;
    mimeType: string;
    folderId: string;
  },
  fetchImpl: typeof fetch = fetch,
): Promise<{ id: string; webViewLink: string }> {
  const token = await resolveAccessToken(fetchImpl);
  const boundary = `km_drive_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const metadata = JSON.stringify({
    name: params.fileName,
    parents: [params.folderId],
  });

  const head = Buffer.from(
    `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${metadata}\r\n--${boundary}\r\nContent-Type: ${params.mimeType || "application/octet-stream"}\r\n\r\n`,
    "utf8",
  );
  const tail = Buffer.from(`\r\n--${boundary}--`, "utf8");
  const body = Buffer.concat([head, params.buffer, tail]);

  const res = await fetchImpl(
    "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,webViewLink",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": `multipart/related; boundary=${boundary}`,
        "Content-Length": String(body.length),
      },
      body,
    },
  );
  const json = (await res.json()) as { id?: string; webViewLink?: string; error?: { message: string } };
  if (!res.ok || !json.id) {
    throw new Error(json.error?.message || `Upload Drive lỗi ${res.status}`);
  }
  return {
    id: json.id,
    webViewLink: json.webViewLink || `https://drive.google.com/file/d/${json.id}/view`,
  };
}

export async function syncAssetToDrive(
  assetId: number,
  fetchImpl: typeof fetch = fetch,
): Promise<{ ok: boolean; driveUrl?: string; error?: string }> {
  const asset = db.prepare("SELECT * FROM pm_collected_assets WHERE id = ?").get(assetId) as CollectedAssetRow | undefined;
  if (!asset) return { ok: false, error: "Không tìm thấy tài liệu" };

  try {
    const settings = getDriveSettings();
    let rootId = settings.root_folder_id;
    if (!rootId) {
      rootId = await ensureDriveFolder(settings.root_folder_name || "Khởi Minh Drive", undefined, fetchImpl);
      updateDriveSettings({ root_folder_id: rootId });
    }

    const projectFolderName = (asset.project_name || "Chờ phân loại").trim();
    const projectFolderId = await ensureDriveFolder(projectFolderName, rootId, fetchImpl);

    const subFolderName =
      asset.asset_type === "image"
        ? "Ảnh"
        : asset.asset_type === "file"
          ? "Tài liệu"
          : "Link tham khảo";
    const subFolderId = await ensureDriveFolder(subFolderName, projectFolderId, fetchImpl);

    let buffer: Buffer | null = null;
    let fileName = asset.title || `asset-${asset.id}`;
    let mimeType = asset.mime_type || "application/octet-stream";

    if (asset.asset_type === "link") {
      const content = [
        `Tiêu đề: ${asset.title}`,
        `URL: ${asset.original_url}`,
        `Người gửi: ${asset.sender_name}`,
        `Thời gian: ${asset.sent_at}`,
        `Dự án: ${projectFolderName}`,
        asset.ai_summary ? `Tóm tắt AI: ${asset.ai_summary}` : "",
        asset.context_text ? `\nNgữ cảnh tin nhắn:\n${asset.context_text}` : "",
      ]
        .filter(Boolean)
        .join("\n");
      buffer = Buffer.from(content, "utf8");
      fileName = `${fileName.replace(/[\\/:*?"<>|]/g, "_").slice(0, 60)}.txt`;
      mimeType = "text/plain; charset=utf-8";
    } else {
      if (asset.local_path) {
        const abs = path.join(dataDir, asset.local_path);
        if (fs.existsSync(abs)) {
          buffer = fs.readFileSync(abs);
        }
      }
      if (!buffer && asset.original_url) {
        const dl = await downloadRemoteFile(asset.original_url);
        if (dl) {
          buffer = dl.data;
          if (!asset.mime_type) mimeType = dl.contentType;
        }
      }
      if (!buffer) {
        throw new Error("Không đọc được dữ liệu file/ảnh (file cục bộ thiếu hoặc link Zalo đã hết hạn)");
      }
      if (asset.asset_type === "image" && !/\.(jpg|jpeg|png|webp|gif)$/i.test(fileName)) {
        fileName = `${fileName.replace(/[\\/:*?"<>|]/g, "_").slice(0, 60)}.jpg`;
      }
    }

    const uploaded = await uploadBufferToDrive({ buffer, fileName, mimeType, folderId: subFolderId }, fetchImpl);

    db.prepare(
      `UPDATE pm_collected_assets
       SET drive_file_id = ?, drive_web_url = ?, status = 'synced', error_message = ''
       WHERE id = ?`,
    ).run(uploaded.id, uploaded.webViewLink, asset.id);

    return { ok: true, driveUrl: uploaded.webViewLink };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    log.warn({ assetId, err: message }, "Đồng bộ Google Drive thất bại");
    db.prepare(
      `UPDATE pm_collected_assets SET status = 'error', error_message = ? WHERE id = ?`,
    ).run(message, asset.id);
    return { ok: false, error: message };
  }
}
