import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { calculateKmGiftSchedule } from "./km-gift-sla.js";

describe("km-gift-sla - calculateKmGiftSchedule", () => {
  it("nhập tạm ứng 10/11 -> Thiết kế 7 ngày ra 17/11, Chốt TKE 19/11, SX 03/12", () => {
    const stages = calculateKmGiftSchedule({
      flowType: "customised",
      depositDate: "2026-11-10",
    });
    const thietKe = stages.find((s) => s.title === "Thiết kế");
    const chotTke = stages.find((s) => s.title === "Chốt thiết kế");
    const sanXuat = stages.find((s) => s.title === "Sản xuất");

    assert.equal(thietKe?.startDate, "2026-11-10");
    assert.equal(thietKe?.endDate, "2026-11-17");
    assert.equal(chotTke?.startDate, "2026-11-17");
    assert.equal(chotTke?.endDate, "2026-11-19");
    assert.equal(sanXuat?.startDate, "2026-11-19");
    assert.equal(sanXuat?.endDate, "2026-12-03");
  });

  it("đổi tạm ứng sang 11/11 -> Thiết kế tự dời sang 18/11", () => {
    const stages = calculateKmGiftSchedule({
      flowType: "customised",
      depositDate: "2026-11-11",
    });
    const thietKe = stages.find((s) => s.title === "Thiết kế");
    assert.equal(thietKe?.startDate, "2026-11-11");
    assert.equal(thietKe?.endDate, "2026-11-18");
  });

  it("nhánh Có sẵn đi thẳng từ Tạm ứng -> Đóng gói -> Bàn giao + ĐNTT", () => {
    const stages = calculateKmGiftSchedule({
      flowType: "ready_stock",
      depositDate: "2026-11-10",
    });
    const titles = stages.map((s) => s.title);
    assert.deepEqual(titles, ["Báo giá", "Ký hợp đồng", "Tạm ứng 50% HĐ", "Đóng gói", "Bàn giao + ĐNTT"]);
    const dongGoi = stages.find((s) => s.title === "Đóng gói");
    assert.equal(dongGoi?.startDate, "2026-11-10");
    assert.equal(dongGoi?.endDate, "2026-11-12");
  });
});
