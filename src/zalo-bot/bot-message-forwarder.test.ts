import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  formatBotTargetsListMessage,
  inferGroupDisplayName,
  parseForwardCommand,
  resolveForwardTargets,
  type BotTargetThread,
} from "./bot-message-forwarder.js";

describe("bot-message-forwarder", () => {
  it("nhận diện các lệnh chuyển tiếp, ds nhóm, đặt tên nhóm và câu thực tế trong Zalo", () => {
    assert.deepEqual(parseForwardCommand("ds nhóm"), { kind: "list" });
    assert.deepEqual(parseForwardCommand("Danh sach nhom"), { kind: "list" });
    assert.deepEqual(parseForwardCommand("nhóm zalo 1 là gì"), { kind: "list" });
    assert.deepEqual(parseForwardCommand("Các nhóm hiện tại"), { kind: "list" });
    assert.deepEqual(parseForwardCommand("sao trong nhóm vẫn không tự động chuyển tiếp"), { kind: "list" });

    assert.deepEqual(parseForwardCommand("đặt tên nhóm: Nhóm Sản Xuất"), {
      kind: "rename",
      newName: "Nhóm Sản Xuất",
    });

    assert.deepEqual(parseForwardCommand("đổi tên nhóm 2 thành Nhóm Thiết Kế"), {
      kind: "rename",
      targetQuery: "2",
      newName: "Nhóm Thiết Kế",
    });

    assert.deepEqual(
      parseForwardCommand("bạn có thể tự setup tên của nhóm zalo 1 không ( KM-3 ANH CHỊ EM )\n\nnhóm 2 là Nhóm Test"),
      {
        kind: "rename",
        targetQuery: "1",
        newName: "KM-3 ANH CHỊ EM",
        renames: [
          { targetQuery: "1", newName: "KM-3 ANH CHỊ EM" },
          { targetQuery: "2", newName: "Nhóm Test" },
        ],
      },
    );

    assert.deepEqual(parseForwardCommand("chuyển sang Nhóm 2: Nhờ xưởng kiểm tra mẫu nhé"), {
      kind: "forward",
      targetQuery: "Nhóm 2",
      bodyText: "Nhờ xưởng kiểm tra mẫu nhé",
    });

    assert.deepEqual(
      parseForwardCommand("Xong c nhắn lại là c trình + cất hộ em lun r cocn jjj @Bot Trợ Lý Jay chuyển sang nhóm test"),
      {
        kind: "forward",
        targetQuery: "nhóm test",
        bodyText: "Xong c nhắn lại là c trình + cất hộ em lun r cocn jjj",
      },
    );

    assert.deepEqual(
      parseForwardCommand("@Project Manager - Khởi Minh @Bot Trợ Lý Jay chuyển tiếp sang Nhóm Test nhé"),
      {
        kind: "forward",
        targetQuery: "Nhóm Test",
        bodyText: "",
        useLastMessage: true,
      },
    );

    assert.deepEqual(
      parseForwardCommand("@Project Manager - Khởi Minh @Bot Trợ Lý Jay chuyến tiếp tin nhắn này sang nhóm test"),
      {
        kind: "forward",
        targetQuery: "nhóm test",
        bodyText: "",
        useLastMessage: true,
      },
    );

    assert.deepEqual(parseForwardCommand("@Bot fw 1: Hàng đã xong"), {
      kind: "forward",
      targetQuery: "1",
      bodyText: "Hàng đã xong",
    });

    assert.equal(parseForwardCommand("Chào buổi sáng mọi người"), null);
  });

  it("tìm đúng nhóm/người nhận theo tên, lược chữ nhóm, số thứ tự hoặc tất cả nhóm", () => {
    const targets: BotTargetThread[] = [
      { index: 1, accountId: "bot", threadId: "zgr-1", threadType: 1, displayName: "KM-3 ANH CHỊ EM", lastSenderName: "A", lastMessageAt: null },
      { index: 2, accountId: "bot", threadId: "zgr-2", threadType: 1, displayName: "Nhóm Test", lastSenderName: "B", lastMessageAt: null },
      { index: 3, accountId: "bot", threadId: "usr-1", threadType: 0, displayName: "Tôn Sa", lastSenderName: "Tôn Sa", lastMessageAt: null },
    ];

    assert.deepEqual(
      resolveForwardTargets("test", targets).map((t) => t.threadId),
      ["zgr-2"],
    );
    assert.deepEqual(
      resolveForwardTargets("nhóm test nhé", targets).map((t) => t.threadId),
      ["zgr-2"],
    );
    assert.deepEqual(
      resolveForwardTargets("km-3", targets).map((t) => t.threadId),
      ["zgr-1"],
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

  it("tự suy luận tên nhóm dễ đọc và format danh sách KHÔNG hiện mã hex zgr-", () => {
    assert.deepEqual(
      inferGroupDisplayName({
        threadId: "zgr-a0378ef36c9c85c2dc8d",
        rawName: "Nhóm Zalo 1",
        memberNames: ["Huy Nguyễn", "Info - Khởi Minh"],
        recentTexts: [],
        groupIndex: 1,
      }),
      { displayName: "KM-3 ANH CHỊ EM", isAutoNamed: true },
    );

    assert.deepEqual(
      inferGroupDisplayName({
        threadId: "zgr-new",
        rawName: "",
        memberNames: ["Lan", "Minh", "Hải"],
        recentTexts: ["mọi người chú ý"],
        groupIndex: 3,
      }),
      { displayName: "Nhóm #3 (Lan, Minh +1)", isAutoNamed: true },
    );

    const rendered = formatBotTargetsListMessage([
      {
        index: 1,
        accountId: "bot",
        threadId: "zgr-a0378ef36c9c85c2dc8d",
        threadType: 1,
        displayName: "KM-3 ANH CHỊ EM",
        lastSenderName: "Huy Nguyễn",
        lastMessageAt: null,
        memberNames: ["Huy Nguyễn", "Info - Khởi Minh"],
        lastMessagePreview: "Nhắc mọi người gửi báo giá",
      },
    ]);
    assert.ok(rendered.includes("KM-3 ANH CHỊ EM"));
    assert.ok(rendered.includes("👥 Thành viên: Huy Nguyễn, Info - Khởi Minh"));
    assert.ok(rendered.includes("💬 Tin gần nhất:"));
    assert.equal(rendered.includes("zgr-a0378ef36c9c85c2dc8d"), false);
  });
});
