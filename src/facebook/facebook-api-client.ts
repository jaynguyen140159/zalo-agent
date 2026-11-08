import { createLogger } from "../shared/logger.js";

const log = createLogger("facebook-api-client");

const GRAPH_API_BASE = "https://graph.facebook.com/v21.0";
const TIMEOUT_MAC_DINH_MS = 15_000;

export class LoiFacebookApi extends Error {
  readonly httpStatus?: number;
  readonly maLoi?: number;

  constructor(message: string, opts?: { httpStatus?: number; maLoi?: number }) {
    super(message);
    this.name = "LoiFacebookApi";
    this.httpStatus = opts?.httpStatus;
    this.maLoi = opts?.maLoi;
  }
}

export type FacebookPageMe = {
  id: string;
  name?: string;
};

export type FacebookClient = {
  getMe: () => Promise<FacebookPageMe>;
  sendMessage: (recipientId: string, text: string) => Promise<{ message_id?: string }>;
  sendSenderAction: (recipientId: string, action: "typing_on" | "typing_off" | "mark_seen") => Promise<void>;
};

export function taoFacebookClient(p: {
  pageAccessToken: string;
  fetchImpl?: typeof fetch;
}): FacebookClient {
  const fetchFn = p.fetchImpl ?? globalThis.fetch;
  const token = p.pageAccessToken.trim();

  async function goiGraph<T>(
    duongDan: string,
    init: RequestInit & { query?: Record<string, string> },
  ): Promise<T> {
    const url = new URL(`${GRAPH_API_BASE}${duongDan}`);
    if (init.query) {
      for (const [k, v] of Object.entries(init.query)) {
        url.searchParams.set(k, v);
      }
    }

    let res: Response;
    try {
      res = await fetchFn(url.toString(), {
        ...init,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          ...(init.headers ?? {}),
        },
        signal: AbortSignal.timeout(TIMEOUT_MAC_DINH_MS),
      });
    } catch (err) {
      throw new LoiFacebookApi(
        `Lỗi kết nối Facebook Graph API: ${err instanceof Error ? err.message : String(err)}`,
      );
    }

    const body = (await res.json().catch(() => null)) as
      | (T & { error?: { message?: string; code?: number } })
      | null;

    if (!res.ok || body?.error) {
      const thongDiep = body?.error?.message ?? `HTTP ${res.status}`;
      const maLoi = body?.error?.code;
      log.warn({ duongDan, status: res.status, maLoi, thongDiep }, "Facebook Graph API trả lỗi");
      throw new LoiFacebookApi(thongDiep, { httpStatus: res.status, maLoi });
    }

    if (!body) {
      throw new LoiFacebookApi("Facebook Graph API trả phản hồi rỗng", { httpStatus: res.status });
    }

    return body;
  }

  return {
    async getMe(): Promise<FacebookPageMe> {
      return goiGraph<FacebookPageMe>("/me", {
        method: "GET",
        query: { fields: "id,name" },
      });
    },

    async sendMessage(recipientId: string, text: string): Promise<{ message_id?: string }> {
      return goiGraph<{ message_id?: string }>("/me/messages", {
        method: "POST",
        body: JSON.stringify({
          recipient: { id: recipientId },
          messaging_type: "RESPONSE",
          message: { text },
        }),
      });
    },

    async sendSenderAction(
      recipientId: string,
      action: "typing_on" | "typing_off" | "mark_seen",
    ): Promise<void> {
      await goiGraph<{ recipient_id?: string }>("/me/messages", {
        method: "POST",
        body: JSON.stringify({
          recipient: { id: recipientId },
          sender_action: action,
        }),
      });
    },
  };
}
