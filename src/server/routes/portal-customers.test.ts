import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";
import { Hono } from "hono";
import { cleanupTestEnv, setupTestEnv } from "../../shared/test-env-setup.js";

let dataDir: string;
let app: Hono;
let database: typeof import("../../conversation/database.js");

before(async () => {
  dataDir = setupTestEnv({ DASHBOARD_PASSWORD: "portal-cust-test-password-123" });
  database = await import("../../conversation/database.js");
  const { portalRoutes } = await import("./portal-routes.js");
  app = new Hono();
  app.route("/portal", portalRoutes);
});

after(() => {
  database.closeDatabase();
  cleanupTestEnv(dataDir);
});

describe("Portal Customers & Multi-Project Profit (KM Gift <-> KM Brand)", () => {
  it("tạo 1 khách hàng với 2 dự án KM Gift + KM Brand, tính đúng lợi nhuận từng dự án và đổi mảng KM Gift -> KM Brand", async () => {
    const createCust = await app.request("/portal/api/customers", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        name: "Tập đoàn Demo Đa Mảng",
        tax_code: "0109888777",
        contact_name: "Chị Lan",
        contact_phone: "0909123456",
      }),
    });
    assert.equal(createCust.status, 200);
    const custJson = (await createCust.json()) as { ok: boolean; id: number };
    assert.equal(custJson.ok, true);
    const customerId = custJson.id;

    // Tạo dự án 1 thuộc KM Gift
    const p1Res = await app.request("/portal/api/projects/km-gift-template", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        name: "Demo Set Quà Tết",
        businessUnit: "KM Gift",
        customerId,
        flowType: "customised",
        depositDate: "2026-11-26",
      }),
    });
    const p1Json = (await p1Res.json()) as { ok: boolean; id: number };
    assert.equal(p1Json.ok, true);

    // Tạo dự án 2 thuộc KM Brand
    const p2Res = await app.request("/portal/api/projects/km-gift-template", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        name: "Demo Tái Định Vị Brand",
        businessUnit: "KM Brand",
        customerId,
        flowType: "customised",
        depositDate: "2026-11-26",
      }),
    });
    const p2Json = (await p2Res.json()) as { ok: boolean; id: number };
    assert.equal(p2Json.ok, true);

    // Thêm chi phí dự án 1 có ảnh sản phẩm: Chi phí 10.000.000, hệ số 2.0 => Doanh thu 20.000.000, VAT 8% = 1.600.000 => Lợi nhuận = 8.400.000
    await app.request(`/portal/api/projects/${p1Json.id}/costs`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        item_name: "Hộp quà cao cấp",
        cost_amount: 10000000,
        quantity: 1,
        markup_factor: 2.0,
        product_image: "https://example.com/hop-qua.jpg",
      }),
    });

    const costsRes = (await (await app.request(`/portal/api/projects/${p1Json.id}/costs`)).json()) as {
      ok: boolean;
      costs: Array<{ product_image: string }>;
    };
    assert.equal(costsRes.costs[0]!.product_image, "https://example.com/hop-qua.jpg");

    const printHtml = await (await app.request(`/portal/api/projects/${p1Json.id}/quotation/print`)).text();
    assert.match(printHtml, /HÌNH ẢNH/);
    assert.match(printHtml, /https:\/\/example\.com\/hop-qua\.jpg/);

    const docRes = await app.request(`/portal/api/projects/${p1Json.id}/quotation/print?download=doc`);
    assert.equal(docRes.headers.get("content-type")?.includes("application/msword"), true);
    const docHtml = await docRes.text();
    assert.match(docHtml, /https:\/\/example\.com\/hop-qua\.jpg/);

    // Thêm chi phí dự án 2: Chi phí 20.000.000, hệ số 1.5 => Doanh thu 30.000.000, VAT 8% = 2.400.000 => Lợi nhuận = 7.600.000
    await app.request(`/portal/api/projects/${p2Json.id}/costs`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        item_name: "Thiết kế Brand Guideline",
        cost_amount: 20000000,
        quantity: 1,
        markup_factor: 1.5,
      }),
    });

    const summaryBefore = (await (await app.request("/portal/api/customers")).json()) as {
      ok: boolean;
      customers: Array<{
        id: number;
        projects_count: number;
        unit_counts: { km_gift: number; km_brand: number; homeplanner: number };
        total_revenue: number;
        total_vat: number;
        total_cost: number;
        total_profit: number;
      }>;
      projects: Array<{
        id: number;
        customer_id: number | null;
        business_unit: string;
        total_revenue: number;
        estimated_profit: number;
      }>;
    };
    assert.equal(summaryBefore.ok, true);
    const custSummary = summaryBefore.customers.find((c) => c.id === customerId)!;
    assert.equal(custSummary.projects_count, 2);
    assert.equal(custSummary.unit_counts.km_gift, 1);
    assert.equal(custSummary.unit_counts.km_brand, 1);
    assert.equal(custSummary.total_revenue, 50000000);
    assert.equal(custSummary.total_vat, 4000000);
    assert.equal(custSummary.total_cost, 30000000);
    assert.equal(custSummary.total_profit, 16000000);

    // Kiểm tra từng dự án riêng lẻ
    const p1Before = summaryBefore.projects.find((p) => p.id === p1Json.id)!;
    const p2Before = summaryBefore.projects.find((p) => p.id === p2Json.id)!;
    assert.equal(p1Before.estimated_profit, 8400000);
    assert.equal(p2Before.estimated_profit, 7600000);

    // Đổi dự án 1 từ KM Gift sang KM Brand
    const moveRes = await app.request(`/portal/api/projects/${p1Json.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ business_unit: "KM Brand" }),
    });
    assert.equal(moveRes.status, 200);

    const summaryAfter = (await (await app.request("/portal/api/customers")).json()) as typeof summaryBefore;
    const custAfter = summaryAfter.customers.find((c) => c.id === customerId)!;
    assert.equal(custAfter.unit_counts.km_gift, 0);
    assert.equal(custAfter.unit_counts.km_brand, 2);
    assert.equal(custAfter.total_profit, 16000000);
    const p1After = summaryAfter.projects.find((p) => p.id === p1Json.id)!;
    assert.equal(p1After.business_unit, "KM Brand");
    assert.equal(p1After.customer_id, customerId);

    // Kiểm tra chế độ "chỉ báo giá các hạng mục đã chọn" (selected): thêm hạng mục bỏ tick -> chỉ in hạng mục đã tick & tính tổng đúng
    await app.request(`/portal/api/projects/${p1Json.id}/costs`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        item_name: "Chi phí nội bộ không báo khách",
        cost_amount: 5000000,
        quantity: 1,
        markup_factor: 1.5,
        show_in_quote: 0,
      }),
    });
    const selectedHtml = await (
      await app.request(`/portal/api/projects/${p1Json.id}/quotation/print?mode=selected`)
    ).text();
    assert.match(selectedHtml, /Hộp quà cao cấp/);
    assert.equal(selectedHtml.includes("Chi phí nội bộ không báo khách"), false);
    assert.match(selectedHtml, /20\.000\.000/);
    assert.match(selectedHtml, /21\.600\.000/);

    const costsSelected = (await (await app.request(`/portal/api/projects/${p1Json.id}/costs`)).json()) as {
      summary: { totalQuoteExclVat: number; selectedCount: number; totalCount: number };
    };
    assert.equal(costsSelected.summary.selectedCount, 1);
    assert.equal(costsSelected.summary.totalCount, 2);
    assert.equal(costsSelected.summary.totalQuoteExclVat, 20000000);
  });
});
