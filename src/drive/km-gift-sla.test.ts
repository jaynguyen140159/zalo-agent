import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { calculateKmGiftSchedule } from "./km-gift-sla.js";

describe("km-gift-sla - calculateKmGiftSchedule", () => {
  it("tính SLA xuôi hoàn toàn từ mốc ngày 10/11 qua từng bước Báo giá -> Ký HĐ -> Tạm ứng -> Thiết kế -> SX", () => {
    const stages = calculateKmGiftSchedule({
      flowType: "customised",
      depositDate: "2026-11-10",
    });
    const baoGia = stages.find((s) => s.title === "Báo giá");
    const kyHd = stages.find((s) => s.title === "Ký hợp đồng");
    const tamUng = stages.find((s) => s.title === "Tạm ứng 50% HĐ");
    const thietKe = stages.find((s) => s.title === "Thiết kế");

    assert.equal(baoGia?.startDate, "2026-11-10");
    assert.equal(baoGia?.endDate, "2026-11-12");
    assert.equal(kyHd?.startDate, "2026-11-12");
    assert.equal(kyHd?.endDate, "2026-11-14");
    assert.equal(tamUng?.startDate, "2026-11-14");
    assert.equal(tamUng?.endDate, "2026-11-17");
    assert.equal(thietKe?.startDate, "2026-11-17");
    assert.equal(thietKe?.endDate, "2026-11-24");
  });

  it("đổi mốc ngày sang 11/11 -> toàn bộ dây chuyền tự dời xuôi thêm 1 ngày", () => {
    const stages = calculateKmGiftSchedule({
      flowType: "customised",
      depositDate: "2026-11-11",
    });
    const baoGia = stages.find((s) => s.title === "Báo giá");
    assert.equal(baoGia?.startDate, "2026-11-11");
    assert.equal(baoGia?.endDate, "2026-11-13");
  });

  it("nhánh Có sẵn tính xuôi Báo giá -> Ký HĐ -> Tạm ứng -> Đóng gói -> Bàn giao + ĐNTT", () => {
    const stages = calculateKmGiftSchedule({
      flowType: "ready_stock",
      depositDate: "2026-11-10",
    });
    const titles = stages.map((s) => s.title);
    assert.deepEqual(titles, ["Báo giá", "Ký hợp đồng", "Tạm ứng 50% HĐ", "Đóng gói", "Bàn giao + ĐNTT"]);
    const dongGoi = stages.find((s) => s.title === "Đóng gói");
    // 1 + 1 + 3 = 5 ngày sau 10/11 -> 15/11 .. 17/11
    assert.equal(dongGoi?.startDate, "2026-11-15");
    assert.equal(dongGoi?.endDate, "2026-11-17");
  });
});
