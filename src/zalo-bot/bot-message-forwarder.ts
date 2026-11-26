import { layBotTokenGiaiMa, listAccounts } from "../config/account-store.js";
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
  memberNames?: string[];
  lastMessagePreview?: string;
  isAutoNamed?: boolean;
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

export const KNOWN_GROUP_NAMES: Record<string, string> = {
  "zgr-a0378ef36c9c85c2dc8d": "KM-3 ANH CHỊ EM",
  "zgr-88fc6d2b7c45951bcc54": "Nhóm Test",
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

function stripBotMentionPrefix(text: string): string {
  return (text || "")
    .replace(/^(?:@(?:bot(?:\s+[^\n@]+)?|[^\n]+?\s-\s[^\n]+)\s*)+/i, "")
    .trim();
}

function stripAnyLeadingMentions(text: string): string {
  return (text || "").replace(/^\s*(?:@[^\n@]+\s+)+/, "").trim();
}

function cleanTargetQuery(raw: string): string {
  return (raw || "")
    .trim()
    .replace(/\s+(?:nhé|nhe|nha|nhá|ạ|a|đi|di|với|voi|luôn|lun|giúp(?:\s+em|\s+mình|\s+tôi|\s+nhé|\s+nha)?)\s*[.!?]*$/i, "")
    .replace(/[.!?]+$/, "")
    .trim();
}

function truncatePreview(text: string, maxLen = 70): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (!clean) return "";
  return clean.length > maxLen ? `${clean.slice(0, maxLen - 1)}…` : clean;
}

/**
 * Bóc nội dung tin nhắn gốc khi người dùng ấn "Trả lời (Reply)" trên Zalo Cá Nhân (`zca-js`).
 */
export function extractQuotedMessageFromRaw(
  msg: Pick<ParsedMessage, "rawData">,
): { senderName: string; content: string } | null {
  const raw = msg.rawData as Record<string, unknown> | undefined;
  const q = raw?.quote as Record<string, unknown> | undefined;
  if (!q || typeof q !== "object") return null;
  const rawContent = q.msg ?? q.content;
  const content = typeof rawContent === "string" ? rawContent.trim() : "";
  if (!content) return null;
  const senderName = String(q.fromD || q.uidFrom || "Thành viên").trim() || "Thành viên";
  return { senderName, content };
}

export function inferGroupDisplayName(params: {
  threadId: string;
  rawName: string;
  memberNames: string[];
  recentTexts: string[];
  groupIndex: number;
}): { displayName: string; isAutoNamed: boolean } {
  const trimmed = (params.rawName || "").trim();
  const isGenericPlaceholder = !trimmed || /^Nhóm Zalo \d+$/i.test(trimmed);

  if (!isGenericPlaceholder) {
    return { displayName: trimmed, isAutoNamed: false };
  }

  for (const txt of params.recentTexts) {
    const m = txt.match(/(?:đây là|nhóm này là)\s+(?:nhóm\s+)?([^\n,.!?]{2,40})/i);
    if (m?.[1]?.trim()) {
      const candidate = m[1].trim();
      const titled = /^nh[oó]m\b/i.test(candidate) ? candidate : `Nhóm ${candidate}`;
      return { displayName: titled, isAutoNamed: true };
    }
  }

  if (KNOWN_GROUP_NAMES[params.threadId]) {
    return { displayName: KNOWN_GROUP_NAMES[params.threadId], isAutoNamed: true };
  }

  const companyMember = params.memberNames.find((n) => /-\s*Khởi Minh$/i.test(n));
  if (companyMember) {
    return { displayName: "KM-3 ANH CHỊ EM", isAutoNamed: true };
  }

  if (params.memberNames.length > 0) {
    const shown = params.memberNames.slice(0, 2).join(", ");
    const extra = params.memberNames.length > 2 ? ` +${params.memberNames.length - 2}` : "";
    return {
      displayName: `Nhóm #${params.groupIndex} (${shown}${extra})`,
      isAutoNamed: true,
    };
  }

  return {
    displayName: trimmed || `Nhóm #${params.groupIndex}`,
    isAutoNamed: true,
  };
}

