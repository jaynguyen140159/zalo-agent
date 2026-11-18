import { ThreadType } from "zca-js";
import { findActivePersonalAccount, getZaloGroupMembers } from "../drive/zalo-history-collector.js";
import { enqueueSend } from "../middleware/rate-limiter.js";
import { createLogger } from "../shared/logger.js";
import { getRunningAccountKenh } from "../zalo/account-manager.js";

const log = createLogger("group-mention-reminder");

function normalizeVi(str: string): string {
  return (str || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim();
}

export function buildMentionPayload(
  displayName: string,
  uid: string,
  bodyText: string,
): {
  msg: string;
  mentions: Array<{ pos: number; uid: string; len: number }>;
} {
  const mentionText = `@${displayName}`;
  return {
    msg: `${mentionText} ${bodyText}`.trim(),
    mentions: [{ pos: 0, uid, len: mentionText.length }],
  };
}

export async function sendGroupMentionReminder(params: {
  accountId?: string;
  groupId: string;
  memberName: string;
  memberUid?: string;
  text: string;
}): Promise<{
  ok: boolean;
  tagged: boolean;
  matchedName?: string;
  matchedUid?: string;
  error?: string;
}> {
  const active = params.accountId
    ? { accountId: params.accountId, api: getRunningAccountKenh(params.accountId)?.api ?? undefined }
    : findActivePersonalAccount();

  if (!active?.api) {
    return {
      ok: false,
      tagged: false,
      error: "Chưa có tài khoản Zalo cá nhân nào đang đăng nhập để gửi tag nhóm",
    };
  }

  let uid = params.memberUid?.trim() || "";
  let displayName = params.memberName.trim();

  if (!uid && displayName) {
    try {
      const members = await getZaloGroupMembers(params.groupId, active.accountId);
      const targetNorm = normalizeVi(displayName);
      const exact = members.find((m) => normalizeVi(m.displayName) === targetNorm);
      const partial =
        exact ??
        members.find(
          (m) =>
            normalizeVi(m.displayName).includes(targetNorm) ||
            targetNorm.includes(normalizeVi(m.displayName)),
        );
      if (partial) {
        uid = partial.uid;
        displayName = partial.displayName;
      }
    } catch (err) {
      log.debug({ groupId: params.groupId, err }, "Không tra được danh sách thành viên nhóm để tag");
    }
  }

  try {
    if (uid) {
      const payload = buildMentionPayload(displayName, uid, params.text);
      await enqueueSend(`${active.accountId}:${params.groupId}`, () =>
        active.api!.sendMessage(payload, params.groupId, ThreadType.Group),
      );
      return {
        ok: true,
        tagged: true,
        matchedName: displayName,
        matchedUid: uid,
      };
    }

    // Fallback: send plain text mentioning name without blue tag if UID not found
    const fallbackMsg = displayName ? `@${displayName} ${params.text}` : params.text;
    await enqueueSend(`${active.accountId}:${params.groupId}`, () =>
      active.api!.sendMessage({ msg: fallbackMsg }, params.groupId, ThreadType.Group),
    );
    return {
      ok: true,
      tagged: false,
      matchedName: displayName,
    };
  } catch (err) {
    return {
      ok: false,
      tagged: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}
