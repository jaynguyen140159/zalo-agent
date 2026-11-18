import { ThreadType, type API } from "zca-js";
import { listAccounts } from "../config/account-store.js";
import { getTuning } from "../config/runtime-tuning-settings.js";
import { persistBatchImages } from "../conversation/media-store.js";
import { createLogger } from "../shared/logger.js";
import { getRunningAccountKenh } from "../zalo/account-manager.js";
import { parseIncomingMessage, type ParsedMessage } from "../zalo/zalo-message-parser.js";
import {
  persistIncomingFiles,
  recordCollectedAssetsFromMessage,
  updateCollectedAssetLocalPath,
} from "./asset-collector-store.js";

const log = createLogger("zalo-history-collector");

export type ZaloGroupSummary = {
  groupId: string;
  name: string;
  memberCount: number;
};

export type ZaloGroupMember = {
  uid: string;
  displayName: string;
  avatar?: string;
};

export function findActivePersonalAccount(): { accountId: string; name: string; api: API } | null {
  const accounts = listAccounts();
  for (const acc of accounts) {
    if (acc.loai === "bot" || acc.loai === "facebook") continue;
    const kenh = getRunningAccountKenh(acc.id);
    if (kenh?.api) {
      return { accountId: acc.id, name: acc.label || acc.id, api: kenh.api };
    }
  }
  return null;
}

export async function listPersonalZaloGroups(accountId?: string): Promise<{
  accountId: string;
  groups: ZaloGroupSummary[];
}> {
  let api: API | undefined;
  let resolvedAccId = accountId || "";

  if (resolvedAccId) {
    api = getRunningAccountKenh(resolvedAccId)?.api ?? undefined;
  } else {
    const active = findActivePersonalAccount();
    if (active) {
      resolvedAccId = active.accountId;
      api = active.api;
    }
  }

  if (!api) {
    throw new Error("Chưa có tài khoản Zalo cá nhân nào đang đăng nhập");
  }

  const all = (await api.getAllGroups()) as { gridVerMap?: Record<string, unknown> };
  const ids = Object.keys(all?.gridVerMap ?? {});
  if (ids.length === 0) return { accountId: resolvedAccId, groups: [] };

  const groups: ZaloGroupSummary[] = [];
  // Fetch info in chunks of 10 to avoid rate spikes
  for (let i = 0; i < ids.length; i += 10) {
    const slice = ids.slice(i, i + 10);
    try {
      const info = (await api.getGroupInfo(slice)) as {
        gridInfoMap?: Record<string, { name?: string; totalMember?: number; memVerList?: string[] }>;
      };
      const map = info?.gridInfoMap ?? {};
      for (const gid of slice) {
        const g = map[gid];
        groups.push({
          groupId: gid,
          name: g?.name || `Nhóm ${gid}`,
          memberCount: g?.totalMember ?? g?.memVerList?.length ?? 0,
        });
      }
    } catch (err) {
      log.debug({ slice, err }, "Không đọc được chi tiết một số nhóm");
      for (const gid of slice) {
        groups.push({ groupId: gid, name: `Nhóm ${gid}`, memberCount: 0 });
      }
    }
  }

  groups.sort((a, b) => a.name.localeCompare(b.name, "vi"));
  return { accountId: resolvedAccId, groups };
}

export async function getZaloGroupMembers(
  groupId: string,
  accountId?: string,
): Promise<ZaloGroupMember[]> {
  const active = accountId
    ? { accountId, api: getRunningAccountKenh(accountId)?.api ?? undefined }
    : findActivePersonalAccount();
  if (!active?.api) {
    throw new Error("Chưa có tài khoản Zalo cá nhân nào đang đăng nhập");
  }

  const api = active.api;
  const info = (await api.getGroupInfo(groupId)) as {
    gridInfoMap?: Record<string, { memVerList?: string[]; adminIds?: string[]; creatorId?: string }>;
  };
  const g = info?.gridInfoMap?.[groupId];
  const rawUids = (g?.memVerList ?? []).map((u) => String(u).split("_")[0]!).filter(Boolean);
  const uids = Array.from(new Set(rawUids)).slice(0, 100);
  if (uids.length === 0) return [];

  const members: ZaloGroupMember[] = [];
  for (let i = 0; i < uids.length; i += 20) {
    const chunk = uids.slice(i, i + 20);
    try {
      const res = (await api.getUserInfo(chunk)) as {
        changed_profiles?: Record<string, { displayName?: string; zaloName?: string; avatar?: string }>;
      };
      const profiles = res?.changed_profiles ?? {};
      for (const uid of chunk) {
        const prof = profiles[uid];
        members.push({
          uid,
          displayName: prof?.displayName || prof?.zaloName || uid,
          avatar: prof?.avatar,
        });
      }
    } catch (err) {
      log.debug({ chunk, err }, "Không lấy được hồ sơ thành viên nhóm");
    }
  }
  return members;
}

export async function scanGroupHistoryForAssets(params: {
  groupId: string;
  accountId?: string;
  count?: number;
  groupName?: string;
}): Promise<{
  scannedMessages: number;
  collectedImages: number;
  collectedFiles: number;
  collectedLinks: number;
}> {
  const active = params.accountId
    ? { accountId: params.accountId, api: getRunningAccountKenh(params.accountId)?.api ?? undefined }
    : findActivePersonalAccount();

  if (!active?.api) {
    throw new Error("Chưa có tài khoản Zalo cá nhân nào đang đăng nhập để quét lịch sử");
  }

  const api = active.api;
  const count = Math.min(Math.max(params.count ?? 50, 10), 200);
  const res = await api.getGroupChatHistory(params.groupId, count);
  const rawMsgs = Array.isArray(res?.groupMsgs) ? res.groupMsgs : [];

  const selfId = typeof api.getOwnId === "function" ? String(api.getOwnId() ?? "") : "";
  const quality = getTuning("ZALO_IMAGE_QUALITY");

  const parsedList: ParsedMessage[] = rawMsgs.map((m) =>
    parseIncomingMessage(
      active.accountId,
      selfId,
      { threadId: params.groupId, type: ThreadType.Group, data: m.data ?? m, isSelf: false },
      quality,
    ),
  );

  // Build rolling context window from adjacent text messages
  let collectedImages = 0;
  let collectedFiles = 0;
  let collectedLinks = 0;

  for (let i = 0; i < parsedList.length; i++) {
    const msg = parsedList[i]!;
    const neighborText = [
      parsedList[i - 1]?.text,
      msg.text,
      parsedList[i + 1]?.text,
    ]
      .filter((t): t is string => Boolean(t && t.trim()))
      .join(" | ");

    const enriched: ParsedMessage = {
      ...msg,
      text: neighborText || msg.text,
    };

    if (msg.images.length > 0) {
      collectedImages += msg.images.length;
      await persistBatchImages(active.accountId, [enriched]);
    }
    if (msg.files && msg.files.length > 0) {
      collectedFiles += msg.files.length;
    }
    if (msg.links && msg.links.length > 0) {
      collectedLinks += msg.links.length;
    }

    recordCollectedAssetsFromMessage(active.accountId, enriched, {
      threadName: params.groupName || "",
      downloadFiles: false,
    });

    for (const img of enriched.images) {
      if (img.localPath) {
        updateCollectedAssetLocalPath(enriched.threadId, enriched.msgId, "image", img.url, img.localPath);
      }
    }
    if (enriched.files && enriched.files.length > 0) {
      await persistIncomingFiles(active.accountId, enriched);
    }
  }

  return {
    scannedMessages: rawMsgs.length,
    collectedImages,
    collectedFiles,
    collectedLinks,
  };
}