export function listBotTargets(accountId = "bot-tro-ly-jay"): BotTargetThread[] {
  // Chỉ lấy các nhóm/người nhận thuộc đúng tài khoản Bot đang dùng để tránh lẫn/trùng
  // với ID số của Zalo Cá Nhân (Bot API không gửi được vào thread ID của nick cá nhân).
  const rawRows = db
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

  // Khử trùng lặp theo thread_id (ưu tiên row có display_name đẹp)
  const deduped = new Map<string, (typeof rawRows)[number]>();
  for (const r of rawRows) {
    const prev = deduped.get(r.thread_id);
    if (!prev) {
      deduped.set(r.thread_id, r);
      continue;
    }
    const prevHasRealName = Boolean(prev.display_name?.trim() && !/^Nhóm Zalo \d+$/i.test(prev.display_name));
    const curHasRealName = Boolean(r.display_name?.trim() && !/^Nhóm Zalo \d+$/i.test(r.display_name));
    if (!prevHasRealName && curHasRealName) {
      deduped.set(r.thread_id, r);
    }
  }
  const rows = Array.from(deduped.values());

  const stmtMembers = db.prepare(
    `SELECT DISTINCT sender_name
     FROM messages
     WHERE account_id = ? AND thread_id = ? AND role = 'user'
       AND sender_name IS NOT NULL AND sender_name != ''
     ORDER BY id DESC
     LIMIT 8`,
  );
  const stmtRecentTexts = db.prepare(
    `SELECT content
     FROM messages
     WHERE account_id = ? AND thread_id = ? AND role = 'user'
       AND content IS NOT NULL AND content != ''
     ORDER BY id DESC
     LIMIT 5`,
  );

  let groupCounter = 0;
  return rows.map((r, idx) => {
    let memberNames: string[] = [];
    let recentTexts: string[] = [];
    try {
      memberNames = (stmtMembers.all(r.account_id, r.thread_id) as Array<{ sender_name: string }>).map(
        (m) => m.sender_name,
      );
      recentTexts = (stmtRecentTexts.all(r.account_id, r.thread_id) as Array<{ content: string }>).map(
        (m) => m.content,
      );
    } catch {
      // Bỏ qua nếu bảng messages chưa sẵn sàng trong test unit cô lập
    }

    const previewCandidate = recentTexts
      .map((t) => stripBotMentionPrefix(t))
      .find((t) => t.length > 0 && !t.startsWith("[gửi một"));
    const lastMessagePreview = previewCandidate ? truncatePreview(previewCandidate, 70) : "";

    let displayName = (r.display_name || "").trim();
    let isAutoNamed = false;
    if (r.thread_type === 1) {
      groupCounter++;
      const inferred = inferGroupDisplayName({
        threadId: r.thread_id,
        rawName: displayName,
        memberNames,
        recentTexts,
        groupIndex: groupCounter,
      });
      displayName = inferred.displayName;
      isAutoNamed = inferred.isAutoNamed;
    } else if (!displayName) {
      displayName = r.last_sender_name || memberNames[0] || "Người dùng Zalo";
    }

    return {
      index: idx + 1,
      accountId: r.account_id,
      threadId: r.thread_id,
      threadType: r.thread_type,
      displayName,
      lastSenderName: r.last_sender_name || memberNames[0] || "",
      lastMessageAt: r.last_message_at,
      memberNames,
      lastMessagePreview,
      isAutoNamed,
    };
  });
}

export function renameBotThread(accountId: string, threadId: string, newName: string): void {
  const clean = newName.trim();
  if (!clean) return;
  const res = db
    .prepare("UPDATE threads SET display_name = ? WHERE account_id = ? AND thread_id = ?")
    .run(clean, accountId, threadId);
  if (Number(res.changes || 0) === 0) {
    db.prepare("UPDATE threads SET display_name = ? WHERE thread_id = ?").run(clean, threadId);
  }
}

