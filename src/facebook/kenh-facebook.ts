import { getTuning } from "../config/runtime-tuning-settings.js";
import { createLogger } from "../shared/logger.js";
import type { KenhLuot } from "../zalo/kenh-luot.js";
import type { FacebookClient } from "./facebook-api-client.js";

const log = createLogger("kenh-facebook");

const TRAN_KY_TU_MOT_TIN_FB = 2000;
const TRAN_DANG_NHAP_MS = 10 * 60 * 1000;

/**
 * Kênh FACEBOOK FANPAGE (Messenger Platform API).
 *
 * Hỗ trợ:
 * - Gửi tin chữ (`sendMessage`)
 * - Đánh dấu đã xem (`mark_seen`)
 * - Hiển thị trạng thái đang nhập (`typing_on` / `typing_off`)
 */
export function kenhFacebook(client: FacebookClient): KenhLuot {
  return {
    api: null,
    tranKyTuMotTin: TRAN_KY_TU_MOT_TIN_FB,
    mangDinhDang: false,

    duongGui: (threadId) => async (doan) => {
      return client.sendMessage(threadId, doan.text);
    },

    baoDaXem: (batch) => {
      const latest = batch[batch.length - 1];
      if (!latest?.threadId) return;
      try {
        void client.sendSenderAction(latest.threadId, "mark_seen").catch((err) => {
          log.debug({ threadId: latest.threadId, err }, "Bắn mark_seen Facebook thất bại - bỏ qua");
        });
      } catch (err) {
        log.debug({ threadId: latest.threadId, err }, "Bắn mark_seen Facebook ném đồng bộ - bỏ qua");
      }
    },

    batDangNhap: (threadId) => {
      let dungLai = false;
      const batDau = Date.now();
      const banMot = () => {
        if (dungLai) return;
        if (Date.now() - batDau > TRAN_DANG_NHAP_MS) {
          log.debug({ threadId }, "Dấu 'đang nhập' Facebook chạm trần thời gian - tự tắt");
          dung();
          return;
        }
        try {
          void client.sendSenderAction(threadId, "typing_on").catch((err) => {
            log.debug({ threadId, err }, "Bắn 'typing_on' Facebook thất bại - bỏ qua");
          });
        } catch (err) {
          log.debug({ threadId, err }, "Bắn 'typing_on' Facebook ném đồng bộ - bỏ qua");
        }
      };
      const dung = () => {
        if (dungLai) return;
        dungLai = true;
        clearInterval(hen);
        try {
          void client.sendSenderAction(threadId, "typing_off").catch(() => {});
        } catch {
          // ignore
        }
      };
      const hen = setInterval(banMot, getTuning("TYPING_REFRESH_MS"));
      hen.unref?.();
      banMot();
      return dung;
    },
  };
}
