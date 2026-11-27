import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";
import { Hono } from "hono";
import { cleanupTestEnv, setupTestEnv } from "../../shared/test-env-setup.js";

let dataDir: string;
let app: Hono;
let database: typeof import("../../conversation/database.js");

before(async () => {
  dataDir = setupTestEnv({ DASHBOARD_PASSWORD: "portal-bot-sched-test-pw" });
  database = await import("../../conversation/database.js");
  database.db
    .prepare(
      `INSERT OR IGNORE INTO threads (account_id, thread_id, thread_type, display_name, last_sender_name)
       VALUES ('bot-tro-ly-jay', 'zgr-a0378ef36c9c85c2dc8d', 1, 'KM-3 ANH CHỊ EM', 'Huy Nguyễn')`,
    )
    .run();
  const { portalRoutes } = await import("./portal-routes.js");
  app = new Hono();
  app.route("/portal", portalRoutes);
});

after(() => {
  database.closeDatabase();
  cleanupTestEnv(dataDir);
});

describe("Portal Bot Schedules", () => {
  it("tạo lịch hẹn gửi 1 lần trong tương lai, chặn giờ quá khứ, bật/tắt và xoá lịch", async () => {
    // Tạo ngày/giờ tương lai theo GMT+7
    const future = new Date(Date.now() + 2 * 3600_000 + 7 * 3600_000);
    const dateStr = future.toISOString().slice(0, 10);
    const timeStr = future.toISOString().slice(11, 16);

    const createRes = await app.request("/portal/api/bot-schedules", {
      method: "POST",
      headers: { "content-type": "application/json", "x-admin-pin": "admin" },
      body: JSON.stringify({
        targetThreadIds: ["zgr-a0378ef36c9c85c2dc8d"],
        senderLabel: "Quản lý KM",
        message: "Chốt mẫu thiết kế trước 16h nhé team",
        name: "Nhắc chốt mẫu",
        schedule: { kind: "once", date: dateStr, time: timeStr },
      }),
    });
    assert.equal(createRes.status, 200);
    const createdJson = (await createRes.json()) as {
      ok: boolean;
      createdCount: number;
      jobs: Array<{ id: string; threadId: string; payload: string; enabled: boolean }>;
    };
    assert.equal(createdJson.ok, true);
    assert.equal(createdJson.createdCount, 1);
    const job = createdJson.jobs[0]!;
    assert.equal(job.threadId, "zgr-a0378ef36c9c85c2dc8d");
    assert.match(job.payload, /\[Quản lý KM\]:/);

    // Kiểm tra chặn thời điểm quá khứ
    const pastRes = await app.request("/portal/api/bot-schedules", {
      method: "POST",
      headers: { "content-type": "application/json", "x-admin-pin": "admin" },
      body: JSON.stringify({
        targetThreadIds: ["zgr-a0378ef36c9c85c2dc8d"],
        message: "Test quá khứ",
        schedule: { kind: "once", date: "2020-01-01", time: "09:00" },
      }),
    });
    assert.equal(pastRes.status, 400);

    // Kiểm tra GET list + PATCH toggle + DELETE
    const listJson = (await (
      await app.request("/portal/api/bot-schedules", { headers: { "x-admin-pin": "admin" } })
    ).json()) as { ok: boolean; jobs: Array<{ id: string; targetDisplayName: string }> };
    assert.equal(listJson.ok, true);
    assert.equal(listJson.jobs.length, 1);
    assert.equal(listJson.jobs[0]!.targetDisplayName, "KM-3 ANH CHỊ EM");

    const patchRes = await app.request(`/portal/api/bot-schedules/${job.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json", "x-admin-pin": "admin" },
      body: JSON.stringify({ threadId: job.threadId, enabled: false }),
    });
    assert.equal(patchRes.status, 200);

    const delRes = await app.request(`/portal/api/bot-schedules/${job.id}?threadId=${job.threadId}`, {
      method: "DELETE",
      headers: { "x-admin-pin": "admin" },
    });
    assert.equal(delRes.status, 200);
  });
});