export type ParsedForwardCommand =
  | { kind: "list" }
  | { kind: "rename"; newName: string; targetQuery?: string; renames?: Array<{ targetQuery: string; newName: string }> }
  | { kind: "forward"; targetQuery: string; bodyText: string; useLastMessage?: boolean };

function stripLeadingMentionsBeforeCommand(rawText: string): string {
  let cleaned = rawText.trim();
  if (!cleaned.startsWith("@")) return cleaned;

  const cmdStartRegex =
    /(?:^|\s)(?=(?:ds\s+nh[oó]m|danh\s+s[aá]ch\s+nh[oó]m|c[aá]c\s+nh[oó]m|nh[oó]m\s+(?:zalo\s*)?\d+\s+(?:l[aà]\s+g[iì]|(?:c[oó]\s+ph[aả]i|l[aà]))|(?:đặt|dat|đổi|doi)\s+(?:tên|ten)\s+nh[oó]m|chuy[eểế]n\s*(?:ti[eế]p|sang|t[oớ]i)|fw\b|đây\s+là\s+nhóm|nhóm\s+này\s+là))/i;
  const match = cmdStartRegex.exec(cleaned);
  if (match && typeof match.index === "number") {
    const prefix = cleaned.slice(0, match.index);
    if (!prefix.includes(":")) {
      cleaned = cleaned.slice(match.index).trim();
    }
  } else {
    cleaned = cleaned.replace(/^@[^\n:]+\s+/, "").trim();
  }
  return cleaned;
}

function extractInlineMentionForward(rawText: string): ParsedForwardCommand | null {
  const inlineMatch = rawText.match(
    /^([\s\S]+?)\s+@[^\n@]+?\s+(?:chuy[eểế]n\s+ti[eế]p\s+(?:tin\s*(?:nh[aắ]n)?\s*(?:n[aà]y|tr[eê]n)?\s+)?(?:sang|t[oớ]i|v[aà]o|cho)|chuy[eểế]n\s+(?:sang|t[oớ]i|v[aà]o|cho)|fw)\s+([^:\n]+?)(?:\s*:\s*([\s\S]+))?$/i,
  );
  if (!inlineMatch) return null;

  const beforePart = stripBotMentionPrefix(inlineMatch[1] || "");
  if (!beforePart || parseForwardCommandSimpleCheck(beforePart)) return null;

  const targetQuery = cleanTargetQuery(inlineMatch[2] || "");
  const bodyText = (inlineMatch[3] || beforePart).trim();
  if (!targetQuery || !bodyText) return null;

  return {
    kind: "forward",
    targetQuery,
    bodyText,
  };
}

function parseForwardCommandSimpleCheck(text: string): boolean {
  const n = normalizeTextVi(text);
  return /^(?:ds nhom|danh sach nhom|chuyen sang|chuyen tiep|dat ten nhom|doi ten nhom|fw\b)/.test(n);
}

function extractBatchRenames(cleaned: string): Array<{ targetQuery: string; newName: string }> {
  const renames: Array<{ targetQuery: string; newName: string }> = [];
  const seen = new Set<string>();

  const parenRegex = /(?:^|[\s\n])nh[oó]m\s+(?:zalo\s*)?(\d+)[^\n():]{0,30}\(\s*([^\n()]{2,60})\s*\)/gi;
  for (const m of cleaned.matchAll(parenRegex)) {
    const q = m[1]?.trim();
    const name = m[2]?.trim();
    if (q && name && !seen.has(q)) {
      seen.add(q);
      renames.push({ targetQuery: q, newName: name });
    }
  }

  const lineRegex = /(?:^|[\n,;])\s*(?:(?:b[aạ]n\s+)?(?:[đd][aặ]t|[đd][oổ]i|setup)\s+t[eê]n\s+(?:c[uủ]a\s+)?)?nh[oó]m\s+(?:zalo\s*)?(\d+)\s*(?::|l[aà]|th[aà]nh|=)\s*([^\n,;()]{2,60})/gi;
  for (const m of cleaned.matchAll(lineRegex)) {
    const q = m[1]?.trim();
    const name = cleanTargetQuery(m[2] || "");
    if (q && name && !seen.has(q)) {
      seen.add(q);
      renames.push({ targetQuery: q, newName: name });
    }
  }

  return renames;
}

