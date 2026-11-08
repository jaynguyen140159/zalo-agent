import { ThreadType } from "zca-js";
import { getAccount } from "../config/account-store.js";
import { recordContactActivity } from "../conversation/contact-store.js";
import { persistBatchImages } from "../conversation/media-store.js";
import { isBotEnabled, recordThreadActivity } from "../conversation/thread-store.js";
import { shouldRespond } from "../middleware/allowlist-filter.js";
import { enqueueMessage } from "../middleware/message-batcher.js";
import { createLogger } from "../shared/logger.js";
import { maybeNotifyBusyWait } from "../zalo/busy-wait-notice.js";
import type { KenhLuot } from "../zalo/kenh-luot.js";
import { processBatch } from "../zalo/message-turn-processor.js";
import { ganAnhVaoHistory, ghiTinDenVaoHistory } from "../zalo/record-incoming-message.js";
import { replyTargetTuKenh } from "../zalo/reply-target-tu-kenh.js";
import type { IncomingImage, ParsedMessage } from "../zalo/zalo-message-parser.js";

const log = createLogger("facebook-message-router");

export type FacebookMessagingEvent = {
  sender?: { id?: string };
  recipient?: { id?: string };
  timestamp?: number;
  message?: {
    mid?: string;
    text?: string;
    is_echo?: boolean;
    attachments?: Array<{
      type?: string;
      payload?: {
        url?: string;
        sticker_id?: number;
      };
    }>;
  };
};

export function doiEventFacebookSangParsedMessage(
  accountId: string,
  ev: FacebookMessagingEvent,
): ParsedMessage | null {
  const m = ev.message;
  if (!m) return null;
  if (m.is_echo) return null;

  const senderId = ev.sender?.id ?? "";
  if (!senderId) return null;

  const images: IncomingImage[] = [];
  let nhanPhu = "";
  for (const att of m.attachments ?? []) {
    if (att.type === "image" && att.payload?.url) {
      if (att.payload.sticker_id) {
        nhanPhu = "[gửi một sticker]";
      } else {
        images.push({ url: att.payload.url });
      }
    } else if (att.type === "audio") {
      nhanPhu = "[gửi một tin thoại]";
    } else if (att.type === "video") {
      nhanPhu = "[gửi một video]";
    } else if (att.type === "file") {
      nhanPhu = "[gửi một tệp đính kèm]";
    }
  }

  const text = m.text?.trim() ?? (images.length > 0 ? "" : nhanPhu || "[gửi một nội dung]");
  const sentAt =
    typeof ev.timestamp === "number" && Number.isFinite(ev.timestamp) && ev.timestamp > 0
      ? new Date(ev.timestamp).toISOString()
      : new Date().toISOString();

  const msgId = m.mid ?? `fb-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  return {
    accountId,
    threadId: senderId,
    threadType: ThreadType.User,
    isGroup: false,
    senderId,
    senderName: `FB User (${senderId.slice(-6)})`,
    text,
    images,
    msgId,
    cliMsgId: msgId,
    isSelf: false,
    mentionsMe: true,
    sentAt,
    rawData: ev as unknown as Record<string, unknown>,
  };
}

export function routeFacebookEvent(
  accountId: string,
  kenh: KenhLuot,
  ev: FacebookMessagingEvent,
): void {
  const config = getAccount(accountId);
  if (!config || !config.enabled) {
    log.debug({ accountId }, "Nhận webhook Facebook cho account không tồn tại hoặc đang tắt - bỏ qua");
    return;
  }

  const msg = doiEventFacebookSangParsedMessage(config.id, ev);
  if (!msg || !msg.threadId) return;

  recordContactActivity(config.id, msg.senderId, msg.senderName);
  recordThreadActivity({
    accountId: config.id,
    threadId: msg.threadId,
    threadType: msg.threadType,
    displayName: msg.senderName,
    lastSenderName: msg.senderName,
  });

  const decision = shouldRespond(config, msg, isBotEnabled(config.id, msg.threadId));
  if (!decision.respond) {
    if (decision.record) ghiTinDenVaoHistory(config.id, msg, { luuAnhNgay: true });
    log.debug(
      { accountId: config.id, threadId: msg.threadId, reason: decision.reason },
      decision.record ? "Ghi passive Facebook, không trả lời" : "Bỏ qua tin Facebook",
    );
    return;
  }

  try {
    ghiTinDenVaoHistory(config.id, msg, { luuAnhNgay: false });
  } catch (err) {
    log.error({ accountId: config.id, threadId: msg.threadId, err }, "Không ghi được tin Facebook vào history");
  }

  const threadKey = `${config.id}:${msg.threadId}`;
  const daNhan = enqueueMessage(threadKey, msg, (batch) => processBatch(config, kenh, batch));

  if (!daNhan && msg.images.length > 0) {
    void persistBatchImages(config.id, [msg])
      .then(() => ganAnhVaoHistory([msg]))
      .catch((err) => log.debug({ threadId: msg.threadId, err }, "Không gắn được ảnh Facebook vào history"));
  }

  void maybeNotifyBusyWait(
    replyTargetTuKenh({ kenh, threadId: msg.threadId, threadType: msg.threadType, threadKey }),
  ).catch((err) => log.debug({ threadId: msg.threadId, err }, "Gửi câu trấn an Facebook thất bại"));
}
