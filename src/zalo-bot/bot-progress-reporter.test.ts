import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { db } from "../conversation/database.js";
import {
  applyBotProgressReport,
  kiemTraLaTinBaoCaoTienDo,
  matchChecklistItemsFromReport,
  type ChecklistItem,
} from "./bot-progress-reporter.js";

describe("bot-progress-reporter", () => {
  it("nhận diện tin nhắn báo cáo tiến độ của người phụ trách", () => {
    assert.equal(kiemTraLaTinBaoCaoTienDo("Báo cáo: đã lên moodboard xong rồi ạ"), true);
    assert.equal(kiemTraLaTinBaoCaoTienDo("Em đã làm xong bản vẽ 2D"), true);
    assert.equal(kiemTraLaTinBaoCaoTienDo("Xin chào mọi người"), false);
  });

  it("khớp đúng đầu mục công việc con từ câu báo cáo tiếng Việt", () => {
    const checklist: ChecklistItem[] = [
      { id: "1", text: "Lên moodboard & concept chủ đạo", done: false },
      { id: "2", text: "Thiết kế bản vẽ 2D & quy cách", done: false },
      { id: "3", text: "Dựng phối cảnh 3D mockup sản phẩm", done: false },
    ];

    const hits1 = matchChecklistItemsFromReport("Báo cáo: em đã lên xong moodboard và bản vẽ 2D rồi", checklist);
    assert.deepEqual(hits1, ["1", "2"]);

    const hitsAll = matchChecklistItemsFromReport("Đã xong hết mục thiết kế rồi nhé", checklist);
    assert.deepEqual(hitsAll, ["1", "2", "3"]);

    const hitsByIndex = matchChecklistItemsFromReport("Đã xong mục 1 và 3", checklist);
    assert.deepEqual(hitsByIndex, ["1", "3"]);
  });

  it("cập nhật DB thanh tiến độ tự động khi applyBotProgressReport chạy", () => {
    const existing = db
      .prepare("SELECT id FROM pm_tasks WHERE checklist IS NOT NULL AND checklist != '[]' LIMIT 1")
      .get() as { id: number } | undefined;
    assert.ok(existing, "Phải có ít nhất 1 task mẫu có checklist trong DB");

    // Reset checklist to known 3 items inside a reversible test check or insert a temp task
    const stageRow = db.prepare("SELECT id, project_id FROM pm_stages LIMIT 1").get() as { id: number; project_id: number };
    const cl: ChecklistItem[] = [
      { id: "t1", text: "Lên moodboard & concept chủ đạo", done: false },
      { id: "t2", text: "Thiết kế bản vẽ 2D & quy cách", done: false },
      { id: "t3", text: "Dựng phối cảnh 3D mockup sản phẩm", done: false },
    ];
    const tmp = db
      .prepare(
        "INSERT INTO pm_tasks (project_id, stage_id, title, checklist, progress, status) VALUES (?, ?, ?, ?, 0, 'pending') RETURNING id",
      )
      .get(stageRow.project_id, stageRow.id, "Test Task Auto Progress", JSON.stringify(cl)) as { id: number };

    try {
      const res1 = applyBotProgressReport({
        taskId: tmp.id,
        senderName: "Khánh Linh",
        reportText: "Em đã xong moodboard rồi nhé",
      });
      assert.equal(res1.ok, true);
      assert.equal(res1.doneCount, 1);
      assert.equal(res1.totalCount, 3);
      assert.equal(res1.progress, 33);

      const res2 = applyBotProgressReport({
        taskId: tmp.id,
        senderName: "Khánh Linh",
        reportText: "Báo cáo hoàn thành hết 2D và 3D mockup luôn ạ",
      });
      assert.equal(res2.doneCount, 3);
      assert.equal(res2.progress, 100);
    } finally {
      db.prepare("DELETE FROM pm_tasks WHERE id = ?").run(tmp.id);
    }
  });
});
