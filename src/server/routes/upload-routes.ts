import fs from "node:fs";
import path from "node:path";
import { Hono } from "hono";
import { getAccount, layBotTokenGiaiMa } from "../../config/account-store.js";
import { createLogger } from "../../shared/logger.js";
import { taoZaloBotClient } from "../../zalo-bot/zalo-bot-api-client.js";

const log = createLogger("upload-routes");
export const KHO_LUU_TRU_DIR = process.env.KHO_LUU_TRU_DIR || path.join(process.cwd(), "data", "kho-luu-tru");

// Đảm bảo thư mục lưu trữ luôn tồn tại
if (!fs.existsSync(KHO_LUU_TRU_DIR)) {
  fs.mkdirSync(KHO_LUU_TRU_DIR, { recursive: true });
}

export const uploadRoutes = new Hono()
  // Trang giao diện Upload HTML (Đẹp, hiện đại, tương thích Mobile & Desktop)
  .get("/", (c) => {
    const sender = c.req.query("sender") ?? "";

    const html = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Kho Lưu Trữ Tài Liệu — Bot Trợ Lý Jay</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --primary: #0068FF;
      --primary-hover: #0053CC;
      --bg: #F8FAFC;
      --card-bg: #FFFFFF;
      --text: #0F172A;
      --text-muted: #64748B;
      --border: #E2E8F0;
      --success: #10B981;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Plus Jakarta Sans', sans-serif; }
    body { background-color: var(--bg); color: var(--text); padding: 24px 16px; min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; }
    .container { width: 100%; max-width: 520px; background: var(--card-bg); border-radius: 20px; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01); border: 1px solid var(--border); overflow: hidden; }
    .header { padding: 32px 28px 20px; text-align: center; }
    .badge { display: inline-flex; align-items: center; gap: 6px; background: #EFF6FF; color: var(--primary); padding: 6px 14px; border-radius: 9999px; font-size: 13px; font-weight: 600; margin-bottom: 12px; }
    .title { font-size: 22px; font-weight: 700; color: var(--text); margin-bottom: 6px; }
    .subtitle { font-size: 14px; color: var(--text-muted); line-height: 1.5; }
    .body { padding: 0 28px 28px; }
    .dropzone { border: 2px dashed #CBD5E1; border-radius: 16px; padding: 36px 20px; text-align: center; cursor: pointer; transition: all 0.2s ease; background: #F8FAFC; }
    .dropzone:hover, .dropzone.dragover { border-color: var(--primary); background: #EFF6FF; }
    .upload-icon { font-size: 42px; margin-bottom: 12px; }
    .dropzone-text { font-size: 15px; font-weight: 600; color: #334155; margin-bottom: 4px; }
    .dropzone-hint { font-size: 13px; color: var(--text-muted); }
    .file-input { display: none; }
    .form-group { margin-top: 18px; }
    .form-label { display: block; font-size: 13px; font-weight: 600; color: #475569; margin-bottom: 6px; }
    .form-input { width: 100%; padding: 10px 14px; border-radius: 10px; border: 1px solid var(--border); font-size: 14px; outline: none; transition: border-color 0.2s; }
    .form-input:focus { border-color: var(--primary); }
    .file-preview { margin-top: 18px; display: none; padding: 14px; background: #F1F5F9; border-radius: 12px; font-size: 13px; }
    .btn { display: block; width: 100%; padding: 14px; margin-top: 20px; background: var(--primary); color: white; border: none; border-radius: 12px; font-size: 15px; font-weight: 600; cursor: pointer; transition: background 0.2s; text-align: center; }
    .btn:hover { background: var(--primary-hover); }
    .btn:disabled { background: #94A3B8; cursor: not-allowed; }
    .status-msg { margin-top: 16px; padding: 12px 16px; border-radius: 10px; font-size: 14px; font-weight: 500; display: none; }
    .status-msg.success { background: #ECFDF5; color: #065F46; border: 1px solid #A7F3D0; }
    .status-msg.error { background: #FEF2F2; color: #991B1B; border: 1px solid #FECACA; }
    .recent-section { margin-top: 24px; padding-top: 20px; border-top: 1px solid var(--border); }
    .recent-title { font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: var(--text-muted); margin-bottom: 10px; }
    .file-item { display: flex; align-items: center; justify-content: space-between; padding: 8px 10px; border-radius: 8px; font-size: 13px; margin-bottom: 4px; background: #F8FAFC; }
    .file-name { font-weight: 500; color: #1E293B; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 280px; }
    .file-size { font-size: 12px; color: var(--text-muted); }
  </style>
</head>
<body>
  <div style="width: 100%; max-width: 520px; margin-bottom: 12px; display: flex; justify-content: flex-start;">
    <a href="/portal" style="display: inline-flex; align-items: center; gap: 8px; text-decoration: none; color: #334155; font-size: 13px; font-weight: 700; padding: 8px 14px; background: white; border-radius: 10px; border: 1px solid var(--border); box-shadow: 0 1px 3px rgba(0,0,0,0.05); transition: all 0.2s;">
      ⬅️ Quay lại Cổng Quản Lý Dự Án
    </a>
  </div>
  <div class="container">
    <div class="header">
      <div class="badge">🤖 Bot Trợ Lý Jay • Zalo Cloud</div>
      <h1 class="title">Tải Lên Kho Lưu Trữ</h1>
      <p class="subtitle">Hỗ trợ mọi định dạng: PDF, Word, Excel, ZIP, Ảnh, Video... Không giới hạn dung lượng Zalo.</p>
    </div>
    <div class="body">
      <div class="dropzone" id="dropzone">
        <div class="upload-icon">📁</div>
        <div class="dropzone-text">Bấm vào đây hoặc kéo thả file vào</div>
        <div class="dropzone-hint">Chọn bất kỳ file tài liệu nào từ máy của bạn</div>
        <input type="file" id="fileInput" class="file-input" multiple>
      </div>

      <div class="file-preview" id="filePreview"></div>

      <div class="form-group">
        <label class="form-label" for="senderName">Tên người gửi / Ghi chú file (Tùy chọn)</label>
        <input type="text" id="senderName" class="form-input" placeholder="Ví dụ: Anh Huy - Báo cáo tài chính" value="${escapeHtml(sender)}">
      </div>

      <button id="uploadBtn" class="btn" disabled>Bắt đầu Tải Lên</button>

      <div id="statusMsg" class="status-msg"></div>

      <div class="recent-section">
        <div class="recent-title">Các file đã lưu gần đây trong kho</div>
        <div id="recentFiles">Đang tải danh sách...</div>
      </div>
    </div>
  </div>

  <script>
    const dropzone = document.getElementById('dropzone');
    const fileInput = document.getElementById('fileInput');
    const filePreview = document.getElementById('filePreview');
    const uploadBtn = document.getElementById('uploadBtn');
    const senderName = document.getElementById('senderName');
    const statusMsg = document.getElementById('statusMsg');
    const recentFiles = document.getElementById('recentFiles');
    const urlParams = new URLSearchParams(window.location.search);
    const threadId = urlParams.get('thread') || '';

    let selectedFiles = [];

    dropzone.addEventListener('click', () => fileInput.click());

    ['dragenter', 'dragover'].forEach(name => {
      dropzone.addEventListener(name, (e) => { e.preventDefault(); dropzone.classList.add('dragover'); });
    });
    ['dragleave', 'drop'].forEach(name => {
      dropzone.addEventListener(name, (e) => { e.preventDefault(); dropzone.classList.remove('dragover'); });
    });

    dropzone.addEventListener('drop', (e) => {
      if (e.dataTransfer.files.length) {
        handleFiles(e.dataTransfer.files);
      }
    });

    fileInput.addEventListener('change', (e) => {
      if (e.target.files.length) {
        handleFiles(e.target.files);
      }
    });

    function formatBytes(bytes) {
      if (bytes === 0) return '0 B';
      const k = 1024, dm = 1;
      const sizes = ['B', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }

    function handleFiles(files) {
      selectedFiles = Array.from(files);
      if (selectedFiles.length === 0) {
        filePreview.style.display = 'none';
        uploadBtn.disabled = true;
        return;
      }
      filePreview.style.display = 'block';
      filePreview.innerHTML = selectedFiles.map(f => '<div>📄 <b>' + f.name + '</b> (' + formatBytes(f.size) + ')</div>').join('');
      uploadBtn.disabled = false;
      uploadBtn.innerText = 'Tải lên ' + selectedFiles.length + ' file';
    }

    uploadBtn.addEventListener('click', async () => {
      if (!selectedFiles.length) return;
      uploadBtn.disabled = true;
      uploadBtn.innerText = 'Đang tải lên...';
      statusMsg.style.display = 'none';

      const formData = new FormData();
      selectedFiles.forEach(f => formData.append('files', f));
      formData.append('sender', senderName.value.trim());
      formData.append('thread', threadId);

      try {
        const res = await fetch('/upload/api', { method: 'POST', body: formData });
        const result = await res.json();
        if (res.ok && result.ok) {
          statusMsg.className = 'status-msg success';
          statusMsg.innerHTML = '✅ ' + result.message + (result.zaloNotified ? '<br>🔔 <i>Đã gửi tin nhắn thông báo xác nhận vào Zalo!</i>' : '');
          statusMsg.style.display = 'block';
          selectedFiles = [];
          filePreview.style.display = 'none';
          fileInput.value = '';
          loadRecentFiles();
        } else {
          throw new Error(result.error || 'Có lỗi xảy ra');
        }
      } catch (err) {
        statusMsg.className = 'status-msg error';
        statusMsg.innerText = '❌ Lỗi: ' + err.message;
        statusMsg.style.display = 'block';
      } finally {
        uploadBtn.disabled = selectedFiles.length === 0;
        uploadBtn.innerText = 'Bắt đầu Tải Lên';
      }
    });

    async function loadRecentFiles() {
      try {
        const res = await fetch('/upload/files');
        const data = await res.json();
        if (data.files && data.files.length) {
          recentFiles.innerHTML = data.files.map(f => 
            '<div class=\"file-item\">' +
              '<span class=\"file-name\" title=\"' + f.name + '\">📄 ' + f.name + '</span>' +
              '<span class=\"file-size\">' + formatBytes(f.size) + '</span>' +
            '</div>'
          ).join('');
        } else {
          recentFiles.innerHTML = '<span style=\"color:#94A3B8;\">Chưa có file nào trong kho.</span>';
        }
      } catch (e) {
        recentFiles.innerHTML = '<span style=\"color:#EF4444;\">Không tải được danh sách file.</span>';
      }
    }

    loadRecentFiles();
  </script>
</body>
</html>`;
    return c.html(html);
  })

  // API tải file lên
  .post("/api", async (c) => {
    try {
      const body = await c.req.parseBody({ all: true });
      const rawFiles = body["files"];
      const sender = (typeof body["sender"] === "string" ? body["sender"] : "").trim() || "Người dùng";
      const threadId = (typeof body["thread"] === "string" ? body["thread"] : "").trim();

      const files: File[] = [];
      if (Array.isArray(rawFiles)) {
        for (const item of rawFiles) {
          if (item instanceof File) files.push(item);
        }
      } else if (rawFiles instanceof File) {
        files.push(rawFiles);
      }

      if (files.length === 0) {
        return c.json({ error: "Không tìm thấy file nào được gửi lên" }, 400);
      }

      const savedNames: string[] = [];
      let totalBytes = 0;

      for (const file of files) {
        const safeName = path.basename(file.name).replace(/[^a-zA-Z0-9._\-() \p{L}]/gu, "_");
        const destPath = path.join(KHO_LUU_TRU_DIR, safeName);
        const arrayBuffer = await file.arrayBuffer();
        fs.writeFileSync(destPath, Buffer.from(arrayBuffer));
        savedNames.push(safeName);
        totalBytes += file.size;
        log.info({ safeName, bytes: file.size, sender }, "Đã lưu file từ trang upload web");
      }

      // Gửi tin nhắn thông báo tự động vào Zalo Bot nếu có cấu hình Bot
      let zaloNotified = false;
      try {
        const botAccount = getAccount("bot-tro-ly-jay") ?? getAccount("bot-tro-ly");
        if (botAccount) {
          const token = layBotTokenGiaiMa(botAccount.id);
          const targetThread = threadId || "c06034026e41871fde50"; // fallback thread của bạn
          if (token && targetThread) {
            const client = taoZaloBotClient({ token });
            const listStr = savedNames.map((n) => `• 📄 ${n}`).join("\n");
            const msg = `🔔 [KHO LƯU TRỮ VỪA NHẬN FILE MỚI]\n👤 Người gửi: ${sender}\n📦 Danh sách file (${savedNames.length} file):\n${listStr}\n📂 Đã lưu an toàn vào thư mục Zalo_Kho_Luu_Tru trên máy.`;
            await client.sendMessage(targetThread, msg);
            zaloNotified = true;
          }
        }
      } catch (err) {
        log.warn({ err }, "Không gửi được tin báo Zalo sau khi upload");
      }

      return c.json({
        ok: true,
        message: `Đã lưu thành công ${savedNames.length} file vào kho lưu trữ!`,
        files: savedNames,
        zaloNotified,
      });
    } catch (err) {
      log.error({ err }, "Lỗi xử lý file upload");
      return c.json({ error: err instanceof Error ? err.message : String(err) }, 500);
    }
  })

  // API xem danh sách file trong kho
  .get("/files", (c) => {
    try {
      if (!fs.existsSync(KHO_LUU_TRU_DIR)) {
        return c.json({ files: [] });
      }
      const entries = fs.readdirSync(KHO_LUU_TRU_DIR, { withFileTypes: true });
      const files = entries
        .filter((e) => e.isFile() && !e.name.startsWith("."))
        .map((e) => {
          const stat = fs.statSync(path.join(KHO_LUU_TRU_DIR, e.name));
          return {
            name: e.name,
            size: stat.size,
            updatedAt: stat.mtime.toISOString(),
          };
        })
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

      return c.json({ files });
    } catch (err) {
      return c.json({ error: String(err) }, 500);
    }
  });

function escapeHtml(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