export function parseForwardCommand(rawText?: string): ParsedForwardCommand | null {
  if (!rawText) return null;

  const inlineCmd = extractInlineMentionForward(rawText.trim());
  if (inlineCmd) return inlineCmd;

  const cleaned = stripLeadingMentionsBeforeCommand(rawText);
  if (!cleaned) return null;
  const norm = normalizeTextVi(cleaned);

  if (
    norm === "ds nhom" ||
    norm === "danh sach nhom" ||
    norm === "/nhom" ||
    norm === "list nhom" ||
    norm === "cac nhom" ||
    norm === "bot dang o nhom nao" ||
    /^nhom\s*(?:zalo\s*)?\d+\s+la\s+(?:gi|nhom nao)/i.test(norm) ||
    /^cac\s+nhom\s+hien\s+tai/i.test(norm) ||
    /(?:tai sao|sao).*khong.*chuyen\s*tiep/i.test(norm) ||
    /^khi\s+toi\s+bao\s+chuyen\s*tiep/i.test(norm)
  ) {
    return { kind: "list" };
  }

  const batchRenames = extractBatchRenames(cleaned);
  if (batchRenames.length > 0) {
    return {
      kind: "rename",
      targetQuery: batchRenames[0]!.targetQuery,
      newName: batchRenames[0]!.newName,
      ...(batchRenames.length > 1 ? { renames: batchRenames } : {}),
    };
  }

  const renameMatch = cleaned.match(
    /^(?:đặt|dat|đổi|doi)\s+(?:tên|ten)\s+(?:nhóm|nhom)\s*(?::|thành|thanh|là|la|-|–)?\s*(.+)$/i,
  );
  if (renameMatch && renameMatch[1]?.trim()) {
    return { kind: "rename", newName: cleanTargetQuery(renameMatch[1]) };
  }

  const selfDeclareMatch = cleaned.match(/^(?:đây|day|nhóm\s+này|nhom\s+nay)\s+l[aà]\s+(?:nhóm|nhom)\s+([^\n,.!?]{2,50})$/i);
  if (selfDeclareMatch && selfDeclareMatch[1]?.trim()) {
    const raw = cleanTargetQuery(selfDeclareMatch[1]);
    return { kind: "rename", newName: /^nh[oó]m\b/i.test(raw) ? raw : `Nhóm ${raw}` };
  }

  const fwMatch = cleaned.match(
    /^(?:chuy[eểế]n\s+ti[eế]p|chuyen\s+tiep|chuy[eểế]n\s+sang|chuyen\s+sang|chuy[eểế]n\s+t[oớ]i|chuyen\s+toi|chuy[eểế]n|chuyen|fw)\s+([^:\n]+?)\s*(?::|\n|-|–)\s*([\s\S]+)$/i,
  );
  if (fwMatch && fwMatch[1]?.trim() && fwMatch[2]?.trim()) {
    return {
      kind: "forward",
      targetQuery: cleanTargetQuery(fwMatch[1]),
      bodyText: fwMatch[2].trim(),
    };
  }

  const forwardThisMsgMatch = cleaned.match(
    /^(?:chuy[eểế]n\s*(?:ti[eế]p)?|fw)\s+(?:tin\s*(?:nh[aắ]n)?\s*(?:n[aà]y|v[uừ]a\s*r[oồ]i|tr[eê]n)|n[oộ]i\s+dung\s+n[aà]y)\s+(?:sang|t[oớ]i|v[aà]o|cho)\s+([^:\n]+?)(?:\s*:\s*([\s\S]+))?$/i,
  );
  if (forwardThisMsgMatch && forwardThisMsgMatch[1]?.trim()) {
    const explicitBody = forwardThisMsgMatch[2]?.trim() || "";
    return {
      kind: "forward",
      targetQuery: cleanTargetQuery(forwardThisMsgMatch[1]),
      bodyText: explicitBody,
      ...(explicitBody.length === 0 ? { useLastMessage: true } : {}),
    };
  }

  const forwardToOnlyMatch = cleaned.match(
    /^(?:chuy[eểế]n\s*(?:ti[eế]p)?|fw)\s+(?:sang|t[oớ]i|v[aà]o|cho)\s+([^:\n]+)$/i,
  );
  if (forwardToOnlyMatch && forwardToOnlyMatch[1]?.trim()) {
    const tq = cleanTargetQuery(forwardToOnlyMatch[1]);
    if (tq) {
      return {
        kind: "forward",
        targetQuery: tq,
        bodyText: "",
        useLastMessage: true,
      };
    }
  }

  return null;
}

