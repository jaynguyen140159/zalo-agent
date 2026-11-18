import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { ThreadType } from "zca-js";
import { parseClassificationJson } from "./ai-project-classifier.js";
import { buildMentionPayload } from "../notification/group-mention-reminder.js";
import { parseIncomingMessage } from "../zalo/zalo-message-parser.js";

describe("zalo-message-parser - files & links extraction", () => {
  it("trích xuất file đính kèm (share.file) và link URL trong text", () => {
    const msg = parseIncomingMessage("acc-1", "self-1", {
      threadId: "grp-1",
      type: ThreadType.Group,
      data: {
        msgId: "m-1",
        uidFrom: "u-1",
        dName: "Anh Văn",
        msgType: "share.file",
        content: {
          title: "Bao_gia_noi_that_Q4.xlsx",
          href: "https://cdn.zalo.me/files/bao-gia.xlsx",
          params: JSON.stringify({ fileExt: "xlsx" }),
        },
      },
    });
    assert.equal(msg.files?.length, 1);
    assert.equal(msg.files?.[0]?.fileName, "Bao_gia_noi_that_Q4.xlsx");
    assert.equal(msg.files?.[0]?.fileExt, "xlsx");
    assert.equal(msg.files?.[0]?.url, "https://cdn.zalo.me/files/bao-gia.xlsx");
  });

  it("trích xuất URL từ tin nhắn văn bản", () => {
    const msg = parseIncomingMessage("acc-1", "self-1", {
      threadId: "grp-1",
      type: ThreadType.Group,
      data: {
        msgId: "m-2",
        uidFrom: "u-2",
        dName: "Chị Thanh",
        msgType: "webchat",
        content: "Gửi mọi người link bản vẽ https://drive.google.com/file/d/abc123/view nhé!",
      },
    });
    assert.deepEqual(msg.links, ["https://drive.google.com/file/d/abc123/view"]);
  });
});

describe("ai-project-classifier - parseClassificationJson", () => {
  it("parse mảng JSON bọc trong markdown code fence", () => {
    const raw = '```json\n[{"id": 12, "projectName": "Bóc tách khối lượng", "cleanTitle": "Bao-gia.xlsx", "summary": "Bảng báo giá"}]\n```';
    const items = parseClassificationJson(raw);
    assert.equal(items.length, 1);
    assert.equal(items[0]?.id, 12);
    assert.equal(items[0]?.projectName, "Bóc tách khối lượng");
  });

  it("trả về mảng rỗng khi JSON lỗi", () => {
    assert.deepEqual(parseClassificationJson("không phải json"), []);
  });
});

describe("group-mention-reminder - buildMentionPayload", () => {
  it("tính đúng pos=0 và len=@Tên cho tên tiếng Việt có dấu", () => {
    const payload = buildMentionPayload("Chị Thanh", "uid-999", "nhờ chị kiểm tra tiến độ 3D nhé");
    assert.equal(payload.msg, "@Chị Thanh nhờ chị kiểm tra tiến độ 3D nhé");
    assert.deepEqual(payload.mentions, [{ pos: 0, uid: "uid-999", len: "@Chị Thanh".length }]);
  });
});
