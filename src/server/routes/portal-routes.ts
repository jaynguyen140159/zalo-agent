import fs from "node:fs";
import path from "node:path";
import { Hono } from "hono";
import { db } from "../../conversation/database.js";
import { layBotTokenGiaiMa } from "../../config/account-store.js";
import { taoLinkGoogleCalendarWeb, taoIcalFeed } from "../../google/google-calendar-service.js";
import { quetVaGuiNhacViecTuDong } from "../../notification/auto-reminder-worker.js";
import { getSmtpConfig, guiEmailNhacViec } from "../../notification/email-service.js";
import { sendGroupMentionReminder } from "../../notification/group-mention-reminder.js";
import { applyBotProgressReport } from "../../zalo-bot/bot-progress-reporter.js";
import {
  forwardViaBotClient,
  listBotTargets,
  renameBotThread,
} from "../../zalo-bot/bot-message-forwarder.js";
import { renderPortalHtml } from "./portal-ui-html.js";
import { taoZaloBotClient } from "../../zalo-bot/zalo-bot-api-client.js";
import { classifyPendingAssetsWithAI } from "../../drive/ai-project-classifier.js";
import { addDaysIso, calculateKmGiftSchedule, type KmGiftFlowType } from "../../drive/km-gift-sla.js";
import type { CollectedAssetRow } from "../../drive/asset-collector-store.js";
import { getDriveSettings, syncAssetToDrive, updateDriveSettings } from "../../drive/google-drive-client.js";
import {
  findActivePersonalAccount,
  getZaloGroupMembers,
  listPersonalZaloGroups,
  scanGroupHistoryForAssets,
} from "../../drive/zalo-history-collector.js";

