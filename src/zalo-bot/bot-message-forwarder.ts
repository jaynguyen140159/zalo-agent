import { layBotTokenGiaiMa } from "../config/account-store.js";
import { db } from "../conversation/database.js";
import { createLogger } from "../shared/logger.js";
import type { KenhLuot } from "../zalo/kenh-luot.js";
import type { ParsedMessage } from "../zalo/zalo-message-parser.js";
import { taoZaloBotClient } from "./zalo-bot-api-client.js";

const log = createLogger("bot-message-forwarder");

export type BotTargetThread = {
  index: number;
  accountId: string;
  threadId: string;
  threadType: number;
  displayName: string;
  lastSenderName: string;
  lastMessageAt: string | null;
};

export type AutoForwardRule = {
  id: number;
  account_id: string;
  source_thread_id: string;
  target_thread_id: string;
  keyword_filter: string;
  prefix_label: string;
  enabled: number;
};

export function normalizeTextVi(raw: string): string {
  return (raw || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim();
}

export function listBotTargets(accountId = "bot-tro-ly-jay"): BotTargetThread[] {
  const rows = db
    .prepare(
      `SELECT account_id, thread_id, thread_type, display_name, last_sender_name, last_message_at
       FROM threads
       WHERE account_id = ?
       ORDER BY thread_type DESC, last_message_at DESC`,
    )
    .all(accountId) as Array<{
    account_id: string;
    thread_id: string;
    thread_type: number;
    display_name: string;
    last_sender_name: string | null;
    last_message_at: string | null;
  }>;

  let groupCounter = 0;
  return rows.map((r, idx) => {
    let fallbackName = r.display_name?.trim() || "";
    if (!fallbackName) {
      if (r.thread_type === 1) {
        groupCounter++;
        fallbackName = `Nhóm Zalo ${groupCounter}`;
      } else {
        fallbackName = r.last_sender_name || r.thread_id;
      }
    }
    return {
      index: idx + 1,
      accountId: r.account_id,
      threadId: r.thread_id,
      threadType: r.thread_type,
      displayName: fallbackName,
      lastSenderName: r.last_sender_name || "",
      lastMessageAt: r.last_message_at,
    };
  });
}

export function renameBotThread(accountId: string, threadId: string, newName: string): void {
  const clean = newName.trim();
  if (!clean) return;
  db.prepare("UPDATE threads SET display_name = ? WHERE account_id = ? AND thread_id = ?").run(
    clean,
    accountId,
    threadId,
  );
}

export type ParsedForwardCommand =
  | { kind: "list" }
  | { kind: "rename"; newName: string }
  | { kind: "forward"; targetQuery: string; bodyText: string };

/**
 * Nhận diện và tách lệnh chuyển tiếp tin nhắn cho Zalo Bot:
 * - "ds nhóm" / "danh sách nhóm"
 * - "đặt tên nhóm: Nhóm Sản Xuất"
 * - "chuyển sang Nhóm 2: Nhờ xưởng kiểm tra mẫu"
 * - "chuyển tiếp Tôn Sa: Gửi file báo giá"
 * - "fw 1: Hàng đã xong"
 * - "chuyển sang tất cả nhóm: Thông báo nghỉ lễ"
 */
export function parseForwardCommand(rawText?: string): ParsedForwardCommand | null {
  if (!rawText) return null;
  // Strip optional @mention prefix (e.g., "@Bot Trợ Lý Jay ...")
  const cleaned = rawText
    .replace(/^@[^\n:]+\s+(?=(?:ds|danh\s+s[aá]ch|[dđ][aặ]t\s+t[eê]n|chuy[eể]n|fw\b))/i, "")
    .trim();
  if (!cleaned) return null;
  const norm = normalizeTextVi(cleaned);

  if (
    norm === "ds nhom" ||
    norm === "danh sach nhom" ||
    norm === "/nhom" ||
    norm === "list nhom"
  ) {
    return { kind: "list" };
  }

  const renameMatch = cleaned.match(/^(?:đặt|dat)\s+(?:tên|ten)\s+(?:nhóm|nhom)\s*[:\-–]?\s*(.+)$/i);
  if (renameMatch && renameMatch[1]?.trim()) {
    return { kind: "rename", newName: renameMatch[1].trim() };
  }

  const fwMatch = cleaned.match(
    /^(?:chuyển\s+tiếp|chuyen\s+tiep|chuyển\s+sang|chuyen\s+sang|chuyển\s+tới|chuyen\s+toi|chuyển|chuyen|fw)\s+([^:\n]+?)\s*(?::|\n|-|–)\s*([\s\S]+)$/i,
  );
  if (fwMatch && fwMatch[1]?.trim() && fwMatch[2]?.trim()) {
    return {
      kind: "forward",
      targetQuery: fwMatch[1].trim(),
      bodyText: fwMatch[2].trim(),
    };
  }

  return null;
}

export function resolveForwardTargets(
  query: string,
  targets: BotTargetThread[],
  excludeThreadId?: string,
): BotTargetThread[] {
  const normQ = normalizeTextVi(query);
  if (!normQ) return [];

  if (normQ === "tat ca" || normQ === "tat ca nhom" || normQ === "all") {
    return targets.filter((t) => t.threadType === 1 && t.threadId !== excludeThreadId);
  }

  // Exact threadId match
  const exactId = targets.find((t) => t.threadId === query.trim());
  if (exactId) return [exactId];

  // Number or "nhom <N>" or "so <N>"
  const numMatch = normQ.match(/^(?:nhom|so)?\s*(\d+)$/);
  if (numMatch) {
    const idx = Number(numMatch[1]);
    const byIdx = targets.find((t) => t.index === idx);
    if (byIdx) return [byIdx];
  }

  // Substring match against displayName
  return targets.filter((t) => normalizeTextVi(t.displayName).includes(normQ));
}

export async function forwardViaBotClient(params: {
  accountId: string;
  targetThreadIds: string[];
  text: string;
  imageUrls?: string[];
  kenh?: KenhLuot;
}): Promise<{ sentCount: number; failedCount: number; errors: string[] }> {
  const token = layBotTokenGiaiMa(params.accountId);
  const botClient = token ? taoZaloBotClient({ token }) : null;
  let sentCount = 0;
  let failedCount = 0;
  const errors: string[] = [];

  for (const tid of params.targetThreadIds) {
    try {
      if (params.kenh) {
        const row = db
          .prepare("SELECT thread_type FROM threads WHERE account_id = ? AND thread_id = ?")
          .get(params.accountId, tid) as { thread_type?: number } | undefined;
        await params.kenh.duongGui(tid, row?.thread_type ?? 1)({ text: params.text });
      } else if (botClient) {
        await botClient.sendMessage(tid, params.text, null);
      } else {
        throw new Error(`Chưa có token cho tài khoản ${params.accountId}`);
      }

      if (botClient && params.imageUrls && params.imageUrls.length > 0) {
        for (const imgUrl of params.imageUrls) {
          if (/^https?:\/\//i.test(imgUrl)) {
            await botClient.sendPhoto(tid, imgUrl).catch(() => {});
          }
        }
      }
      sentCount++;
    } catch (err) {
      failedCount++;
      errors.push(`${tid}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  return { sentCount, failedCount, errors };
}

export async function xuLyLenhChuyenTiepBot(
  accountId: string,
  kenh: KenhLuot,
  msg: ParsedMessage,
): Promise<boolean> {
  const cmd = parseForwardCommand(msg.text);
  if (!cmd) return false;

  const targets = listBotTargets(accountId);

  if (cmd.kind === "list") {
    const lines =
      targets.length > 0
        ? targets
            .map(
              (t) =>
                `${t.index}. ${t.threadType === 1 ? "[Nhóm]" : "[Cá nhân]"} ${t.displayName} (${t.threadId})`,
            )
            .join("\n")
        : "Chưa có nhóm/người nhận nào kết nối với Bot.";
    const reply =
      `📋 [DANH SÁCH NHÓM & NGƯỜI NHẬN CỦA BOT]\n${lines}\n\n` +
      `👉 Cách chuyển tiếp nhanh:\n` +
      `• Chuyển sang Nhóm 1: Nội dung tin nhắn...\n` +
      `• Chuyển sang tất cả nhóm: Thông báo chung...\n` +
      `• Đặt tên nhóm: Nhóm Sản Xuất (gõ ngay trong nhóm cần đổi tên)`;
    await kenh.duongGui(msg.threadId, msg.threadType)({ text: reply }).catch(() => {});
    return true;
  }

  if (cmd.kind === "rename") {
    renameBotThread(accountId, msg.threadId, cmd.newName);
    await kenh
      .duongGui(msg.threadId, msg.threadType)({
        text: `✅ Đã đặt tên cuộc trò chuyện này thành: "${cmd.newName}". Giờ bạn có thể gõ: "Chuyển sang ${cmd.newName}: ..." từ bất kỳ đâu!`,
      })
      .catch(() => {});
    return true;
  }

  const matched = resolveForwardTargets(cmd.targetQuery, targets, msg.threadId);
  if (matched.length === 0) {
    const sample = targets
      .slice(0, 5)
      .map((t) => `${t.index}. ${t.displayName}`)
      .join(", ");
    await kenh
      .duongGui(msg.threadId, msg.threadType)({
        text: `⚠️ Bot chưa tìm thấy nhóm/người nhận "${cmd.targetQuery}".\nCác kênh đang có: ${sample}\nGõ "ds nhóm" để xem đầy đủ.`,
      })
      .catch(() => {});
    return true;
  }

  const sourceLabel =
    targets.find((t) => t.threadId === msg.threadId)?.displayName || msg.senderName || "Zalo";
  const forwardedText = `📨 [Chuyển tiếp từ ${msg.senderName || "Thành viên"} • ${sourceLabel}]:\n${cmd.bodyText}`;
  const imgUrls = (msg.images ?? []).map((i) => i.url).filter(Boolean);

  const res = await forwardViaBotClient({
    accountId,
    targetThreadIds: matched.map((m) => m.threadId),
    text: forwardedText,
    imageUrls: imgUrls,
    kenh,
  });

  const targetNames = matched.map((m) => m.displayName).join(", ");
  const confirmMsg =
    res.sentCount > 0
      ? `✅ Đã chuyển tiếp sang ${res.sentCount} nơi (${targetNames})!`
      : `❌ Chuyển tiếp thất bại: ${res.errors.join("; ")}`;
  await kenh.duongGui(msg.threadId, msg.threadType)({ text: confirmMsg }).catch(() => {});
  return true;
}

export async function chayLuatTuDongChuyenTiep(
  accountId: string,
  kenh: KenhLuot,
  msg: ParsedMessage,
): Promise<void> {
  if (msg.isSelf) return;
  try {
    const rules = db
      .prepare(
        "SELECT * FROM pm_bot_forward_rules WHERE account_id = ? AND source_thread_id = ? AND enabled = 1",
      )
      .all(accountId, msg.threadId) as AutoForwardRule[];
    if (!rules || rules.length === 0) return;

    const targets = listBotTargets(accountId);
    const sourceName = targets.find((t) => t.threadId === msg.threadId)?.displayName || "Nhóm nguồn";
    const normText = normalizeTextVi(msg.text || "");
    const imgUrls = (msg.images ?? []).map((i) => i.url).filter(Boolean);

    for (const rule of rules) {
      if (rule.target_thread_id === msg.threadId) continue;
      if (rule.keyword_filter?.trim()) {
        const kw = normalizeTextVi(rule.keyword_filter);
        if (!normText.includes(kw)) continue;
      }
      const prefix = rule.prefix_label?.trim() || `📨 [Tự động chuyển từ ${sourceName} • ${msg.senderName}]:`;
      const body = msg.text?.trim() || (imgUrls.length > 0 ? "[Hình ảnh đính kèm]" : "[Tin nhắn]");
      await forwardViaBotClient({
        accountId,
        targetThreadIds: [rule.target_thread_id],
        text: `${prefix}\n${body}`,
        imageUrls: imgUrls,
        kenh,
      });
    }
  } catch (err) {
    log.debug({ accountId, threadId: msg.threadId, err }, "Lỗi chạy luật tự động chuyển tiếp Bot");
  }
}