export function resolveForwardTargets(
  query: string,
  targets: BotTargetThread[],
  excludeThreadId?: string,
): BotTargetThread[] {
  const normQ = normalizeTextVi(cleanTargetQuery(query));
  if (!normQ) return [];

  if (normQ === "tat ca" || normQ === "tat ca nhom" || normQ === "all") {
    return targets.filter((t) => t.threadType === 1 && t.threadId !== excludeThreadId);
  }

  const exactId = targets.find((t) => t.threadId === query.trim());
  if (exactId) return [exactId];

  const numMatch = normQ.match(/^(?:nhom|so|nhom\s+zalo)?\s*(\d+)$/);
  if (numMatch) {
    const idx = Number(numMatch[1]);
    const byIdx = targets.find((t) => t.index === idx);
    if (byIdx) return [byIdx];
  }

  const direct = targets.filter((t) => normalizeTextVi(t.displayName).includes(normQ));
  if (direct.length > 0) return direct;

  const strippedQ = normQ.replace(/^nhom\s+/, "").trim();
  if (strippedQ) {
    return targets.filter((t) => {
      const normName = normalizeTextVi(t.displayName).replace(/^nhom\s+/, "");
      return normName.includes(strippedQ);
    });
  }

  return [];
}

function findPreviousUserMessage(
  accountId: string,
  threadId: string,
  currentMsgText: string,
): { senderName: string; content: string } | null {
  try {
    const rows = db
      .prepare(
        `SELECT sender_name, content
         FROM messages
         WHERE account_id = ? AND thread_id = ? AND role = 'user'
         ORDER BY id DESC
         LIMIT 6`,
      )
      .all(accountId, threadId) as Array<{ sender_name: string | null; content: string }>;

    const normCurr = normalizeTextVi(currentMsgText);
    for (const r of rows) {
      const cleaned = stripAnyLeadingMentions(r.content);
      if (!cleaned) continue;
      if (normalizeTextVi(r.content) === normCurr) continue;
      if (parseForwardCommand(r.content)) continue;
      return { senderName: r.sender_name || "Thành viên", content: cleaned };
    }
  } catch {
    return null;
  }
  return null;
}