export const portalRoutes = new Hono()
  // Trang Giao Diện Portal (Workspace Hiện Đại)
  .get("/", (c) => c.html(renderPortalHtml()))

  // API Đăng nhập / Kiểm tra mã PIN bảo mật
  .post("/api/login", async (c) => {
    const { phone, pin } = await c.req.json<{ phone?: string; pin?: string }>();
    if (!phone) return c.json({ ok: false, error: "Vui lòng nhập số điện thoại" }, 400);

    const cleanPhone = phone.trim();
    const cleanPin = (pin || "").trim();

    if (cleanPhone === "admin") {
      if (cleanPin === "admin" || cleanPin === "123456") {
        return c.json({
          ok: true,
          user: {
            phone: "admin",
            name: "Quản Trị Viên (Tôi)",
            role: "admin",
            isAdmin: true,
            isManager: true,
            isMember: false,
            isViewer: false
          }
        });
      }
      return c.json({ ok: false, error: "Mã PIN của Quản Trị Viên không chính xác (mặc định 123456)" }, 401);
    }

    const member = db.prepare("SELECT * FROM pm_members WHERE phone = ?").get(cleanPhone) as {
      phone: string;
      name: string;
      role: string;
      pin?: string;
    } | undefined;

    if (!member) {
      return c.json({ ok: false, error: "Số điện thoại chưa được đăng ký trong hệ thống" }, 404);
    }

    const expectedPin = member.pin || "123456";
    if (cleanPin && cleanPin !== expectedPin) {
      return c.json({ ok: false, error: "Mã PIN bảo mật không đúng" }, 401);
    }

    const role = member.role || "member";
    return c.json({
      ok: true,
      user: {
        phone: member.phone,
        name: member.name,
        role: role,
        isAdmin: role === "admin",
        isManager: role === "manager" || role === "admin",
        isMember: role === "member",
        isViewer: role === "viewer"
      }
    });
  })

  // API Lấy dữ liệu Portal theo phone và projectId (Enriched với thống kê cho từng dự án)
  .get("/api/data", (c) => {
    const phone = c.req.query("phone") || "admin";
    const projectIdParam = c.req.query("projectId");

    let currentUser = {
      phone: "admin",
      name: "Quản Trị Viên (Tôi)",
      role: "admin",
      isAdmin: true,
      isManager: true,
      isMember: false,
      isViewer: false
    };

    if (phone !== "admin") {
      const mem = db.prepare("SELECT * FROM pm_members WHERE phone = ?").get(phone) as {
        phone: string;
        name: string;
        role: string;
      } | undefined;

      if (mem) {
        currentUser = {
          phone: mem.phone,
          name: mem.name,
          role: mem.role || "member",
          isAdmin: mem.role === "admin",
          isManager: mem.role === "manager" || mem.role === "admin",
          isMember: mem.role === "member",
          isViewer: mem.role === "viewer"
        };
      } else {
        currentUser = {
          phone,
          name: "Người Dùng",
          role: "viewer",
          isAdmin: false,
          isManager: false,
          isMember: false,
          isViewer: true
        };
      }
    }

    const rawProjects = db.prepare("SELECT * FROM pm_projects ORDER BY id ASC").all() as {
      id: number;
      name: string;
      description?: string;
      budget?: number;
      status?: string;
    }[];

    const allProjects = rawProjects.map(p => {
      const pTasks = db.prepare("SELECT id, progress, status FROM pm_tasks WHERE project_id = ?").all(p.id) as { progress: number; status: string }[];
      const tasks_count = pTasks.length;
      const completed_tasks = pTasks.filter(t => t.progress >= 100 || t.status === "completed").length;
      let overall_progress = 0;
      if (tasks_count > 0) {
        const sumPct = pTasks.reduce((s, t) => s + (t.progress || 0), 0);
        overall_progress = Math.round(sumPct / tasks_count);
      }
      const stages_count = (db.prepare("SELECT count(*) as c FROM pm_stages WHERE project_id = ?").get(p.id) as { c: number })?.c || 0;
      const expenses_sum = (db.prepare("SELECT COALESCE(SUM(amount), 0) as s FROM pm_expenses WHERE project_id = ?").get(p.id) as { s: number })?.s || 0;

      const pCosts = db
        .prepare("SELECT item_name, vendor_name, cost_amount, quantity, markup_factor, payment_status FROM pm_project_costs WHERE project_id = ? ORDER BY id ASC")
        .all(p.id) as Array<{
          item_name: string;
          vendor_name: string;
          cost_amount: number;
          quantity: number;
          markup_factor: number;
          payment_status: string;
        }>;
      let total_cost = 0;
      let total_quote = 0;
      const itemNames: string[] = [];
      const vendors = new Set<string>();
      for (const cItem of pCosts) {
        const qty = Math.max(1, Number(cItem.quantity) || 1);
        const uCost = Number(cItem.cost_amount) || 0;
        const markup = Number(cItem.markup_factor) || 1.5;
        total_cost += uCost * qty;
        total_quote += Math.round(uCost * markup) * qty;
        if (cItem.item_name) itemNames.push(cItem.item_name);
        if (cItem.vendor_name) vendors.add(cItem.vendor_name);
      }
      const items_preview = itemNames.slice(0, 2).join(", ") + (itemNames.length > 2 ? ` (+${itemNames.length - 2})` : "");
      const vendors_preview = Array.from(vendors).slice(0, 2).join(", ") + (vendors.size > 2 ? ` (+${vendors.size - 2})` : "");
      const paidCount = pCosts.filter(c => String(c.payment_status || "").includes("100%")).length;
      const payment_summary = pCosts.length > 0 ? `${paidCount}/${pCosts.length} Đã TT` : "Chưa có khoản chi";

      return {
        ...p,
        tasks_count,
        completed_tasks,
        overall_progress,
        stages_count,
        expenses_sum,
        total_cost,
        total_quote,
        cost_items_count: pCosts.length,
        items_preview,
        vendors_preview,
        payment_summary
      };
    });

    const activeProjectId = Number(projectIdParam) || (allProjects[0]?.id as number) || 1;
    const activeProject = allProjects.find(p => p.id === activeProjectId) || allProjects[0] || null;

    // Giai đoạn của dự án này
    const stages = db.prepare("SELECT * FROM pm_stages WHERE project_id = ? ORDER BY step_order ASC").all(activeProjectId) as {
      id: number;
      step_order: number;
      title: string;
      description?: string;
      status?: string;
    }[];

    // Công việc của dự án này
    const rawTasks = db.prepare("SELECT * FROM pm_tasks WHERE project_id = ? ORDER BY id DESC").all(activeProjectId) as {
      id: number;
      project_id: number;
      stage_id: number;
      title: string;
      description?: string;
      assigned_phone?: string;
      deadline?: string;
      status?: string;
      progress?: number;
      checklist?: string;
      assignees?: string;
    }[];

    // Chi phí phát sinh của dự án này
    const expenses = db.prepare("SELECT * FROM pm_expenses WHERE project_id = ? ORDER BY id DESC").all(activeProjectId) as {
      id: number;
      project_id: number;
      task_id?: number | null;
      title: string;
      amount: number;
      category?: string;
      spent_by?: string;
      spent_at?: string;
      note?: string;
    }[];

    // Danh sách thành viên
    const members = db.prepare("SELECT id, phone, name, role, avatar, thread_id, email FROM pm_members").all() as {
      id: number;
      phone: string;
      name: string;
      role: string;
      avatar?: string;
      thread_id?: string;
      email?: string;
    }[];

    const membersMap = new Map<string, string>();
    members.forEach(m => membersMap.set(m.phone, m.name));

    const taskExpensesMap = new Map<number, number>();
    expenses.forEach(e => {
      if (e.task_id) {
        taskExpensesMap.set(e.task_id, (taskExpensesMap.get(e.task_id) || 0) + (Number(e.amount) || 0));
      }
    });

    const stagesMap = new Map<number, string>();
    stages.forEach(s => stagesMap.set(s.id, s.title));

    const tasks = rawTasks.map(t => {
      let checklistArr: { id: string; text: string; done: boolean }[] = [];
      try {
        if (t.checklist) checklistArr = JSON.parse(t.checklist);
      } catch {
        checklistArr = [];
      }

      return {
        ...t,
        assigned_name: t.assigned_phone ? (membersMap.get(t.assigned_phone) || t.assigned_phone) : "",
        stage_title: stagesMap.get(t.stage_id) || `Bước ${t.stage_id}`,
        checklist: checklistArr,
        expenses_sum: taskExpensesMap.get(t.id) || 0,
        gcal_link: taoLinkGoogleCalendarWeb({
          title: t.title,
          description: t.description,
          deadline: t.deadline,
          stage_title: stagesMap.get(t.stage_id) || ""
        })
      };
    });

    const smtp = getSmtpConfig();
    const smtpConfigured = !!(smtp.host && smtp.user);

    return c.json({
      currentUser,
      projects: allProjects,
      activeProject,
      stages,
      tasks,
      expenses,
      members,
      smtpConfigured: currentUser.isAdmin ? smtpConfigured : false
    });
  })

  // API Gửi tin nhắn Zalo tùy chọn (Test Bot Trợ Lý Jay)
  .post("/api/zalo/send-test", async (c) => {
    const { targetThread, message } = await c.req.json<{ targetThread: string; message: string }>();
    if (!targetThread || !message?.trim()) {
      return c.json({ ok: false, error: "Thiếu thread người nhận hoặc nội dung tin nhắn" }, 400);
    }

    const token = layBotTokenGiaiMa("bot-tro-ly-jay");
    if (!token) return c.json({ ok: false, error: "Chưa cấu hình token Bot Trợ Lý Jay" }, 500);

    const client = taoZaloBotClient({ token });
    await client.sendMessage(targetThread.trim(), message.trim());
    return c.json({ ok: true, message: `Đã gửi tin nhắn Zalo thành công đến ${targetThread}!` });
  })

  // API Tạo dự án mới (Admin only)
  .post("/api/projects", async (c) => {
    const { name, description, budget } = await c.req.json<{
      name: string;
      description?: string;
      budget?: number;
    }>();

    if (!name?.trim()) return c.json({ ok: false, error: "Thiếu tên dự án" }, 400);

    const proj = db.prepare("INSERT INTO pm_projects (name, description, budget, status) VALUES (?, ?, ?, ?) RETURNING id")
      .get(name.trim(), description || "", Number(budget) || 0, "active") as { id: number };

    db.prepare("INSERT INTO pm_stages (project_id, step_order, title, description, status) VALUES (?, ?, ?, ?, ?)").run(proj.id, 1, "Bước 1: Khảo sát & Kế hoạch", "Khảo sát yêu cầu và lập kế hoạch", "in_progress");
    db.prepare("INSERT INTO pm_stages (project_id, step_order, title, description, status) VALUES (?, ?, ?, ?, ?)").run(proj.id, 2, "Bước 2: Thiết kế & Chuẩn bị", "Thiết kế giải pháp và chuẩn bị vật tư", "todo");
    db.prepare("INSERT INTO pm_stages (project_id, step_order, title, description, status) VALUES (?, ?, ?, ?, ?)").run(proj.id, 3, "Bước 3: Thi công & Triển khai", "Thực hiện lắp đặt và tích hợp", "todo");
    db.prepare("INSERT INTO pm_stages (project_id, step_order, title, description, status) VALUES (?, ?, ?, ?, ?)").run(proj.id, 4, "Bước 4: Kiểm thử & Bàn giao", "Nghiệm thu và bàn giao", "todo");

    return c.json({ ok: true, id: proj.id });
  })

  // API Tạo dự án Khởi Minh Gift theo quy trình chuẩn + Tự tính SLA từ Ngày Tạm Ứng
  .post("/api/projects/km-gift-template", async (c) => {
    const body = await c.req.json<{
      name: string;
      businessUnit?: string;
      flowType?: KmGiftFlowType;
      depositDate?: string;
      budget?: number;
    }>();

    if (!body.name?.trim()) return c.json({ ok: false, error: "Vui lòng nhập tên dự án" }, 400);
    const flowType: KmGiftFlowType = body.flowType === "ready_stock" ? "ready_stock" : "customised";
    const businessUnit = body.businessUnit?.trim() || "KM Gift";
    const depositDate = body.depositDate?.trim() || new Date().toISOString().slice(0, 10);

    const proj = db
      .prepare(
        `INSERT INTO pm_projects (name, description, budget, status, business_unit, flow_type, deposit_date)
         VALUES (?, ?, ?, 'active', ?, ?, ?) RETURNING id`,
      )
      .get(
        body.name.trim(),
        `Quy trình ${businessUnit} (${flowType === "ready_stock" ? "Hàng có sẵn" : "Customised / Không có sẵn"})`,
        Number(body.budget) || 0,
        businessUnit,
        flowType,
        depositDate,
      ) as { id: number };

    const schedule = calculateKmGiftSchedule({ flowType, depositDate });
    const stageStmt = db.prepare(
      `INSERT INTO pm_stages (project_id, step_order, title, description, sla_days, phase, start_date, end_date)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?) RETURNING id`,
    );
    const taskStmt = db.prepare(
      `INSERT INTO pm_tasks (project_id, stage_id, title, description, deadline, progress, status, checklist)
       VALUES (?, ?, ?, ?, ?, 0, 'pending', ?)`,
    );

    for (const st of schedule) {
      const stageRow = stageStmt.get(
        proj.id,
        st.stepOrder,
        st.title,
        `SLA chuẩn: ${st.slaDays} ngày`,
        st.slaDays,
        st.phase,
        st.startDate,
        st.endDate,
      ) as { id: number };
      const checklistJson = JSON.stringify(
        st.defaultChecklist.map((txt, idx) => ({
          id: `${proj.id}_${st.stepOrder}_${idx + 1}`,
          text: txt,
          done: false,
        })),
      );
      taskStmt.run(
        proj.id,
        stageRow.id,
        st.defaultTaskTitle,
        `Mốc SLA: ${st.startDate} → ${st.endDate} (${st.slaDays} ngày)`,
        st.endDate,
        checklistJson,
      );
    }

    return c.json({ ok: true, id: proj.id });
  })

  // API Tính lại toàn bộ deadline giai đoạn & công việc khi đổi Ngày Tạm Ứng hoặc SLA từng bước
  .post("/api/projects/:id/recalculate-sla", async (c) => {
    const projectId = Number(c.req.param("id"));
    const body = await c.req.json<{
      depositDate?: string;
      flowType?: KmGiftFlowType;
      stageSlaUpdates?: Array<{ id: number; slaDays: number }>;
    }>();

    const proj = db.prepare("SELECT * FROM pm_projects WHERE id = ?").get(projectId) as
      | { id: number; deposit_date?: string; flow_type?: string }
      | undefined;
    if (!proj) return c.json({ ok: false, error: "Không tìm thấy dự án" }, 404);

    const nextDeposit = body.depositDate ?? proj.deposit_date ?? new Date().toISOString().slice(0, 10);
    const nextFlow: KmGiftFlowType =
      body.flowType === "ready_stock" || (body.flowType === undefined && proj.flow_type === "ready_stock")
        ? "ready_stock"
        : "customised";

    db.prepare("UPDATE pm_projects SET deposit_date = ?, flow_type = ? WHERE id = ?").run(
      nextDeposit,
      nextFlow,
      projectId,
    );

    if (Array.isArray(body.stageSlaUpdates)) {
      const updSla = db.prepare("UPDATE pm_stages SET sla_days = ? WHERE id = ? AND project_id = ?");
      for (const u of body.stageSlaUpdates) {
        updSla.run(Math.max(0, Number(u.slaDays) || 0), u.id, projectId);
      }
    }

    const stages = db
      .prepare("SELECT * FROM pm_stages WHERE project_id = ? ORDER BY step_order ASC, id ASC")
      .all(projectId) as Array<{ id: number; step_order: number; title: string; sla_days?: number; phase?: string }>;

    // Cascade dates based on each stage's phase & sla_days
    const preAndDeposit = stages.filter((s) => s.phase === "pre_deposit" || s.phase === "deposit");
    const postDeposit = stages.filter((s) => s.phase !== "pre_deposit" && s.phase !== "deposit");

    const updates: Array<{ id: number; startDate: string; endDate: string; slaDays: number }> = [];

    let cursorBack = nextDeposit;
    for (let i = preAndDeposit.length - 1; i >= 0; i--) {
      const st = preAndDeposit[i]!;
      const sla = Number(st.sla_days) || 0;
      const endDate = cursorBack;
      const startDate = addDaysIso(endDate, -sla);
      updates.push({ id: st.id, startDate, endDate, slaDays: sla });
      cursorBack = startDate;
    }

    let cursorForward = nextDeposit;
    for (const st of postDeposit) {
      const sla = Number(st.sla_days) || 0;
      const startDate = cursorForward;
      const endDate = addDaysIso(startDate, sla);
      updates.push({ id: st.id, startDate, endDate, slaDays: sla });
      cursorForward = endDate;
    }

    const updStageStmt = db.prepare(
      "UPDATE pm_stages SET start_date = ?, end_date = ?, description = ? WHERE id = ?",
    );
    const updTaskStmt = db.prepare(
      "UPDATE pm_tasks SET deadline = ? WHERE stage_id = ? AND project_id = ?",
    );

    for (const u of updates) {
      updStageStmt.run(u.startDate, u.endDate, `SLA: ${u.slaDays} ngày (${u.startDate} → ${u.endDate})`, u.id);
      updTaskStmt.run(u.endDate, u.id, projectId);
    }

    return c.json({ ok: true, depositDate: nextDeposit, stages: updates });
  })

  // --- API CHI PHÍ HẠNG MỤC & TẠO BÁO GIÁ TỰ ĐỘNG (COST x HỆ SỐ) ---
  .get("/api/projects/:id/costs", (c) => {
    const projectId = Number(c.req.param("id"));
    const costs = db
      .prepare(
        `SELECT pc.*, s.title as stage_title
         FROM pm_project_costs pc
         LEFT JOIN pm_stages s ON pc.stage_id = s.id
         WHERE pc.project_id = ?
         ORDER BY pc.id ASC`,
      )
      .all(projectId) as Array<{
        id: number;
        project_id: number;
        stage_id: number | null;
        stage_title?: string;
        category: string;
        item_name: string;
        vendor_name: string;
        cost_amount: number;
        quantity: number;
        unit: string;
        duration_days: number;
        markup_factor: number;
        description_specs: string;
        payment_status: string;
        contract_ref: string;
      }>;

    const quotation = (db.prepare("SELECT * FROM pm_quotations WHERE project_id = ?").get(projectId) as
      | {
          project_id: number;
          customer_name: string;
          customer_rep: string;
          quote_date: string;
          title: string;
          client_tier: string;
          default_markup: number;
          vat_percent: number;
          notes: string;
        }
      | undefined) ?? {
      project_id: projectId,
      customer_name: "",
      customer_rep: "",
      quote_date: new Date().toISOString().slice(0, 10),
      title: "BÁO GIÁ SẢN PHẨM & DỊCH VỤ",
      client_tier: "Doanh nghiệp",
      default_markup: 1.5,
      vat_percent: 8,
      notes:
        "Thanh toán: Tạm ứng 50% giá trị đơn hàng sau khi đặt hàng và thanh toán toàn bộ giá trị còn lại sau khi bàn giao sản phẩm.\nVận chuyển: Giá trên đã bao gồm chi phí vận chuyển đến 1 địa điểm trong nội thành Hà Nội.",
    };

    let totalCost = 0;
    let totalQuoteExclVat = 0;
    const enriched = costs.map((item) => {
      const qty = Math.max(1, Number(item.quantity) || 1);
      const unitCost = Number(item.cost_amount) || 0;
      const factor = Number(item.markup_factor) || quotation.default_markup || 1.5;
      const lineCost = unitCost * qty;
      const quoteUnitPrice = Math.round(unitCost * factor);
      const quoteLineTotal = quoteUnitPrice * qty;
      totalCost += lineCost;
      totalQuoteExclVat += quoteLineTotal;
      return {
        ...item,
        line_cost: lineCost,
        quote_unit_price: quoteUnitPrice,
        quote_line_total: quoteLineTotal,
      };
    });

    const vatPct = Number(quotation.vat_percent) || 0;
    const vatAmount = Math.round((totalQuoteExclVat * vatPct) / 100);
    const totalQuoteInclVat = totalQuoteExclVat + vatAmount;
    const estimatedProfit = totalQuoteExclVat - totalCost;
    const profitMarginPct = totalQuoteExclVat > 0 ? Math.round((estimatedProfit / totalQuoteExclVat) * 100) : 0;

    return c.json({
      ok: true,
      costs: enriched,
      quotation,
      summary: {
        totalCost,
        totalQuoteExclVat,
        vatAmount,
        totalQuoteInclVat,
        estimatedProfit,
        profitMarginPct,
      },
    });
  })

  .post("/api/projects/:id/costs", async (c) => {
    const projectId = Number(c.req.param("id"));
    const body = await c.req.json<{
      id?: number;
      stage_id?: number | null;
      category?: string;
      item_name: string;
      vendor_name?: string;
      cost_amount?: number;
      quantity?: number;
      unit?: string;
      duration_days?: number;
      markup_factor?: number;
      description_specs?: string;
      payment_status?: string;
      contract_ref?: string;
    }>();

    if (!body.item_name?.trim()) return c.json({ ok: false, error: "Thiếu tên hạng mục" }, 400);

    if (body.id) {
      db.prepare(
        `UPDATE pm_project_costs
         SET stage_id = ?, category = ?, item_name = ?, vendor_name = ?, cost_amount = ?, quantity = ?, unit = ?, duration_days = ?, markup_factor = ?, description_specs = ?, payment_status = ?, contract_ref = ?
         WHERE id = ? AND project_id = ?`,
      ).run(
        body.stage_id ?? null,
        body.category || "Sản xuất",
        body.item_name.trim(),
        body.vendor_name || "",
        Number(body.cost_amount) || 0,
        Math.max(1, Number(body.quantity) || 1),
        body.unit || "bộ",
        Number(body.duration_days) || 0,
        Number(body.markup_factor) || 1.5,
        body.description_specs || "",
        body.payment_status || "Chưa thanh toán",
        body.contract_ref || "",
        body.id,
        projectId,
      );
      return c.json({ ok: true, id: body.id });
    }

    const row = db
      .prepare(
        `INSERT INTO pm_project_costs
          (project_id, stage_id, category, item_name, vendor_name, cost_amount, quantity, unit, duration_days, markup_factor, description_specs, payment_status, contract_ref)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING id`,
      )
      .get(
        projectId,
        body.stage_id ?? null,
        body.category || "Sản xuất",
        body.item_name.trim(),
        body.vendor_name || "",
        Number(body.cost_amount) || 0,
        Math.max(1, Number(body.quantity) || 1),
        body.unit || "bộ",
        Number(body.duration_days) || 0,
        Number(body.markup_factor) || 1.5,
        body.description_specs || "",
        body.payment_status || "Chưa thanh toán",
        body.contract_ref || "",
      ) as { id: number };

    return c.json({ ok: true, id: row.id });
  })

  .delete("/api/projects/costs/:costId", (c) => {
    const costId = Number(c.req.param("costId"));
    db.prepare("DELETE FROM pm_project_costs WHERE id = ?").run(costId);
    return c.json({ ok: true });
  })

  .post("/api/projects/:id/quotation", async (c) => {
    const projectId = Number(c.req.param("id"));
    const body = await c.req.json<{
      customer_name?: string;
      customer_rep?: string;
      quote_date?: string;
      title?: string;
      client_tier?: string;
      default_markup?: number;
      vat_percent?: number;
      notes?: string;
      applyMarkupToAll?: boolean;
    }>();

    const defaultMarkup = Number(body.default_markup) || 1.5;
    db.prepare(
      `INSERT INTO pm_quotations (project_id, customer_name, customer_rep, quote_date, title, client_tier, default_markup, vat_percent, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(project_id) DO UPDATE SET
         customer_name = excluded.customer_name,
         customer_rep = excluded.customer_rep,
         quote_date = excluded.quote_date,
         title = excluded.title,
         client_tier = excluded.client_tier,
         default_markup = excluded.default_markup,
         vat_percent = excluded.vat_percent,
         notes = excluded.notes,
         updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')`,
    ).run(
      projectId,
      body.customer_name || "",
      body.customer_rep || "",
      body.quote_date || new Date().toISOString().slice(0, 10),
      body.title || "BÁO GIÁ SẢN PHẨM & DỊCH VỤ",
      body.client_tier || "Doanh nghiệp",
      defaultMarkup,
      body.vat_percent ?? 8,
      body.notes || "",
    );

    if (body.applyMarkupToAll) {
      db.prepare("UPDATE pm_project_costs SET markup_factor = ? WHERE project_id = ?").run(defaultMarkup, projectId);
    }

    return c.json({ ok: true });
  })

  .get("/api/projects/:id/quotation/print", (c) => {
    const projectId = Number(c.req.param("id"));
    const proj = db.prepare("SELECT * FROM pm_projects WHERE id = ?").get(projectId) as
      | { id: number; name: string; business_unit?: string }
      | undefined;
    if (!proj) return c.text("Không tìm thấy dự án", 404);

    const costs = db
      .prepare("SELECT * FROM pm_project_costs WHERE project_id = ? ORDER BY id ASC")
      .all(projectId) as Array<{
      id: number;
      item_name: string;
      cost_amount: number;
      quantity: number;
      unit: string;
      duration_days: number;
      markup_factor: number;
      description_specs: string;
    }>;

    const q = (db.prepare("SELECT * FROM pm_quotations WHERE project_id = ?").get(projectId) as
      | {
          customer_name: string;
          customer_rep: string;
          quote_date: string;
          title: string;
          default_markup: number;
          vat_percent: number;
          notes: string;
        }
      | undefined) ?? {
      customer_name: "Quý Khách hàng",
      customer_rep: "",
      quote_date: new Date().toISOString().slice(0, 10),
      title: `BÁO GIÁ ${proj.name.toUpperCase()}`,
      default_markup: 1.5,
      vat_percent: 8,
      notes:
        "Thanh toán: Tạm ứng 50% giá trị đơn hàng sau khi đặt hàng và thanh toán toàn bộ giá trị còn lại sau khi bàn giao sản phẩm.\nVận chuyển: Giá trên đã bao gồm chi phí vận chuyển đến 1 địa điểm trong nội thành Hà Nội.",
    };

    const escHtml = (s: unknown) =>
      String(s ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");

    let subTotal = 0;
    const rowsHtml = costs
      .map((item, idx) => {
        const qty = Math.max(1, Number(item.quantity) || 1);
        const unitPrice = Math.round((Number(item.cost_amount) || 0) * (Number(item.markup_factor) || q.default_markup || 1.5));
        const lineTotal = unitPrice * qty;
        subTotal += lineTotal;
        const specs = escHtml(item.description_specs).replace(/\n/g, "<br>");
        return `<tr>
          <td style="text-align:center;">${idx + 1}</td>
          <td><strong>${escHtml(item.item_name)}</strong>${specs ? `<div style="font-size:12px; color:#475569; margin-top:4px;">${specs}</div>` : ""}</td>
          <td style="text-align:center;">${escHtml(item.unit || "bộ")}</td>
          <td style="text-align:center;">${qty.toLocaleString("vi-VN")}</td>
          <td style="text-align:right; font-family:monospace;">${unitPrice.toLocaleString("vi-VN")}</td>
          <td style="text-align:right; font-family:monospace; font-weight:700;">${lineTotal.toLocaleString("vi-VN")}</td>
          <td style="font-size:12px; color:#475569;">${item.duration_days ? `Dự kiến ${item.duration_days} ngày` : ""}</td>
        </tr>`;
      })
      .join("");

    const vatPct = Number(q.vat_percent) || 0;
    const vatAmt = Math.round((subTotal * vatPct) / 100);
    const grandTotal = subTotal + vatAmt;
    const notesHtml = escHtml(q.notes).replace(/\n/g, "<br>");

    return c.html(`<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <title>${escHtml(q.title)} - Khởi Minh CST</title>
  <style>
    @page { size: A4 portrait; margin: 14mm; }
    body { font-family: 'Segoe UI', Arial, sans-serif; color: #0F172A; margin: 0; padding: 24px; background: #F8FAFC; }
    .sheet { max-width: 840px; margin: 0 auto; background: #fff; padding: 32px 36px; border: 1px solid #E2E8F0; border-radius: 8px; }
    .header { display: flex; justify-content: space-between; gap: 20px; border-bottom: 2px solid #2563EB; padding-bottom: 16px; margin-bottom: 20px; }
    .co-name { font-size: 15px; font-weight: 800; color: #2563EB; margin-bottom: 6px; }
    .co-meta { font-size: 12px; color: #475569; line-height: 1.55; }
    .cust-box { font-size: 12.5px; color: #0F172A; line-height: 1.65; min-width: 240px; }
    h1 { text-align: center; font-size: 19px; font-weight: 800; margin: 10px 0 6px; color: #0F172A; }
    .intro { font-size: 13px; color: #334155; margin-bottom: 16px; text-align: center; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 18px; font-size: 13px; }
    th { background: #EFF6FF; color: #0F172A; font-weight: 700; border: 1px solid #CBD5E1; padding: 9px 10px; text-align: left; }
    td { border: 1px solid #CBD5E1; padding: 9px 10px; vertical-align: top; }
    .totals { width: 340px; margin-left: auto; font-size: 13.5px; margin-bottom: 20px; }
    .totals td { border: none; padding: 5px 8px; }
    .totals tr.grand td { border-top: 2px solid #2563EB; font-weight: 800; font-size: 15px; color: #2563EB; padding-top: 8px; }
    .notes { font-size: 12.5px; color: #334155; background: #F8FAFC; padding: 12px 14px; border-radius: 6px; border: 1px solid #E2E8F0; line-height: 1.6; }
    .print-bar { text-align: right; margin-bottom: 14px; }
    .btn { background: #2563EB; color: #fff; border: none; padding: 9px 18px; border-radius: 6px; font-weight: 600; cursor: pointer; }
    @media print { body { background: #fff; padding: 0; } .sheet { border: none; padding: 0; } .print-bar { display: none; } }
  </style>
</head>
<body>
  <div class="sheet">
    <div class="print-bar"><button class="btn" onclick="window.print()">🖨️ In / Lưu PDF Báo Giá Gửi Khách</button></div>
    <div class="header">
      <div>
        <div class="co-name">CÔNG TY CỔ PHẦN TƯ VẤN, DỊCH VỤ VÀ THƯƠNG MẠI KHỞI MINH (KHOI MINH CST)</div>
        <div class="co-meta">
          VPGD: 102/6 Lê Thánh Tông, Hoàn Kiếm, Hà Nội<br>
          Showroom: 6/38 Phố Huế, Cửa Nam, Hà Nội<br>
          Liên hệ: 079.338.1666
        </div>
      </div>
      <div class="cust-box">
        <div><strong>Khách hàng:</strong> ${escHtml(q.customer_name || "Quý Đối tác")}</div>
        <div><strong>Đại diện:</strong> ${escHtml(q.customer_rep || "-")}</div>
        <div><strong>Ngày báo giá:</strong> ${escHtml(q.quote_date)}</div>
      </div>
    </div>
    <h1>${escHtml(q.title)} (CHƯA BAO GỒM ${vatPct}% VAT)</h1>
    <div class="intro">Kính gửi: ${escHtml(q.customer_name || "Quý Đối tác")}, Chúng tôi xin gửi đến Quý Đối tác bảng báo giá chi tiết như sau:</div>
    <table>
      <thead>
        <tr>
          <th style="width:42px; text-align:center;">No.</th>
          <th>MÔ TẢ HẠNG MỤC &amp; QUY CÁCH</th>
          <th style="width:65px; text-align:center;">ĐƠN VỊ</th>
          <th style="width:65px; text-align:center;">SL</th>
          <th style="width:110px; text-align:right;">ĐƠN GIÁ (VND)</th>
          <th style="width:120px; text-align:right;">THÀNH TIỀN</th>
          <th style="width:110px;">GHI CHÚ</th>
        </tr>
      </thead>
      <tbody>${rowsHtml || '<tr><td colspan="7" style="text-align:center; color:#64748B;">Chưa có hạng mục nào</td></tr>'}</tbody>
    </table>
    <table class="totals">
      <tr><td>Cộng tiền hàng (Chưa VAT):</td><td style="text-align:right; font-weight:700;">${subTotal.toLocaleString("vi-VN")} ₫</td></tr>
      <tr><td>Thuế GTGT (${vatPct}%):</td><td style="text-align:right;">${vatAmt.toLocaleString("vi-VN")} ₫</td></tr>
      <tr class="grand"><td>TỔNG THANH TOÁN:</td><td style="text-align:right;">${grandTotal.toLocaleString("vi-VN")} ₫</td></tr>
    </table>
    <div class="notes"><strong>Ghi chú &amp; Điều khoản:</strong><br>${notesHtml}</div>
  </div>
</body>
</html>`);
  })

  // API Tạo công việc mới
  .post("/api/tasks", async (c) => {
    const { project_id, stage_id, title, description, assigned_phone, deadline, progress } = await c.req.json<{
      project_id: number;
      stage_id: number;
      title: string;
      description?: string;
      assigned_phone?: string;
      deadline?: string;
      progress?: number;
    }>();

    if (!title?.trim()) return c.json({ ok: false, error: "Thiếu tên công việc" }, 400);

    const res = db.prepare(`
      INSERT INTO pm_tasks (project_id, stage_id, title, description, assigned_phone, deadline, progress, status, checklist)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      RETURNING id
    `).get(
      Number(project_id) || 1,
      Number(stage_id) || 1,
      title.trim(),
      description || "",
      assigned_phone || "",
      deadline || "",
      Number(progress) || 0,
      (Number(progress) >= 100) ? "completed" : "in_progress",
      "[]"
    ) as { id: number };

    return c.json({ ok: true, id: res.id });
  })

  // API Cập nhật công việc (kéo thả Kanban, đổi hạn, sửa tên...)
  .patch("/api/tasks/:id", async (c) => {
    const id = Number(c.req.param("id"));
    const body = await c.req.json();

    const current = db.prepare("SELECT * FROM pm_tasks WHERE id = ?").get(id) as {
      stage_id: number;
      progress: number;
      status: string;
    } | undefined;

    if (!current) return c.json({ ok: false, error: "Không tìm thấy công việc" }, 404);

    const newStage = (body.stage_id !== undefined) ? Number(body.stage_id) : current.stage_id;
    let newProgress = (body.progress !== undefined) ? Number(body.progress) : current.progress;
    let newStatus = body.status || current.status;

    if (newProgress >= 100) newStatus = "completed";

    db.prepare(`
      UPDATE pm_tasks
      SET stage_id = ?,
          title = COALESCE(?, title),
          description = COALESCE(?, description),
          assigned_phone = COALESCE(?, assigned_phone),
          deadline = COALESCE(?, deadline),
          progress = ?,
          status = ?,
          updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
      WHERE id = ?
    `).run(
      newStage,
      body.title,
      body.description,
      body.assigned_phone,
      body.deadline,
      newProgress,
      newStatus,
      id
    );

    return c.json({ ok: true });
  })

  // API Tương tác Checklist việc nhỏ bên trong công việc
  .post("/api/tasks/:id/checklist", async (c) => {
    const id = Number(c.req.param("id"));
    const { action, text, itemId } = await c.req.json<{
      action: "add" | "toggle" | "delete";
      text?: string;
      itemId?: string;
    }>();

    const task = db.prepare("SELECT checklist, progress FROM pm_tasks WHERE id = ?").get(id) as {
      checklist?: string;
      progress: number;
    } | undefined;

    if (!task) return c.json({ ok: false, error: "Không tìm thấy công việc" }, 404);

    let items: { id: string; text: string; done: boolean }[] = [];
    try {
      if (task.checklist) items = JSON.parse(task.checklist);
    } catch {
      items = [];
    }

    if (action === "add" && text?.trim()) {
      items.push({ id: Date.now().toString(), text: text.trim(), done: false });
    } else if (action === "toggle" && itemId) {
      const it = items.find(i => i.id === itemId);
      if (it) it.done = !it.done;
    } else if (action === "delete" && itemId) {
      items = items.filter(i => i.id !== itemId);
    }

    let newProgress = task.progress;
    if (items.length > 0) {
      const doneCount = items.filter(i => i.done).length;
      newProgress = Math.round((doneCount / items.length) * 100);
    }

    db.prepare(`
      UPDATE pm_tasks
      SET checklist = ?,
          progress = ?,
          status = CASE WHEN ? >= 100 THEN 'completed' ELSE 'in_progress' END,
          updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
      WHERE id = ?
    `).run(JSON.stringify(items), newProgress, newProgress, id);

    return c.json({ ok: true, checklist: items, progress: newProgress });
  })

  // API Người phụ trách báo tiến độ cho Bot -> Bot đối chiếu đầu mục con & tự kéo thanh tiến độ
  .post("/api/tasks/:id/bot-report", async (c) => {
    const id = Number(c.req.param("id"));
    const body = await c.req.json<{ reportText: string; senderName?: string }>();
    const res = applyBotProgressReport({
      taskId: id,
      reportText: body.reportText || "",
      senderName: body.senderName,
    });
    return c.json(res, res.ok ? 200 : 400);
  })

  // API Ghi nhận chi phí gắn liền trực tiếp với công việc
  .post("/api/tasks/:id/expense", async (c) => {
    const id = Number(c.req.param("id"));
    const { title, amount, category, spent_by, note } = await c.req.json<{
      title: string;
      amount: number;
      category?: string;
      spent_by?: string;
      note?: string;
    }>();

    if (!title?.trim() || !amount) return c.json({ ok: false, error: "Thiếu tiêu đề hoặc số tiền" }, 400);

    const task = db.prepare("SELECT project_id FROM pm_tasks WHERE id = ?").get(id) as {
      project_id: number;
    } | undefined;

    if (!task) return c.json({ ok: false, error: "Không tìm thấy công việc" }, 404);

    db.prepare(`
      INSERT INTO pm_expenses (project_id, task_id, title, amount, category, spent_by, note)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      task.project_id,
      id,
      title.trim(),
      Number(amount) || 0,
      category || "Khác",
      spent_by || "",
      note || ""
    );

    return c.json({ ok: true });
  })

  // API Xóa công việc
  .delete("/api/tasks/:id", (c) => {
    const id = Number(c.req.param("id"));
    db.prepare("DELETE FROM pm_tasks WHERE id = ?").run(id);
    db.prepare("DELETE FROM pm_expenses WHERE task_id = ?").run(id);
    return c.json({ ok: true });
  })

  // API Tạo bước / giai đoạn mới
  .post("/api/stages", async (c) => {
    const { project_id, title, description } = await c.req.json<{
      project_id: number;
      title: string;
      description?: string;
    }>();

    if (!title?.trim()) return c.json({ ok: false, error: "Thiếu tên bước" }, 400);

    const maxOrder = (db.prepare("SELECT MAX(step_order) as m FROM pm_stages WHERE project_id = ?").get(Number(project_id) || 1) as { m: number | null })?.m || 0;

    const res = db.prepare(`
      INSERT INTO pm_stages (project_id, step_order, title, description, status)
      VALUES (?, ?, ?, ?, 'todo')
      RETURNING id
    `).get(Number(project_id) || 1, maxOrder + 1, title.trim(), description || "") as { id: number };

    return c.json({ ok: true, id: res.id });
  })

  // API Ghi nhận chi phí chung của dự án
  .post("/api/expenses", async (c) => {
    const { project_id, title, amount, category, spent_by, note } = await c.req.json<{
      project_id: number;
      title: string;
      amount: number;
      category?: string;
      spent_by?: string;
      note?: string;
    }>();

    if (!title?.trim() || !amount) return c.json({ ok: false, error: "Thiếu tiêu đề hoặc số tiền" }, 400);

    db.prepare(`
      INSERT INTO pm_expenses (project_id, task_id, title, amount, category, spent_by, note)
      VALUES (?, NULL, ?, ?, ?, ?, ?)
    `).run(
      Number(project_id) || 1,
      title.trim(),
      Number(amount) || 0,
      category || "Khác",
      spent_by || "",
      note || ""
    );

    return c.json({ ok: true });
  })

  // API Thêm thành viên mới (Admin only)
  .post("/api/members", async (c) => {
    const { phone, name, email, role, pin } = await c.req.json<{
      phone: string;
      name: string;
      email?: string;
      role?: string;
      pin?: string;
    }>();

    if (!phone?.trim() || !name?.trim()) {
      return c.json({ ok: false, error: "Thiếu số điện thoại hoặc tên" }, 400);
    }

    db.prepare(`
      INSERT INTO pm_members (phone, name, email, role, pin)
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(phone) DO UPDATE SET
        name = excluded.name,
        email = excluded.email,
        role = excluded.role,
        pin = excluded.pin
    `).run(phone.trim(), name.trim(), email || "", role || "member", pin || "123456");

    return c.json({ ok: true });
  })

  // API Thay đổi vai trò thành viên (Admin only)
  .post("/api/members/role", async (c) => {
    const { phone, role } = await c.req.json<{ phone: string; role: string }>();
    if (!phone || !role) return c.json({ ok: false, error: "Thiếu tham số" }, 400);

    db.prepare("UPDATE pm_members SET role = ? WHERE phone = ?").run(role, phone);
    return c.json({ ok: true });
  })

  // API iCal Feed đồng bộ Google Calendar
  .get("/api/calendar.ics", (c) => {
    const tasks = db.prepare("SELECT * FROM pm_tasks ORDER BY id DESC").all() as any[];
    const icsContent = taoIcalFeed(tasks);
    return new Response(icsContent, {
      status: 200,
      headers: {
        "Content-Type": "text/calendar; charset=utf-8",
        "Content-Disposition": 'attachment; filename="zalo-project-calendar.ics"',
        "Cache-Control": "no-cache"
      }
    });
  })

  // API Quét nhắc việc khẩn cấp tức thời (Admin only)
  .post("/api/sync-reminders", async (c) => {
    const result = await quetVaGuiNhacViecTuDong();
    return c.json({ ok: true, ...result });
  })

  // API Gửi email thử nghiệm (Admin only)
  .post("/api/test-email", async (c) => {
    const { email } = await c.req.json<{ email: string }>();
    if (!email) return c.json({ ok: false, error: "Thiếu địa chỉ email" }, 400);

    const res = await guiEmailNhacViec({
      to: email,
      taskTitle: "Thử nghiệm kết nối SMTP từ Cổng Quản Lý Zalo Agent",
      name: "Quản Trị Viên"
    });

    return c.json(res);
  })

  // API Gửi tin nhắn Zalo nhắc việc tức thì cho 1 công việc
  .post("/api/remind/:taskId", async (c) => {
    const taskId = Number(c.req.param("taskId"));
    const task = db.prepare("SELECT * FROM pm_tasks WHERE id = ?").get(taskId) as {
      id: number;
      title: string;
      assigned_phone: string;
      deadline: string;
    } | undefined;

    if (!task) return c.json({ ok: false, error: "Không tìm thấy công việc" }, 404);

    let targetThread = "";
    if (task.assigned_phone) {
      const mem = db.prepare("SELECT thread_id FROM pm_members WHERE phone = ?").get(task.assigned_phone) as { thread_id?: string } | undefined;
      if (mem?.thread_id) targetThread = mem.thread_id;
    }

    if (!targetThread) {
      const adminMem = db.prepare("SELECT thread_id FROM pm_members WHERE phone = 'admin'").get() as { thread_id?: string } | undefined;
      targetThread = adminMem?.thread_id || "";
    }

    if (!targetThread) {
      return c.json({ ok: false, error: "Chưa có cuộc trò chuyện Zalo 1-1 nào kết nối với bot" }, 400);
    }

    const token = layBotTokenGiaiMa("bot-tro-ly-jay");
    if (!token) return c.json({ ok: false, error: "Chưa có token bot" }, 500);

    const client = taoZaloBotClient({ token });
    const msg = `🔔 [NHẮC VIỆC KHẨN CẤP // ZALO AGENT STUDIO]\n` +
      `📌 Công việc: ${task.title}\n` +
      `⏰ Hạn chót: ${task.deadline ? task.deadline.replace("T", " ") : "Chưa đặt"}\n` +
      `🔗 Xem trên Cổng Portal: http://127.0.0.1:3901/portal`;

    await client.sendMessage(targetThread, msg);
    return c.json({ ok: true, message: `Đã gửi tin nhắn nhắc việc qua Zalo đến thread ${targetThread}` });
  })

  // =========================================================================
  // API TIẾN ĐỘ THEO DÕI CÔNG VIỆC (WORK TRACKER & GANTT)
  // =========================================================================
  .get("/api/work-tracker", (c) => {
    try {
      const settings = db.prepare("SELECT * FROM pm_work_tracker_settings WHERE id = 1").get() || {
        project_start_date: '2026-11-09',
        today_date: '2026-11-10',
        title: 'THEO DÕI TIẾN ĐỘ CÔNG VIỆC',
        weeks_count: 7
      };
      const members = db.prepare("SELECT * FROM pm_work_tracker_members ORDER BY member_order ASC").all();
      const tasks = db.prepare("SELECT * FROM pm_work_tracker_tasks ORDER BY task_order ASC, id ASC").all();
      return c.json({ ok: true, settings, members, tasks });
    } catch (err: any) {
      return c.json({ ok: false, error: err.message || "Lỗi lấy dữ liệu tiến độ" }, 500);
    }
  })

  .post("/api/work-tracker/task", async (c) => {
    try {
      const body = await c.req.json<{
        id?: number;
        title: string;
        assigned_member_id?: number;
        start_date?: string;
        end_date?: string;
        duration_days?: number;
        progress?: number;
        status?: string;
        notes?: string;
      }>();

      if (!body.title) return c.json({ ok: false, error: "Vui lòng nhập tên công việc" }, 400);

      if (body.id) {
        db.prepare(`
          UPDATE pm_work_tracker_tasks
          SET title = ?, assigned_member_id = ?, start_date = ?, end_date = ?, duration_days = ?, progress = ?, status = ?, notes = ?, updated_at = (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
          WHERE id = ?
        `).run(
          body.title,
          body.assigned_member_id ?? null,
          body.start_date || "",
          body.end_date || "",
          body.duration_days || 0,
          body.progress ?? 0,
          body.status || "pending",
          body.notes || "",
          body.id
        );
      } else {
        const maxOrder = db.prepare("SELECT COALESCE(MAX(task_order), 0) as m FROM pm_work_tracker_tasks").get() as { m: number };
        const nextOrder = (maxOrder?.m || 0) + 1;
        db.prepare(`
          INSERT INTO pm_work_tracker_tasks (task_order, title, assigned_member_id, start_date, end_date, duration_days, progress, status, notes)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          nextOrder,
          body.title,
          body.assigned_member_id ?? null,
          body.start_date || "",
          body.end_date || "",
          body.duration_days || 0,
          body.progress ?? 0,
          body.status || "pending",
          body.notes || ""
        );
      }

      return c.json({ ok: true });
    } catch (err: any) {
      return c.json({ ok: false, error: err.message || "Lỗi lưu công việc" }, 500);
    }
  })

  .delete("/api/work-tracker/task/:id", (c) => {
    try {
      const id = c.req.param("id");
      db.prepare("DELETE FROM pm_work_tracker_tasks WHERE id = ?").run(id);
      return c.json({ ok: true });
    } catch (err: any) {
      return c.json({ ok: false, error: err.message || "Lỗi xóa công việc" }, 500);
    }
  })

  .post("/api/work-tracker/members", async (c) => {
    try {
      const { members } = await c.req.json<{
        members: Array<{ id: number; name: string; color_name?: string; color_hex: string }>;
      }>();

      if (!members || !Array.isArray(members)) {
        return c.json({ ok: false, error: "Dữ liệu không hợp lệ" }, 400);
      }

      const stmt = db.prepare("UPDATE pm_work_tracker_members SET name = ?, color_name = ?, color_hex = ? WHERE id = ?");
      for (const m of members) {
        stmt.run(m.name, m.color_name || "", m.color_hex, m.id);
      }

      return c.json({ ok: true });
    } catch (err: any) {
      return c.json({ ok: false, error: err.message || "Lỗi lưu thành viên" }, 500);
    }
  })

  .post("/api/work-tracker/settings", async (c) => {
    try {
      const { project_start_date, today_date, title } = await c.req.json<{
        project_start_date?: string;
        today_date?: string;
        title?: string;
      }>();

      db.prepare(`
        UPDATE pm_work_tracker_settings
        SET project_start_date = COALESCE(?, project_start_date),
            today_date = COALESCE(?, today_date),
            title = COALESCE(?, title)
        WHERE id = 1
      `).run(project_start_date || null, today_date || null, title || null);

      return c.json({ ok: true });
    } catch (err: any) {
      return c.json({ ok: false, error: err.message || "Lỗi cập nhật cấu hình" }, 500);
    }
  })

  // API Phục vụ Trang Trình Chiếu Slide Thuyết Trình Khởi Minh
  .get("/pitch", (c) => {
    try {
      const html = fs.readFileSync(path.join(process.cwd(), "presentation", "index.html"), "utf-8");
      return c.html(html);
    } catch {
      return c.text("Chưa tìm thấy file slide thuyết trình.");
    }
  })

  // Phục vụ ảnh chụp thực tế cho slide
  .get("/screenshots/:name", (c) => {
    try {
      const name = c.req.param("name");
      const filePath = path.join("/Users/m1/screenshots", name);
      if (fs.existsSync(filePath)) {
        const buf = fs.readFileSync(filePath);
        return new Response(buf, {
          headers: { "Content-Type": "image/png" }
        });
      }
      return c.text("Ảnh không tồn tại", 404);
    } catch {
      return c.text("Lỗi đọc ảnh", 500);
    }
  })

  // --- API TÀI KHOẢN CÁ NHÂN, QUÉT LỊCH SỬ, AI PHÂN LOẠI & GOOGLE DRIVE ---
  .get("/api/personal-status", (c) => {
    const active = findActivePersonalAccount();
    const drive = getDriveSettings();
    return c.json({
      ok: true,
      personalAccount: active ? { accountId: active.accountId, name: active.name, connected: true } : { connected: false },
      drive: {
        rootFolderName: drive.root_folder_name,
        rootFolderId: drive.root_folder_id,
        hasToken: Boolean(drive.access_token || drive.refresh_token),
        autoSync: Boolean(drive.auto_sync),
        defaultGroupId: drive.default_group_id,
      },
    });
  })

  .get("/api/zalo-groups", async (c) => {
    try {
      const data = await listPersonalZaloGroups();
      return c.json({ ok: true, ...data });
    } catch (err: any) {
      return c.json({ ok: false, connected: false, error: err?.message || "Chưa kết nối tài khoản Zalo cá nhân", groups: [] });
    }
  })

  .get("/api/zalo-groups/:groupId/members", async (c) => {
    try {
      const groupId = c.req.param("groupId");
      const members = await getZaloGroupMembers(groupId);
      return c.json({ ok: true, members });
    } catch (err: any) {
      return c.json({ ok: false, error: err?.message || "Không lấy được danh sách thành viên", members: [] }, 400);
    }
  })

  .post("/api/scan-history", async (c) => {
    try {
      const body = await c.req.json<{
        groupId: string;
        groupName?: string;
        count?: number;
        classify?: boolean;
        syncDrive?: boolean;
      }>();
      if (!body.groupId) return c.json({ ok: false, error: "Thiếu groupId" }, 400);

      const scan = await scanGroupHistoryForAssets({
        groupId: body.groupId,
        groupName: body.groupName,
        count: body.count ?? 60,
      });

      let classify = { processed: 0, classified: 0 };
      if (body.classify !== false) {
        try {
          classify = await classifyPendingAssetsWithAI(30);
        } catch (err: any) {
          return c.json({ ok: true, scan, classify, warning: `Đã quét lịch sử nhưng AI phân loại lỗi: ${err?.message}` });
        }
      }

      let synced = 0;
      if (body.syncDrive) {
        const rows = db
          .prepare("SELECT id FROM pm_collected_assets WHERE status = 'classified' LIMIT 30")
          .all() as { id: number }[];
        for (const r of rows) {
          const res = await syncAssetToDrive(r.id);
          if (res.ok) synced++;
        }
      }

      return c.json({ ok: true, scan, classify, synced });
    } catch (err: any) {
      return c.json({ ok: false, error: err?.message || "Lỗi quét lịch sử nhóm" }, 500);
    }
  })

  .get("/api/assets", (c) => {
    const project = c.req.query("project") || "";
    const type = c.req.query("type") || "";
    const status = c.req.query("status") || "";

    const where: string[] = [];
    const args: string[] = [];
    if (project) {
      where.push("project_name = ?");
      args.push(project);
    }
    if (type) {
      where.push("asset_type = ?");
      args.push(type);
    }
    if (status) {
      where.push("status = ?");
      args.push(status);
    }

    const sql = `SELECT * FROM pm_collected_assets ${where.length ? "WHERE " + where.join(" AND ") : ""} ORDER BY sent_at DESC, id DESC LIMIT 200`;
    const assets = db.prepare(sql).all(...args) as CollectedAssetRow[];
    const projects = db
      .prepare("SELECT project_name, COUNT(*) as count FROM pm_collected_assets GROUP BY project_name ORDER BY count DESC")
      .all() as { project_name: string; count: number }[];
    return c.json({ ok: true, assets, projects });
  })

  .patch("/api/assets/:id", async (c) => {
    const id = Number(c.req.param("id"));
    const body = await c.req.json<{ project_name?: string; title?: string }>();
    db.prepare(
      `UPDATE pm_collected_assets
       SET project_name = COALESCE(?, project_name),
           title = COALESCE(?, title),
           status = CASE WHEN status = 'pending' THEN 'classified' ELSE status END
       WHERE id = ?`,
    ).run(body.project_name || null, body.title || null, id);
    return c.json({ ok: true });
  })

  .post("/api/ai-classify", async (c) => {
    try {
      const result = await classifyPendingAssetsWithAI(30);
      return c.json({ ok: true, ...result });
    } catch (err: any) {
      return c.json({ ok: false, error: err?.message || "AI phân loại thất bại" }, 500);
    }
  })

  .post("/api/drive/settings", async (c) => {
    const body = await c.req.json<{
      root_folder_name?: string;
      root_folder_id?: string;
      access_token?: string;
      refresh_token?: string;
      client_id?: string;
      client_secret?: string;
      auto_sync?: number;
      default_group_id?: string;
    }>();
    const updated = updateDriveSettings(body);
    return c.json({
      ok: true,
      drive: {
        rootFolderName: updated.root_folder_name,
        rootFolderId: updated.root_folder_id,
        hasToken: Boolean(updated.access_token || updated.refresh_token),
        autoSync: Boolean(updated.auto_sync),
        defaultGroupId: updated.default_group_id,
      },
    });
  })

  .post("/api/drive/sync", async (c) => {
    try {
      const body = await c.req.json<{ assetId?: number }>().catch(() => ({} as { assetId?: number }));
      if (body.assetId) {
        const res = await syncAssetToDrive(body.assetId);
        return c.json(res, res.ok ? 200 : 400);
      }

      const rows = db
        .prepare("SELECT id FROM pm_collected_assets WHERE status IN ('classified', 'pending', 'error') LIMIT 30")
        .all() as { id: number }[];
      let synced = 0;
      let failed = 0;
      let lastError = "";
      for (const r of rows) {
        const res = await syncAssetToDrive(r.id);
        if (res.ok) synced++;
        else {
          failed++;
          lastError = res.error || lastError;
        }
      }
      return c.json({ ok: failed === 0 || synced > 0, synced, failed, lastError });
    } catch (err: any) {
      return c.json({ ok: false, error: err?.message || "Lỗi đồng bộ Drive" }, 500);
    }
  })

  .post("/api/remind-group", async (c) => {
    try {
      const body = await c.req.json<{
        groupId: string;
        memberName: string;
        memberUid?: string;
        text: string;
      }>();
      if (!body.groupId || !body.text) {
        return c.json({ ok: false, error: "Cần chọn nhóm và nhập nội dung nhắc việc" }, 400);
      }
      const res = await sendGroupMentionReminder({
        groupId: body.groupId,
        memberName: body.memberName || "",
        memberUid: body.memberUid,
        text: body.text,
      });
      return c.json(res, res.ok ? 200 : 400);
    } catch (err: any) {
      return c.json({ ok: false, error: err?.message || "Gửi nhắc việc nhóm thất bại" }, 500);
    }
  })

  // --- API CHUYỂN TIẾP TIN NHẮN ZALO BOT SANG NHÓM KHÁC ---
  .get("/api/bot-forwarding", (c) => {
    const accountId = c.req.query("accountId") || "bot-tro-ly-jay";
    const targets = listBotTargets(accountId);
    const rules = db
      .prepare("SELECT * FROM pm_bot_forward_rules WHERE account_id = ? ORDER BY id DESC")
      .all(accountId);
    return c.json({ ok: true, accountId, targets, rules });
  })

  .post("/api/bot-forwarding/rename", async (c) => {
    const body = await c.req.json<{ accountId?: string; threadId: string; displayName: string }>();
    if (!body.threadId || !body.displayName?.trim()) {
      return c.json({ ok: false, error: "Thiếu threadId hoặc tên mới" }, 400);
    }
    renameBotThread(body.accountId || "bot-tro-ly-jay", body.threadId, body.displayName);
    return c.json({ ok: true });
  })

  .post("/api/bot-forwarding/send", async (c) => {
    const body = await c.req.json<{
      accountId?: string;
      targetThreadIds: string[];
      message: string;
      senderLabel?: string;
    }>();
    if (!Array.isArray(body.targetThreadIds) || body.targetThreadIds.length === 0 || !body.message?.trim()) {
      return c.json({ ok: false, error: "Cần chọn ít nhất 1 nhóm/người nhận và nhập nội dung" }, 400);
    }
    const header = body.senderLabel?.trim()
      ? `📨 [Chuyển tiếp từ ${body.senderLabel.trim()}]:\n`
      : `📨 [Thông báo chuyển tiếp từ Zalo Bot]:\n`;
    const res = await forwardViaBotClient({
      accountId: body.accountId || "bot-tro-ly-jay",
      targetThreadIds: body.targetThreadIds,
      text: `${header}${body.message.trim()}`,
    });
    return c.json({ ok: res.sentCount > 0, ...res }, res.sentCount > 0 ? 200 : 400);
  })

  .post("/api/bot-forwarding/rules", async (c) => {
    const body = await c.req.json<{
      accountId?: string;
      source_thread_id: string;
      target_thread_id: string;
      keyword_filter?: string;
      prefix_label?: string;
    }>();
    if (!body.source_thread_id || !body.target_thread_id || body.source_thread_id === body.target_thread_id) {
      return c.json({ ok: false, error: "Cần chọn nhóm nguồn và nhóm đích khác nhau" }, 400);
    }
    const row = db
      .prepare(
        `INSERT INTO pm_bot_forward_rules (account_id, source_thread_id, target_thread_id, keyword_filter, prefix_label, enabled)
         VALUES (?, ?, ?, ?, ?, 1) RETURNING id`,
      )
      .get(
        body.accountId || "bot-tro-ly-jay",
        body.source_thread_id,
        body.target_thread_id,
        body.keyword_filter || "",
        body.prefix_label || "",
      ) as { id: number };
    return c.json({ ok: true, id: row.id });
  })

  .delete("/api/bot-forwarding/rules/:id", (c) => {
    const id = Number(c.req.param("id"));
    db.prepare("DELETE FROM pm_bot_forward_rules WHERE id = ?").run(id);
    return c.json({ ok: true });
  });

