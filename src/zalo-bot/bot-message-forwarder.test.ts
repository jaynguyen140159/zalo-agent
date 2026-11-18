import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  parseForwardCommand,
  resolveForwardTargets,
  type BotTargetThread,
} from "./bot-message-forwarder.js";

describe("bot-message-forwarder", () => {
  it("nhận diện các lệnh chuyển tiếp, ds nhóm và đặt tên nhóm", () => {
    assert.deepEqual(parseForwardCommand("ds nhóm"), { kind: "list" });
    assert.deepEqual(parseForwardCommand("Danh sach nhom"), { kind: "list" });

    assert.deepEqual(parseForwardCommand("đặt tên nhóm: Nhóm Sản Xuất"), {
      kind: "rename",
      newName: "Nhóm Sản Xuất",
    });

    assert.deepEqual(parseForwardCommand("chuyển sang Nhóm 2: Nhờ xưởng kiểm tra mẫu nhé"), {
      kind: "forward",
      targetQuery: "Nhóm 2",
      bodyText: "Nhờ xưởng kiểm tra mẫu nhé",
    });

    assert.deepEqual(parseForwardCommand("@Bot fw 1: Hàng đã xong"), {
      kind: "forward",
      targetQuery: "1",
      bodyText: "Hàng đã xong",
    });

    assert.equal(parseForwardCommand("Chào buổi sáng mọi người"), null);
  });

  it("tìm đúng nhóm/người nhận theo tên, số thứ tự hoặc tất cả nhóm", () => {
    const targets: BotTargetThread[] = [
      { index: 1, accountId: "bot", threadId: "zgr-1", threadType: 1, displayName: "Nhóm Thiết Kế", lastSenderName: "A", lastMessageAt: null },
      { index: 2, accountId: "bot", threadId: "zgr-2", threadType: 1, displayName: "Nhóm Sản Xuất", lastSenderName: "B", lastMessageAt: null },
      { index: 3, accountId: "bot", threadId: "usr-1", threadType: 0, displayName: "Tôn Sa", lastSenderName: "Tôn Sa", lastMessageAt: null },
    ];

    assert.deepEqual(
      resolveForwardTargets("sản xuất", targets).map((t) => t.threadId),
      ["zgr-2"],
    );
    assert.deepEqual(
      resolveForwardTargets("3", targets).map((t) => t.threadId),
      ["usr-1"],
    );
    assert.deepEqual(
      resolveForwardTargets("tất cả nhóm", targets, "zgr-1").map((t) => t.threadId),
      ["zgr-2"],
    );
  });
});