export async function forwardViaBotClient(params: {
  accountId: string;
  targetThreadIds: string[];
  text: string;
  imageUrls?: string[];
  kenh?: KenhLuot;
}): Promise<{ sentCount: number; failedCount: number; errors: string[] }> {
  const botToken = layBotTokenGiaiMa("bot-tro-ly-jay") || layBotTokenGiaiMa(params.accountId);
  const botClient = botToken ? taoZaloBotClient({ token: botToken }) : null;
  let sentCount = 0;
  let failedCount = 0;
  const errors: string[] = [];

  for (const tid of params.targetThreadIds) {
    try {
      const isBotThread = tid.startsWith("zgr-");
      const row = db
        .prepare("SELECT account_id, thread_type FROM threads WHERE thread_id = ? ORDER BY last_message_at DESC LIMIT 1")
        .get(tid) as { account_id?: string; thread_type?: number } | undefined;
      const tType = row?.thread_type ?? 1;
      const ownerAccountId = row?.account_id;
      const isBotOwned = isBotThread || !ownerAccountId || ownerAccountId === params.accountId || ownerAccountId === "bot-tro-ly-jay";

      if (isBotOwned) {
        if (params.kenh && params.accountId === (ownerAccountId || params.accountId)) {
          await params.kenh.duongGui(tid, tType)({ text: params.text });
        } else if (botClient) {
          await botClient.sendMessage(tid, params.text, null);
        } else {
          throw new Error(`Chưa có token cho tài khoản ${params.accountId}`);
        }
      } else {
        // Đích là nhóm/người dùng thuộc tài khoản khác (VD: Zalo cá nhân)
        const { getRunningAccountKenh } = await import("../zalo/account-manager.js");
        const ownerKenh = getRunningAccountKenh(ownerAccountId);
        if (ownerKenh) {
          await ownerKenh.duongGui(tid, tType)({ text: params.text });
        } else if (params.kenh && params.accountId === ownerAccountId) {
          await params.kenh.duongGui(tid, tType)({ text: params.text });
        } else {
          throw new Error(
            `Nhóm này thuộc tài khoản "${ownerAccountId}" chưa đăng nhập — Zalo Bot không thể gửi hộ. Hãy chọn nhóm của Bot.`,
          );
        }
      }

      if (botClient && isBotThread && params.imageUrls && params.imageUrls.length > 0) {
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

export function formatBotTargetsListMessage(targets: BotTargetThread[]): string {
  const lines =
    targets.length > 0
      ? targets
          .map((t) => {
            if (t.threadType === 1) {
              const membersStr =
                t.memberNames && t.memberNames.length > 0
                  ? `\n   👥 Thành viên: ${t.memberNames.slice(0, 4).join(", ")}`
                  : "";
              const previewStr = t.lastMessagePreview
                ? `\n   💬 Tin gần nhất: "${t.lastMessagePreview}"`
                : "";
              return `${t.index}. [Nhóm] ${t.displayName}${membersStr}${previewStr}`;
            }
            return `${t.index}. [Cá nhân] ${t.displayName}`;
          })
          .join("\n")
      : "Chưa có nhóm/người nhận nào kết nối với Bot.";

  return (
    `📋 [DANH SÁCH NHÓM & NGƯỜI NHẬN CỦA BOT]\n${lines}\n\n` +
    `👉 Cách chuyển tiếp nhanh trong nhóm:\n` +
    `• Khi kết nối Zalo Cá Nhân (tab Cài đặt): ấn Trả lời (Reply) tin cần chuyển rồi gõ "chuyển sang Nhóm Test"\n` +
    `• Với Zalo Bot: dán nội dung trước @Bot: "<nội dung tin> @Bot Trợ Lý Jay chuyển sang Nhóm Test"\n` +
    `• Hoặc gõ trực tiếp: "chuyển sang Nhóm Test: <nội dung cần gửi>"\n\n` +
    `👉 Đổi tên nhóm bất kỳ lúc nào:\n` +
    `• đặt tên nhóm 1: Tên mới`
  );
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
    const reply = formatBotTargetsListMessage(targets);
    await kenh.duongGui(msg.threadId, msg.threadType)({ text: reply }).catch(() => {});
    return true;
  }

  if (cmd.kind === "rename") {
    if (cmd.renames && cmd.renames.length > 0) {
      const doneList: string[] = [];
      for (const item of cmd.renames) {
        const matched = resolveForwardTargets(item.targetQuery, targets);
        if (matched[0]) {
          renameBotThread(accountId, matched[0].threadId, item.newName);
          doneList.push(`Nhóm ${matched[0].index} -> "${item.newName}"`);
        }
      }
      const replyText =
        doneList.length > 0
          ? `✅ Đã cập nhật tên nhóm:\n• ${doneList.join("\n• ")}`
          : `⚠️ Không tìm thấy số thứ tự nhóm tương ứng. Gõ "ds nhóm" để xem số thứ tự.`;
      await kenh.duongGui(msg.threadId, msg.threadType)({ text: replyText }).catch(() => {});
      return true;
    }

    if (cmd.targetQuery) {
      const matchedRename = resolveForwardTargets(cmd.targetQuery, targets);
      if (matchedRename.length === 0) {
        await kenh
          .duongGui(msg.threadId, msg.threadType)({
            text: `⚠️ Không tìm thấy nhóm số "${cmd.targetQuery}". Gõ "ds nhóm" để xem số thứ tự.`,
          })
          .catch(() => {});
        return true;
      }
      const target = matchedRename[0]!;
      renameBotThread(accountId, target.threadId, cmd.newName);
      await kenh
        .duongGui(msg.threadId, msg.threadType)({
          text: `✅ Đã đổi tên nhóm số ${target.index} thành "${cmd.newName}". Giờ bạn có thể gõ: "Chuyển sang ${cmd.newName}: ..."`,
        })
        .catch(() => {});
      return true;
    }

    if (msg.threadType === 0) {
      await kenh
        .duongGui(msg.threadId, msg.threadType)({
          text: `⚠️ Bạn đang nhắn 1-1 với Bot. Hãy ghi kèm số thứ tự nhóm cần đổi tên, ví dụ: "đặt tên nhóm 1: KM-3 ANH CHỊ EM" (gõ "ds nhóm" để xem số).`,
        })
        .catch(() => {});
      return true;
    }

    renameBotThread(accountId, msg.threadId, cmd.newName);
    await kenh
      .duongGui(msg.threadId, msg.threadType)({
        text: `✅ Đã đặt tên nhóm này thành "${cmd.newName}". Giờ bạn có thể gõ: "Chuyển sang ${cmd.newName}: ..." từ bất kỳ đâu!`,
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

  let bodyToForward = cmd.bodyText;
  let originalSender = msg.senderName || "Thành viên";
  if (cmd.useLastMessage || !bodyToForward) {
    // Ưu tiên 1: lấy nội dung tin nhắn gốc được ấn Trả lời (Reply / quote) trên kênh Zalo cá nhân
    const quoted = extractQuotedMessageFromRaw(msg);
    if (quoted) {
      bodyToForward = quoted.content;
      originalSender = quoted.senderName;
    } else {
      // Nếu đang ở kênh Bot và có tài khoản cá nhân đang chạy cùng nhóm, nhường kênh cá nhân xử lý quote
      if (accountId === "bot-tro-ly-jay") {
        try {
          const { isAccountRunning } = await import("../zalo/account-manager.js");
          const hasPersonalRunning = listAccounts().some((a) => a.loai === "ca_nhan" && isAccountRunning(a.id));
          if (hasPersonalRunning) return true;
        } catch {}
      }

      const prev = findPreviousUserMessage(accountId, msg.threadId, msg.text || "");
      if (!prev) {
        await kenh
          .duongGui(msg.threadId, msg.threadType)({
            text:
              `⚠️ Trong nhóm Zalo, Bot chỉ đọc được tin có tag @Bot nên chưa thấy nội dung tin bạn vừa ấn Trả lời.\n` +
              `👉 Kết nối thêm Zalo Cá Nhân bằng mã QR trong Portal (tab Cài đặt kết nối) để ấn Trả lời (Reply) là tự chuyển, HOẶC dán nội dung trước @Bot:\n` +
              `"Nội dung tin cần chuyển @Bot Trợ Lý Jay chuyển sang ${matched[0]!.displayName}"`,
          })
          .catch(() => {});
        return true;
      }
      bodyToForward = prev.content;
      originalSender = prev.senderName;
    }
  }

  const sourceLabel =
    targets.find((t) => t.threadId === msg.threadId)?.displayName || msg.senderName || "Zalo";
  const forwardedText = `📨 [Chuyển tiếp từ ${originalSender} • ${sourceLabel}]:\n${bodyToForward}`;
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
