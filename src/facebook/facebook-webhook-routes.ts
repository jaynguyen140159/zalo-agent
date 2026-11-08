import crypto from "node:crypto";
import { Hono } from "hono";
import {
  getAccount,
  layBotTokenGiaiMa,
  layFbAppSecretGiaiMa,
  listAccounts,
} from "../config/account-store.js";
import { createLogger } from "../shared/logger.js";
import { getRunningAccountKenh } from "../zalo/account-manager.js";
import { taoFacebookClient } from "./facebook-api-client.js";
import { routeFacebookEvent, type FacebookMessagingEvent } from "./facebook-message-router.js";
import { kenhFacebook } from "./kenh-facebook.js";

const log = createLogger("facebook-webhook-routes");

type FacebookWebhookPayload = {
  object?: string;
  entry?: Array<{
    id?: string;
    time?: number;
    messaging?: FacebookMessagingEvent[];
  }>;
};

function xacThucChuKyFacebook(rawBody: string, signatureHeader: string | undefined, appSecret: string): boolean {
  if (!signatureHeader || !signatureHeader.startsWith("sha256=")) return false;
  const expected =
    "sha256=" + crypto.createHmac("sha256", appSecret).update(rawBody, "utf8").digest("hex");
  const a = Buffer.from(signatureHeader);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

function layKenhFacebookHieuLuc(accountId: string) {
  const dangChay = getRunningAccountKenh(accountId);
  if (dangChay) return dangChay;
  const token = layBotTokenGiaiMa(accountId);
  if (!token) return null;
  return kenhFacebook(taoFacebookClient({ pageAccessToken: token }));
}

export const facebookWebhookRoutes = new Hono()

  // Xác minh Webhook theo tài khoản cụ thể: GET /api/webhooks/facebook/:accountId
  .get("/:accountId", (c) => {
    const accountId = c.req.param("accountId");
    const acc = getAccount(accountId);
    if (!acc || acc.loai !== "facebook") {
      return c.text("Account Facebook không tồn tại", 404);
    }

    const mode = c.req.query("hub.mode");
    const token = c.req.query("hub.verify_token");
    const challenge = c.req.query("hub.challenge") ?? "";

    if (mode === "subscribe" && acc.fbVerifyToken && token === acc.fbVerifyToken) {
      log.info({ accountId }, "Xác minh Facebook Webhook thành công");
      return c.text(challenge, 200);
    }

    log.warn({ accountId, mode }, "Xác minh Facebook Webhook thất bại - sai Verify Token");
    return c.text("Forbidden", 403);
  })

  // Nhận sự kiện Messenger theo tài khoản cụ thể: POST /api/webhooks/facebook/:accountId
  .post("/:accountId", async (c) => {
    const accountId = c.req.param("accountId");
    const acc = getAccount(accountId);
    if (!acc || acc.loai !== "facebook") {
      return c.json({ error: "Account Facebook không tồn tại" }, 404);
    }

    const rawBody = await c.req.text();
    const appSecret = layFbAppSecretGiaiMa(accountId);
    if (appSecret) {
      const sig = c.req.header("x-hub-signature-256");
      if (!xacThucChuKyFacebook(rawBody, sig, appSecret)) {
        log.warn({ accountId }, "Từ chối Facebook Webhook - chữ ký X-Hub-Signature-256 không khớp");
        return c.text("Invalid signature", 403);
      }
    }

    let payload: FacebookWebhookPayload | null = null;
    try {
      payload = JSON.parse(rawBody) as FacebookWebhookPayload;
    } catch {
      return c.text("Bad JSON", 400);
    }

    if (payload?.object !== "page") {
      return c.text("Not a page subscription", 404);
    }

    const kenh = layKenhFacebookHieuLuc(accountId);
    if (!kenh) {
      log.warn({ accountId }, "Nhận webhook Facebook nhưng tài khoản chưa cấu hình Page Access Token");
      return c.text("EVENT_RECEIVED", 200);
    }

    for (const entry of payload.entry ?? []) {
      for (const ev of entry.messaging ?? []) {
        routeFacebookEvent(accountId, kenh, ev);
      }
    }

    return c.text("EVENT_RECEIVED", 200);
  })

  // Xác minh Webhook chung (khớp bất kỳ account Facebook nào có cùng Verify Token)
  .get("/", (c) => {
    const mode = c.req.query("hub.mode");
    const token = c.req.query("hub.verify_token");
    const challenge = c.req.query("hub.challenge") ?? "";

    if (mode === "subscribe" && token) {
      const acc = listAccounts().find((a) => a.loai === "facebook" && a.fbVerifyToken === token);
      if (acc) {
        log.info({ accountId: acc.id }, "Xác minh Facebook Webhook (chung) thành công");
        return c.text(challenge, 200);
      }
    }
    return c.text("Forbidden", 403);
  })

  // Nhận sự kiện Messenger chung (tự định tuyến theo Page ID trong entry.id)
  .post("/", async (c) => {
    const rawBody = await c.req.text();
    let payload: FacebookWebhookPayload | null = null;
    try {
      payload = JSON.parse(rawBody) as FacebookWebhookPayload;
    } catch {
      return c.text("Bad JSON", 400);
    }

    if (payload?.object !== "page") {
      return c.text("Not a page subscription", 404);
    }

    const fbAccounts = listAccounts().filter((a) => a.loai === "facebook" && a.enabled);
    for (const entry of payload.entry ?? []) {
      const pageId = entry.id ?? "";
      const acc =
        fbAccounts.find((a) => a.fbPageId && a.fbPageId === pageId) ??
        (fbAccounts.length === 1 ? fbAccounts[0] : undefined);
      if (!acc) continue;

      const appSecret = layFbAppSecretGiaiMa(acc.id);
      if (appSecret) {
        const sig = c.req.header("x-hub-signature-256");
        if (!xacThucChuKyFacebook(rawBody, sig, appSecret)) {
          log.warn({ accountId: acc.id }, "Từ chối Facebook Webhook - chữ ký không khớp");
          continue;
        }
      }

      const kenh = layKenhFacebookHieuLuc(acc.id);
      if (!kenh) continue;

      for (const ev of entry.messaging ?? []) {
        routeFacebookEvent(acc.id, kenh, ev);
      }
    }

    return c.text("EVENT_RECEIVED", 200);
  });
