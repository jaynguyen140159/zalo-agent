import { renderStaticFetchInterceptorScript } from "./portal-static-mock.js";

export function renderPortalHtml(): string {
  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Khởi Minh Workspace // Điều Phối Dự Án & Google Drive AI</title>
  <link rel="icon" type="image/svg+xml" href="/favicon.svg">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;600&display=swap" rel="stylesheet">
  <style>
    :root {
      /* 1. MÀU NỀN (Background) */
      --bg-canvas: #F8FAFC;
      --bg-surface: #FFFFFF;

      /* 2. MÀU CHỦ ĐẠO (Primary) */
      --primary: #2563EB;
      --primary-hover: #1D4ED8;

      /* 3. MÀU MỜ PHỤ TRỢ (Auxiliary) */
      --aux-tint: #EFF6FF;
      --aux-muted: #F1F5F9;
      --border: #E2E8F0;
      --border-input: #CBD5E1;

      --text-main: #0F172A;
      --text-body: #334155;
      --text-muted: #64748B;
      --radius-lg: 12px;
      --radius-md: 8px;
      --shadow-sm: 0 1px 2px rgba(15, 23, 42, 0.04);
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
      background: var(--bg-canvas);
      color: var(--text-main);
      line-height: 1.5;
      -webkit-font-smoothing: antialiased;
    }

    /* LAYOUT SHELL */
    .app-shell {
      display: flex;
      min-height: 100vh;
    }

    .sidebar {
      width: 256px;
      background: var(--bg-surface);
      border-right: 1px solid var(--border);
      display: flex;
      flex-direction: column;
      position: fixed;
      top: 0;
      bottom: 0;
      left: 0;
      z-index: 40;
      transition: transform 0.2s ease;
    }

    .brand {
      padding: 20px 20px 16px;
      border-bottom: 1px solid var(--border);
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .brand-mark {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      background: var(--primary);
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      font-size: 16px;
      flex-shrink: 0;
    }

    .brand-title {
      font-size: 15px;
      font-weight: 700;
      color: var(--text-main);
      letter-spacing: -0.01em;
    }

    .brand-sub {
      font-size: 12px;
      color: var(--text-muted);
    }

    .nav-list {
      padding: 14px 12px;
      display: flex;
      flex-direction: column;
      gap: 4px;
      flex: 1;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 12px;
      border-radius: var(--radius-md);
      border: none;
      background: transparent;
      color: var(--text-body);
      font-family: inherit;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      text-align: left;
      transition: background 0.15s, color 0.15s;
      width: 100%;
    }

    .nav-item:hover {
      background: var(--aux-muted);
      color: var(--text-main);
    }

    .nav-item.active {
      background: var(--aux-tint);
      color: var(--primary);
    }

    .nav-icon {
      width: 20px;
      text-align: center;
      font-size: 15px;
    }

    .sidebar-footer {
      padding: 14px 16px;
      border-top: 1px solid var(--border);
      background: var(--bg-canvas);
      font-size: 12px;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .status-line {
      display: flex;
      align-items: center;
      justify-content: space-between;
      color: var(--text-muted);
    }

    .dot {
      display: inline-block;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      margin-right: 6px;
      background: #94A3B8;
    }
    .dot.on { background: #10B981; }
    .dot.warn { background: #F59E0B; }

    /* MAIN CONTENT */
    .main-area {
      flex: 1;
      margin-left: 256px;
      min-width: 0;
      display: flex;
      flex-direction: column;
    }

    .topbar {
      height: 64px;
      background: var(--bg-surface);
      border-bottom: 1px solid var(--border);
      padding: 0 28px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      position: sticky;
      top: 0;
      z-index: 30;
    }

    .topbar-left {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .menu-toggle {
      display: none;
      border: 1px solid var(--border);
      background: var(--bg-surface);
      border-radius: var(--radius-md);
      padding: 6px 10px;
      font-size: 16px;
      cursor: pointer;
    }

    .page-title {
      font-size: 18px;
      font-weight: 700;
      letter-spacing: -0.01em;
    }

    .topbar-actions {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .content-wrap {
      padding: 24px 28px 48px;
      max-width: 1440px;
      width: 100%;
    }

    /* PANELS & CARDS */
    .panel { display: none; }
    .panel.active { display: block; }

    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 16px;
      margin-bottom: 20px;
    }

    .kpi-card {
      background: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: 18px 20px;
      box-shadow: var(--shadow-sm);
    }

    .kpi-label {
      font-size: 13px;
      font-weight: 600;
      color: var(--text-muted);
      margin-bottom: 6px;
    }

    .kpi-val {
      font-size: 26px;
      font-weight: 800;
      color: var(--text-main);
      font-family: 'JetBrains Mono', monospace;
    }

    .kpi-sub {
      font-size: 12px;
      color: var(--primary);
      margin-top: 4px;
      font-weight: 500;
    }

    .card {
      background: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-sm);
      overflow: hidden;
      margin-bottom: 20px;
    }

    .card-header {
      padding: 16px 20px;
      border-bottom: 1px solid var(--border);
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
    }

    .card-title {
      font-size: 15px;
      font-weight: 700;
      color: var(--text-main);
    }

    .card-body {
      padding: 20px;
    }

    /* CONTROLS: BUTTONS & INPUTS */
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      height: 38px;
      padding: 0 14px;
      border-radius: var(--radius-md);
      border: 1px solid var(--border-input);
      background: var(--bg-surface);
      color: var(--text-main);
      font-family: inherit;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.15s;
      white-space: nowrap;
      text-decoration: none;
    }

    .btn:hover { background: var(--aux-muted); }
    .btn:disabled { opacity: 0.55; cursor: not-allowed; }

    .btn-primary {
      background: var(--primary);
      border-color: var(--primary);
      color: #fff;
    }
    .btn-primary:hover { background: var(--primary-hover); border-color: var(--primary-hover); }

    .btn-soft {
      background: var(--aux-tint);
      border-color: transparent;
      color: var(--primary);
    }
    .btn-soft:hover { background: #DBEAFE; }

    .btn-sm {
      height: 32px;
      padding: 0 10px;
      font-size: 12px;
    }

    .input, .select, .textarea {
      height: 38px;
      padding: 0 12px;
      border-radius: var(--radius-md);
      border: 1px solid var(--border-input);
      background: var(--bg-surface);
      color: var(--text-main);
      font-family: inherit;
      font-size: 13px;
      outline: none;
      transition: border-color 0.15s, box-shadow 0.15s;
    }

    .textarea {
      height: auto;
      padding: 10px 12px;
      resize: vertical;
      width: 100%;
    }

    .input:focus, .select:focus, .textarea:focus {
      border-color: var(--primary);
      box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.14);
    }

    .select {
      appearance: none;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2364748B' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 10px center;
      padding-right: 30px;
    }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 16px;
    }

    .field {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .field label {
      font-size: 13px;
      font-weight: 600;
      color: var(--text-body);
    }

    /* TABLES */
    .table-scroll {
      overflow-x: auto;
      width: 100%;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;
    }

    th {
      background: var(--aux-muted);
      color: var(--text-muted);
      font-weight: 700;
      font-size: 12px;
      text-align: left;
      padding: 10px 12px;
      border-bottom: 1px solid var(--border);
      white-space: nowrap;
    }

    td {
      padding: 10px 12px;
      border-bottom: 1px solid var(--border);
      vertical-align: middle;
    }

    tr:hover td {
      background: #FAFCFF;
    }

    .badge {
      display: inline-flex;
      align-items: center;
      padding: 3px 9px;
      border-radius: 999px;
      font-size: 11px;
      font-weight: 600;
      background: var(--aux-tint);
      color: var(--primary);
      white-space: nowrap;
    }
    .badge.done { background: #ECFDF5; color: #059669; }
    .badge.warn { background: #FFFBEB; color: #D97706; }
    .badge.err { background: #FEF2F2; color: #DC2626; }
    .badge.muted { background: var(--aux-muted); color: var(--text-muted); }

    /* WORK TRACKER GANTT */
    .wt-cell-input {
      width: 100%;
      border: 1px solid transparent;
      background: transparent;
      font-family: inherit;
      font-size: 13px;
      padding: 4px 6px;
      border-radius: 6px;
      color: var(--text-main);
    }
    .wt-cell-input:hover, .wt-cell-input:focus {
      border-color: var(--border-input);
      background: var(--bg-surface);
      outline: none;
    }
    .gantt-day {
      min-width: 24px;
      width: 24px;
      height: 28px;
      padding: 0 !important;
      text-align: center;
      border-left: 1px solid #F1F5F9;
      position: relative;
    }
    .gantt-day.today {
      background: #EFF6FF;
      border-left: 2px solid var(--primary);
    }
    .gantt-bar {
      height: 16px;
      width: 100%;
      border-radius: 3px;
      opacity: 0.9;
    }

    .member-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
    .member-chip {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 5px 10px;
      border-radius: 999px;
      background: var(--bg-surface);
      border: 1px solid var(--border);
      font-size: 12px;
      font-weight: 600;
    }
    .member-swatch {
      width: 10px;
      height: 10px;
      border-radius: 50%;
    }

    /* KANBAN DRAG & DROP */
    .kanban-board {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 16px;
      padding: 20px;
    }
    .kanban-col {
      background: var(--bg-canvas);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: 12px;
      min-height: 260px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      transition: border-color 0.15s, background 0.15s;
    }
    .kanban-col.drag-over {
      border-color: var(--primary);
      background: var(--aux-tint);
    }
    .kanban-col-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 4px 4px 8px;
      font-size: 13px;
      font-weight: 700;
      color: var(--text-main);
    }
    .kanban-card {
      background: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      padding: 12px 14px;
      box-shadow: var(--shadow-sm);
      cursor: grab;
      transition: transform 0.12s, box-shadow 0.12s;
    }
    .kanban-card:active { cursor: grabbing; }
    .kanban-card.dragging { opacity: 0.5; transform: scale(0.98); }
    .progress-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 11.5px;
      font-weight: 600;
      color: var(--text-body);
      margin-bottom: 4px;
    }
    .progress-track {
      width: 100%;
      height: 8px;
      background: #E2E8F0;
      border-radius: 999px;
      overflow: hidden;
    }
    .progress-fill {
      height: 100%;
      border-radius: 999px;
      background: var(--primary);
      transition: width 0.25s ease;
    }
    .progress-fill.done {
      background: #10B981;
    }
    .cl-box {
      margin: 8px 0 10px;
      padding: 8px 10px;
      background: var(--bg-canvas);
      border: 1px solid var(--border);
      border-radius: 8px;
      display: flex;
      flex-direction: column;
      gap: 5px;
    }
    .cl-item {
      display: flex;
      align-items: flex-start;
      gap: 6px;
      font-size: 11.5px;
      color: var(--text-body);
      cursor: pointer;
    }
    .cl-item.done {
      color: #059669;
      text-decoration: line-through;
    }
    .cl-item.cancelled {
      color: #94A3B8;
      text-decoration: line-through;
    }
    .cl-cancel-badge {
      font-size: 10px;
      padding: 1px 6px;
      border-radius: 999px;
      background: #FEF2F2;
      color: #DC2626;
      font-weight: 600;
      margin-left: auto;
      flex-shrink: 0;
      text-decoration: none;
      display: inline-block;
    }
    .cl-report {
      font-size: 11px;
      color: var(--primary);
      background: var(--aux-tint);
      border-radius: 6px;
      padding: 5px 8px;
      margin-bottom: 8px;
      line-height: 1.4;
    }
    @media (max-width: 960px) {
      .kanban-board { grid-template-columns: 1fr; }
    }

    /* KM GIFT SLA FLOW STRIP */
    .sla-bar {
      padding: 16px 20px;
      background: var(--aux-tint);
      border-bottom: 1px solid var(--border);
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .sla-controls {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
    }
    .sla-strip {
      display: flex;
      gap: 8px;
      overflow-x: auto;
      padding-bottom: 4px;
    }
    .sla-node {
      min-width: 158px;
      background: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      padding: 10px 12px;
      flex-shrink: 0;
    }
    .sla-node.anchor {
      border-color: var(--primary);
      box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.12);
    }
    .sla-node-title {
      font-size: 12.5px;
      font-weight: 700;
      color: var(--text-main);
      margin-bottom: 4px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .sla-node-dates {
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      color: var(--primary);
      font-weight: 600;
      margin-bottom: 6px;
    }
    .sla-days-row {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 11px;
      color: var(--text-muted);
    }
    .sla-days-input {
      width: 48px;
      height: 24px;
      padding: 0 6px;
      border: 1px solid var(--border-input);
      border-radius: 6px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 11.5px;
      text-align: center;
    }

    /* TOAST */
    .toast-box {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 100;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .toast {
      background: var(--text-main);
      color: #fff;
      padding: 12px 16px;
      border-radius: var(--radius-md);
      font-size: 13px;
      font-weight: 500;
      box-shadow: 0 10px 25px rgba(15, 23, 42, 0.18);
      max-width: 380px;
    }
    .toast.err { background: #DC2626; }
    .toast.ok { background: #0F172A; border-left: 4px solid var(--primary); }

    /* PRINT A4 LANDSCAPE */
    @media print {
      @page { size: A4 landscape; margin: 10mm; }
      .sidebar, .topbar, .no-print { display: none !important; }
      .main-area { margin-left: 0 !important; }
      .content-wrap { padding: 0 !important; }
      .card { border: none !important; box-shadow: none !important; }
      body { background: #fff !important; }
    }

    @media (max-width: 960px) {
      .sidebar { transform: translateX(-100%); }
      .sidebar.open { transform: translateX(0); box-shadow: 0 20px 40px rgba(0,0,0,0.15); }
      .main-area { margin-left: 0; }
      .menu-toggle { display: inline-flex; }
      .kpi-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      .form-grid { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>
  <div class="app-shell">
    <aside class="sidebar" id="sidebar">
      <div class="brand">
        <div class="brand-mark">KM</div>
        <div>
          <div class="brand-title">Khởi Minh Workspace</div>
          <div class="brand-sub">Điều phối &amp; Drive AI</div>
        </div>
      </div>

      <nav class="nav-list">
        <button class="nav-item active" data-tab="projects" data-bu="KM Gift" onclick="openBusinessUnit('KM Gift')">
          <span class="nav-icon">🎁</span> Dự án Khởi Minh Gift
        </button>
        <button class="nav-item" data-tab="projects" data-bu="KM Brand" onclick="openBusinessUnit('KM Brand')">
          <span class="nav-icon">✨</span> Dự án KM Brand
        </button>
        <button class="nav-item" data-tab="projects" data-bu="Homeplanner" onclick="openBusinessUnit('Homeplanner')">
          <span class="nav-icon">🏠</span> Dự án Homeplanner
        </button>
        <button class="nav-item" data-tab="customers" onclick="switchTab('customers')">
          <span class="nav-icon">💰</span> Khách hàng &amp; Lợi Nhuận
        </button>
        <button class="nav-item" data-tab="tracker" onclick="switchTab('tracker')">
          <span class="nav-icon">📊</span> Theo dõi tiến độ chung
        </button>
        <button class="nav-item" data-tab="drive" onclick="switchTab('drive')">
          <span class="nav-icon">📁</span> Kho tài liệu &amp; Drive
        </button>
        <button class="nav-item admin-only" id="nav-admin-mention" data-tab="mention" style="display:none;" onclick="switchTab('mention')">
          <span class="nav-icon">🔔</span> Nhắc việc &amp; Gửi tin Bot
        </button>
        <button class="nav-item admin-only" id="nav-admin-settings" data-tab="settings" style="display:none;" onclick="switchTab('settings')">
          <span class="nav-icon">🤖</span> Quản lý Zalo Bot &amp; Kết nối
        </button>
      </nav>

      <div class="sidebar-footer admin-only" id="sidebar-admin-footer" style="display:none;">
        <div class="status-line" style="cursor:pointer;" title="Bấm để mở phần Quét mã QR Zalo Cá Nhân" onclick="switchTab('settings')">
          <span><span class="dot" id="dot-zalo"></span>Zalo cá nhân</span>
          <strong id="lbl-zalo">Đang kiểm tra...</strong>
        </div>
        <div class="status-line">
          <span><span class="dot" id="dot-drive"></span>Google Drive</span>
          <strong id="lbl-drive">Đang kiểm tra...</strong>
        </div>
      </div>
    </aside>

    <main class="main-area">
      <header class="topbar">
        <div class="topbar-left">
          <button class="menu-toggle" onclick="document.getElementById('sidebar').classList.toggle('open')">☰</button>
          <h1 class="page-title" id="topbar-title">Dự án Khởi Minh Gift</h1>
        </div>
        <div class="topbar-actions" id="topbar-actions">
          <button class="btn btn-soft" id="btn-admin-auth" onclick="openAdminLoginModal()">🔐 Đăng nhập Admin</button>
          <a href="/zalo-agent/presentation/" onclick="window.open(location.hostname.indexOf('github.io') !== -1 ? '/zalo-agent/presentation/' : '/portal/pitch', '_blank'); return false;" class="btn btn-soft">📽️ Xem Slide</a>
          <button class="btn btn-primary" onclick="window.print()">🖨️ Xuất PDF / In</button>
        </div>
      </header>

      <div class="content-wrap">
        <!-- TAB 0: DỰ ÁN KHỞI MINH GIFT / HOMEPLANNER (2 CẤP: TỔNG HỢP -> CHI TIẾT DỰ ÁN) -->
        <section class="panel active" id="panel-projects">
          <input type="hidden" id="filter-bu" value="KM Gift">

          <!-- CẤP 1: BẢNG TỔNG HỢP CÁC DỰ ÁN -->
          <div id="projects-master-view">
            <div class="kpi-grid">
              <div class="kpi-card">
                <div class="kpi-label">Số dự án đang quản lý</div>
                <div class="kpi-val" id="bu-kpi-count">0</div>
                <div class="kpi-sub" id="bu-kpi-label">Khởi Minh Gift</div>
              </div>
              <div class="kpi-card">
                <div class="kpi-label">Tổng Doanh thu (Chưa VAT)</div>
                <div class="kpi-val" id="bu-kpi-quote" style="font-size:20px; color:var(--primary);">0 ₫</div>
                <div class="kpi-sub">Tổng thành tiền báo khách</div>
              </div>
              <div class="kpi-card">
                <div class="kpi-label">Tổng Chi phí (Gồm VAT/TNCN)</div>
                <div class="kpi-val" id="bu-kpi-cost" style="font-size:20px;">0 ₫</div>
                <div class="kpi-sub">Chi phí NCC / Freelancer đã gồm thuế</div>
              </div>
              <div class="kpi-card">
                <div class="kpi-label">Lợi nhuận ròng dự kiến</div>
                <div class="kpi-val" id="bu-kpi-profit" style="font-size:20px; color:#059669;">0 ₫</div>
                <div class="kpi-sub">= Doanh thu - Thuế GTGT (8%) - Chi phí</div>
              </div>
            </div>

            <div class="card">
              <div class="card-header">
                <div>
                  <div class="card-title" id="master-bu-title">Bảng Tổng Hợp Dự Án — Khởi Minh Gift</div>
                  <div style="font-size:12px; color:var(--text-muted); margin-top:2px;">
                    Bấm vào một dự án bất kỳ để mở công cụ tính SLA xuôi, quản lý chứng từ &amp; lập báo giá gửi khách.
                  </div>
                </div>
                <div style="display:flex; gap:8px; flex-wrap:wrap; align-items:center;">
                  <button class="btn btn-primary btn-sm" onclick="toggleKmGiftCreator()">+ Tạo Dự án mới (Auto SLA)</button>
                </div>
              </div>
              <div id="km-gift-creator" style="display:none; padding:16px 20px; background:var(--aux-tint); border-bottom:1px solid var(--border);">
                <div style="font-size:13px; font-weight:700; color:var(--text-main); margin-bottom:10px;">Khởi tạo Dự án mới theo quy trình chuẩn</div>
                <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(190px, 1fr)); gap:10px; align-items:end;">
                  <div class="field">
                    <label>Tên dự án / Khách hàng</label>
                    <input class="input" id="new-km-name" placeholder="VD: Quà tặng Công ty ABC">
                  </div>
                  <div class="field">
                    <label>Mảng kinh doanh</label>
                    <select class="select" id="new-km-bu">
                      <option value="KM Gift">Khởi Minh Gift</option>
                      <option value="KM Brand">KM Brand</option>
                      <option value="Homeplanner">Homeplanner</option>
                    </select>
                  </div>
                  <div class="field">
                    <label>Khách hàng (Gom nhiều dự án)</label>
                    <select class="select" id="new-km-customer">
                      <option value="">-- Tự tạo theo tên dự án --</option>
                    </select>
                  </div>
                  <div class="field">
                    <label>Loại sản phẩm (Nhánh quy trình)</label>
                    <select class="select" id="new-km-flow">
                      <option value="customised">Không có sẵn / Customised (9 bước)</option>
                      <option value="ready_stock">Hàng có sẵn (5 bước)</option>
                    </select>
                  </div>
                  <div class="field">
                    <label>Ngày bắt đầu / Mốc tính SLA</label>
                    <input class="input" type="date" id="new-km-deposit" value="2026-11-10">
                  </div>
                  <div style="display:flex; gap:8px;">
                    <button class="btn btn-primary" onclick="createKmGiftProject()">Tạo &amp; Tính SLA</button>
                    <button class="btn" onclick="toggleKmGiftCreator()">Đóng</button>
                  </div>
                </div>
              </div>
              <div class="table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th style="width:42px;">STT</th>
                      <th style="min-width:130px;">Mã Hợp đồng</th>
                      <th style="min-width:190px;">Khách hàng / Dự án</th>
                      <th style="min-width:130px;">Mảng KD</th>
                      <th style="min-width:240px;">Hạng mục triển khai</th>
                      <th style="min-width:150px;">Freelancer / NCC</th>
                      <th>Mốc SLA &amp; Luồng</th>
                      <th style="text-align:right;">Tổng Chi phí</th>
                      <th style="text-align:right;">Tổng Doanh thu</th>
                      <th style="text-align:right;">Lợi nhuận (Sau VAT)</th>
                      <th>Tiến độ</th>
                      <th>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody id="master-projects-tbody">
                    <tr><td colspan="12" style="text-align:center; color:var(--text-muted); padding:28px;">Đang tải bảng tổng hợp dự án...</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <!-- CẤP 2: CHI TIẾT 1 DỰ ÁN CỤ THỂ (SLA + CHI PHÍ & BÁO GIÁ) -->
          <div id="project-detail-view" style="display:none;">
            <div style="margin-bottom:14px; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:10px;">
              <button class="btn btn-sm" onclick="backToMasterProjects()">← Quay lại Bảng Tổng Hợp Dự Án</button>
              <div style="display:flex; gap:8px; align-items:center; flex-wrap:wrap;">
                <select class="select" id="detail-customer-select" style="height:32px; font-size:12px;" title="Khách hàng sở hữu dự án này" onchange="changeProjectCustomer(activeProjectId, this.value)">
                  <option value="">-- Chưa gắn Khách hàng --</option>
                </select>
                <select class="select" id="detail-bu-select" style="height:32px; font-size:12px; font-weight:700;" title="Đổi mảng dự án (KM Gift ↔ KM Brand ↔ Homeplanner)" onchange="changeProjectBusinessUnit(activeProjectId, this.value)">
                  <option value="KM Gift">🎁 Khởi Minh Gift</option>
                  <option value="KM Brand">✨ KM Brand</option>
                  <option value="Homeplanner">🏠 Homeplanner</option>
                </select>
              </div>
            </div>

            <div class="card">
              <div class="card-header">
                <div>
                  <div class="card-title" id="active-project-title">Chi tiết dự án</div>
                  <div style="font-size:12px; color:var(--text-muted); margin-top:2px;" id="active-project-meta"></div>
                </div>
                <div style="display:flex; gap:8px; flex-wrap:wrap;">
                  <button class="btn btn-soft btn-sm" id="btn-view-costs" onclick="setProjectView('costs')">💰 1. Chi phí &amp; Báo giá</button>
                  <button class="btn btn-sm" id="btn-view-stages" onclick="setProjectView('stages')">⏱️ 2. SLA &amp; Giai đoạn</button>
                  <button class="btn btn-sm" id="btn-view-kanban" onclick="setProjectView('kanban')">📊 Theo Trạng thái</button>
                  <button class="btn btn-sm" id="btn-view-table" onclick="setProjectView('table')">📋 Bảng đầu việc</button>
                  <button class="btn btn-soft btn-sm" onclick="createNewStage()">+ Thêm giai đoạn</button>
                  <button class="btn btn-primary btn-sm" onclick="createNewProjectTask()">+ Giao việc mới</button>
                </div>
              </div>
            <div id="project-sla-bar" class="sla-bar" style="display:none;">
              <div class="sla-controls">
                <div style="display:flex; align-items:center; gap:10px; flex-wrap:wrap;">
                  <span style="font-size:13px; font-weight:700; color:var(--text-main);">📅 Ngày bắt đầu / Mốc tính SLA (Tính xuôi):</span>
                  <input type="date" class="input" id="sla-deposit-date" style="height:34px; width:150px;" onchange="recalculateProjectSla()">
                  <span id="sla-flow-badge" class="badge"></span>
                </div>
                <button class="btn btn-primary btn-sm" onclick="recalculateProjectSla()">⚡ Tính lại SLA xuôi về sau</button>
              </div>
              <div class="sla-strip" id="sla-strip"></div>
            </div>
            <div id="project-kanban-view" class="kanban-board"></div>
            <div id="project-table-view" class="table-scroll" style="display:none;">
              <table>
                <thead>
                  <tr>
                    <th>Công việc</th>
                    <th>Giai đoạn</th>
                    <th>Phụ trách</th>
                    <th>Hạn chót</th>
                    <th>Tiến độ</th>
                    <th>Trạng thái</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody id="project-tasks-tbody">
                  <tr><td colspan="7" style="text-align:center; color:var(--text-muted); padding:24px;">Đang tải công việc...</td></tr>
                </tbody>
              </table>
            </div>
            <div id="project-costs-view" style="display:none; padding:20px;">
              <div class="kpi-grid" style="margin-bottom:16px;">
                <div class="kpi-card">
                  <div class="kpi-label">Tổng Chi phí (Gồm VAT/TNCN)</div>
                  <div class="kpi-val" id="cost-kpi-total" style="font-size:20px;">0 ₫</div>
                  <div class="kpi-sub">Chi phí NCC / Xưởng / Freelancer</div>
                </div>
                <div class="kpi-card">
                  <div class="kpi-label">Tổng Doanh thu (Chưa VAT)</div>
                  <div class="kpi-val" id="cost-kpi-quote" style="font-size:20px; color:var(--primary);">0 ₫</div>
                  <div class="kpi-sub">Tổng thành tiền báo khách</div>
                </div>
                <div class="kpi-card">
                  <div class="kpi-label">Thuế GTGT &amp; Tổng thu</div>
                  <div class="kpi-val" id="cost-kpi-vat" style="font-size:20px;">0 ₫</div>
                  <div class="kpi-sub" id="cost-kpi-vat-sub">VAT 8%: 0 ₫</div>
                </div>
                <div class="kpi-card">
                  <div class="kpi-label">Lợi nhuận ròng dự kiến</div>
                  <div class="kpi-val" id="cost-kpi-profit" style="font-size:20px; color:#059669;">0 ₫</div>
                  <div class="kpi-sub" id="cost-kpi-margin">= Doanh thu - VAT - Chi phí</div>
                </div>
              </div>

              <div style="background:var(--aux-tint); border:1px solid var(--border); border-radius:10px; padding:16px; margin-bottom:16px;">
                <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; margin-bottom:12px;">
                  <div style="font-size:14px; font-weight:700; color:var(--text-main);">Thông tin Khách hàng, Hợp đồng &amp; Cấu hình Báo giá (Tự động lưu)</div>
                  <div style="display:flex; gap:8px; flex-wrap:wrap;">
                    <button class="btn btn-soft btn-sm" onclick="downloadQuotationDoc()">💾 Lưu file Báo Giá (.doc)</button>
                    <button class="btn btn-primary btn-sm" onclick="openPrintableQuotation()">📄 Xem &amp; In PDF Báo Giá</button>
                  </div>
                </div>
                <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(175px, 1fr)); gap:10px; align-items:end; margin-bottom:12px;">
                  <div class="field">
                    <label>Mã Hợp đồng dự án</label>
                    <input class="input" id="q-contract-code" placeholder="VD: 01/2026/HĐKT-KM" onchange="saveQuotationMeta(false)">
                  </div>
                  <div class="field">
                    <label>Tên doanh nghiệp (Khách hàng)</label>
                    <input class="input" id="q-cust-name" placeholder="VD: Công ty TNHH ABC / ĐHQG" onchange="saveQuotationMeta(false)">
                  </div>
                  <div class="field">
                    <label>Mã số thuế (MST)</label>
                    <input class="input" id="q-cust-tax" placeholder="VD: 0109xxxxxx" onchange="saveQuotationMeta(false)">
                  </div>
                  <div class="field">
                    <label>Họ và tên đại diện</label>
                    <input class="input" id="q-contact-name" placeholder="VD: Anh Long" onchange="saveQuotationMeta(false)">
                  </div>
                  <div class="field">
                    <label>Số điện thoại (SĐT)</label>
                    <input class="input" id="q-contact-phone" placeholder="VD: 0909xxxxxx" onchange="saveQuotationMeta(false)">
                  </div>
                  <div class="field">
                    <label>Tệp khách hàng</label>
                    <select class="select" id="q-client-tier" onchange="applyTierPreset(); saveQuotationMeta(false);">
                      <option value="Khách lẻ">Khách lẻ (Hệ số x1.7)</option>
                      <option value="Doanh nghiệp">Doanh nghiệp (Hệ số x1.5)</option>
                      <option value="Đối tác / Đại lý">Đối tác / Đại lý (Hệ số x1.35)</option>
                      <option value="VIP / Chuỗi">VIP / Chuỗi (Hệ số x1.6)</option>
                    </select>
                  </div>
                  <div class="field">
                    <label>Hệ số chung (Markup)</label>
                    <div style="display:flex; gap:6px;">
                      <input class="input" type="number" step="0.05" min="1" id="q-default-markup" value="1.5" style="width:76px;" onchange="saveQuotationMeta(false)">
                      <button class="btn btn-soft btn-sm" style="height:38px;" onclick="saveQuotationMeta(true)">Áp dụng tất cả</button>
                    </div>
                  </div>
                  <div class="field">
                    <label>VAT (%)</label>
                    <input class="input" type="number" step="1" min="0" max="20" id="q-vat-percent" value="8" style="width:76px;" onchange="saveQuotationMeta(false)">
                  </div>
                  <div class="field">
                    <label>Dạng hiển thị báo giá</label>
                    <select class="select" id="q-display-mode" onchange="saveQuotationMeta(false)">
                      <option value="selected">Chỉ báo giá các hạng mục đã chọn</option>
                      <option value="all">Hiển thị tất cả các hạng mục</option>
                      <option value="hidden">Báo giá ẩn chi tiết (Gộp gói)</option>
                    </select>
                  </div>
                </div>
                <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(240px, 1fr)); gap:10px; padding-top:10px; border-top:1px dashed var(--border);">
                  <div class="field">
                    <label>Điều khoản thanh toán (hiện trên Báo giá)</label>
                    <textarea class="textarea" id="q-payment-terms" rows="2" placeholder="VD: Tạm ứng 50% sau khi ký HĐ, 50% sau bàn giao..." onchange="saveQuotationMeta(false)"></textarea>
                  </div>
                  <div class="field">
                    <label>Thông tin STK &amp; Ngân hàng thanh toán</label>
                    <textarea class="textarea" id="q-bank-info" rows="2" placeholder="Chủ TK / Số tài khoản / Ngân hàng..." onchange="saveQuotationMeta(false)"></textarea>
                  </div>
                  <div class="field">
                    <label>Mã QR thanh toán (Link ảnh hoặc tải ảnh QR lên)</label>
                    <div style="display:flex; gap:6px; align-items:center;">
                      <input class="input" id="q-bank-qr-url" placeholder="Dán link ảnh QR hoặc tải file..." onchange="saveQuotationMeta(false)">
                      <label class="btn btn-soft btn-sm" style="cursor:pointer; margin:0; white-space:nowrap;">
                        📷 Ảnh QR
                        <input type="file" accept="image/*" style="display:none;" onchange="uploadBankQrFile(this)">
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; flex-wrap:wrap; gap:8px;">
                <div>
                  <div style="font-size:14px; font-weight:700;">Chi tiết Chi phí từng Hạng mục &amp; Chứng từ (Đã gồm VAT/Thuế TNCN)</div>
                  <div id="cost-quote-selection-pill" style="font-size:12px; color:var(--primary); font-weight:600; margin-top:2px;"></div>
                </div>
                <div style="display:flex; gap:6px; flex-wrap:wrap; align-items:center;">
                  <button type="button" class="btn btn-soft btn-sm" onclick="toggleAllCostsInQuote(true)" title="Chọn tất cả hạng mục vào Báo giá">☑ Chọn tất cả BG</button>
                  <button type="button" class="btn btn-soft btn-sm" onclick="toggleAllCostsInQuote(false)" title="Bỏ chọn tất cả hạng mục">☐ Bỏ chọn hết</button>
                  <button class="btn btn-primary btn-sm" onclick="toggleCostCreator()">+ Thêm khoản chi / Hạng mục</button>
                </div>
              </div>
              <div id="cost-creator-box" style="display:none; background:var(--aux-tint); border:1px solid var(--border); border-radius:10px; padding:14px; margin-bottom:12px;">
                <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(160px, 1fr)); gap:10px; align-items:end;">
                  <div class="field" style="grid-column: span 2;">
                    <label>Tên hạng mục &amp; Quy cách (*)</label>
                    <input class="input" id="new-cost-name" placeholder="VD: In ấn hộp quà cứng + ép kim logo">
                  </div>
                  <div class="field">
                    <label>Freelancer / NCC</label>
                    <input class="input" id="new-cost-vendor" placeholder="VD: Xưởng in / Anh Huy">
                  </div>
                  <div class="field">
                    <label>Chi phí (VND) (Đã gồm VAT/TNCN)</label>
                    <input class="input" id="new-cost-amount" inputmode="numeric" placeholder="VD: 1.000.000" oninput="formatVndInputLive(this)">
                  </div>
                  <div class="field">
                    <label>Số lượng</label>
                    <input class="input" type="number" min="1" id="new-cost-qty" value="1">
                  </div>
                  <div class="field">
                    <label>Số Hợp đồng / Hóa đơn</label>
                    <input class="input" id="new-cost-contract" placeholder="VD: 01/2026/HĐKV">
                  </div>
                  <div class="field">
                    <label>Chứng từ (.docx/.pdf/.xlsx)</label>
                    <input class="input" type="file" id="new-cost-file" accept=".docx,.doc,.pdf,.xlsx,.xls" style="padding:5px;">
                  </div>
                  <div class="field">
                    <label>Ảnh sản phẩm (Hiển thị trên Báo giá)</label>
                    <input class="input" id="new-cost-image-url" placeholder="Dán link ảnh hoặc chọn file..." style="margin-bottom:4px;">
                    <input class="input" type="file" id="new-cost-image-file" accept="image/*" style="padding:5px;">
                  </div>
                  <div style="display:flex; gap:6px;">
                    <button class="btn btn-primary btn-sm" onclick="submitNewCostItem()">Lưu hạng mục</button>
                    <button class="btn btn-sm" onclick="toggleCostCreator()">Đóng</button>
                  </div>
                </div>
              </div>
              <div class="table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th style="width:68px; text-align:center;" title="Tick để chọn sản phẩm/hạng mục đưa vào file Báo giá"><label style="display:flex; flex-direction:column; align-items:center; gap:2px; cursor:pointer; font-size:11px; margin:0;"><span>Báo giá</span><input type="checkbox" id="chk-all-costs-quote" onchange="toggleAllCostsInQuote(this.checked)"></label></th>
                      <th>Giai đoạn</th>
                      <th style="min-width:128px;">Ảnh SP (Báo giá)</th>
                      <th style="min-width:240px;">Hạng mục &amp; Quy cách (Hiển thị đầy đủ)</th>
                      <th>Freelancer / NCC</th>
                      <th>SLA (ngày)</th>
                      <th>Chi phí (VND)<br><span style="font-weight:400; font-size:10px; color:var(--text-muted);">(Gồm VAT/TNCN)</span></th>
                      <th>SL</th>
                      <th>Hệ số</th>
                      <th>Đơn giá báo khách</th>
                      <th>Thành tiền</th>
                      <th style="min-width:170px;">HĐ / Hóa đơn chứng từ</th>
                      <th>Trạng thái</th>
                      <th>Xóa</th>
                    </tr>
                  </thead>
                  <tbody id="project-costs-tbody">
                    <tr><td colspan="14" style="text-align:center; color:var(--text-muted); padding:20px;">Đang tải bảng chi phí...</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          </div>
        </section>

        <!-- TAB: KHÁCH HÀNG & TÍNH LỢI NHUẬN TỪNG DỰ ÁN (KM GIFT ↔ KM BRAND ↔ HOMEPLANNER) -->
        <section class="panel" id="panel-customers">
          <div id="customers-master-view">
            <div class="kpi-grid">
              <div class="kpi-card">
                <div class="kpi-label">Số Khách hàng</div>
                <div class="kpi-val" id="cust-kpi-count">0</div>
                <div class="kpi-sub" id="cust-kpi-filter-lbl">Tất cả các mảng</div>
              </div>
              <div class="kpi-card">
                <div class="kpi-label">Tổng Doanh thu (Chưa VAT)</div>
                <div class="kpi-val" id="cust-kpi-rev" style="font-size:20px; color:var(--primary);">0 ₫</div>
                <div class="kpi-sub">Cộng gộp mọi dự án của khách</div>
              </div>
              <div class="kpi-card">
                <div class="kpi-label">Tổng Chi phí (Gồm VAT/TNCN)</div>
                <div class="kpi-val" id="cust-kpi-cost" style="font-size:20px;">0 ₫</div>
                <div class="kpi-sub">Tổng chi phí triển khai</div>
              </div>
              <div class="kpi-card">
                <div class="kpi-label">Lợi nhuận ròng dự kiến</div>
                <div class="kpi-val" id="cust-kpi-profit" style="font-size:20px; color:#059669;">0 ₫</div>
                <div class="kpi-sub">= Doanh thu - Thuế VAT - Chi phí</div>
              </div>
            </div>

            <div class="card">
              <div class="card-header">
                <div>
                  <div class="card-title">Tổng hợp Lợi nhuận theo Khách hàng (Gồm nhiều dự án KM Gift / KM Brand)</div>
                  <div style="font-size:12px; color:var(--text-muted); margin-top:2px;">
                    Bấm vào một Khách hàng để xem &amp; tính lợi nhuận riêng lẻ từng dự án, thêm dự án mới hoặc đổi mảng giữa <strong>KM Gift</strong> và <strong>KM Brand</strong>.
                  </div>
                </div>
                <div style="display:flex; gap:8px; flex-wrap:wrap; align-items:center;">
                  <div style="display:inline-flex; gap:4px; background:var(--aux-muted); padding:3px; border-radius:8px;">
                    <button class="btn btn-sm btn-soft cust-bu-pill" data-bu="ALL" onclick="setCustomerBuFilter('ALL')">Tất cả</button>
                    <button class="btn btn-sm cust-bu-pill" data-bu="KM Gift" onclick="setCustomerBuFilter('KM Gift')">🎁 KM Gift</button>
                    <button class="btn btn-sm cust-bu-pill" data-bu="KM Brand" onclick="setCustomerBuFilter('KM Brand')">✨ KM Brand</button>
                    <button class="btn btn-sm cust-bu-pill" data-bu="Homeplanner" onclick="setCustomerBuFilter('Homeplanner')">🏠 Homeplanner</button>
                  </div>
                  <button class="btn btn-primary btn-sm" onclick="toggleCustomerCreator()">+ Thêm Khách hàng mới</button>
                </div>
              </div>

              <div id="customer-creator-box" style="display:none; padding:16px 20px; background:var(--aux-tint); border-bottom:1px solid var(--border);">
                <div style="font-size:13px; font-weight:700; margin-bottom:10px;">Thêm Khách hàng mới</div>
                <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(175px, 1fr)); gap:10px; align-items:end;">
                  <div class="field">
                    <label>Tên khách hàng / Doanh nghiệp (*)</label>
                    <input class="input" id="new-cust-name" placeholder="VD: Tập đoàn ABC">
                  </div>
                  <div class="field">
                    <label>Mã số thuế (MST)</label>
                    <input class="input" id="new-cust-tax" placeholder="VD: 0109xxxxxx">
                  </div>
                  <div class="field">
                    <label>Người đại diện</label>
                    <input class="input" id="new-cust-contact" placeholder="VD: Anh Minh">
                  </div>
                  <div class="field">
                    <label>Số điện thoại</label>
                    <input class="input" id="new-cust-phone" placeholder="VD: 0909xxxxxx">
                  </div>
                  <div class="field">
                    <label>Ghi chú</label>
                    <input class="input" id="new-cust-notes" placeholder="VD: Khách VIP dùng cả Gift & Brand">
                  </div>
                  <div style="display:flex; gap:6px;">
                    <button class="btn btn-primary" onclick="createCustomer()">Lưu Khách hàng</button>
                    <button class="btn" onclick="toggleCustomerCreator()">Đóng</button>
                  </div>
                </div>
              </div>

              <div class="table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th style="width:42px;">STT</th>
                      <th style="min-width:200px;">Khách hàng / Doanh nghiệp</th>
                      <th>MST &amp; Đại diện</th>
                      <th style="min-width:170px;">Dự án theo Mảng</th>
                      <th style="text-align:right;">Tổng Doanh thu</th>
                      <th style="text-align:right;">Thuế VAT</th>
                      <th style="text-align:right;">Tổng Chi phí</th>
                      <th style="text-align:right;">Tổng Lợi nhuận</th>
                      <th style="text-align:center;">Biên LN</th>
                      <th>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody id="customers-master-tbody">
                    <tr><td colspan="10" style="text-align:center; color:var(--text-muted); padding:28px;">Đang tải danh sách khách hàng...</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <!-- CẤP 2: CHI TIẾT KHÁCH HÀNG -> TÍNH LỢI NHUẬN TỪNG DỰ ÁN & ĐỔI MẢNG -->
          <div id="customer-detail-view" style="display:none;">
            <div style="margin-bottom:14px; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:10px;">
              <button class="btn btn-sm" onclick="backToCustomersMaster()">← Quay lại Danh sách Khách hàng</button>
              <div style="display:flex; gap:8px; align-items:center; flex-wrap:wrap;">
                <div style="display:inline-flex; gap:4px; background:var(--aux-muted); padding:3px; border-radius:8px;">
                  <button class="btn btn-sm btn-soft cust-det-bu-pill" data-bu="ALL" onclick="setCustomerDetailBuFilter('ALL')">Tất cả</button>
                  <button class="btn btn-sm cust-det-bu-pill" data-bu="KM Gift" onclick="setCustomerDetailBuFilter('KM Gift')">🎁 KM Gift</button>
                  <button class="btn btn-sm cust-det-bu-pill" data-bu="KM Brand" onclick="setCustomerDetailBuFilter('KM Brand')">✨ KM Brand</button>
                  <button class="btn btn-sm cust-det-bu-pill" data-bu="Homeplanner" onclick="setCustomerDetailBuFilter('Homeplanner')">🏠 Homeplanner</button>
                </div>
                <button class="btn btn-sm" style="color:#DC2626;" onclick="deleteActiveCustomer()">🗑 Xoá khách</button>
              </div>
            </div>

            <div class="card">
              <div class="card-header">
                <div>
                  <div class="card-title" id="cust-detail-title">Khách hàng</div>
                  <div style="font-size:12px; color:var(--text-muted); margin-top:2px;">
                    Chỉnh sửa thông tin khách hàng (Tự động lưu sang các dự án liên kết)
                  </div>
                </div>
              </div>
              <div class="card-body">
                <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(175px, 1fr)); gap:10px; margin-bottom:16px;">
                  <div class="field">
                    <label>Tên khách hàng / Doanh nghiệp</label>
                    <input class="input" id="cust-edit-name" onchange="saveActiveCustomerMeta()">
                  </div>
                  <div class="field">
                    <label>Mã số thuế (MST)</label>
                    <input class="input" id="cust-edit-tax" onchange="saveActiveCustomerMeta()">
                  </div>
                  <div class="field">
                    <label>Họ tên đại diện</label>
                    <input class="input" id="cust-edit-contact" onchange="saveActiveCustomerMeta()">
                  </div>
                  <div class="field">
                    <label>Số điện thoại</label>
                    <input class="input" id="cust-edit-phone" onchange="saveActiveCustomerMeta()">
                  </div>
                  <div class="field">
                    <label>Ghi chú</label>
                    <input class="input" id="cust-edit-notes" onchange="saveActiveCustomerMeta()">
                  </div>
                </div>

                <div class="kpi-grid" style="margin-bottom:0;">
                  <div class="kpi-card">
                    <div class="kpi-label">Số Dự án của khách</div>
                    <div class="kpi-val" id="cust-det-count">0</div>
                    <div class="kpi-sub" id="cust-det-bu-sub">Mọi mảng</div>
                  </div>
                  <div class="kpi-card">
                    <div class="kpi-label">Tổng Doanh thu (Chưa VAT)</div>
                    <div class="kpi-val" id="cust-det-rev" style="font-size:20px; color:var(--primary);">0 ₫</div>
                    <div class="kpi-sub">Tổng thành tiền báo giá</div>
                  </div>
                  <div class="kpi-card">
                    <div class="kpi-label">Tổng Chi phí (Gồm VAT/TNCN)</div>
                    <div class="kpi-val" id="cust-det-cost" style="font-size:20px;">0 ₫</div>
                    <div class="kpi-sub">Chi phí các dự án</div>
                  </div>
                  <div class="kpi-card">
                    <div class="kpi-label">Tổng Lợi nhuận ròng</div>
                    <div class="kpi-val" id="cust-det-profit" style="font-size:20px; color:#059669;">0 ₫</div>
                    <div class="kpi-sub" id="cust-det-margin">Biên LN: 0%</div>
                  </div>
                </div>
              </div>
            </div>

            <div class="card">
              <div class="card-header">
                <div>
                  <div class="card-title">Bảng Tính Lợi Nhuận Từng Dự Án Riêng Lẻ</div>
                  <div style="font-size:12px; color:var(--text-muted); margin-top:2px;">
                    Công thức: <strong>Lợi nhuận = Doanh thu (Chưa VAT) − Thuế VAT − Chi phí (Gồm VAT/TNCN)</strong>. Có thể đổi trực tiếp Mảng dự án giữa <strong>KM Gift ↔ KM Brand</strong> ngay tại bảng.
                  </div>
                </div>
                <div style="display:flex; gap:8px; flex-wrap:wrap; align-items:center;">
                  <select class="select" id="cust-assign-proj-select" style="height:32px; font-size:12px; max-width:220px;">
                    <option value="">-- Gán thêm dự án có sẵn --</option>
                  </select>
                  <button class="btn btn-soft btn-sm" onclick="assignExistingProjectToCustomer()">+ Gán dự án</button>
                  <button class="btn btn-primary btn-sm" onclick="toggleCustProjCreator()">+ Tạo Dự án mới cho khách</button>
                </div>
              </div>

              <div id="cust-proj-creator" style="display:none; padding:16px 20px; background:var(--aux-tint); border-bottom:1px solid var(--border);">
                <div style="font-size:13px; font-weight:700; margin-bottom:10px;">Tạo Dự án mới cho Khách hàng này</div>
                <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(175px, 1fr)); gap:10px; align-items:end;">
                  <div class="field">
                    <label>Tên dự án (*)</label>
                    <input class="input" id="cust-new-proj-name" placeholder="VD: Bộ nhận diện KM Brand T12">
                  </div>
                  <div class="field">
                    <label>Mảng kinh doanh</label>
                    <select class="select" id="cust-new-proj-bu">
                      <option value="KM Gift">Khởi Minh Gift</option>
                      <option value="KM Brand">KM Brand</option>
                      <option value="Homeplanner">Homeplanner</option>
                    </select>
                  </div>
                  <div class="field">
                    <label>Loại quy trình</label>
                    <select class="select" id="cust-new-proj-flow">
                      <option value="customised">Customised (9 bước)</option>
                      <option value="ready_stock">Hàng có sẵn (5 bước)</option>
                    </select>
                  </div>
                  <div class="field">
                    <label>Ngày bắt đầu / Mốc SLA</label>
                    <input class="input" type="date" id="cust-new-proj-deposit" value="2026-11-26">
                  </div>
                  <div style="display:flex; gap:6px;">
                    <button class="btn btn-primary" onclick="createProjectForCustomer()">Tạo dự án</button>
                    <button class="btn" onclick="toggleCustProjCreator()">Đóng</button>
                  </div>
                </div>
              </div>

              <div class="table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th style="width:42px;">STT</th>
                      <th style="min-width:200px;">Tên Dự án</th>
                      <th style="min-width:125px;">Mã Hợp đồng</th>
                      <th style="min-width:145px;">Mảng KD (Đổi mảng)</th>
                      <th style="text-align:right;">Doanh thu (Chưa VAT)</th>
                      <th style="text-align:center; width:78px;">VAT (%)</th>
                      <th style="text-align:right;">Tiền thuế VAT</th>
                      <th style="text-align:right;">Tổng Chi phí</th>
                      <th style="text-align:right;">Lợi nhuận ròng</th>
                      <th style="text-align:center;">Biên LN</th>
                      <th>Chi tiết</th>
                    </tr>
                  </thead>
                  <tbody id="cust-projects-tbody">
                    <tr><td colspan="11" style="text-align:center; color:var(--text-muted); padding:24px;">Chưa có dự án nào.</td></tr>
                  </tbody>
                  <tfoot id="cust-projects-tfoot"></tfoot>
                </table>
              </div>
            </div>
          </div>
        </section>

        <!-- TAB 1: WORK TRACKER -->
        <section class="panel" id="panel-tracker">
          <div class="kpi-grid">
            <div class="kpi-card">
              <div class="kpi-label">Tổng hạng mục</div>
              <div class="kpi-val" id="kpi-total">0</div>
              <div class="kpi-sub">Theo dõi trực tiếp trên Portal</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-label">Hoàn thành</div>
              <div class="kpi-val" id="kpi-done">0</div>
              <div class="kpi-sub">Đạt 100% tiến độ</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-label">Đang thực hiện</div>
              <div class="kpi-val" id="kpi-active">0</div>
              <div class="kpi-sub">Cần bám sát deadline</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-label">Tiến độ trung bình</div>
              <div class="kpi-val" id="kpi-avg">0%</div>
              <div class="kpi-sub">Tổng hợp toàn dự án</div>
            </div>
          </div>

          <div class="card">
            <div class="card-header">
              <div>
                <div class="card-title" id="wt-title">THEO DÕI TIẾN ĐỘ CÔNG VIỆC</div>
                <div style="font-size: 12px; color: var(--text-muted); margin-top: 4px;" id="wt-dates-info"></div>
              </div>
              <div style="display:flex; gap:8px; flex-wrap:wrap;" class="no-print">
                <div class="member-chips" id="wt-members-bar"></div>
                <button class="btn btn-primary btn-sm" onclick="addWorkTrackerTask()">+ Thêm công việc</button>
              </div>
            </div>
            <div class="table-scroll">
              <table id="wt-table">
                <thead id="wt-thead"></thead>
                <tbody id="wt-tbody"></tbody>
              </table>
            </div>
          </div>
        </section>


        <!-- TAB 2: KHO TÀI LIỆU & GOOGLE DRIVE -->
        <section class="panel" id="panel-drive">
          <div class="card">
            <div class="card-header">
              <div>
                <div class="card-title">Quét lịch sử nhóm Zalo &amp; Phân loại AI vào Google Drive</div>
                <div style="font-size:12px; color:var(--text-muted); margin-top:2px;">
                  Tài khoản cá nhân đọc ảnh, file (PDF/Word/Excel) &amp; link từ nhóm, AI tự xếp vào thư mục Công việc / Dự án.
                </div>
              </div>
              <div style="display:flex; gap:8px; flex-wrap:wrap;">
                <select class="select" id="scan-group-select" style="min-width:220px;">
                  <option value="">-- Chọn nhóm Zalo để quét --</option>
                </select>
                <button class="btn btn-soft" id="btn-scan-history" onclick="scanGroupHistory()">🔍 Quét lịch sử cũ</button>
                <button class="btn btn-soft" id="btn-ai-classify" onclick="runAiClassify()">✨ AI phân loại</button>
                <button class="btn btn-primary" id="btn-sync-drive" onclick="syncAllDrive()">☁️ Đồng bộ Drive</button>
              </div>
            </div>
            <div class="card-body" style="padding-bottom:12px;">
              <div style="display:flex; gap:10px; flex-wrap:wrap; align-items:center;">
                <select class="select" id="filter-project" onchange="loadAssets()">
                  <option value="">Tất cả dự án / công việc</option>
                </select>
                <select class="select" id="filter-type" onchange="loadAssets()">
                  <option value="">Tất cả định dạng</option>
                  <option value="image">Hình ảnh</option>
                  <option value="file">Tài liệu (PDF/Excel/Word)</option>
                  <option value="link">Đường dẫn (Link)</option>
                </select>
                <select class="select" id="filter-status" onchange="loadAssets()">
                  <option value="">Mọi trạng thái</option>
                  <option value="pending">Chờ phân loại</option>
                  <option value="classified">Đã phân loại (chưa lên Drive)</option>
                  <option value="synced">Đã lên Google Drive</option>
                  <option value="error">Lỗi đồng bộ</option>
                </select>
                <button class="btn btn-sm" onclick="loadAssets()">↻ Làm mới</button>
              </div>
            </div>
            <div class="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Loại</th>
                    <th>Tên tài liệu / Link</th>
                    <th>Dự án / Công việc (Drive Folder)</th>
                    <th>Người gửi &amp; Nhóm</th>
                    <th>Tóm tắt AI</th>
                    <th>Trạng thái Drive</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody id="assets-tbody">
                  <tr><td colspan="7" style="text-align:center; color:var(--text-muted); padding:28px;">Chưa có dữ liệu. Hãy chọn nhóm Zalo và bấm "Quét lịch sử cũ" hoặc gửi ảnh/file vào nhóm.</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>


        <!-- TAB 3: NHẮC VIỆC & GỬI TIN NHẮN QUA ZALO BOT -->
        <section class="panel" id="panel-mention">
          <div class="card">
            <div class="card-header">
              <div>
                <div class="card-title">🤖 Gửi tin nhắn vào nhóm qua Zalo Bot (Trợ Lý Jay)</div>
                <div style="font-size:12px; color:var(--text-muted); margin-top:2px;">
                  Gửi tin nhắn trực tiếp từ Zalo Bot vào 1 hoặc nhiều nhóm đã kết nối (có thể đặt lại tên nhóm để dễ phân biệt).
                </div>
              </div>
              <button class="btn btn-soft btn-sm" onclick="loadBotForwarding()">↻ Làm mới danh sách nhóm Bot</button>
            </div>
            <div class="card-body">
              <div style="margin-bottom:4px;">
                <div style="font-size:13px; font-weight:700; margin-bottom:8px;">1. Danh sách Nhóm &amp; Người nhận đã kết nối với Bot (tick chọn nhiều hoặc bấm gửi trực tiếp từng dòng)</div>
                <div class="table-scroll" style="margin-bottom:12px; border:1px solid var(--border); border-radius:8px;">
                  <table>
                    <thead>
                      <tr>
                        <th style="width:44px; text-align:center;">Chọn</th>
                        <th style="width:44px; text-align:center;">STT</th>
                        <th style="width:90px;">Loại</th>
                        <th style="min-width:230px;">Tên nhóm / Người nhận (Sửa &amp; Lưu)</th>
                        <th>Thành viên &amp; Tin nhắn nhận diện</th>
                        <th style="width:140px; text-align:center;">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody id="bot-targets-tbody">
                      <tr><td colspan="6" style="text-align:center; color:var(--text-muted); padding:16px;">Đang tải danh sách nhóm của Bot...</td></tr>
                    </tbody>
                  </table>
                </div>
                <div class="form-grid" style="margin-bottom:10px;">
                  <div class="field">
                    <label>Tiêu đề / Nhãn gửi kèm (tuỳ chọn — để trống sẽ gửi nguyên văn)</label>
                    <input class="input" id="fw-sender-label" placeholder="VD: Thông báo từ Quản lý Khởi Minh">
                  </div>
                  <div class="field">
                    <label>Nội dung tin nhắn gửi vào nhóm qua Bot</label>
                    <textarea class="textarea" id="fw-message" rows="2" placeholder="Nhập nội dung cần gửi qua Bot vào nhóm..."></textarea>
                  </div>
                </div>
                <button class="btn btn-primary" id="btn-fw-send" onclick="sendBotForwardNow()">🤖 Gửi tin nhắn qua Bot vào các nhóm đã chọn</button>
                <div id="bot-send-result" style="margin-top:10px; font-size:12.5px;"></div>
              </div>
            </div>
          </div>

          <div class="card">
            <div class="card-header">
              <div>
                <div class="card-title">🔔 Gửi nhắc việc có @mention tag xanh thật trong nhóm Zalo (Qua Nick Cá Nhân)</div>
                <div style="font-size:12px; color:var(--text-muted); margin-top:2px;">
                  Sử dụng tài khoản cá nhân để tag đúng UID thành viên, giúp người phụ trách nhận thông báo chuông ngay trên Zalo.
                </div>
              </div>
            </div>
            <div class="card-body">
              <div class="form-grid" style="margin-bottom:16px;">
                <div class="field">
                  <label>1. Chọn Nhóm Zalo nhận thông báo</label>
                  <select class="select" id="mention-group-select" onchange="loadGroupMembers()">
                    <option value="">-- Đang tải danh sách nhóm --</option>
                  </select>
                </div>
                <div class="field">
                  <label>2. Chọn Thành viên cần @tag</label>
                  <select class="select" id="mention-member-select">
                    <option value="">-- Chọn nhóm trước --</option>
                  </select>
                </div>
              </div>

              <div class="field" style="margin-bottom:16px;">
                <label>3. Chọn nhanh từ công việc (tuỳ chọn)</label>
                <select class="select" id="mention-task-preset" onchange="applyTaskPreset()">
                  <option value="">-- Tự nhập nội dung hoặc chọn 1 đầu việc --</option>
                </select>
              </div>

              <div class="field" style="margin-bottom:16px;">
                <label>4. Nội dung tin nhắn nhắc việc</label>
                <textarea class="textarea" id="mention-message" rows="3" placeholder="Ví dụ: nhờ anh/chị cập nhật giúp tiến độ bản vẽ kỹ thuật trước 17h chiều nay nhé!"></textarea>
              </div>

              <div style="display:flex; gap:10px; align-items:center;">
                <button class="btn btn-primary" id="btn-send-mention" onclick="sendMentionNow()">🔔 Gửi @mention vào nhóm ngay</button>
                <span style="font-size:12px; color:var(--text-muted);" id="mention-hint"></span>
              </div>
            </div>
          </div>
        </section>


        <!-- TAB 4: QUẢN LÝ ZALO BOT & CÀI ĐẶT KẾT NỐI (CHỈ ADMIN) -->
        <section class="panel" id="panel-settings">
          <div class="card" style="margin-bottom:16px;">
            <div class="card-header">
              <div>
                <div class="card-title">🤖 Quản lý &amp; Điều chỉnh Tài khoản Zalo Bot (Chỉ Admin)</div>
                <div style="font-size:12px; color:var(--text-muted); margin-top:2px;">
                  Bật/tắt Bot, đổi tên, cập nhật Token hoặc điều chỉnh cách Bot phản hồi trong nhóm Zalo ngay tại đây.
                </div>
              </div>
              <button class="btn btn-soft btn-sm" onclick="loadAdminZaloBots()">↻ Làm mới danh sách Bot</button>
            </div>
            <div class="card-body">
              <div id="admin-zalo-bots-list" style="display:flex; flex-direction:column; gap:12px; margin-bottom:18px;">
                <div style="font-size:12.5px; color:var(--text-muted);">Đang tải danh sách Zalo Bot...</div>
              </div>

              <div style="padding-top:14px; border-top:1px solid var(--border);">
                <div style="font-size:13px; font-weight:700; margin-bottom:10px;">➕ Thêm Zalo Bot mới</div>
                <div style="display:grid; grid-template-columns:1fr 1.6fr auto; gap:10px; align-items:end;">
                  <div class="field">
                    <label>Tên hiển thị Bot</label>
                    <input class="input" id="new-bot-label" placeholder="VD: Bot CSKH Khởi Minh">
                  </div>
                  <div class="field">
                    <label>Zalo Bot Token</label>
                    <input class="input" id="new-bot-token" type="password" placeholder="Dán Bot Token từ Zalo Bot Platform...">
                  </div>
                  <button class="btn btn-primary" onclick="createAdminZaloBot()">+ Thêm &amp; Khởi động Bot</button>
                </div>
              </div>
            </div>
          </div>

          <div class="card" style="margin-bottom:16px;">
            <div class="card-header">
              <div>
                <div class="card-title">📱 Kết nối Tài khoản Zalo Cá Nhân (Quét mã QR)</div>
                <div style="font-size:12px; color:var(--text-muted); margin-top:2px;">
                  Kết nối tài khoản Zalo cá nhân để ấn <strong>Trả lời (Reply)</strong> trực tiếp vào tin nhắn trong nhóm là chuyển tiếp được sang nhóm khác (không cần copy/paste), đồng thời bật quét kho tài liệu &amp; @mention thành viên nhóm.
                </div>
              </div>
              <span class="badge muted" id="settings-personal-status-badge">Đang kiểm tra...</span>
            </div>
            <div class="card-body">
              <div style="display:flex; gap:10px; align-items:center; flex-wrap:wrap;">
                <button class="btn btn-primary" id="btn-start-zalo-qr" onclick="startPersonalZaloQr()">📷 Lấy mã QR đăng nhập Zalo</button>
                <button class="btn btn-soft" id="btn-disconnect-zalo" style="display:none; color:#dc2626;" onclick="disconnectPersonalZalo()">🔌 Ngắt kết nối Zalo cá nhân</button>
                <span style="font-size:12px; color:var(--text-muted);">Trạng thái Zalo Bot: <strong style="color:var(--primary);">Bot Trợ Lý Jay đang hoạt động</strong></span>
              </div>
              <div id="personal-qr-box" style="display:none; margin-top:16px; padding:16px; border:1px dashed var(--border); border-radius:10px; background:var(--bg-canvas); align-items:center; gap:18px; flex-wrap:wrap;">
                <div id="personal-qr-img-wrap" style="width:200px; height:200px; display:flex; align-items:center; justify-content:center; border:1px solid var(--border); border-radius:8px; background:#fff;">
                  <span style="font-size:12px; color:var(--text-muted);">Đang tạo mã QR...</span>
                </div>
                <div style="flex:1; min-width:220px;">
                  <div id="personal-qr-msg" style="font-size:13.5px; font-weight:700; color:var(--text-main); margin-bottom:6px;">Đang khởi tạo phiên đăng nhập QR...</div>
                  <div style="font-size:12px; color:var(--text-muted); line-height:1.6;">
                    1. Mở ứng dụng <strong>Zalo</strong> trên điện thoại.<br>
                    2. Chọn biểu tượng <strong>Quét mã QR</strong> ở góc trên bên phải.<br>
                    3. Quét mã và bấm <strong>Đăng nhập / Xác nhận</strong> trên điện thoại.
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="card">
            <div class="card-header">
              <div class="card-title">Cấu hình Google Drive &amp; Nhóm mặc định</div>
            </div>
            <div class="card-body">
              <div class="form-grid" style="margin-bottom:16px;">
                <div class="field">
                  <label>Tên thư mục gốc trên Google Drive</label>
                  <input class="input" id="cfg-root-name" placeholder="Khởi Minh Drive">
                </div>
                <div class="field">
                  <label>Google Drive Folder ID (để trống sẽ tự tạo)</label>
                  <input class="input" id="cfg-root-id" placeholder="Tự động tạo nếu để trống">
                </div>
                <div class="field">
                  <label>Google OAuth Access Token</label>
                  <input class="input" id="cfg-access-token" type="password" placeholder="ya29.a0...">
                </div>
                <div class="field">
                  <label>Google OAuth Refresh Token (tuỳ chọn)</label>
                  <input class="input" id="cfg-refresh-token" type="password" placeholder="1//0g...">
                </div>
                <div class="field">
                  <label>OAuth Client ID (nếu dùng Refresh Token)</label>
                  <input class="input" id="cfg-client-id" placeholder="xxxx.apps.googleusercontent.com">
                </div>
                <div class="field">
                  <label>OAuth Client Secret</label>
                  <input class="input" id="cfg-client-secret" type="password" placeholder="GOCSPX-...">
                </div>
              </div>
              <div style="display:flex; gap:10px; align-items:center;">
                <button class="btn btn-primary" onclick="saveDriveSettings()">💾 Lưu cấu hình Drive</button>
                <a href="/" target="_blank" class="btn btn-soft">🔑 Mở Dashboard quản lý tài khoản Zalo &amp; AI Model</a>
              </div>
            </div>
          </div>
        </section>

      </div>
    </main>
  </div>

  <div id="admin-login-modal" style="display:none; position:fixed; inset:0; background:rgba(15,23,42,0.45); z-index:999; align-items:center; justify-content:center; padding:16px;">
    <div style="background:#fff; border:1px solid var(--border); border-radius:12px; width:100%; max-width:380px; padding:22px; box-shadow:0 20px 40px rgba(15,23,42,0.18);">
      <div style="font-size:16px; font-weight:700; color:var(--text-main); margin-bottom:6px;">🔐 Đăng nhập Quản trị viên (Admin)</div>
      <div style="font-size:12.5px; color:var(--text-muted); margin-bottom:14px;">
        Phần điều chỉnh Zalo Bot, chuyển tiếp nhóm và kết nối tài khoản chỉ dành riêng cho Quản trị viên.
      </div>
      <div class="field" style="margin-bottom:14px;">
        <label>Mã PIN Admin (mặc định 123456)</label>
        <input class="input" id="admin-pin-input" type="password" placeholder="Nhập mã PIN..." onkeydown="if(event.key==='Enter') submitAdminLogin()">
      </div>
      <div id="admin-login-err" style="display:none; color:#dc2626; font-size:12px; margin-bottom:10px;"></div>
      <div style="display:flex; justify-content:flex-end; gap:8px;">
        <button class="btn btn-soft" onclick="closeAdminLoginModal()">Đóng</button>
        <button class="btn btn-primary" onclick="submitAdminLogin()">Xác nhận đăng nhập</button>
      </div>
    </div>
  </div>

  <div id="checklist-transition-modal" style="display:none; position:fixed; inset:0; background:rgba(15,23,42,0.45); z-index:1000; align-items:center; justify-content:center; padding:16px;">
    <div style="background:#fff; border:1px solid var(--border); border-radius:12px; width:100%; max-width:540px; padding:22px; box-shadow:0 20px 40px rgba(15,23,42,0.18);">
      <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:10px; margin-bottom:6px;">
        <div id="cl-modal-title" style="font-size:15.5px; font-weight:700; color:var(--text-main);">Xác nhận đầu mục công việc</div>
        <span id="cl-modal-target-badge" class="badge"></span>
      </div>
      <div id="cl-modal-subtitle" style="font-size:12.5px; color:var(--text-muted); margin-bottom:14px; line-height:1.45;">
        Vui lòng tick (&#9745;) vào những đầu mục đã làm. Những đầu mục không tick sẽ được đánh dấu là <strong>Bị huỷ</strong>.
      </div>
      <div id="cl-modal-items" style="display:flex; flex-direction:column; gap:8px; max-height:320px; overflow-y:auto; margin-bottom:16px;"></div>
      <div style="display:flex; justify-content:flex-end; flex-wrap:wrap; gap:8px;">
        <button class="btn btn-soft" onclick="closeChecklistTransitionModal()">Đóng / Huỷ thao tác</button>
        <button id="cl-modal-keep-btn" class="btn" style="display:none;" onclick="confirmChecklistTransition(false)">⏳ Lưu mục đã tick (Giữ mục còn lại làm tiếp)</button>
        <button id="cl-modal-confirm-btn" class="btn btn-primary" onclick="confirmChecklistTransition(true)">✅ Xác nhận (Mục không tick = Bị huỷ)</button>
      </div>
    </div>
  </div>

  <div class="toast-box" id="toast-box"></div>

  <script>
    ${renderStaticFetchInterceptorScript()}
    var wtData = { settings: {}, members: [], tasks: [] };
    var zaloGroups = [];
    var groupMembers = [];

    function showToast(msg, isErr) {
      var box = document.getElementById('toast-box');
      var el = document.createElement('div');
      el.className = 'toast ' + (isErr ? 'err' : 'ok');
      el.textContent = msg;
      box.appendChild(el);
      setTimeout(function() { el.remove(); }, 4200);
    }

    function esc(s) {
      return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    var activeBu = 'KM Gift';
    var projectLevel = 'master'; // 'master' | 'detail'
    var BUSINESS_UNITS = [
      { value: 'KM Gift', label: '🎁 KM Gift', fullName: 'Khởi Minh Gift' },
      { value: 'KM Brand', label: '✨ KM Brand', fullName: 'KM Brand' },
      { value: 'Homeplanner', label: '🏠 Homeplanner', fullName: 'Homeplanner' }
    ];

    function buDisplayName(bu) {
      var hit = BUSINESS_UNITS.find(function(x) { return x.value === bu; });
      return hit ? hit.fullName : 'Khởi Minh Gift';
    }

    function buOptionsHtml(selected) {
      var cur = selected || 'KM Gift';
      return BUSINESS_UNITS.map(function(u) {
        return '<option value="' + u.value + '"' + (cur === u.value ? ' selected' : '') + '>' + u.label + '</option>';
      }).join('');
    }

    function openBusinessUnit(bu) {
      activeBu = bu;
      document.getElementById('filter-bu').value = bu;
      var newBuSel = document.getElementById('new-km-bu');
      if (newBuSel) newBuSel.value = bu;
      projectLevel = 'master';
      switchTab('projects');
      backToMasterProjects();
    }

    function backToMasterProjects() {
      projectLevel = 'master';
      document.getElementById('projects-master-view').style.display = 'block';
      document.getElementById('project-detail-view').style.display = 'none';
      document.getElementById('topbar-title').textContent = 'Dự án ' + buDisplayName(activeBu);
      loadProjectsData(activeProjectId);
    }

    async function openProjectDetail(pid) {
      projectLevel = 'detail';
      activeProjectId = pid;
      document.getElementById('projects-master-view').style.display = 'none';
      document.getElementById('project-detail-view').style.display = 'block';
      await loadProjectsData(pid);
      if (pmData && pmData.activeProject && pmData.activeProject.business_unit) {
        activeBu = pmData.activeProject.business_unit;
        document.querySelectorAll('.nav-item').forEach(function(btn) {
          var bTab = btn.getAttribute('data-tab');
          var bBu = btn.getAttribute('data-bu');
          btn.classList.toggle('active', bTab === 'projects' && bBu === activeBu);
        });
      }
      setProjectView('costs');
    }

    function switchTab(tab) {
      if ((tab === 'mention' || tab === 'settings') && !isAdminMode) {
        openAdminLoginModal(tab);
        return;
      }
      var titles = {
        projects: 'Dự án ' + buDisplayName(activeBu),
        customers: 'Khách hàng & Tính Lợi Nhuận Dự Án',
        tracker: 'Theo dõi tiến độ công việc',
        drive: 'Kho tài liệu & Google Drive AI',
        mention: 'Nhắc việc & Gửi tin qua Zalo Bot (Admin)',
        settings: 'Quản lý Zalo Bot & Kết nối (Admin)'
      };
      document.getElementById('topbar-title').textContent = titles[tab] || 'Khởi Minh Workspace';
      document.querySelectorAll('.nav-item').forEach(function(btn) {
        var bTab = btn.getAttribute('data-tab');
        var bBu = btn.getAttribute('data-bu');
        if (tab === 'projects') {
          btn.classList.toggle('active', bTab === 'projects' && bBu === activeBu);
        } else {
          btn.classList.toggle('active', bTab === tab);
        }
      });
      document.querySelectorAll('.panel').forEach(function(p) {
        p.classList.toggle('active', p.id === 'panel-' + tab);
      });
      document.getElementById('sidebar').classList.remove('open');
      if (tab === 'projects') loadProjectsData(activeProjectId);
      if (tab === 'customers') loadCustomersTab();
      if (tab === 'drive') loadAssets();
      if (tab === 'mention') {
        loadBotForwarding();
        if (zaloGroups.length === 0) loadZaloGroups();
      }
      if (tab === 'settings') {
        loadPersonalStatus();
        loadAdminZaloBots();
      }
    }

    var pmData = { projects: [], activeProject: null, stages: [], tasks: [], members: [] };
    var activeProjectId = 0;
    var projectViewMode = 'costs';
    var draggedTaskId = null;
    var projectCostsData = { costs: [], quotation: {}, summary: {} };

    function setProjectView(mode) {
      projectViewMode = mode;
      document.getElementById('project-kanban-view').style.display = (mode === 'kanban' || mode === 'stages') ? 'grid' : 'none';
      document.getElementById('project-table-view').style.display = mode === 'table' ? 'block' : 'none';
      document.getElementById('project-costs-view').style.display = mode === 'costs' ? 'block' : 'none';
      document.getElementById('btn-view-stages').className = 'btn btn-sm ' + (mode === 'stages' ? 'btn-soft' : '');
      document.getElementById('btn-view-kanban').className = 'btn btn-sm ' + (mode === 'kanban' ? 'btn-soft' : '');
      document.getElementById('btn-view-table').className = 'btn btn-sm ' + (mode === 'table' ? 'btn-soft' : '');
      document.getElementById('btn-view-costs').className = 'btn btn-sm ' + (mode === 'costs' ? 'btn-soft' : '');
      if (mode === 'costs') loadProjectCosts();
      renderProjectsTab();
    }

    async function loadProjectCosts() {
      if (!activeProjectId) return;
      try {
        var res = await fetch('/portal/api/projects/' + activeProjectId + '/costs');
        var data = await res.json();
        if (!data.ok) return;
        projectCostsData = data;
        renderProjectCosts();
      } catch (e) {}
    }

    function fmtVnd(n) {
      return Number(n || 0).toLocaleString('vi-VN') + ' ₫';
    }

    function parseVndNumber(val) {
      return Number(String(val || '').replace(/[^0-9]/g, '')) || 0;
    }

    function formatVndInputLive(inp) {
      var raw = String(inp.value || '').replace(/[^0-9]/g, '');
      inp.value = raw ? Number(raw).toLocaleString('vi-VN') : '';
    }

    function renderProjectCosts() {
      var sum = projectCostsData.summary || {};
      var q = projectCostsData.quotation || {};
      var costs = projectCostsData.costs || [];
      var stages = pmData.stages || [];
      var vatPct = Number(q.vat_percent !== undefined && q.vat_percent !== null ? q.vat_percent : 8);
      var totalRev = Number(sum.totalRevenue !== undefined ? sum.totalRevenue : sum.totalQuoteExclVat) || 0;

      document.getElementById('cost-kpi-total').textContent = fmtVnd(sum.totalCost);
      document.getElementById('cost-kpi-quote').textContent = fmtVnd(totalRev);
      document.getElementById('cost-kpi-vat').textContent = fmtVnd(sum.totalQuoteInclVat);
      document.getElementById('cost-kpi-vat-sub').textContent = 'VAT ' + vatPct + '%: ' + fmtVnd(sum.vatAmount);
      document.getElementById('cost-kpi-profit').textContent = fmtVnd(sum.estimatedProfit);
      document.getElementById('cost-kpi-margin').textContent = '= Doanh thu - VAT (' + vatPct + '%) - Chi phí (Biên ' + (sum.profitMarginPct || 0) + '%)';

      document.getElementById('q-contract-code').value = projectCostsData.contract_code || (pmData.activeProject && pmData.activeProject.contract_code) || '';
      document.getElementById('q-cust-name').value = q.customer_name || '';
      document.getElementById('q-cust-tax').value = q.customer_tax_code || '';
      document.getElementById('q-contact-name').value = q.contact_name || '';
      document.getElementById('q-contact-phone').value = q.contact_phone || '';
      document.getElementById('q-client-tier').value = q.client_tier || 'Doanh nghiệp';
      document.getElementById('q-default-markup').value = q.default_markup || 1.5;
      document.getElementById('q-vat-percent').value = vatPct;
      document.getElementById('q-display-mode').value = q.display_mode || 'selected';
      document.getElementById('q-payment-terms').value = q.payment_terms || '';
      document.getElementById('q-bank-info').value = q.bank_info || '';
      document.getElementById('q-bank-qr-url').value = q.bank_qr_url || '';

      var selCount = costs.filter(function(c) { return Number(c.show_in_quote !== undefined ? c.show_in_quote : 1) !== 0; }).length;
      var selSum = costs
        .filter(function(c) { return Number(c.show_in_quote !== undefined ? c.show_in_quote : 1) !== 0; })
        .reduce(function(s, c) { return s + (Number(c.quote_line_total) || 0); }, 0);
      var masterChk = document.getElementById('chk-all-costs-quote');
      if (masterChk) {
        masterChk.checked = costs.length > 0 && selCount === costs.length;
        masterChk.indeterminate = selCount > 0 && selCount < costs.length;
      }
      var selPill = document.getElementById('cost-quote-selection-pill');
      if (selPill) {
        selPill.innerHTML = costs.length > 0
          ? ('✅ Đang chọn <strong>' + selCount + '/' + costs.length + '</strong> hạng mục vào Báo giá • Giá trị BG (chưa VAT): <strong>' + fmtVnd(selSum) + '</strong>')
          : '';
      }

      var tbody = document.getElementById('project-costs-tbody');
      if (costs.length === 0) {
        tbody.innerHTML = '<tr><td colspan="14" style="text-align:center; color:var(--text-muted); padding:24px;">Chưa có khoản chi nào. Bấm "+ Thêm khoản chi / Hạng mục" để nhập chi phí (đã gồm VAT/Thuế TNCN).</td></tr>';
        return;
      }

      tbody.innerHTML = costs.map(function(c) {
        var stageOpts = '<option value="">--</option>';
        for (var i = 0; i < stages.length; i++) {
          var st = stages[i];
          stageOpts += '<option value="' + st.id + '"' + (Number(st.id) === Number(c.stage_id) ? ' selected' : '') + '>' + esc(st.title) + '</option>';
        }
        var attLink = '';
        if (c.has_attachment || c.attachment_data) {
          var dlHref = c.attachment_data ? c.attachment_data : ('/portal/api/projects/costs/' + c.id + '/attachment');
          attLink = '<a href="' + esc(dlHref) + '" download="' + esc(c.attachment_name || ('chung-tu-' + c.id)) + '" style="display:block; font-size:11px; color:var(--primary); margin-top:3px; word-break:break-all;">📎 ' + esc(c.attachment_name || 'Tải chứng từ') + '</a>';
        }
        var prodImg = c.product_image || '';
        var imgPreview = prodImg
          ? '<div style="display:flex; align-items:center; gap:6px; margin-bottom:4px;"><img src="' + esc(prodImg) + '" alt="SP" style="width:44px; height:44px; object-fit:cover; border-radius:6px; border:1px solid var(--border); background:#fff;"><button type="button" class="btn btn-sm" style="height:22px; padding:0 6px; font-size:10.5px; color:#DC2626;" title="Xoá ảnh" onclick="clearCostProductImage(' + c.id + ')">✕</button></div>'
          : '';
        var imgCellHtml = '<div style="min-width:118px;">' +
          imgPreview +
          '<input class="wt-cell-input" style="font-size:11px; width:116px; margin-bottom:2px;" placeholder="Link ảnh SP..." value="' + esc(prodImg.indexOf('data:') === 0 ? '' : prodImg) + '" onchange="updateCostRow(' + c.id + ', {product_image: this.value.trim()})">' +
          '<label style="display:inline-block; font-size:11px; color:var(--primary); cursor:pointer;">📷 Tải ảnh SP<input type="file" accept="image/*" style="display:none;" onchange="uploadCostProductImage(' + c.id + ', this)"></label>' +
        '</div>';
        var showChecked = Number(c.show_in_quote !== undefined ? c.show_in_quote : 1) !== 0;
        var rowStyle = showChecked ? '' : ' style="opacity:0.72; background:#F8FAFC;"';
        return '<tr' + rowStyle + '>' +
          '<td style="text-align:center;"><input type="checkbox" style="width:16px; height:16px; cursor:pointer; accent-color:var(--primary);" title="Tick để đưa vào Báo giá" ' + (showChecked ? 'checked' : '') + ' onchange="toggleCostInQuote(' + c.id + ', this.checked)"></td>' +
          '<td><select class="select" style="height:30px; font-size:12px; max-width:115px;" onchange="updateCostRow(' + c.id + ', {stage_id: Number(this.value) || null})">' + stageOpts + '</select></td>' +
          '<td>' + imgCellHtml + '</td>' +
          '<td><textarea class="wt-cell-input" rows="2" style="font-weight:600; min-width:230px; white-space:pre-wrap; resize:vertical; line-height:1.4;" onchange="updateCostRow(' + c.id + ', {item_name: this.value})">' + esc(c.item_name) + '</textarea></td>' +
          '<td><input class="wt-cell-input" style="min-width:120px;" value="' + esc(c.vendor_name) + '" onchange="updateCostRow(' + c.id + ', {vendor_name: this.value})"></td>' +
          '<td><input type="number" min="0" class="wt-cell-input" style="width:48px; font-family:JetBrains Mono,monospace;" value="' + (c.duration_days || 0) + '" onchange="updateCostRow(' + c.id + ', {duration_days: Number(this.value)})"></td>' +
          '<td><input type="text" inputmode="numeric" class="wt-cell-input" style="width:112px; font-family:JetBrains Mono,monospace; text-align:right;" value="' + Number(c.cost_amount || 0).toLocaleString('vi-VN') + '" oninput="formatVndInputLive(this)" onchange="updateCostRow(' + c.id + ', {cost_amount: parseVndNumber(this.value)})"></td>' +
          '<td><input type="number" min="1" class="wt-cell-input" style="width:44px; font-family:JetBrains Mono,monospace;" value="' + (c.quantity || 1) + '" onchange="updateCostRow(' + c.id + ', {quantity: Number(this.value)})"></td>' +
          '<td><input type="number" min="1" step="0.05" class="wt-cell-input" style="width:52px; font-family:JetBrains Mono,monospace; color:var(--primary); font-weight:700;" value="' + (c.markup_factor || 1.5) + '" onchange="updateCostRow(' + c.id + ', {markup_factor: Number(this.value)})"></td>' +
          '<td style="font-family:JetBrains Mono,monospace; font-weight:600; white-space:nowrap;">' + fmtVnd(c.quote_unit_price) + '</td>' +
          '<td style="font-family:JetBrains Mono,monospace; font-weight:700; color:var(--primary); white-space:nowrap;">' + fmtVnd(c.quote_line_total) + '</td>' +
          '<td>' +
            '<input class="wt-cell-input" style="font-size:11.5px; min-width:130px; margin-bottom:3px;" placeholder="Số HĐ / Hóa đơn..." value="' + esc(c.contract_ref || '') + '" onchange="updateCostRow(' + c.id + ', {contract_ref: this.value})">' +
            attLink +
            '<label style="display:inline-block; font-size:11px; color:var(--primary); cursor:pointer; margin-top:2px;">+ Đính kèm (.docx/.pdf/.xlsx)<input type="file" accept=".docx,.doc,.pdf,.xlsx,.xls" style="display:none;" onchange="uploadCostAttachment(' + c.id + ', this)"></label>' +
          '</td>' +
          '<td><select class="select" style="height:30px; font-size:11.5px;" onchange="updateCostRow(' + c.id + ', {payment_status: this.value})">' +
            '<option value="Chưa thanh toán"' + (c.payment_status === 'Chưa thanh toán' ? ' selected' : '') + '>Chưa TT</option>' +
            '<option value="Đã tạm ứng 50%"' + (c.payment_status === 'Đã tạm ứng 50%' ? ' selected' : '') + '>Tạm ứng 50%</option>' +
            '<option value="Đã TT 100%"' + (c.payment_status === 'Đã TT 100%' ? ' selected' : '') + '>Đã TT 100%</option>' +
          '</select></td>' +
          '<td><button class="btn btn-sm" style="height:28px; color:#DC2626;" onclick="deleteCostItem(' + c.id + ')">✕</button></td>' +
        '</tr>';
      }).join('');
    }

    function readFileAsDataUrl(file) {
      return new Promise(function(resolve, reject) {
        var r = new FileReader();
        r.onload = function() { resolve(String(r.result || '')); };
        r.onerror = function() { reject(new Error('Không đọc được file')); };
        r.readAsDataURL(file);
      });
    }

    function readProductImageAsDataUrl(file, maxDim) {
      var limit = maxDim || 640;
      return readFileAsDataUrl(file).then(function(rawUrl) {
        return new Promise(function(resolve) {
          var img = new Image();
          img.onload = function() {
            var w = img.naturalWidth || img.width;
            var h = img.naturalHeight || img.height;
            if (!w || !h || (w <= limit && h <= limit && file.size <= 350000)) {
              resolve(rawUrl);
              return;
            }
            var ratio = Math.min(limit / w, limit / h);
            var canvas = document.createElement('canvas');
            canvas.width = Math.max(1, Math.round(w * ratio));
            canvas.height = Math.max(1, Math.round(h * ratio));
            var ctx = canvas.getContext('2d');
            if (!ctx) { resolve(rawUrl); return; }
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            try {
              resolve(canvas.toDataURL('image/jpeg', 0.85));
            } catch (e) {
              resolve(rawUrl);
            }
          };
          img.onerror = function() { resolve(rawUrl); };
          img.src = rawUrl;
        });
      });
    }

    async function clearCostProductImage(costId) {
      await updateCostRow(costId, { product_image: '' });
      showToast('Đã xoá ảnh sản phẩm');
    }

    async function uploadCostProductImage(costId, inp) {
      var file = inp && inp.files && inp.files[0];
      if (!file) return;
      if (file.size > 6 * 1024 * 1024) {
        showToast('Ảnh sản phẩm tối đa 6MB', true);
        return;
      }
      var dataUrl = await readProductImageAsDataUrl(file, 640);
      await updateCostRow(costId, { product_image: dataUrl });
      showToast('Đã gắn ảnh sản phẩm cho báo giá!');
    }

    async function uploadCostAttachment(costId, inp) {
      var file = inp && inp.files && inp.files[0];
      if (!file) return;
      if (file.size > 4 * 1024 * 1024) {
        showToast('File tối đa 4MB để đảm bảo tốc độ', true);
        return;
      }
      var dataUrl = await readFileAsDataUrl(file);
      await updateCostRow(costId, { attachment_name: file.name, attachment_data: dataUrl });
      showToast('Đã đính kèm chứng từ: ' + file.name);
    }

    async function uploadBankQrFile(inp) {
      var file = inp && inp.files && inp.files[0];
      if (!file) return;
      var dataUrl = await readFileAsDataUrl(file);
      document.getElementById('q-bank-qr-url').value = dataUrl;
      await saveQuotationMeta(false);
      showToast('Đã tải ảnh QR thanh toán!');
    }

    async function updateProjectContractCode(pid, val) {
      await fetch('/portal/api/projects/' + pid, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contract_code: String(val || '').trim() })
      });
      showToast('Đã cập nhật Mã Hợp đồng');
      await loadProjectsData(activeProjectId);
      renderCustomersTab();
    }

    async function changeProjectBusinessUnit(pid, nextBu) {
      await fetch('/portal/api/projects/' + pid, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ business_unit: nextBu })
      });
      showToast('Đã chuyển dự án sang mảng ' + buDisplayName(nextBu));
      await loadProjectsData(activeProjectId);
      renderCustomersTab();
    }

    async function changeProjectCustomer(pid, custIdVal) {
      await fetch('/portal/api/projects/' + pid, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customer_id: custIdVal ? Number(custIdVal) : null })
      });
      showToast('Đã cập nhật khách hàng sở hữu dự án');
      await loadProjectsData(activeProjectId);
      renderCustomersTab();
    }

    var activeCustomerId = null;
    var customerLevel = 'master'; // 'master' | 'detail'
    var customerBuFilter = 'ALL';
    var customerDetailBuFilter = 'ALL';

    function setCustomerBuFilter(bu) {
      customerBuFilter = bu;
      document.querySelectorAll('.cust-bu-pill').forEach(function(b) {
        b.className = 'btn btn-sm cust-bu-pill ' + (b.getAttribute('data-bu') === bu ? 'btn-soft' : '');
      });
      renderCustomersTab();
    }

    function setCustomerDetailBuFilter(bu) {
      customerDetailBuFilter = bu;
      document.querySelectorAll('.cust-det-bu-pill').forEach(function(b) {
        b.className = 'btn btn-sm cust-det-bu-pill ' + (b.getAttribute('data-bu') === bu ? 'btn-soft' : '');
      });
      renderCustomersTab();
    }

    async function loadCustomersTab() {
      await loadProjectsData(activeProjectId);
      renderCustomersTab();
    }

    function backToCustomersMaster() {
      customerLevel = 'master';
      activeCustomerId = null;
      renderCustomersTab();
    }

    function openCustomerDetail(cid) {
      customerLevel = 'detail';
      activeCustomerId = Number(cid);
      customerDetailBuFilter = 'ALL';
      document.querySelectorAll('.cust-det-bu-pill').forEach(function(b) {
        b.className = 'btn btn-sm cust-det-bu-pill ' + (b.getAttribute('data-bu') === 'ALL' ? 'btn-soft' : '');
      });
      renderCustomersTab();
    }

    function toggleCustomerCreator() {
      var box = document.getElementById('customer-creator-box');
      if (box) box.style.display = box.style.display === 'none' ? 'block' : 'none';
    }

    function toggleCustProjCreator() {
      var box = document.getElementById('cust-proj-creator');
      if (box) box.style.display = box.style.display === 'none' ? 'block' : 'none';
    }

    async function createCustomer() {
      var name = document.getElementById('new-cust-name').value.trim();
      if (!name) { showToast('Vui lòng nhập tên khách hàng', true); return; }
      var res = await fetch('/portal/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name,
          tax_code: document.getElementById('new-cust-tax').value.trim(),
          contact_name: document.getElementById('new-cust-contact').value.trim(),
          contact_phone: document.getElementById('new-cust-phone').value.trim(),
          notes: document.getElementById('new-cust-notes').value.trim()
        })
      });
      var data = await res.json();
      if (data.ok) {
        ['new-cust-name', 'new-cust-tax', 'new-cust-contact', 'new-cust-phone', 'new-cust-notes'].forEach(function(id) {
          var el = document.getElementById(id); if (el) el.value = '';
        });
        document.getElementById('customer-creator-box').style.display = 'none';
        showToast('Đã thêm khách hàng mới!');
        await loadCustomersTab();
        if (data.id) openCustomerDetail(data.id);
      } else {
        showToast(data.error || 'Lỗi thêm khách hàng', true);
      }
    }

    async function saveActiveCustomerMeta() {
      if (!activeCustomerId) return;
      var payload = {
        name: document.getElementById('cust-edit-name').value.trim(),
        tax_code: document.getElementById('cust-edit-tax').value.trim(),
        contact_name: document.getElementById('cust-edit-contact').value.trim(),
        contact_phone: document.getElementById('cust-edit-phone').value.trim(),
        notes: document.getElementById('cust-edit-notes').value.trim()
      };
      await fetch('/portal/api/customers/' + activeCustomerId, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      showToast('Đã tự động lưu thông tin khách hàng');
      await loadCustomersTab();
    }

    async function deleteActiveCustomer() {
      if (!activeCustomerId) return;
      if (!confirm('Xoá khách hàng này? (Các dự án đang gắn vẫn được giữ lại, chỉ bỏ liên kết)')) return;
      await fetch('/portal/api/customers/' + activeCustomerId, { method: 'DELETE' });
      showToast('Đã xoá khách hàng');
      backToCustomersMaster();
      await loadCustomersTab();
    }

    async function createProjectForCustomer() {
      if (!activeCustomerId) return;
      var name = document.getElementById('cust-new-proj-name').value.trim();
      if (!name) { showToast('Vui lòng nhập tên dự án', true); return; }
      var bu = document.getElementById('cust-new-proj-bu').value;
      var flow = document.getElementById('cust-new-proj-flow').value;
      var dep = document.getElementById('cust-new-proj-deposit').value;
      var res = await fetch('/portal/api/projects/km-gift-template', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name, businessUnit: bu, flowType: flow, depositDate: dep, customerId: activeCustomerId })
      });
      var data = await res.json();
      if (data.ok) {
        document.getElementById('cust-new-proj-name').value = '';
        document.getElementById('cust-proj-creator').style.display = 'none';
        showToast('Đã tạo dự án "' + name + '" (' + buDisplayName(bu) + ') cho khách hàng!');
        await loadCustomersTab();
      } else {
        showToast(data.error || 'Lỗi tạo dự án', true);
      }
    }

    async function assignExistingProjectToCustomer() {
      if (!activeCustomerId) return;
      var sel = document.getElementById('cust-assign-proj-select');
      var pid = Number(sel && sel.value);
      if (!pid) { showToast('Vui lòng chọn dự án cần gán', true); return; }
      await fetch('/portal/api/projects/' + pid, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customer_id: activeCustomerId })
      });
      showToast('Đã gán dự án vào khách hàng!');
      await loadCustomersTab();
    }

    async function updateProjectVatInCustomerView(pid, val) {
      var vatPct = Math.max(0, Math.min(100, Number(val) || 0));
      await fetch('/portal/api/projects/' + pid + '/quotation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vat_percent: vatPct })
      });
      showToast('Đã cập nhật thuế VAT (' + vatPct + '%) & tính lại lợi nhuận');
      await loadCustomersTab();
    }

    async function openProjectFromCustomer(pid) {
      await openProjectDetail(pid);
      switchTab('projects');
      document.getElementById('projects-master-view').style.display = 'none';
      document.getElementById('project-detail-view').style.display = 'block';
    }

    function renderCustomersTab() {
      var mv = document.getElementById('customers-master-view');
      var dv = document.getElementById('customer-detail-view');
      if (!mv || !dv) return;

      var allProjects = pmData.projects || [];
      var allCustomers = pmData.customers || [];

      if (customerLevel === 'detail' && activeCustomerId) {
        var cust = allCustomers.find(function(c) { return Number(c.id) === Number(activeCustomerId); });
        if (!cust) {
          customerLevel = 'master';
        } else {
          mv.style.display = 'none';
          dv.style.display = 'block';
          document.getElementById('cust-detail-title').textContent = '🏢 ' + cust.name;
          document.getElementById('cust-edit-name').value = cust.name || '';
          document.getElementById('cust-edit-tax').value = cust.tax_code || '';
          document.getElementById('cust-edit-contact').value = cust.contact_name || '';
          document.getElementById('cust-edit-phone').value = cust.contact_phone || '';
          document.getElementById('cust-edit-notes').value = cust.notes || '';

          var otherProjs = allProjects.filter(function(p) { return Number(p.customer_id) !== Number(cust.id); });
          var assignSel = document.getElementById('cust-assign-proj-select');
          if (assignSel) {
            assignSel.innerHTML = '<option value="">-- Gán thêm dự án có sẵn --</option>' + otherProjs.map(function(p) {
              return '<option value="' + p.id + '">' + esc(p.name) + ' (' + esc(p.business_unit || 'KM Gift') + ')</option>';
            }).join('');
          }

          var cProjsAll = allProjects.filter(function(p) { return Number(p.customer_id) === Number(cust.id); });
          var cProjs = customerDetailBuFilter === 'ALL'
            ? cProjsAll
            : cProjsAll.filter(function(p) { return (p.business_unit || 'KM Gift') === customerDetailBuFilter; });

          var sumRev = 0, sumVat = 0, sumCost = 0, sumProfit = 0;
          cProjs.forEach(function(p) {
            var rev = Number(p.total_revenue !== undefined ? p.total_revenue : p.total_quote) || 0;
            var vat = p.vat_amount !== undefined ? Number(p.vat_amount) : Math.round(rev * (Number(p.vat_percent !== undefined ? p.vat_percent : 8)) / 100);
            var cost = Number(p.total_cost) || 0;
            var prof = p.estimated_profit !== undefined ? Number(p.estimated_profit) : (rev - vat - cost);
            sumRev += rev; sumVat += vat; sumCost += cost; sumProfit += prof;
          });
          var sumMargin = sumRev > 0 ? Math.round((sumProfit * 100) / sumRev) : 0;

          document.getElementById('cust-det-count').textContent = String(cProjs.length);
          document.getElementById('cust-det-bu-sub').textContent = customerDetailBuFilter === 'ALL'
            ? ('KM Gift: ' + cProjsAll.filter(function(p) { return p.business_unit === 'KM Gift'; }).length + ' • KM Brand: ' + cProjsAll.filter(function(p) { return p.business_unit === 'KM Brand'; }).length + ' • Homeplanner: ' + cProjsAll.filter(function(p) { return p.business_unit === 'Homeplanner'; }).length)
            : ('Đang lọc mảng: ' + buDisplayName(customerDetailBuFilter));
          document.getElementById('cust-det-rev').textContent = fmtVnd(sumRev);
          document.getElementById('cust-det-cost').textContent = fmtVnd(sumCost);
          var detProfEl = document.getElementById('cust-det-profit');
          detProfEl.textContent = fmtVnd(sumProfit);
          detProfEl.style.color = sumProfit >= 0 ? '#059669' : '#DC2626';
          document.getElementById('cust-det-margin').textContent = 'VAT: ' + fmtVnd(sumVat) + ' • Biên LN: ' + sumMargin + '%';

          var pTbody = document.getElementById('cust-projects-tbody');
          var pTfoot = document.getElementById('cust-projects-tfoot');
          if (cProjs.length === 0) {
            pTbody.innerHTML = '<tr><td colspan="11" style="text-align:center; color:var(--text-muted); padding:24px;">Khách hàng này chưa có dự án nào trong bộ lọc hiện tại. Hãy bấm "+ Tạo Dự án mới cho khách" hoặc gán dự án có sẵn.</td></tr>';
            pTfoot.innerHTML = '';
          } else {
            pTbody.innerHTML = cProjs.map(function(p, idx) {
              var rev = Number(p.total_revenue !== undefined ? p.total_revenue : p.total_quote) || 0;
              var vatPct = p.vat_percent !== undefined ? Number(p.vat_percent) : 8;
              var vat = p.vat_amount !== undefined ? Number(p.vat_amount) : Math.round(rev * vatPct / 100);
              var cost = Number(p.total_cost) || 0;
              var prof = p.estimated_profit !== undefined ? Number(p.estimated_profit) : (rev - vat - cost);
              var margin = rev > 0 ? Math.round((prof * 100) / rev) : 0;
              return '<tr>' +
                '<td style="text-align:center; font-weight:700; color:var(--text-muted);">' + (idx + 1) + '</td>' +
                '<td><div style="font-weight:700; color:var(--text-main); cursor:pointer;" onclick="openProjectFromCustomer(' + p.id + ')">' + esc(p.name) + '</div><div style="font-size:11.5px; color:var(--text-muted);">Tiến độ: ' + (p.overall_progress || 0) + '% • ' + esc(p.items_preview || '-') + '</div></td>' +
                '<td><input class="wt-cell-input" style="font-family:JetBrains Mono,monospace; font-size:12px; min-width:110px;" placeholder="Mã HĐ..." value="' + esc(p.contract_code || '') + '" onchange="updateProjectContractCode(' + p.id + ', this.value)"></td>' +
                '<td><select class="select" style="height:30px; font-size:12px; min-width:130px; font-weight:600;" onchange="changeProjectBusinessUnit(' + p.id + ', this.value)">' + buOptionsHtml(p.business_unit) + '</select></td>' +
                '<td style="text-align:right; font-family:JetBrains Mono,monospace; font-weight:700; color:var(--primary); white-space:nowrap;">' + fmtVnd(rev) + '</td>' +
                '<td style="text-align:center;"><input type="number" min="0" max="30" class="wt-cell-input" style="width:54px; text-align:center; font-family:JetBrains Mono,monospace; border:1px solid var(--border);" value="' + vatPct + '" onchange="updateProjectVatInCustomerView(' + p.id + ', this.value)"></td>' +
                '<td style="text-align:right; font-family:JetBrains Mono,monospace; color:var(--text-muted); white-space:nowrap;">' + fmtVnd(vat) + '</td>' +
                '<td style="text-align:right; font-family:JetBrains Mono,monospace; font-weight:600; white-space:nowrap;">' + fmtVnd(cost) + '</td>' +
                '<td style="text-align:right; font-family:JetBrains Mono,monospace; font-weight:800; color:' + (prof >= 0 ? '#059669' : '#DC2626') + '; white-space:nowrap;">' + fmtVnd(prof) + '</td>' +
                '<td style="text-align:center;"><span class="badge ' + (prof >= 0 ? 'done' : 'err') + '">' + margin + '%</span></td>' +
                '<td><button class="btn btn-soft btn-sm" onclick="openProjectFromCustomer(' + p.id + ')">💰 Chi tiết Chi phí →</button></td>' +
              '</tr>';
            }).join('');
            pTfoot.innerHTML = '<tr style="background:var(--aux-muted); font-weight:800;">' +
              '<td colspan="4" style="text-align:right; color:var(--text-main);">TỔNG CỘNG (' + cProjs.length + ' dự án):</td>' +
              '<td style="text-align:right; font-family:JetBrains Mono,monospace; color:var(--primary); white-space:nowrap;">' + fmtVnd(sumRev) + '</td>' +
              '<td style="text-align:center;">—</td>' +
              '<td style="text-align:right; font-family:JetBrains Mono,monospace; color:var(--text-muted); white-space:nowrap;">' + fmtVnd(sumVat) + '</td>' +
              '<td style="text-align:right; font-family:JetBrains Mono,monospace; white-space:nowrap;">' + fmtVnd(sumCost) + '</td>' +
              '<td style="text-align:right; font-family:JetBrains Mono,monospace; color:' + (sumProfit >= 0 ? '#059669' : '#DC2626') + '; white-space:nowrap;">' + fmtVnd(sumProfit) + '</td>' +
              '<td style="text-align:center;"><span class="badge ' + (sumProfit >= 0 ? 'done' : 'err') + '">' + sumMargin + '%</span></td>' +
              '<td></td>' +
            '</tr>';
          }
          return;
        }
      }

      mv.style.display = 'block';
      dv.style.display = 'none';

      var filteredCustRows = allCustomers.map(function(cust) {
        var cAll = allProjects.filter(function(p) { return Number(p.customer_id) === Number(cust.id); });
        var cFiltered = customerBuFilter === 'ALL'
          ? cAll
          : cAll.filter(function(p) { return (p.business_unit || 'KM Gift') === customerBuFilter; });
        var rev = 0, cost = 0, vat = 0, prof = 0;
        cFiltered.forEach(function(p) {
          var r = Number(p.total_revenue !== undefined ? p.total_revenue : p.total_quote) || 0;
          var v = p.vat_amount !== undefined ? Number(p.vat_amount) : Math.round(r * 0.08);
          var co = Number(p.total_cost) || 0;
          var pr = p.estimated_profit !== undefined ? Number(p.estimated_profit) : (r - v - co);
          rev += r; vat += v; cost += co; prof += pr;
        });
        return {
          cust: cust,
          projs: cFiltered,
          allProjs: cAll,
          rev: rev,
          vat: vat,
          cost: cost,
          prof: prof,
          margin: rev > 0 ? Math.round((prof * 100) / rev) : 0
        };
      }).filter(function(row) {
        return customerBuFilter === 'ALL' || row.projs.length > 0;
      });

      var grandRev = filteredCustRows.reduce(function(s, r) { return s + r.rev; }, 0);
      var grandCost = filteredCustRows.reduce(function(s, r) { return s + r.cost; }, 0);
      var grandProf = filteredCustRows.reduce(function(s, r) { return s + r.prof; }, 0);

      document.getElementById('cust-kpi-count').textContent = String(filteredCustRows.length);
      document.getElementById('cust-kpi-filter-lbl').textContent = customerBuFilter === 'ALL' ? 'Tất cả các mảng (KM Gift, KM Brand, Homeplanner)' : ('Đang lọc mảng: ' + buDisplayName(customerBuFilter));
      document.getElementById('cust-kpi-rev').textContent = fmtVnd(grandRev);
      document.getElementById('cust-kpi-cost').textContent = fmtVnd(grandCost);
      var kpiProfEl = document.getElementById('cust-kpi-profit');
      kpiProfEl.textContent = fmtVnd(grandProf);
      kpiProfEl.style.color = grandProf >= 0 ? '#059669' : '#DC2626';

      var cTbody = document.getElementById('customers-master-tbody');
      if (filteredCustRows.length === 0) {
        cTbody.innerHTML = '<tr><td colspan="10" style="text-align:center; color:var(--text-muted); padding:28px;">Không có khách hàng nào trong mảng đang lọc.</td></tr>';
        return;
      }
      cTbody.innerHTML = filteredCustRows.map(function(row, idx) {
        var c = row.cust;
        var gCnt = row.projs.filter(function(p) { return p.business_unit === 'KM Gift'; }).length;
        var bCnt = row.projs.filter(function(p) { return p.business_unit === 'KM Brand'; }).length;
        var hCnt = row.projs.filter(function(p) { return p.business_unit === 'Homeplanner'; }).length;
        var badges = [];
        if (gCnt > 0) badges.push('<span class="badge">🎁 ' + gCnt + ' KM Gift</span>');
        if (bCnt > 0) badges.push('<span class="badge" style="background:#EFF6FF; color:#1D4ED8;">✨ ' + bCnt + ' KM Brand</span>');
        if (hCnt > 0) badges.push('<span class="badge muted">🏠 ' + hCnt + ' Homeplanner</span>');
        if (badges.length === 0) badges.push('<span class="badge muted">Chưa có dự án</span>');
        var repStr = [c.contact_name, c.contact_phone].filter(Boolean).join(' • ');
        return '<tr style="cursor:pointer;" onclick="openCustomerDetail(' + c.id + ')">' +
          '<td style="text-align:center; font-weight:700; color:var(--text-muted);">' + (idx + 1) + '</td>' +
          '<td><div style="font-weight:700; color:var(--text-main);">' + esc(c.name) + '</div>' + (c.notes ? '<div style="font-size:11.5px; color:var(--text-muted);">' + esc(c.notes) + '</div>' : '') + '</td>' +
          '<td style="font-size:12px; color:var(--text-body);">' + (c.tax_code ? '<div>MST: ' + esc(c.tax_code) + '</div>' : '') + (repStr ? '<div style="color:var(--text-muted);">' + esc(repStr) + '</div>' : '<span style="color:var(--text-muted);">—</span>') + '</td>' +
          '<td><div style="display:flex; gap:4px; flex-wrap:wrap;">' + badges.join('') + '</div></td>' +
          '<td style="text-align:right; font-family:JetBrains Mono,monospace; font-weight:700; color:var(--primary); white-space:nowrap;">' + fmtVnd(row.rev) + '</td>' +
          '<td style="text-align:right; font-family:JetBrains Mono,monospace; color:var(--text-muted); white-space:nowrap;">' + fmtVnd(row.vat) + '</td>' +
          '<td style="text-align:right; font-family:JetBrains Mono,monospace; font-weight:600; white-space:nowrap;">' + fmtVnd(row.cost) + '</td>' +
          '<td style="text-align:right; font-family:JetBrains Mono,monospace; font-weight:800; color:' + (row.prof >= 0 ? '#059669' : '#DC2626') + '; white-space:nowrap;">' + fmtVnd(row.prof) + '</td>' +
          '<td style="text-align:center;"><span class="badge ' + (row.prof >= 0 ? 'done' : 'err') + '">' + row.margin + '%</span></td>' +
          '<td><button class="btn btn-soft btn-sm" onclick="event.stopPropagation(); openCustomerDetail(' + c.id + ')">Tính lợi nhuận &amp; Dự án →</button></td>' +
        '</tr>';
      }).join('');
    }

    async function updateCostRow(costId, patch) {
      var item = (projectCostsData.costs || []).find(function(x) { return x.id === costId; });
      if (!item) return;
      var payload = Object.assign({}, item, patch, { id: costId });
      await fetch('/portal/api/projects/' + activeProjectId + '/costs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      showToast('Đã cập nhật chi phí & tính lại doanh thu/lợi nhuận');
      await loadProjectCosts();
      loadProjectsData(activeProjectId);
    }

    async function toggleCostInQuote(costId, checked) {
      if (!activeProjectId) return;
      var item = (projectCostsData.costs || []).find(function(x) { return x.id === costId; });
      if (!item) return;
      var modeSel = document.getElementById('q-display-mode');
      var payload = Object.assign({}, item, { id: costId, show_in_quote: checked ? 1 : 0 });
      await fetch('/portal/api/projects/' + activeProjectId + '/costs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (modeSel && modeSel.value === 'all' && !checked) {
        modeSel.value = 'selected';
        await saveQuotationMeta(false);
        showToast('Đã bỏ khỏi Báo giá & bật chế độ Chỉ báo giá mục đã chọn');
        return;
      }
      showToast(checked ? 'Đã chọn đưa hạng mục vào Báo giá' : 'Đã bỏ hạng mục khỏi Báo giá');
      await loadProjectCosts();
      loadProjectsData(activeProjectId);
    }

    async function toggleAllCostsInQuote(checked) {
      if (!activeProjectId) return;
      var modeSel = document.getElementById('q-display-mode');
      await fetch('/portal/api/projects/' + activeProjectId + '/costs/quote-selection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ showInQuote: checked ? 1 : 0 })
      });
      if (modeSel && modeSel.value === 'all' && !checked) {
        modeSel.value = 'selected';
        await saveQuotationMeta(false);
      } else {
        await loadProjectCosts();
        loadProjectsData(activeProjectId);
      }
      showToast(checked ? 'Đã chọn tất cả hạng mục vào Báo giá' : 'Đã bỏ chọn toàn bộ hạng mục khỏi Báo giá');
    }

    function toggleCostCreator() {
      var box = document.getElementById('cost-creator-box');
      box.style.display = box.style.display === 'none' ? 'block' : 'none';
    }

    async function submitNewCostItem() {
      var name = document.getElementById('new-cost-name').value.trim();
      if (!name) { showToast('Vui lòng nhập tên hạng mục', true); return; }
      var vendor = document.getElementById('new-cost-vendor').value.trim();
      var costAmount = parseVndNumber(document.getElementById('new-cost-amount').value);
      var qty = Math.max(1, Number(document.getElementById('new-cost-qty').value) || 1);
      var contractRef = document.getElementById('new-cost-contract').value.trim();
      var fileInp = document.getElementById('new-cost-file');
      var file = fileInp && fileInp.files && fileInp.files[0];
      var attachment_name = '';
      var attachment_data = '';
      if (file) {
        if (file.size > 4 * 1024 * 1024) { showToast('File chứng từ tối đa 4MB', true); return; }
        attachment_name = file.name;
        attachment_data = await readFileAsDataUrl(file);
      }
      var imgUrlInp = document.getElementById('new-cost-image-url');
      var imgFileInp = document.getElementById('new-cost-image-file');
      var product_image = imgUrlInp ? imgUrlInp.value.trim() : '';
      var imgFile = imgFileInp && imgFileInp.files && imgFileInp.files[0];
      if (imgFile) {
        if (imgFile.size > 6 * 1024 * 1024) { showToast('Ảnh sản phẩm tối đa 6MB', true); return; }
        product_image = await readProductImageAsDataUrl(imgFile, 640);
      }
      var defaultMarkup = Number(document.getElementById('q-default-markup').value) || 1.5;
      await fetch('/portal/api/projects/' + activeProjectId + '/costs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          item_name: name,
          vendor_name: vendor,
          cost_amount: costAmount,
          quantity: qty,
          markup_factor: defaultMarkup,
          contract_ref: contractRef,
          attachment_name: attachment_name,
          attachment_data: attachment_data,
          product_image: product_image,
          show_in_quote: 1
        })
      });
      document.getElementById('new-cost-name').value = '';
      document.getElementById('new-cost-vendor').value = '';
      document.getElementById('new-cost-amount').value = '';
      document.getElementById('new-cost-contract').value = '';
      if (fileInp) fileInp.value = '';
      if (imgUrlInp) imgUrlInp.value = '';
      if (imgFileInp) imgFileInp.value = '';
      document.getElementById('cost-creator-box').style.display = 'none';
      showToast('Đã thêm hạng mục chi phí mới');
      await loadProjectCosts();
      loadProjectsData(activeProjectId);
    }

    async function deleteCostItem(costId) {
      if (!confirm('Xóa khoản chi phí này?')) return;
      await fetch('/portal/api/projects/costs/' + costId, { method: 'DELETE' });
      showToast('Đã xóa khoản chi');
      await loadProjectCosts();
      loadProjectsData(activeProjectId);
    }

    function applyTierPreset() {
      var tier = document.getElementById('q-client-tier').value;
      var map = {
        'Khách lẻ': 1.7,
        'Doanh nghiệp': 1.5,
        'Đối tác / Đại lý': 1.35,
        'VIP / Chuỗi': 1.6
      };
      document.getElementById('q-default-markup').value = map[tier] || 1.5;
    }

    async function saveQuotationMeta(applyMarkupToAll) {
      if (!activeProjectId) return;
      var payload = {
        contract_code: document.getElementById('q-contract-code').value.trim(),
        customer_name: document.getElementById('q-cust-name').value.trim(),
        customer_tax_code: document.getElementById('q-cust-tax').value.trim(),
        contact_name: document.getElementById('q-contact-name').value.trim(),
        contact_phone: document.getElementById('q-contact-phone').value.trim(),
        client_tier: document.getElementById('q-client-tier').value,
        default_markup: Number(document.getElementById('q-default-markup').value) || 1.5,
        vat_percent: Number(document.getElementById('q-vat-percent').value) || 0,
        display_mode: document.getElementById('q-display-mode').value || 'all',
        payment_terms: document.getElementById('q-payment-terms').value.trim(),
        bank_info: document.getElementById('q-bank-info').value.trim(),
        bank_qr_url: document.getElementById('q-bank-qr-url').value.trim(),
        applyMarkupToAll: Boolean(applyMarkupToAll)
      };
      await fetch('/portal/api/projects/' + activeProjectId + '/quotation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      showToast(applyMarkupToAll ? 'Đã áp dụng hệ số mới cho tất cả hạng mục!' : 'Đã tự động lưu thông tin báo giá');
      await loadProjectCosts();
      loadProjectsData(activeProjectId);
    }

    function buildQuotationDocumentHtml(isForDownload) {
      var q = projectCostsData.quotation || {};
      var costs = projectCostsData.costs || [];
      var sum = projectCostsData.summary || {};
      var ap = pmData.activeProject || {};
      var vatPct = Number(q.vat_percent !== undefined ? q.vat_percent : 8);
      var displayMode = document.getElementById('q-display-mode').value || q.display_mode || 'selected';
      var custName = document.getElementById('q-cust-name').value.trim() || q.customer_name || 'Quý Đối tác';
      var custTax = document.getElementById('q-cust-tax').value.trim() || q.customer_tax_code || '';
      var contactName = document.getElementById('q-contact-name').value.trim() || q.contact_name || '';
      var contactPhone = document.getElementById('q-contact-phone').value.trim() || q.contact_phone || '';
      var contractCode = document.getElementById('q-contract-code').value.trim() || projectCostsData.contract_code || ap.contract_code || '';
      var payTerms = document.getElementById('q-payment-terms').value.trim() || q.payment_terms || '';
      var bankInfo = document.getElementById('q-bank-info').value.trim() || q.bank_info || '';
      var bankQr = document.getElementById('q-bank-qr-url').value.trim() || q.bank_qr_url || '';

      function renderQuoteRowHtml(item, idx, includeImgCol) {
        var imgCell = includeImgCol
          ? '<td style="text-align:center;vertical-align:middle;width:80px;">' + (item.product_image ? '<img src="' + esc(item.product_image) + '" alt="' + esc(item.item_name) + '" width="64" height="64" style="width:64px;height:64px;object-fit:cover;border-radius:6px;border:1px solid #CBD5E1;display:block;margin:0 auto;">' : '<span style="color:#94A3B8;font-size:11px;">—</span>') + '</td>'
          : '';
        return '<tr><td style="text-align:center;">' + (idx + 1) + '</td>' + imgCell + '<td><strong>' + esc(item.item_name) + '</strong></td><td style="text-align:center;">' + esc(item.unit || 'gói') + '</td><td style="text-align:center;">' + (item.quantity || 1) + '</td><td style="text-align:right;font-family:monospace;">' + Number(item.quote_unit_price || 0).toLocaleString('vi-VN') + '</td><td style="text-align:right;font-family:monospace;font-weight:700;">' + Number(item.quote_line_total || 0).toLocaleString('vi-VN') + '</td><td style="font-size:12px;color:#475569;">' + (item.duration_days ? 'Dự kiến ' + item.duration_days + ' ngày' : '') + '</td></tr>';
      }

      var hasAnyImage = false;
      var rows = '';
      var quoteSubTotal = costs.reduce(function(s, x) { return s + (Number(x.quote_line_total) || 0); }, 0);
      if (displayMode === 'selected') {
        var selItems = costs.filter(function(c) { return Number(c.show_in_quote !== undefined ? c.show_in_quote : 1) !== 0; });
        quoteSubTotal = selItems.reduce(function(s, x) { return s + (Number(x.quote_line_total) || 0); }, 0);
        hasAnyImage = selItems.some(function(c) { return Boolean(c.product_image && String(c.product_image).trim()); });
        rows = selItems.length > 0
          ? selItems.map(function(item, idx) { return renderQuoteRowHtml(item, idx, hasAnyImage); }).join('')
          : '<tr><td colspan="7" style="text-align:center;color:#64748B;padding:16px;">Chưa có hạng mục nào được tick chọn đưa vào Báo giá.</td></tr>';
      } else if (displayMode === 'hidden') {
        var visibleItems = costs.filter(function(c) { return Number(c.show_in_quote !== undefined ? c.show_in_quote : 1) !== 0; });
        var hiddenSum = costs.filter(function(c) { return Number(c.show_in_quote !== undefined ? c.show_in_quote : 1) === 0; }).reduce(function(s, x) { return s + (Number(x.quote_line_total) || 0); }, 0);
        if (visibleItems.length === 0 || (hiddenSum === 0 && costs.length > 0 && visibleItems.length === costs.length)) {
          rows = '<tr><td style="text-align:center;">1</td><td><strong>Trọn gói triển khai dự án: ' + esc(ap.name || 'Quà tặng doanh nghiệp') + '</strong><div style="font-size:12px;color:#475569;margin-top:3px;">Bao gồm toàn bộ thiết kế, sản xuất &amp; hoàn thiện theo yêu cầu.</div></td><td style="text-align:center;">gói</td><td style="text-align:center;">1</td><td style="text-align:right;font-family:monospace;">' + Number(quoteSubTotal || 0).toLocaleString('vi-VN') + '</td><td style="text-align:right;font-family:monospace;font-weight:700;">' + Number(quoteSubTotal || 0).toLocaleString('vi-VN') + '</td><td>Theo tiến độ HĐ</td></tr>';
        } else {
          hasAnyImage = visibleItems.some(function(c) { return Boolean(c.product_image && String(c.product_image).trim()); });
          rows = visibleItems.map(function(item, idx) {
            return renderQuoteRowHtml(item, idx, hasAnyImage);
          }).join('');
          if (hiddenSum > 0) {
            rows += '<tr><td style="text-align:center;">' + (visibleItems.length + 1) + '</td>' + (hasAnyImage ? '<td style="text-align:center;color:#94A3B8;font-size:11px;">—</td>' : '') + '<td><strong>Chi phí triển khai, vận hành &amp; hoàn thiện dự án (Gói gộp)</strong></td><td style="text-align:center;">gói</td><td style="text-align:center;">1</td><td style="text-align:right;font-family:monospace;">' + Number(hiddenSum).toLocaleString('vi-VN') + '</td><td style="text-align:right;font-family:monospace;font-weight:700;">' + Number(hiddenSum).toLocaleString('vi-VN') + '</td><td></td></tr>';
          }
        }
      } else {
        hasAnyImage = costs.some(function(c) { return Boolean(c.product_image && String(c.product_image).trim()); });
        rows = costs.map(function(item, idx) {
          return renderQuoteRowHtml(item, idx, hasAnyImage);
        }).join('');
      }
      var quoteVatAmt = Math.round(quoteSubTotal * vatPct / 100);
      var quoteGrandTotal = quoteSubTotal + quoteVatAmt;

      var contactDisplay = [contactName, contactPhone].filter(Boolean).join(' — ') || q.customer_rep || '-';
      var qrHtml = bankQr ? '<div style="text-align:center;"><img src="' + esc(bankQr) + '" alt="QR Thanh toán" style="width:110px;height:110px;object-fit:contain;border:1px solid #CBD5E1;border-radius:6px;background:#fff;padding:4px;"></div>' : '';
      var topBtns = isForDownload ? '' : '<div class="no-p" style="display:flex;justify-content:flex-end;gap:8px;margin-bottom:12px;"><button class="btn" style="background:#EFF6FF;color:#1D4ED8;border:1px solid #BFDBFE;" onclick="window.opener && window.opener.downloadQuotationDoc && window.opener.downloadQuotationDoc()">💾 Lưu file Báo Giá (.doc)</button><button class="btn" onclick="window.print()">🖨️ In / Lưu PDF Báo Giá</button></div>';

      return '<!DOCTYPE html><html lang="vi"><head><meta charset="UTF-8"><title>' + esc(q.title || 'BÁO GIÁ KHỞI MINH CST') + '</title>' +
        '<style>@page{size:A4 portrait;margin:14mm;}body{font-family:Segoe UI,Arial,sans-serif;color:#0F172A;margin:0;padding:24px;background:#F8FAFC;}.sheet{max-width:860px;margin:0 auto;background:#fff;padding:32px;border:1px solid #E2E8F0;border-radius:8px;}.header{display:flex;justify-content:space-between;gap:20px;border-bottom:2px solid #2563EB;padding-bottom:16px;margin-bottom:20px;}.co-name{font-size:15px;font-weight:800;color:#2563EB;margin-bottom:6px;}.co-meta,.cust-box{font-size:12.5px;color:#475569;line-height:1.6;}h1{text-align:center;font-size:19px;font-weight:800;margin:10px 0 6px;}table{width:100%;border-collapse:collapse;margin:16px 0;font-size:13px;}th{background:#EFF6FF;border:1px solid #CBD5E1;padding:9px;text-align:left;}td{border:1px solid #CBD5E1;padding:9px;}.totals{width:340px;margin-left:auto;font-size:13.5px;}.totals td{border:none;padding:5px 8px;}.totals tr.grand td{border-top:2px solid #2563EB;font-weight:800;color:#2563EB;}.pay-box{display:flex;justify-content:space-between;align-items:flex-start;gap:16px;font-size:12.5px;background:#F8FAFC;padding:14px;border:1px solid #E2E8F0;border-radius:6px;line-height:1.6;}.btn{background:#2563EB;color:#fff;border:none;padding:9px 16px;border-radius:6px;font-weight:600;cursor:pointer;}@media print{.no-p{display:none!important;}body{background:#fff;padding:0;}.sheet{border:none;}}</style></head><body>' +
        '<div class="sheet">' + topBtns +
        '<div class="header"><div><div class="co-name">CÔNG TY CỔ PHẦN TƯ VẤN, DỊCH VỤ VÀ THƯƠNG MẠI KHỞI MINH (KHOI MINH CST)</div><div class="co-meta">VPGD: 102/6 Lê Thánh Tông, Hoàn Kiếm, Hà Nội<br>Showroom: 6/38 Phố Huế, Cửa Nam, Hà Nội | Liên hệ: 079.338.1666</div></div>' +
        '<div class="cust-box"><div><strong>Khách hàng:</strong> ' + esc(custName) + '</div>' + (custTax ? '<div><strong>MST:</strong> ' + esc(custTax) + '</div>' : '') + '<div><strong>Đại diện:</strong> ' + esc(contactDisplay) + '</div>' + (contractCode ? '<div><strong>Mã HĐ:</strong> ' + esc(contractCode) + '</div>' : '') + '<div><strong>Ngày:</strong> ' + esc(q.quote_date || '') + '</div></div></div>' +
        '<h1>' + esc(q.title || 'BÁO GIÁ SẢN PHẨM & DỊCH VỤ') + ' (CHƯA BAO GỒM ' + vatPct + '% VAT)</h1>' +
        '<table><thead><tr><th style="width:40px;text-align:center;">No.</th>' + (hasAnyImage ? '<th style="width:80px;text-align:center;">HÌNH ẢNH</th>' : '') + '<th>MÔ TẢ HẠNG MỤC</th><th style="width:65px;text-align:center;">ĐƠN VỊ</th><th style="width:60px;text-align:center;">SL</th><th style="width:110px;text-align:right;">ĐƠN GIÁ</th><th style="width:120px;text-align:right;">THÀNH TIỀN</th><th>GHI CHÚ</th></tr></thead><tbody>' + rows + '</tbody></table>' +
        '<table class="totals"><tr><td>Tổng doanh thu (Chưa VAT):</td><td style="text-align:right;font-weight:700;">' + fmtVnd(quoteSubTotal) + '</td></tr><tr><td>Thuế GTGT (' + vatPct + '%):</td><td style="text-align:right;">' + fmtVnd(quoteVatAmt) + '</td></tr><tr class="grand"><td>TỔNG THANH TOÁN:</td><td style="text-align:right;">' + fmtVnd(quoteGrandTotal) + '</td></tr></table>' +
        '<div class="pay-box"><div style="flex:1;"><div><strong>Điều khoản thanh toán:</strong><br>' + esc(payTerms).replace(/\\n/g, '<br>') + '</div><div style="margin-top:8px;"><strong>Thông tin STK &amp; Ngân hàng:</strong><br>' + esc(bankInfo).replace(/\\n/g, '<br>') + '</div></div>' + qrHtml + '</div>' +
        '</div></body></html>';
    }

    function ensureQuoteHasSelectionForSelectedMode() {
      var mode = (document.getElementById('q-display-mode') && document.getElementById('q-display-mode').value) || 'selected';
      if (mode !== 'selected') return true;
      var costs = projectCostsData.costs || [];
      var sel = costs.filter(function(c) { return Number(c.show_in_quote !== undefined ? c.show_in_quote : 1) !== 0; });
      if (costs.length > 0 && sel.length === 0) {
        showToast('Chưa tick chọn hạng mục nào trong cột Báo giá!', true);
        return false;
      }
      return true;
    }

    function downloadQuotationDoc() {
      if (!activeProjectId || !ensureQuoteHasSelectionForSelectedMode()) return;
      var mode = document.getElementById('q-display-mode').value || 'selected';
      if (!window.__KM_IS_STATIC) {
        window.location.href = '/portal/api/projects/' + activeProjectId + '/quotation/print?download=doc&mode=' + encodeURIComponent(mode);
        return;
      }
      var docHtml = String.fromCharCode(0xFEFF) + buildQuotationDocumentHtml(true);
      var blob = new Blob([docHtml], { type: 'application/msword;charset=utf-8' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = 'BaoGia-DuAn-' + activeProjectId + '.doc';
      document.body.appendChild(a);
      a.click();
      setTimeout(function() { URL.revokeObjectURL(url); a.remove(); }, 1000);
      showToast('Đã lưu file Báo Giá (.doc) về máy!');
    }

    function openPrintableQuotation() {
      if (!activeProjectId || !ensureQuoteHasSelectionForSelectedMode()) return;
      var mode = document.getElementById('q-display-mode').value || 'selected';
      if (!window.__KM_IS_STATIC) {
        window.open('/portal/api/projects/' + activeProjectId + '/quotation/print?mode=' + encodeURIComponent(mode), '_blank');
        return;
      }
      var w = window.open('', '_blank');
      if (!w) { showToast('Trình duyệt đã chặn popup, vui lòng cho phép mở tab mới', true); return; }
      w.document.open();
      w.document.write(buildQuotationDocumentHtml(false));
      w.document.close();
    }

    function updateSliderLabel(el) {
      if (el && el.nextElementSibling) el.nextElementSibling.textContent = el.value + '%';
    }

    function onCardMouseDown(ev, card) {
      var tag = ev.target && ev.target.tagName;
      var inCl = ev.target && ev.target.closest && ev.target.closest('.cl-box');
      if (tag === 'INPUT' || tag === 'BUTTON' || tag === 'SELECT' || tag === 'LABEL' || inCl) {
        card.setAttribute('draggable', 'false');
      } else {
        card.setAttribute('draggable', 'true');
      }
    }

    function onCardMouseUp(card) {
      card.setAttribute('draggable', 'true');
    }

    function onTaskDragStart(ev, taskId) {
      draggedTaskId = taskId;
      if (ev.dataTransfer) {
        ev.dataTransfer.effectAllowed = 'move';
        ev.dataTransfer.setData('text/plain', String(taskId));
      }
      ev.currentTarget.classList.add('dragging');
    }

    function onTaskDragEnd(ev) {
      ev.currentTarget.classList.remove('dragging');
      document.querySelectorAll('.kanban-col').forEach(function(c) { c.classList.remove('drag-over'); });
    }

    function onColDragOver(ev) {
      ev.preventDefault();
      if (ev.dataTransfer) ev.dataTransfer.dropEffect = 'move';
      ev.currentTarget.classList.add('drag-over');
    }

    function onColDragLeave(ev) {
      ev.currentTarget.classList.remove('drag-over');
    }

    function deriveTaskKanbanStatus(t) {
      var cl = Array.isArray(t.checklist) ? t.checklist : [];
      if (cl.length > 0) {
        var clDone = cl.filter(function(i) { return i.done && !i.cancelled; }).length;
        var clCancelled = cl.filter(function(i) { return i.cancelled; }).length;
        var clActive = cl.length - clCancelled;
        if (clDone === 0 && clCancelled === 0) return 'pending';
        if ((clActive > 0 && clDone === clActive) || (clCancelled === cl.length && (t.status === 'completed' || t.status === 'done'))) return 'done';
        return 'in_progress';
      }
      if (t.progress >= 100 || t.status === 'completed' || t.status === 'done') return 'done';
      if (t.status === 'in_progress' || (t.progress || 0) > 0) return 'in_progress';
      return 'pending';
    }

    var pendingTransitionModal = null;

    function openChecklistTransitionModal(taskId, targetStatus) {
      var t = (pmData.tasks || []).find(function(x) { return x.id === taskId; });
      if (!t) return;
      var cl = Array.isArray(t.checklist) ? t.checklist : [];
      pendingTransitionModal = {
        taskId: taskId,
        targetStatus: targetStatus,
        items: cl.map(function(i) {
          return {
            id: String(i.id),
            text: i.text,
            done: Boolean(i.done && !i.cancelled),
            cancelled: Boolean(i.cancelled),
            keepActive: false
          };
        })
      };
      var isDoneTarget = targetStatus === 'completed' || targetStatus === 'done';
      document.getElementById('cl-modal-title').textContent = 'Xác nhận đầu mục: ' + (t.title || 'Công việc');
      var badge = document.getElementById('cl-modal-target-badge');
      badge.className = 'badge ' + (isDoneTarget ? 'done' : '');
      badge.textContent = isDoneTarget ? 'Chuyển → Hoàn thành' : 'Chuyển → Đang thực hiện';
      document.getElementById('cl-modal-subtitle').innerHTML = isDoneTarget
        ? 'Bạn đang chuyển công việc sang <strong>Hoàn thành</strong>. Hãy tick (&#9745;) những việc đã làm — các việc không tick sẽ được đánh dấu là <strong>Bị huỷ</strong>.'
        : 'Bạn đang chuyển công việc sang <strong>Đang thực hiện</strong> nhưng chưa có đầu mục nào phù hợp được tick. Hãy tick (&#9745;) việc đã làm; các việc không tick sẽ mặc định là <strong>Bị huỷ</strong> (hoặc bấm giữ làm tiếp).';
      document.getElementById('cl-modal-keep-btn').style.display = isDoneTarget ? 'none' : 'inline-flex';
      document.getElementById('cl-modal-confirm-btn').textContent = isDoneTarget
        ? '✅ Xác nhận Hoàn thành (Mục không tick = Bị huỷ)'
        : '✅ Xác nhận (Mục không tick = Bị huỷ)';
      renderChecklistTransitionModalItems();
      document.getElementById('checklist-transition-modal').style.display = 'flex';
    }

    function renderChecklistTransitionModalItems() {
      var wrap = document.getElementById('cl-modal-items');
      if (!wrap || !pendingTransitionModal) return;
      var isInProg = pendingTransitionModal.targetStatus === 'in_progress';
      wrap.innerHTML = pendingTransitionModal.items.map(function(item, idx) {
        var rightCtrl = '';
        if (item.done) {
          rightCtrl = '<span class="badge done" style="flex-shrink:0;">✅ Đã làm</span>';
        } else if (isInProg) {
          rightCtrl = '<button type="button" class="btn btn-sm" style="height:24px; font-size:11px; padding:0 8px; flex-shrink:0;" onclick="event.preventDefault(); event.stopPropagation(); toggleModalItemMode(' + idx + ')">' +
            (item.keepActive ? '⏳ Chờ làm tiếp' : '🚫 Bị huỷ (Không tick)') +
          '</button>';
        } else {
          rightCtrl = '<span class="cl-cancel-badge" style="font-size:11px; padding:2px 8px;">🚫 Bị huỷ (Không tick)</span>';
        }
        return '<label style="display:flex; align-items:center; gap:10px; padding:10px 12px; border:1px solid var(--border); border-radius:8px; cursor:pointer; background:' + (item.done ? '#ECFDF5' : (item.keepActive ? '#FFFFFF' : '#FEF2F2')) + ';">' +
          '<input type="checkbox" style="width:17px; height:17px; cursor:pointer; flex-shrink:0;"' + (item.done ? ' checked' : '') + ' onchange="toggleModalChecklistCheck(' + idx + ', this.checked)">' +
          '<span style="flex:1; font-size:13px; color:var(--text-main); ' + (!item.done && !item.keepActive ? 'text-decoration:line-through; color:#64748B;' : 'font-weight:600;') + '">' + esc(item.text) + '</span>' +
          rightCtrl +
        '</label>';
      }).join('');
    }

    function toggleModalChecklistCheck(idx, checked) {
      if (!pendingTransitionModal || !pendingTransitionModal.items[idx]) return;
      var item = pendingTransitionModal.items[idx];
      item.done = Boolean(checked);
      if (item.done) {
        item.cancelled = false;
        item.keepActive = false;
      }
      renderChecklistTransitionModalItems();
    }

    function toggleModalItemMode(idx) {
      if (!pendingTransitionModal || !pendingTransitionModal.items[idx]) return;
      pendingTransitionModal.items[idx].keepActive = !pendingTransitionModal.items[idx].keepActive;
      renderChecklistTransitionModalItems();
    }

    function closeChecklistTransitionModal() {
      pendingTransitionModal = null;
      var el = document.getElementById('checklist-transition-modal');
      if (el) el.style.display = 'none';
    }

    async function confirmChecklistTransition(cancelUnticked) {
      if (!pendingTransitionModal) return;
      var state = pendingTransitionModal;
      var checkedCount = state.items.filter(function(i) { return i.done; }).length;
      if (!cancelUnticked && checkedCount === 0) {
        showToast('Vui lòng tick ít nhất 1 đầu mục đã làm!', true);
        return;
      }
      var payloadItems = state.items.map(function(i) {
        if (i.done) return { id: i.id, text: i.text, done: true, cancelled: false };
        var keep = !cancelUnticked || (state.targetStatus === 'in_progress' && i.keepActive);
        return { id: i.id, text: i.text, done: false, cancelled: !keep };
      });
      await fetch('/portal/api/tasks/' + state.taskId + '/checklist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'bulk_update',
          targetStatus: state.targetStatus,
          items: payloadItems
        })
      });
      closeChecklistTransitionModal();
      showToast('Đã cập nhật trạng thái công việc & đầu mục!');
      await loadProjectsData(activeProjectId);
    }

    async function onColDrop(ev) {
      ev.preventDefault();
      ev.currentTarget.classList.remove('drag-over');
      var targetStatus = ev.currentTarget.getAttribute('data-status');
      var targetStageId = ev.currentTarget.getAttribute('data-stage-id');
      var id = draggedTaskId || Number(ev.dataTransfer && ev.dataTransfer.getData('text/plain'));
      draggedTaskId = null;
      if (!id) return;
      var t = (pmData.tasks || []).find(function(x) { return x.id === id; });
      if (!t) return;

      if (targetStageId) {
        var sid = Number(targetStageId);
        await fetch('/portal/api/tasks/' + id, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ stage_id: sid })
        });
        showToast('Đã chuyển "' + t.title + '" sang giai đoạn mới');
        loadProjectsData(activeProjectId);
        return;
      }

      if (targetStatus) {
        var cl = Array.isArray(t.checklist) ? t.checklist : [];
        if (cl.length > 0) {
          var curStatus = deriveTaskKanbanStatus(t);
          var clDone = cl.filter(function(i) { return i.done && !i.cancelled; }).length;
          var clActive = cl.filter(function(i) { return !i.cancelled; }).length;
          if (targetStatus === 'pending') {
            await fetch('/portal/api/tasks/' + id + '/checklist', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ action: 'bulk_update', targetStatus: 'pending' })
            });
            showToast('Đã đưa "' + t.title + '" về Chờ làm (0% — bỏ tick đầu mục)');
            loadProjectsData(activeProjectId);
            return;
          }
          if (targetStatus === 'in_progress') {
            if (clDone === 0 || (curStatus === 'done' && clActive > 0 && clDone === clActive)) {
              openChecklistTransitionModal(t.id, 'in_progress');
              return;
            }
          }
          if (targetStatus === 'done') {
            if (clDone < clActive || (curStatus !== 'done' && clDone === 0)) {
              openChecklistTransitionModal(t.id, 'completed');
              return;
            }
          }
        }
        var nextPct = targetStatus === 'done' ? 100 : (targetStatus === 'pending' ? 0 : (t.progress > 0 && t.progress < 100 ? t.progress : 50));
        await fetch('/portal/api/tasks/' + id, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: targetStatus, progress: nextPct })
        });
        showToast('Đã chuyển "' + t.title + '" (' + nextPct + '%)');
        loadProjectsData(activeProjectId);
      }
    }

    async function loadProjectsData(projectId) {
      try {
        var qs = projectId ? '?projectId=' + projectId : '';
        var res = await fetch('/portal/api/data' + qs);
        var data = await res.json();
        pmData = data;
        activeProjectId = (data.activeProject && data.activeProject.id) || 1;
        renderProjectsTab();
        var custPanel = document.getElementById('panel-customers');
        if (custPanel && custPanel.classList.contains('active')) renderCustomersTab();
      } catch (e) {}
    }

    function fmtShortDate(iso) {
      if (!iso) return '--/--';
      var parts = String(iso).slice(0, 10).split('-');
      if (parts.length !== 3) return iso;
      return parts[2] + '/' + parts[1];
    }

    function toggleKmGiftCreator() {
      var box = document.getElementById('km-gift-creator');
      box.style.display = box.style.display === 'none' ? 'block' : 'none';
    }

    async function createKmGiftProject() {
      var name = document.getElementById('new-km-name').value.trim();
      var businessUnit = document.getElementById('new-km-bu').value;
      var customerSel = document.getElementById('new-km-customer');
      var customerId = customerSel && customerSel.value ? Number(customerSel.value) : null;
      var flowType = document.getElementById('new-km-flow').value;
      var depositDate = document.getElementById('new-km-deposit').value;
      if (!name) {
        showToast('Vui lòng nhập tên dự án', true);
        return;
      }
      var res = await fetch('/portal/api/projects/km-gift-template', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name, businessUnit: businessUnit, customerId: customerId, flowType: flowType, depositDate: depositDate })
      });
      var data = await res.json();
      if (data.ok) {
        document.getElementById('new-km-name').value = '';
        document.getElementById('km-gift-creator').style.display = 'none';
        activeBu = businessUnit;
        showToast('Đã tạo dự án và tự tính toàn bộ deadline SLA!');
        openProjectDetail(data.id);
      } else {
        showToast(data.error || 'Lỗi tạo dự án', true);
      }
    }

    async function recalculateProjectSla() {
      if (!activeProjectId) return;
      var depositDate = document.getElementById('sla-deposit-date').value;
      var inputs = document.querySelectorAll('.sla-days-input');
      var stageSlaUpdates = [];
      inputs.forEach(function(inp) {
        var sid = Number(inp.getAttribute('data-stage-id'));
        if (sid) stageSlaUpdates.push({ id: sid, slaDays: Number(inp.value) || 0 });
      });
      var res = await fetch('/portal/api/projects/' + activeProjectId + '/recalculate-sla', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ depositDate: depositDate, stageSlaUpdates: stageSlaUpdates })
      });
      var data = await res.json();
      if (data.ok) {
        showToast('Đã cập nhật dây chuyền SLA theo mốc ký HĐ / tạm ứng ' + fmtShortDate(depositDate));
        loadProjectsData(activeProjectId);
      } else {
        showToast(data.error || 'Lỗi tính SLA', true);
      }
    }

    async function toggleChecklistItem(taskId, itemId) {
      await fetch('/portal/api/tasks/' + taskId + '/checklist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'toggle', itemId: itemId })
      });
      await loadProjectsData(activeProjectId);
      showToast('Đã cập nhật trạng thái đầu mục & thanh tiến độ!');
    }

    function toggleChecklistFromInput(inp) {
      var taskId = Number(inp.getAttribute('data-task-id'));
      var itemId = inp.getAttribute('data-item-id');
      if (taskId && itemId) toggleChecklistItem(taskId, itemId);
    }

    async function addChecklistItem(taskId) {
      var text = prompt('Nhập đầu mục công việc con mới (để người phụ trách báo Bot):');
      if (!text || !text.trim()) return;
      await fetch('/portal/api/tasks/' + taskId + '/checklist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'add', text: text.trim() })
      });
      showToast('Đã thêm đầu mục mới');
      loadProjectsData(activeProjectId);
    }

    async function promptBotReport(taskId) {
      var report = prompt('Nhập nội dung báo cáo gửi cho Bot (VD: "Đã làm xong moodboard và bản vẽ 2D" hoặc "Xong hết"):');
      if (!report || !report.trim()) return;
      var res = await fetch('/portal/api/tasks/' + taskId + '/bot-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportText: report.trim(), senderName: 'Phụ trách' })
      });
      var data = await res.json();
      if (data.ok) {
        var msg = data.newlyCompletedTexts && data.newlyCompletedTexts.length > 0
          ? 'Bot đã tự đánh dấu ' + data.newlyCompletedTexts.length + ' đầu mục -> Tiến độ: ' + data.progress + '%'
          : 'Bot đã ghi nhận báo cáo -> Tiến độ: ' + data.progress + '%';
        showToast(msg);
        loadProjectsData(activeProjectId);
      } else {
        showToast(data.error || 'Bot chưa cập nhật được tiến độ', true);
      }
    }

    function renderKanbanCard(t, showStageBadge) {
      var stKey = deriveTaskKanbanStatus(t);
      var isDone = stKey === 'done';
      var pillText = showStageBadge ? (t.stage_title || 'Giai đoạn') : (isDone ? 'Hoàn thành' : (stKey === 'in_progress' ? 'Đang làm' : 'Chờ làm'));
      var pillClass = showStageBadge ? 'muted' : (isDone ? 'done' : (stKey === 'in_progress' ? '' : 'muted'));
      var cl = Array.isArray(t.checklist) ? t.checklist : [];
      var clDone = cl.filter(function(i) { return i.done && !i.cancelled; }).length;
      var clCancelled = cl.filter(function(i) { return i.cancelled; }).length;
      var clActive = cl.length - clCancelled;
      var clHtml = cl.map(function(item) {
        var itemCls = item.cancelled ? ' cancelled' : (item.done ? ' done' : '');
        var checkedAttr = (!item.cancelled && item.done) ? ' checked' : '';
        var cancelBadge = item.cancelled ? '<span class="cl-cancel-badge">Đã huỷ</span>' : '';
        return '<label class="cl-item' + itemCls + '">' +
          '<input type="checkbox" data-task-id="' + t.id + '" data-item-id="' + esc(item.id) + '"' + checkedAttr + ' onchange="toggleChecklistFromInput(this)">' +
          '<span style="flex:1;">' + esc(item.text) + '</span>' +
          cancelBadge +
        '</label>';
      }).join('');

      return '<div class="kanban-card" data-task-id="' + t.id + '" draggable="true" onmousedown="onCardMouseDown(event, this)" onmouseup="onCardMouseUp(this)" ondragstart="onTaskDragStart(event, ' + t.id + ')" ondragend="onTaskDragEnd(event)">' +
        '<div style="font-weight:700; font-size:13.5px; color:var(--text-main); margin-bottom:4px;">' + esc(t.title) + '</div>' +
        '<div style="display:flex; justify-content:space-between; align-items:center; font-size:11.5px; color:var(--text-muted); margin-bottom:8px;">' +
          '<span>' + esc(t.assigned_name || t.assigned_phone || 'Chưa gán') + '</span>' +
          '<span>Hạn: ' + esc(t.deadline ? t.deadline.slice(0, 10) : 'Chưa đặt') + '</span>' +
        '</div>' +
        '<div style="margin-bottom:8px;">' +
          '<div class="progress-header">' +
            '<span>Tiến độ tự động: ' + clDone + '/' + clActive + ' đầu mục' + (clCancelled > 0 ? ' (Huỷ ' + clCancelled + ')' : '') + '</span>' +
            '<span style="font-family:JetBrains Mono,monospace; color:' + (isDone ? '#059669' : 'var(--primary)') + ';">' + (t.progress || 0) + '%</span>' +
          '</div>' +
          '<div class="progress-track"><div class="progress-fill' + (isDone ? ' done' : '') + '" style="width:' + Math.min(100, Math.max(0, t.progress || 0)) + '%;"></div></div>' +
        '</div>' +
        '<div class="cl-box">' +
          (clHtml || '<div style="font-size:11px; color:var(--text-muted);">Chưa có đầu mục con</div>') +
          '<button class="btn btn-sm" style="height:24px; font-size:11px; align-self:flex-start; margin-top:2px;" onclick="addChecklistItem(' + t.id + ')">+ Thêm đầu mục</button>' +
        '</div>' +
        (t.last_report ? '<div class="cl-report">🤖 ' + esc(t.last_report) + '</div>' : '') +
        '<div style="display:flex; justify-content:space-between; align-items:center; gap:6px; width:100%;">' +
          '<span class="badge ' + pillClass + '" style="font-size:10.5px; flex:1; min-width:0; overflow:hidden; text-overflow:ellipsis; display:block;" title="' + esc(pillText) + '">' + esc(pillText) + '</span>' +
          '<button class="btn btn-soft btn-sm" style="height:26px; font-size:11px; padding:0 8px; flex-shrink:0;" onclick="promptBotReport(' + t.id + ')">🤖 Báo Bot</button>' +
          '<button class="btn btn-soft btn-sm" style="height:26px; font-size:11px; padding:0 8px; flex-shrink:0;" data-title="' + esc(t.title) + '" data-assigned="' + esc(t.assigned_name || '') + '" onclick="remindProjectTaskFromBtn(this)">🔔 Tag</button>' +
        '</div>' +
      '</div>';
    }

    function renderProjectsTab() {
      var buName = buDisplayName(activeBu);
      var rawList = pmData.projects || pmData.allProjects || [];
      var custList = pmData.customers || [];
      var list = rawList.filter(function(p) { return (p.business_unit || 'KM Gift') === activeBu; });

      var newCustSel = document.getElementById('new-km-customer');
      if (newCustSel) {
        var prevVal = newCustSel.value;
        newCustSel.innerHTML = '<option value="">-- Tự tạo theo tên dự án --</option>' + custList.map(function(c) {
          return '<option value="' + c.id + '">' + esc(c.name) + '</option>';
        }).join('');
        if (prevVal) newCustSel.value = prevVal;
      }

      var totalBuCost = list.reduce(function(s, p) { return s + (Number(p.total_cost) || 0); }, 0);
      var totalBuQuote = list.reduce(function(s, p) { return s + (Number(p.total_revenue !== undefined ? p.total_revenue : p.total_quote) || 0); }, 0);
      var totalBuProfit = list.reduce(function(s, p) {
        var prof = p.estimated_profit !== undefined ? Number(p.estimated_profit) : (Number(p.total_quote || 0) - Math.round(Number(p.total_quote || 0) * 0.08) - Number(p.total_cost || 0));
        return s + prof;
      }, 0);

      if (document.getElementById('bu-kpi-count')) {
        document.getElementById('bu-kpi-count').textContent = String(list.length);
        document.getElementById('bu-kpi-label').textContent = buName;
        document.getElementById('bu-kpi-cost').textContent = fmtVnd(totalBuCost);
        document.getElementById('bu-kpi-quote').textContent = fmtVnd(totalBuQuote);
        document.getElementById('bu-kpi-profit').textContent = fmtVnd(totalBuProfit);
        document.getElementById('master-bu-title').textContent = 'Bảng Tổng Hợp Dự Án — ' + buName;
      }

      var masterTbody = document.getElementById('master-projects-tbody');
      if (masterTbody) {
        if (list.length === 0) {
          masterTbody.innerHTML = '<tr><td colspan="12" style="text-align:center; color:var(--text-muted); padding:28px;">Chưa có dự án nào trong mảng ' + esc(buName) + '. Bấm "+ Tạo Dự án mới (Auto SLA)" hoặc chuyển mảng từ dự án khác.</td></tr>';
        } else {
          masterTbody.innerHTML = list.map(function(p, idx) {
            var flowLbl = p.flow_type === 'ready_stock' ? 'Hàng có sẵn' : 'Customised';
            var rev = Number(p.total_revenue !== undefined ? p.total_revenue : p.total_quote) || 0;
            var vatAmt = p.vat_amount !== undefined ? Number(p.vat_amount) : Math.round(rev * 0.08);
            var profitVal = p.estimated_profit !== undefined ? Number(p.estimated_profit) : (rev - vatAmt - Number(p.total_cost || 0));
            return '<tr style="cursor:pointer;" onclick="openProjectDetail(' + p.id + ')">' +
              '<td style="text-align:center; font-weight:700; color:var(--text-muted);">' + (idx + 1) + '</td>' +
              '<td onclick="event.stopPropagation()"><input class="wt-cell-input" style="font-family:JetBrains Mono,monospace; font-size:12px; min-width:120px;" placeholder="Nhập mã HĐ..." value="' + esc(p.contract_code || '') + '" onchange="updateProjectContractCode(' + p.id + ', this.value)"></td>' +
              '<td><div style="font-weight:700; color:var(--text-main);">' + esc(p.name) + '</div><div style="font-size:11.5px; color:var(--text-muted);">' + (p.customer_name ? '🏢 ' + esc(p.customer_name) + ' • ' : '') + esc(p.payment_summary || '') + '</div></td>' +
              '<td onclick="event.stopPropagation()"><select class="select" style="height:30px; font-size:11.5px; min-width:120px;" onchange="changeProjectBusinessUnit(' + p.id + ', this.value)">' + buOptionsHtml(p.business_unit) + '</select></td>' +
              '<td style="font-size:12.5px; color:var(--text-body); white-space:normal; line-height:1.45; min-width:220px;">' + esc(p.items_preview || p.description || '-') + '</td>' +
              '<td style="font-size:12.5px; color:var(--text-muted); white-space:normal;">' + esc(p.vendors_preview || 'Chưa gán NCC') + '</td>' +
              '<td><div class="badge" style="margin-bottom:4px;">' + flowLbl + '</div><div style="font-size:11.5px; font-family:JetBrains Mono,monospace; color:var(--text-muted);">Mốc: ' + fmtShortDate(p.deposit_date) + '</div></td>' +
              '<td style="text-align:right; font-family:JetBrains Mono,monospace; font-weight:600; white-space:nowrap;">' + fmtVnd(p.total_cost) + '</td>' +
              '<td style="text-align:right; font-family:JetBrains Mono,monospace; font-weight:700; color:var(--primary); white-space:nowrap;">' + fmtVnd(rev) + '</td>' +
              '<td style="text-align:right; font-family:JetBrains Mono,monospace; font-weight:700; color:' + (profitVal >= 0 ? '#059669' : '#DC2626') + '; white-space:nowrap;">' + fmtVnd(profitVal) + '</td>' +
              '<td><span class="badge ' + ((p.overall_progress || 0) >= 100 ? 'done' : '') + '">' + (p.overall_progress || 0) + '%</span></td>' +
              '<td><button class="btn btn-soft btn-sm" onclick="event.stopPropagation(); openProjectDetail(' + p.id + ')">Chi tiết →</button></td>' +
            '</tr>';
          }).join('');
        }
      }

      var ap = pmData.activeProject;
      if (ap) {
        var apRev = Number(ap.total_revenue !== undefined ? ap.total_revenue : ap.total_quote) || 0;
        var apProfit = ap.estimated_profit !== undefined ? Number(ap.estimated_profit) : (apRev - Math.round(apRev * 0.08) - Number(ap.total_cost || 0));
        var detBuSel = document.getElementById('detail-bu-select');
        if (detBuSel) detBuSel.value = ap.business_unit || 'KM Gift';
        var detCustSel = document.getElementById('detail-customer-select');
        if (detCustSel) {
          detCustSel.innerHTML = '<option value="">-- Chưa gắn Khách hàng --</option>' + custList.map(function(c) {
            return '<option value="' + c.id + '">' + esc(c.name) + '</option>';
          }).join('');
          detCustSel.value = ap.customer_id ? String(ap.customer_id) : '';
        }
        document.getElementById('active-project-title').textContent = ap.name;
        document.getElementById('active-project-meta').textContent =
          (ap.customer_name ? 'Khách hàng: ' + ap.customer_name + '  •  ' : '') +
          (ap.contract_code ? 'Mã HĐ: ' + ap.contract_code + '  •  ' : '') +
          'Tiến độ: ' + (ap.overall_progress || 0) + '%  •  Tổng Chi phí: ' + fmtVnd(ap.total_cost) + '  •  Tổng Doanh thu: ' + fmtVnd(apRev) + '  •  Lợi nhuận (sau VAT): ' + fmtVnd(apProfit);
      }

      var tbody = document.getElementById('project-tasks-tbody');
      var kanban = document.getElementById('project-kanban-view');
      var tasks = pmData.tasks || [];
      var stages = pmData.stages || [];

      var slaBar = document.getElementById('project-sla-bar');
      var showSla = projectViewMode !== 'costs' && ap && (ap.deposit_date || stages.some(function(s) { return Number(s.sla_days) > 0; }));
      if (slaBar && showSla) {
        slaBar.style.display = 'flex';
        document.getElementById('sla-deposit-date').value = ap.deposit_date || '';
        document.getElementById('sla-flow-badge').textContent =
          ap.flow_type === 'ready_stock' ? 'Luồng: Hàng có sẵn (Tính xuôi)' : 'Luồng: Customised (Tính xuôi)';
        document.getElementById('sla-strip').innerHTML = stages.map(function(st) {
          var isAnchor = st.step_order === 1;
          return '<div class="sla-node' + (isAnchor ? ' anchor' : '') + '">' +
            '<div class="sla-node-title" title="' + esc(st.title) + '">' + esc(st.step_order + '. ' + st.title) + '</div>' +
            '<div class="sla-node-dates">' + fmtShortDate(st.start_date) + ' → ' + fmtShortDate(st.end_date) + '</div>' +
            '<div class="sla-days-row">' +
              '<span>SLA:</span>' +
              '<input type="number" min="0" max="180" class="sla-days-input" data-stage-id="' + st.id + '" value="' + (Number(st.sla_days) || 0) + '" onchange="recalculateProjectSla()">' +
              '<span>ngày</span>' +
            '</div>' +
          '</div>';
        }).join('');
      } else if (slaBar) {
        slaBar.style.display = 'none';
      }

      if (projectViewMode === 'stages' && stages.length > 0) {
        kanban.style.gridTemplateColumns = 'repeat(' + Math.min(stages.length, 4) + ', minmax(250px, 1fr))';
        kanban.innerHTML = stages.map(function(st) {
          var colTasks = tasks.filter(function(t) { return Number(t.stage_id) === Number(st.id); });
          var cardsHtml = colTasks.length === 0
            ? '<div style="text-align:center; color:var(--text-muted); font-size:12px; padding:24px 8px; border:1px dashed var(--border); border-radius:8px;">Kéo thẻ công việc vào đây</div>'
            : colTasks.map(function(t) { return renderKanbanCard(t, false); }).join('');
          return '<div class="kanban-col" data-stage-id="' + st.id + '" ondragover="onColDragOver(event)" ondragleave="onColDragLeave(event)" ondrop="onColDrop(event)">' +
            '<div class="kanban-col-head"><span style="min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="' + esc(st.title) + '">' + esc(st.title) + '</span><span class="badge">' + colTasks.length + '</span></div>' +
            cardsHtml +
          '</div>';
        }).join('');
      } else {
        kanban.style.gridTemplateColumns = 'repeat(3, minmax(0, 1fr))';
        var cols = [
          { key: 'pending', label: 'Chờ làm', badge: 'muted' },
          { key: 'in_progress', label: 'Đang thực hiện', badge: '' },
          { key: 'done', label: 'Hoàn thành', badge: 'done' }
        ];
        kanban.innerHTML = cols.map(function(col) {
          var colTasks = tasks.filter(function(t) {
            return deriveTaskKanbanStatus(t) === col.key;
          });
          var cardsHtml = colTasks.length === 0
            ? '<div style="text-align:center; color:var(--text-muted); font-size:12px; padding:24px 8px; border:1px dashed var(--border); border-radius:8px;">Kéo thẻ công việc vào đây</div>'
            : colTasks.map(function(t) { return renderKanbanCard(t, true); }).join('');
          return '<div class="kanban-col" data-status="' + col.key + '" ondragover="onColDragOver(event)" ondragleave="onColDragLeave(event)" ondrop="onColDrop(event)">' +
            '<div class="kanban-col-head"><span>' + col.label + '</span><span class="badge ' + col.badge + '">' + colTasks.length + '</span></div>' +
            cardsHtml +
          '</div>';
        }).join('');
      }

      if (tasks.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; color:var(--text-muted); padding:24px;">Dự án này chưa có đầu việc nào. Bấm "+ Giao việc mới" để thêm.</td></tr>';
        return;
      }
      tbody.innerHTML = tasks.map(function(t) {
        var stKey = deriveTaskKanbanStatus(t);
        var stBadge = stKey === 'done'
          ? '<span class="badge done">Hoàn thành</span>'
          : (stKey === 'in_progress' ? '<span class="badge">Đang làm</span>' : '<span class="badge muted">Chờ làm</span>');
        return '<tr>' +
          '<td style="font-weight:600;">' + esc(t.title) + '</td>' +
          '<td><span class="badge muted">' + esc(t.stage_title || '-') + '</span></td>' +
          '<td>' + esc(t.assigned_name || t.assigned_phone || 'Chưa gán') + '</td>' +
          '<td>' + esc(t.deadline ? t.deadline.slice(0, 10) : '-') + '</td>' +
          '<td><div style="display:inline-flex; align-items:center; gap:4px;"><input type="number" min="0" max="100" class="wt-cell-input" style="width:58px; border:1px solid var(--border); font-family:JetBrains Mono,monospace;" value="' + (t.progress || 0) + '" onchange="updateProjectTaskProgress(' + t.id + ', this.value)"><span>%</span></div></td>' +
          '<td>' + stBadge + '</td>' +
          '<td><button class="btn btn-soft btn-sm" data-title="' + esc(t.title) + '" data-assigned="' + esc(t.assigned_name || '') + '" onclick="remindProjectTaskFromBtn(this)">🔔 Tag nhắc nhóm</button></td>' +
        '</tr>';
      }).join('');
    }

    async function createNewProject() {
      var name = prompt('Nhập tên dự án mới (ví dụ: Biệt thự Thảo Điền):');
      if (!name || !name.trim()) return;
      var res = await fetch('/portal/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() })
      });
      var data = await res.json();
      if (data.ok) {
        showToast('Đã tạo dự án mới');
        loadProjectsData(data.project && data.project.id);
      } else {
        showToast(data.error || 'Lỗi tạo dự án', true);
      }
    }

    async function createNewStage() {
      var title = prompt('Nhập tên giai đoạn mới:');
      if (!title || !title.trim()) return;
      var res = await fetch('/portal/api/stages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project_id: activeProjectId || 1, title: title.trim() })
      });
      var data = await res.json();
      if (data.ok) {
        showToast('Đã thêm giai đoạn mới');
        loadProjectsData(activeProjectId);
      }
    }

    async function createNewProjectTask() {
      var title = prompt('Nhập tên đầu việc cần giao:');
      if (!title || !title.trim()) return;
      var stageId = (pmData.stages && pmData.stages[0]) ? pmData.stages[0].id : 1;
      var res = await fetch('/portal/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project_id: activeProjectId || 1, stage_id: stageId, title: title.trim() })
      });
      var data = await res.json();
      if (data.ok) {
        showToast('Đã thêm công việc vào dự án');
        loadProjectsData(activeProjectId);
      }
    }

    async function updateProjectTaskProgress(taskId, val) {
      var pct = Math.min(100, Math.max(0, Number(val) || 0));
      var t = (pmData.tasks || []).find(function(x) { return x.id === taskId; });
      var cl = t && Array.isArray(t.checklist) ? t.checklist : [];
      if (cl.length > 0) {
        var curStatus = deriveTaskKanbanStatus(t);
        if (pct <= 0) {
          await fetch('/portal/api/tasks/' + taskId + '/checklist', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'bulk_update', targetStatus: 'pending' })
          });
          showToast('Đã đưa công việc về Chờ làm (0% — bỏ tick đầu mục)');
          loadProjectsData(activeProjectId);
          return;
        }
        var wantedStatus = pct >= 100 ? 'completed' : 'in_progress';
        var clDone = cl.filter(function(i) { return i.done && !i.cancelled; }).length;
        var clActive = cl.filter(function(i) { return !i.cancelled; }).length;
        if ((wantedStatus === 'completed' && clDone < clActive) || (wantedStatus === 'in_progress' && (clDone === 0 || (curStatus === 'done' && clActive > 0 && clDone === clActive)))) {
          loadProjectsData(activeProjectId);
          openChecklistTransitionModal(taskId, wantedStatus);
          return;
        }
      }
      await fetch('/portal/api/tasks/' + taskId, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ progress: pct, status: pct >= 100 ? 'done' : (pct > 0 ? 'in_progress' : 'pending') })
      });
      showToast('Đã cập nhật tiến độ đầu việc');
      loadProjectsData(activeProjectId);
    }

    function remindProjectTaskFromBtn(btn) {
      var title = btn.getAttribute('data-title') || '';
      var assignedName = btn.getAttribute('data-assigned') || '';
      switchTab('mention');
      document.getElementById('mention-message').value =
        'nhờ ' + (assignedName || 'anh/chị') + ' kiểm tra và cập nhật tiến độ đầu việc "' + title + '" nhé!';
    }

    async function loadPersonalStatus() {
      try {
        var res = await fetch('/portal/api/personal-status');
        var data = await res.json();
        var dotZ = document.getElementById('dot-zalo');
        var lblZ = document.getElementById('lbl-zalo');
        var stBadge = document.getElementById('settings-personal-status-badge');
        var discBtn = document.getElementById('btn-disconnect-zalo');
        if (data.personalAccount && data.personalAccount.connected) {
          dotZ.className = 'dot on';
          lblZ.textContent = data.personalAccount.name || 'Đã kết nối';
          if (stBadge) {
            stBadge.className = 'badge';
            stBadge.textContent = 'Đã kết nối: ' + (data.personalAccount.name || 'Zalo Cá Nhân');
          }
          if (discBtn) discBtn.style.display = 'inline-flex';
          loadZaloGroups();
        } else {
          dotZ.className = 'dot warn';
          lblZ.textContent = 'Chưa đăng nhập';
          if (stBadge) {
            stBadge.className = 'badge muted';
            stBadge.textContent = 'Chưa kết nối';
          }
          if (discBtn) discBtn.style.display = 'none';
        }

        var dotD = document.getElementById('dot-drive');
        var lblD = document.getElementById('lbl-drive');
        if (data.drive && data.drive.hasToken) {
          dotD.className = 'dot on';
          lblD.textContent = 'Sẵn sàng';
        } else {
          dotD.className = 'dot warn';
          lblD.textContent = 'Chưa gắn token';
        }
        if (data.drive) {
          document.getElementById('cfg-root-name').value = data.drive.rootFolderName || 'Khởi Minh Drive';
          document.getElementById('cfg-root-id').value = data.drive.rootFolderId || '';
        }
      } catch (e) {}
    }

    async function loadZaloGroups() {
      try {
        var res = await fetch('/portal/api/zalo-groups');
        var data = await res.json();
        zaloGroups = data.groups || [];
        var opts = '<option value="">-- Chọn nhóm Zalo (' + zaloGroups.length + ' nhóm) --</option>';
        for (var i = 0; i < zaloGroups.length; i++) {
          var g = zaloGroups[i];
          opts += '<option value="' + esc(g.groupId) + '">' + esc(g.name) + ' (' + g.memberCount + ' TV)</option>';
        }
        document.getElementById('scan-group-select').innerHTML = opts;
        document.getElementById('mention-group-select').innerHTML = opts;
      } catch (e) {}
    }

    async function loadGroupMembers() {
      var gid = document.getElementById('mention-group-select').value;
      var sel = document.getElementById('mention-member-select');
      if (!gid) {
        sel.innerHTML = '<option value="">-- Chọn nhóm trước --</option>';
        return;
      }
      sel.innerHTML = '<option value="">Đang tải thành viên...</option>';
      try {
        var res = await fetch('/portal/api/zalo-groups/' + encodeURIComponent(gid) + '/members');
        var data = await res.json();
        groupMembers = data.members || [];
        var html = '<option value="">-- Chọn người nhận @tag --</option>';
        for (var i = 0; i < groupMembers.length; i++) {
          var m = groupMembers[i];
          html += '<option value="' + esc(m.uid) + '" data-name="' + esc(m.displayName) + '">' + esc(m.displayName) + '</option>';
        }
        sel.innerHTML = html;
      } catch (e) {
        sel.innerHTML = '<option value="">Không tải được thành viên</option>';
      }
    }

    /* WORK TRACKER */
    async function loadWorkTracker() {
      try {
        var res = await fetch('/portal/api/work-tracker');
        var data = await res.json();
        if (!data.ok) return;
        wtData = data;
        renderWorkTracker();
        populateTaskPresets();
      } catch (e) {}
    }

    function populateTaskPresets() {
      var sel = document.getElementById('mention-task-preset');
      var html = '<option value="">-- Tự nhập nội dung hoặc chọn 1 đầu việc --</option>';
      for (var i = 0; i < wtData.tasks.length; i++) {
        var t = wtData.tasks[i];
        html += '<option value="' + t.id + '">' + esc(t.title) + ' (Hạn: ' + esc(t.end_date) + ')</option>';
      }
      sel.innerHTML = html;
    }

    function applyTaskPreset() {
      var id = Number(document.getElementById('mention-task-preset').value);
      var t = wtData.tasks.find(function(x) { return x.id === id; });
      if (!t) return;
      var pct = Math.round((t.progress || 0) * 100);
      document.getElementById('mention-message').value =
        'nhờ anh/chị kiểm tra & cập nhật đầu việc "' + t.title + '" (Tiến độ hiện tại: ' + pct + '%, Hạn: ' + (t.end_date || 'chưa đặt') + ') nhé!';
    }

    function renderWorkTracker() {
      var s = wtData.settings || {};
      var members = wtData.members || [];
      var tasks = wtData.tasks || [];

      document.getElementById('wt-title').textContent = s.title || 'THEO DÕI TIẾN ĐỘ CÔNG VIỆC';
      document.getElementById('wt-dates-info').textContent =
        'Bắt đầu: ' + (s.project_start_date || '') + '  •  Hôm nay: ' + (s.today_date || '');

      var total = tasks.length;
      var done = tasks.filter(function(t) { return (t.progress || 0) >= 1 || t.status === 'completed'; }).length;
      var active = total - done;
      var avg = total > 0 ? Math.round((tasks.reduce(function(acc, t) { return acc + (Number(t.progress) || 0); }, 0) / total) * 100) : 0;

      document.getElementById('kpi-total').textContent = String(total);
      document.getElementById('kpi-done').textContent = String(done);
      document.getElementById('kpi-active').textContent = String(active);
      document.getElementById('kpi-avg').textContent = avg + '%';

      var mBar = document.getElementById('wt-members-bar');
      mBar.innerHTML = members.map(function(m) {
        return '<span class="member-chip"><span class="member-swatch" style="background:' + esc(m.color_hex) + '"></span>' + esc(m.name) + '</span>';
      }).join('');

      var startBase = new Date((s.project_start_date || '2026-11-09') + 'T00:00:00');
      var totalDays = (s.weeks_count || 7) * 7;
      var todayStr = s.today_date || '';

      var headHtml = '<tr>' +
        '<th style="min-width:240px;">Công việc / Hạng mục</th>' +
        '<th style="min-width:120px;">Phụ trách</th>' +
        '<th style="min-width:115px;">Bắt đầu</th>' +
        '<th style="min-width:115px;">Kết thúc</th>' +
        '<th style="width:72px;">Tiến độ</th>';

      for (var d = 0; d < totalDays; d++) {
        var dt = new Date(startBase.getTime() + d * 86400000);
        var iso = dt.toISOString().slice(0, 10);
        var isToday = iso === todayStr;
        headHtml += '<th class="gantt-day' + (isToday ? ' today' : '') + '" title="' + iso + '">' + dt.getDate() + '</th>';
      }
      headHtml += '</tr>';
      document.getElementById('wt-thead').innerHTML = headHtml;

      var bodyHtml = '';
      for (var i = 0; i < tasks.length; i++) {
        var t = tasks[i];
        var mem = members.find(function(m) { return m.id === t.assigned_member_id; });
        var barColor = mem ? mem.color_hex : '#2563EB';
        var pct = Math.round((Number(t.progress) || 0) * 100);

        var memOpts = '<option value="">--</option>';
        for (var j = 0; j < members.length; j++) {
          var m = members[j];
          memOpts += '<option value="' + m.id + '"' + (m.id === t.assigned_member_id ? ' selected' : '') + '>' + esc(m.name) + '</option>';
        }

        bodyHtml += '<tr>' +
          '<td style="min-width:300px; white-space:normal;"><textarea class="wt-cell-input" rows="2" style="min-width:290px; white-space:pre-wrap; word-break:break-word; resize:vertical; line-height:1.45;" onchange="updateWtTask(' + t.id + ', {title: this.value})">' + esc(t.title) + '</textarea></td>' +
          '<td><select class="select" style="height:30px; font-size:12px; width:100%;" onchange="updateWtTask(' + t.id + ', {assigned_member_id: Number(this.value) || null})">' + memOpts + '</select></td>' +
          '<td><input type="date" class="wt-cell-input" value="' + esc(t.start_date) + '" onchange="updateWtTask(' + t.id + ', {start_date: this.value})"></td>' +
          '<td><input type="date" class="wt-cell-input" value="' + esc(t.end_date) + '" onchange="updateWtTask(' + t.id + ', {end_date: this.value})"></td>' +
          '<td><input type="number" min="0" max="100" class="wt-cell-input" style="font-family:JetBrains Mono,monospace;" value="' + pct + '" onchange="updateWtTask(' + t.id + ', {progress: Math.min(100, Math.max(0, Number(this.value)))/100})"></td>';

        for (var k = 0; k < totalDays; k++) {
          var cellDate = new Date(startBase.getTime() + k * 86400000).toISOString().slice(0, 10);
          var inRange = t.start_date && t.end_date && cellDate >= t.start_date && cellDate <= t.end_date;
          var isT = cellDate === todayStr;
          bodyHtml += '<td class="gantt-day' + (isT ? ' today' : '') + '">' +
            (inRange ? '<div class="gantt-bar" style="background:' + esc(barColor) + ';"></div>' : '') +
            '</td>';
        }
        bodyHtml += '</tr>';
      }
      document.getElementById('wt-tbody').innerHTML = bodyHtml;
    }

    async function updateWtTask(id, patch) {
      try {
        var existing = wtData.tasks.find(function(x) { return x.id === id; });
        if (!existing) return;
        var payload = Object.assign({}, existing, patch, { id: id });
        await fetch('/portal/api/work-tracker/task', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        await loadWorkTracker();
        showToast('Đã lưu thay đổi tiến độ');
      } catch (e) {
        showToast('Lỗi cập nhật tiến độ', true);
      }
    }

    async function addWorkTrackerTask() {
      var title = prompt('Nhập tên công việc / hạng mục mới:');
      if (!title || !title.trim()) return;
      try {
        await fetch('/portal/api/work-tracker/task', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: title.trim() })
        });
        await loadWorkTracker();
        showToast('Đã thêm công việc mới');
      } catch (e) {
        showToast('Không thêm được công việc', true);
      }
    }

    /* DRIVE & ASSETS */
    async function scanGroupHistory() {
      var sel = document.getElementById('scan-group-select');
      var gid = sel.value;
      if (!gid) {
        showToast('Vui lòng chọn nhóm Zalo trước khi quét', true);
        return;
      }
      var gName = sel.options[sel.selectedIndex] ? sel.options[sel.selectedIndex].text : '';
      var btn = document.getElementById('btn-scan-history');
      btn.disabled = true;
      btn.textContent = 'Đang quét & phân tích...';
      try {
        var res = await fetch('/portal/api/scan-history', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ groupId: gid, groupName: gName, count: 60, classify: true })
        });
        var data = await res.json();
        if (!data.ok) {
          showToast(data.error || 'Quét lịch sử thất bại', true);
        } else {
          showToast('Đã quét ' + data.scan.scannedMessages + ' tin: ' + data.scan.collectedImages + ' ảnh, ' + data.scan.collectedFiles + ' file, ' + data.scan.collectedLinks + ' link.');
          await loadAssets();
        }
      } catch (e) {
        showToast('Lỗi kết nối khi quét lịch sử', true);
      } finally {
        btn.disabled = false;
        btn.textContent = '🔍 Quét lịch sử cũ';
      }
    }

    async function runAiClassify() {
      var btn = document.getElementById('btn-ai-classify');
      btn.disabled = true;
      btn.textContent = 'Đang phân tích...';
      try {
        var res = await fetch('/portal/api/ai-classify', { method: 'POST' });
        var data = await res.json();
        if (!data.ok) {
          showToast(data.error || 'AI phân loại lỗi', true);
        } else {
          showToast('AI đã phân loại ' + data.classified + '/' + data.processed + ' tài liệu.');
          await loadAssets();
        }
      } catch (e) {
        showToast('Lỗi gọi AI phân loại', true);
      } finally {
        btn.disabled = false;
        btn.textContent = '✨ AI phân loại';
      }
    }

    async function syncAllDrive() {
      var btn = document.getElementById('btn-sync-drive');
      btn.disabled = true;
      btn.textContent = 'Đang đẩy lên Drive...';
      try {
        var res = await fetch('/portal/api/drive/sync', { method: 'POST', body: '{}' });
        var data = await res.json();
        if (!data.ok) {
          showToast(data.lastError || data.error || 'Chưa đồng bộ được Drive', true);
        } else {
          showToast('Đã đồng bộ ' + data.synced + ' tài liệu lên Google Drive.');
          await loadAssets();
        }
      } catch (e) {
        showToast('Lỗi đồng bộ Drive', true);
      } finally {
        btn.disabled = false;
        btn.textContent = '☁️ Đồng bộ Drive';
      }
    }

    async function loadAssets() {
      var proj = document.getElementById('filter-project').value;
      var type = document.getElementById('filter-type').value;
      var status = document.getElementById('filter-status').value;
      var qs = '?project=' + encodeURIComponent(proj) + '&type=' + encodeURIComponent(type) + '&status=' + encodeURIComponent(status);
      try {
        var res = await fetch('/portal/api/assets' + qs);
        var data = await res.json();
        var projSel = document.getElementById('filter-project');
        var curProj = projSel.value;
        var pOpts = '<option value="">Tất cả dự án / công việc</option>';
        for (var i = 0; i < (data.projects || []).length; i++) {
          var p = data.projects[i];
          pOpts += '<option value="' + esc(p.project_name) + '">' + esc(p.project_name) + ' (' + p.count + ')</option>';
        }
        projSel.innerHTML = pOpts;
        projSel.value = curProj;

        var tbody = document.getElementById('assets-tbody');
        var list = data.assets || [];
        if (list.length === 0) {
          tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; color:var(--text-muted); padding:28px;">Chưa có tài liệu nào khớp bộ lọc.</td></tr>';
          return;
        }
        var html = '';
        for (var j = 0; j < list.length; j++) {
          var a = list[j];
          var typeLabel = a.asset_type === 'image' ? '🖼️ Ảnh' : (a.asset_type === 'file' ? '📄 File' : '🔗 Link');
          var stBadge = a.status === 'synced'
            ? '<span class="badge done">Đã lên Drive</span>'
            : (a.status === 'error'
              ? '<span class="badge err" title="' + esc(a.error_message) + '">Lỗi Drive</span>'
              : (a.status === 'classified' ? '<span class="badge">Đã phân loại</span>' : '<span class="badge muted">Chờ phân loại</span>'));
          var driveAction = a.drive_web_url
            ? '<a class="btn btn-soft btn-sm" href="' + esc(a.drive_web_url) + '" target="_blank">Mở Drive</a>'
            : '<button class="btn btn-sm" onclick="syncSingleAsset(' + a.id + ')">Đẩy Drive</button>';

          html += '<tr>' +
            '<td><span class="badge">' + typeLabel + '</span></td>' +
            '<td><div style="font-weight:600; max-width:240px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="' + esc(a.title) + '">' + esc(a.title) + '</div>' +
            (a.original_url ? '<a href="' + esc(a.original_url) + '" target="_blank" style="font-size:11px; color:var(--primary);">Xem nguồn gốc</a>' : '') + '</td>' +
            '<td><input class="wt-cell-input" style="border:1px solid var(--border); background:#fff;" value="' + esc(a.project_name) + '" onchange="renameAssetProject(' + a.id + ', this.value)"></td>' +
            '<td><div style="font-weight:600;">' + esc(a.sender_name || 'Thành viên') + '</div><div style="font-size:11px; color:var(--text-muted);">' + esc(a.thread_name || a.thread_id) + '</div></td>' +
            '<td style="max-width:220px; font-size:12px; color:var(--text-body);">' + esc(a.ai_summary || a.context_text || '-') + '</td>' +
            '<td>' + stBadge + '</td>' +
            '<td>' + driveAction + '</td>' +
            '</tr>';
        }
        tbody.innerHTML = html;
      } catch (e) {}
    }

    async function renameAssetProject(id, projectName) {
      await fetch('/portal/api/assets/' + id, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project_name: projectName })
      });
      showToast('Đã cập nhật thư mục dự án');
    }

    async function syncSingleAsset(id) {
      var res = await fetch('/portal/api/drive/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assetId: id })
      });
      var data = await res.json();
      if (!data.ok) showToast(data.error || 'Lỗi đẩy Drive', true);
      else {
        showToast('Đã đồng bộ lên Google Drive');
        loadAssets();
      }
    }

    /* ZALO BOT FORWARDING */
    var botFwData = { targets: [], rules: [] };

    async function loadBotForwarding() {
      if (!isAdminMode) return;
      try {
        var res = await fetch('/portal/api/bot-forwarding', { headers: adminHeaders() });
        var data = await res.json();
        if (!data.ok) return;
        botFwData = data;
        renderBotForwarding();
      } catch (e) {}
    }

    function saveBotThreadRenameBtn(btn) {
      var wrap = btn ? btn.parentNode : null;
      var inp = wrap ? wrap.querySelector('input[data-tid]') : null;
      if (inp) renameBotThreadFromInput(inp);
    }

    function renameBotThreadFromInput(inp) {
      var tid = inp.getAttribute('data-tid');
      var name = inp.value.trim();
      if (!tid || !name) return;
      fetch('/portal/api/bot-forwarding/rename', {
        method: 'POST',
        headers: adminHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ threadId: tid, displayName: name })
      }).then(function() {
        showToast('Đã đổi tên nhóm thành "' + name + '"');
        loadBotForwarding();
      });
    }

    function renderBotForwarding() {
      var targets = botFwData.targets || [];
      var rules = botFwData.rules || [];
      var tbody = document.getElementById('bot-targets-tbody');
      if (tbody) {
        if (targets.length === 0) {
          tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; color:var(--text-muted); padding:16px;">Chưa có nhóm nào từng nhắn với Bot. Hãy tag @Bot trong nhóm Zalo 1 lần để kết nối.</td></tr>';
        } else {
          tbody.innerHTML = targets.map(function(t) {
            var kind = t.threadType === 1 ? '<span class="badge">Nhóm</span>' : '<span class="badge muted">Cá nhân</span>';
            var members = (t.memberNames && t.memberNames.length > 0) ? t.memberNames.slice(0, 4).join(', ') : (t.lastSenderName || '-');
            var infoHtml = '<div title="ID nội bộ: ' + esc(t.threadId) + '">' +
              '<div style="font-size:12px; color:var(--text-main);"><strong>Thành viên:</strong> ' + esc(members) + '</div>' +
              (t.lastMessagePreview ? '<div style="font-size:11.5px; color:var(--text-muted); margin-top:2px;">💬 "' + esc(t.lastMessagePreview) + '"</div>' : '') +
              '</div>';
            return '<tr>' +
              '<td style="text-align:center;"><input type="checkbox" class="fw-target-chk" value="' + esc(t.threadId) + '"></td>' +
              '<td style="text-align:center; font-weight:700;">' + t.index + '</td>' +
              '<td>' + kind + '</td>' +
              '<td><div style="display:flex; align-items:center; gap:6px;"><input class="wt-cell-input" style="font-weight:600; flex:1;" data-tid="' + esc(t.threadId) + '" value="' + esc(t.displayName) + '" onchange="renameBotThreadFromInput(this)"><button type="button" class="btn btn-soft btn-sm" style="padding:4px 8px; font-size:11px; white-space:nowrap;" onclick="saveBotThreadRenameBtn(this)">Lưu tên</button></div></td>' +
              '<td>' + infoHtml + '</td>' +
              '<td style="text-align:center;"><button type="button" class="btn btn-primary btn-sm" style="height:28px; font-size:11.5px; white-space:nowrap;" data-tid="' + esc(t.threadId) + '" data-name="' + esc(t.displayName) + '" onclick="sendBotToSingleBtn(this)">🤖 Gửi vào đây</button></td>' +
            '</tr>';
          }).join('');
        }
      }
    }

    function setBotSendResult(html, isErr) {
      var box = document.getElementById('bot-send-result');
      if (!box) return;
      if (!html) {
        box.innerHTML = '';
        return;
      }
      var bg = isErr ? '#FEF2F2' : '#ECFDF5';
      var bd = isErr ? '#FECACA' : '#A7F3D0';
      var fg = isErr ? '#991B1B' : '#065F46';
      box.innerHTML = '<div style="padding:10px 12px; border-radius:8px; background:' + bg + '; border:1px solid ' + bd + '; color:' + fg + ';">' + html + '</div>';
    }

    async function sendBotMessagesToTargets(targetIds, singleTargetName) {
      var msgEl = document.getElementById('fw-message');
      var msg = msgEl ? msgEl.value.trim() : '';
      var labelEl = document.getElementById('fw-sender-label');
      var label = labelEl ? labelEl.value.trim() : '';
      if (!targetIds || targetIds.length === 0) {
        setBotSendResult('⚠️ Vui lòng chọn ít nhất 1 nhóm/người nhận.', true);
        showToast('Vui lòng chọn ít nhất 1 nhóm/người nhận', true);
        return false;
      }
      if (!msg) {
        setBotSendResult('⚠️ Vui lòng nhập nội dung tin nhắn trước khi gửi qua Bot.', true);
        showToast('Vui lòng nhập nội dung tin nhắn trước khi gửi qua Bot', true);
        if (msgEl) msgEl.focus();
        return false;
      }
      setBotSendResult('<span style="color:#475569;">⏳ Đang gửi tin nhắn qua Zalo Bot...</span>', false);
      var res = await fetch('/portal/api/bot-forwarding/send', {
        method: 'POST',
        headers: adminHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ targetThreadIds: targetIds, message: msg, senderLabel: label })
      });
      var data = await res.json().catch(function() { return { ok: false, error: 'Lỗi phản hồi máy chủ (HTTP ' + res.status + ')' }; });
      if (res.ok && data.ok) {
        var successMsg = singleTargetName
          ? '✅ Bot đã gửi tin nhắn thành công vào "' + esc(singleTargetName) + '"!'
          : '✅ Bot đã gửi tin nhắn thành công vào ' + data.sentCount + ' nhóm/người nhận!';
        setBotSendResult(successMsg, false);
        showToast(singleTargetName ? ('Bot đã gửi tin nhắn vào "' + singleTargetName + '"!') : ('Bot đã gửi tin nhắn vào ' + data.sentCount + ' nhóm/người nhận!'));
        if (msgEl) msgEl.value = '';
        return true;
      }
      var errText = (data.errors && data.errors[0]) || data.error || ('Bot gửi tin nhắn thất bại (HTTP ' + res.status + ')');
      setBotSendResult('❌ Không gửi được: ' + esc(errText), true);
      showToast(errText, true);
      return false;
    }

    async function sendBotToSingleBtn(btn) {
      var tid = btn && btn.getAttribute('data-tid');
      var name = btn && btn.getAttribute('data-name');
      if (!tid) return;
      btn.disabled = true;
      var oldTxt = btn.textContent;
      btn.textContent = 'Đang gửi...';
      try {
        await sendBotMessagesToTargets([tid], name || tid);
      } catch (e) {
        setBotSendResult('❌ Lỗi kết nối khi gửi tin qua Bot.', true);
        showToast('Lỗi kết nối khi gửi tin qua Bot', true);
      } finally {
        btn.disabled = false;
        btn.textContent = oldTxt;
      }
    }

    async function sendBotForwardNow() {
      var chks = Array.from(document.querySelectorAll('.fw-target-chk:checked'));
      var ids = chks.map(function(c) { return c.value; });
      if (ids.length === 0) {
        setBotSendResult('⚠️ Vui lòng tick chọn ít nhất 1 nhóm/người nhận (hoặc bấm "🤖 Gửi vào đây" ở từng dòng).', true);
        showToast('Vui lòng tick chọn ít nhất 1 nhóm/người nhận (hoặc bấm "🤖 Gửi vào đây" ở từng dòng)', true);
        return;
      }
      var btn = document.getElementById('btn-fw-send');
      btn.disabled = true;
      btn.textContent = 'Đang gửi qua Bot...';
      try {
        await sendBotMessagesToTargets(ids);
      } catch (e) {
        setBotSendResult('❌ Lỗi kết nối khi gửi tin qua Bot.', true);
        showToast('Lỗi kết nối khi gửi tin qua Bot', true);
      } finally {
        btn.disabled = false;
        btn.textContent = '🤖 Gửi tin nhắn qua Bot vào các nhóm đã chọn';
      }
    }

    /* GROUP MENTION REMINDER */
    async function sendMentionNow() {
      var gid = document.getElementById('mention-group-select').value;
      var memSel = document.getElementById('mention-member-select');
      var uid = memSel.value;
      var mName = uid && memSel.options[memSel.selectedIndex] ? (memSel.options[memSel.selectedIndex].getAttribute('data-name') || memSel.options[memSel.selectedIndex].text) : '';
      var text = document.getElementById('mention-message').value.trim();

      if (!gid || !text) {
        showToast('Vui lòng chọn nhóm Zalo và nhập nội dung nhắc việc', true);
        return;
      }

      var btn = document.getElementById('btn-send-mention');
      btn.disabled = true;
      btn.textContent = 'Đang gửi...';
      try {
        var res = await fetch('/portal/api/remind-group', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ groupId: gid, memberUid: uid, memberName: mName, text: text })
        });
        var data = await res.json();
        if (!data.ok) {
          showToast(data.error || 'Gửi nhắc việc thất bại', true);
        } else {
          showToast(data.tagged ? 'Đã gửi tin nhắn kèm @tag xanh tới ' + data.matchedName : 'Đã gửi nhắc việc vào nhóm');
        }
      } catch (e) {
        showToast('Lỗi kết nối khi gửi nhắc việc', true);
      } finally {
        btn.disabled = false;
        btn.textContent = '🔔 Gửi @mention vào nhóm ngay';
      }
    }

    async function saveDriveSettings() {
      var payload = {
        root_folder_name: document.getElementById('cfg-root-name').value.trim() || 'Khởi Minh Drive',
        root_folder_id: document.getElementById('cfg-root-id').value.trim()
      };
      var at = document.getElementById('cfg-access-token').value.trim();
      var rt = document.getElementById('cfg-refresh-token').value.trim();
      var cid = document.getElementById('cfg-client-id').value.trim();
      var csec = document.getElementById('cfg-client-secret').value.trim();
      if (at) payload.access_token = at;
      if (rt) payload.refresh_token = rt;
      if (cid) payload.client_id = cid;
      if (csec) payload.client_secret = csec;

      var res = await fetch('/portal/api/drive/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      var data = await res.json();
      if (data.ok) {
        showToast('Đã lưu cấu hình Google Drive');
        loadPersonalStatus();
      } else {
        showToast('Lỗi lưu cấu hình', true);
      }
    }

    var adminPin = '';
    var isAdminMode = false;
    var pendingAdminTab = 'settings';

    function getAdminPin() {
      return adminPin || '';
    }

    function adminHeaders(extra) {
      var h = Object.assign({}, extra || {});
      if (adminPin) h['x-admin-pin'] = adminPin;
      return h;
    }

    function syncAdminVisibility() {
      document.querySelectorAll('.admin-only').forEach(function(el) {
        el.style.display = isAdminMode ? (el.classList.contains('nav-item') ? 'flex' : 'block') : 'none';
      });
      var btn = document.getElementById('btn-admin-auth');
      if (btn) {
        if (isAdminMode) {
          btn.textContent = '👑 Admin: Đang bật (Thoát)';
          btn.onclick = logoutAdminMode;
        } else {
          btn.textContent = '🔐 Đăng nhập Admin';
          btn.onclick = function() { openAdminLoginModal('settings'); };
        }
      }
      if (!isAdminMode) {
        var activePanel = document.querySelector('.panel.active');
        if (activePanel && (activePanel.id === 'panel-mention' || activePanel.id === 'panel-settings')) {
          switchTab('projects');
        }
      }
    }

    function openAdminLoginModal(targetTab) {
      pendingAdminTab = targetTab || 'settings';
      var m = document.getElementById('admin-login-modal');
      var errEl = document.getElementById('admin-login-err');
      var inp = document.getElementById('admin-pin-input');
      if (errEl) { errEl.style.display = 'none'; errEl.textContent = ''; }
      if (inp) inp.value = '';
      if (m) m.style.display = 'flex';
      if (inp) setTimeout(function() { inp.focus(); }, 60);
    }

    function closeAdminLoginModal() {
      var m = document.getElementById('admin-login-modal');
      if (m) m.style.display = 'none';
    }

    async function submitAdminLogin() {
      var inp = document.getElementById('admin-pin-input');
      var errEl = document.getElementById('admin-login-err');
      var pin = (inp ? inp.value : '').trim();
      if (!pin) {
        if (errEl) { errEl.textContent = 'Vui lòng nhập mã PIN Admin'; errEl.style.display = 'block'; }
        return;
      }
      try {
        var res = await fetch('/portal/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: 'admin', pin: pin })
        });
        var data = await res.json();
        if (!data.ok || !data.user || !data.user.isAdmin) {
          if (errEl) { errEl.textContent = data.error || 'Mã PIN Admin không đúng'; errEl.style.display = 'block'; }
          return;
        }
        adminPin = pin;
        isAdminMode = true;
        try { localStorage.setItem('km_portal_admin_pin', pin); } catch (e) {}
        closeAdminLoginModal();
        syncAdminVisibility();
        showToast('Đã đăng nhập quyền Admin!');
        switchTab(pendingAdminTab || 'settings');
      } catch (e) {
        if (errEl) { errEl.textContent = 'Lỗi kết nối máy chủ'; errEl.style.display = 'block'; }
      }
    }

    function logoutAdminMode() {
      adminPin = '';
      isAdminMode = false;
      try { localStorage.removeItem('km_portal_admin_pin'); } catch (e) {}
      syncAdminVisibility();
      showToast('Đã thoát chế độ Admin');
    }

    async function initAdminMode() {
      try {
        var savedPin = localStorage.getItem('km_portal_admin_pin') || '';
        if (savedPin) {
          var res = await fetch('/portal/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone: 'admin', pin: savedPin })
          });
          var data = await res.json();
          if (data.ok && data.user && data.user.isAdmin) {
            adminPin = savedPin;
            isAdminMode = true;
          } else {
            localStorage.removeItem('km_portal_admin_pin');
          }
        }
      } catch (e) {}
      syncAdminVisibility();
    }

    async function loadAdminZaloBots() {
      if (!isAdminMode) return;
      var box = document.getElementById('admin-zalo-bots-list');
      try {
        var res = await fetch('/portal/api/admin/zalo-bots', { headers: adminHeaders() });
        var data = await res.json();
        if (!data.ok) {
          if (box) box.innerHTML = '<div style="font-size:12.5px; color:#dc2626;">' + esc(data.error || 'Không có quyền truy cập') + '</div>';
          return;
        }
        renderAdminZaloBots(data.bots || []);
      } catch (e) {}
    }

    function renderAdminZaloBots(bots) {
      var box = document.getElementById('admin-zalo-bots-list');
      if (!box) return;
      if (!bots || bots.length === 0) {
        box.innerHTML = '<div style="font-size:12.5px; color:var(--text-muted);">Chưa có Zalo Bot nào được cấu hình.</div>';
        return;
      }
      box.innerHTML = bots.map(function(b) {
        var stBadge = b.running
          ? '<span class="badge">🟢 Đang chạy</span>'
          : (b.enabled ? '<span class="badge muted">🟡 Đang bật (Chờ kết nối)</span>' : '<span class="badge muted">⚪ Đang tắt</span>');
        var toggleLabel = b.enabled ? '⏸️ Tắt Bot' : '⚡ Bật Bot';
        var chkStyle = 'display:inline-flex; align-items:center; gap:6px; font-size:12.5px; color:var(--text-main); cursor:pointer;';
        return '<div class="admin-bot-card" data-bot-id="' + esc(b.id) + '" style="padding:14px; border:1px solid var(--border); border-radius:10px; background:var(--bg-canvas);">' +
          '<div style="display:flex; justify-content:space-between; align-items:center; gap:10px; flex-wrap:wrap; margin-bottom:10px;">' +
            '<div style="display:flex; align-items:center; gap:8px; flex:1; min-width:220px;">' +
              '<input class="input bot-label-inp" value="' + esc(b.label) + '" style="max-width:230px; height:32px; font-weight:700;">' +
              '<span style="font-size:11.5px; color:var(--text-muted);">ID: ' + esc(b.id) + '</span>' +
              stBadge +
            '</div>' +
            '<div style="display:flex; gap:8px; align-items:center;">' +
              '<button class="btn btn-soft btn-sm" onclick="saveAdminBotFromBtn(this, ' + (b.enabled ? 'false' : 'true') + ')">' + toggleLabel + '</button>' +
              '<button class="btn btn-primary btn-sm" onclick="saveAdminBotFromBtn(this)">💾 Lưu cấu hình</button>' +
            '</div>' +
          '</div>' +
          '<div style="display:flex; flex-wrap:wrap; gap:16px; margin-bottom:10px;">' +
            '<label style="' + chkStyle + '"><input type="checkbox" class="bot-chk-groups" ' + (b.respondToGroups ? 'checked' : '') + '> Trả lời nhóm</label>' +
            '<label style="' + chkStyle + '"><input type="checkbox" class="bot-chk-mention" ' + (b.groupRequireMention ? 'checked' : '') + '> Chỉ trả lời nhóm khi @tag</label>' +
            '<label style="' + chkStyle + '"><input type="checkbox" class="bot-chk-passive" ' + (b.groupPassiveListen ? 'checked' : '') + '> Ghi lịch sử nhóm</label>' +
            '<label style="' + chkStyle + '"><input type="checkbox" class="bot-chk-typing" ' + (b.typingIndicatorEnabled ? 'checked' : '') + '> Báo "đang nhập..."</label>' +
          '</div>' +
          '<div style="display:flex; gap:8px; align-items:center; flex-wrap:wrap;">' +
            '<span style="font-size:12px; color:var(--text-muted);">Token: ' + (b.coBotToken ? '✅ Đã lưu' : '⚠️ Chưa có') + '</span>' +
            '<input class="input bot-token-inp" type="password" placeholder="Nhập Bot Token mới nếu muốn thay..." style="flex:1; min-width:240px; height:32px; font-size:12px;">' +
          '</div>' +
        '</div>';
      }).join('');
    }

    function saveAdminBotFromBtn(btn, forceEnabled) {
      var card = btn && btn.closest ? btn.closest('.admin-bot-card') : null;
      if (card) saveAdminZaloBot(card.getAttribute('data-bot-id'), forceEnabled);
    }

    async function saveAdminZaloBot(botId, forceEnabled) {
      var card = document.querySelector('.admin-bot-card[data-bot-id="' + botId + '"]');
      if (!card) return;
      var label = card.querySelector('.bot-label-inp').value.trim();
      var respondToGroups = card.querySelector('.bot-chk-groups').checked;
      var groupRequireMention = card.querySelector('.bot-chk-mention').checked;
      var groupPassiveListen = card.querySelector('.bot-chk-passive').checked;
      var typingIndicatorEnabled = card.querySelector('.bot-chk-typing').checked;
      var botToken = card.querySelector('.bot-token-inp').value.trim();

      var payload = {
        id: botId,
        label: label,
        respondToGroups: respondToGroups,
        groupRequireMention: groupRequireMention,
        groupPassiveListen: groupPassiveListen,
        typingIndicatorEnabled: typingIndicatorEnabled
      };
      if (forceEnabled !== undefined) payload.enabled = forceEnabled;
      if (botToken) payload.botToken = botToken;

      var res = await fetch('/portal/api/admin/zalo-bots/update', {
        method: 'POST',
        headers: adminHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(payload)
      });
      var data = await res.json();
      if (data.ok) {
        showToast('Đã cập nhật & áp dụng cấu hình cho Bot "' + label + '"!');
        loadAdminZaloBots();
      } else {
        showToast(data.error || 'Cập nhật thất bại', true);
      }
    }

    async function createAdminZaloBot() {
      var label = document.getElementById('new-bot-label').value.trim();
      var botToken = document.getElementById('new-bot-token').value.trim();
      if (!label || !botToken) {
        showToast('Vui lòng nhập đủ Tên Bot và Token Zalo Bot', true);
        return;
      }
      var res = await fetch('/portal/api/admin/zalo-bots/create', {
        method: 'POST',
        headers: adminHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ label: label, botToken: botToken })
      });
      var data = await res.json();
      if (data.ok) {
        showToast('Đã thêm & khởi động Bot "' + label + '" thành công!');
        document.getElementById('new-bot-label').value = '';
        document.getElementById('new-bot-token').value = '';
        loadAdminZaloBots();
      } else {
        showToast(data.error || 'Không thêm được Bot mới', true);
      }
    }

    var qrPollTimer = null;

    async function startPersonalZaloQr() {
      if (!isAdminMode) { openAdminLoginModal('settings'); return; }
      var box = document.getElementById('personal-qr-box');
      var wrap = document.getElementById('personal-qr-img-wrap');
      var msgEl = document.getElementById('personal-qr-msg');
      if (box) box.style.display = 'flex';
      if (wrap) wrap.innerHTML = '<span style="font-size:12px; color:var(--text-muted);">Đang tạo mã QR...</span>';
      if (msgEl) msgEl.textContent = 'Đang khởi tạo phiên đăng nhập QR...';
      try {
        var res = await fetch('/portal/api/personal-zalo/qr-start', {
          method: 'POST',
          headers: adminHeaders()
        });
        var data = await res.json();
        renderPersonalQrState(data);
        if (qrPollTimer) clearInterval(qrPollTimer);
        qrPollTimer = setInterval(pollPersonalZaloQr, 1500);
      } catch (e) {
        if (msgEl) msgEl.textContent = 'Không khởi tạo được phiên QR: ' + (e && e.message ? e.message : e);
      }
    }

    async function pollPersonalZaloQr() {
      try {
        var res = await fetch('/portal/api/personal-zalo/qr-status');
        var data = await res.json();
        renderPersonalQrState(data);
        if (data.status === 'success' || data.status === 'error' || data.status === 'declined' || data.status === 'timeout') {
          if (qrPollTimer) {
            clearInterval(qrPollTimer);
            qrPollTimer = null;
          }
          if (data.status === 'success') {
            showToast('Đã kết nối tài khoản Zalo cá nhân thành công!');
            loadPersonalStatus();
            loadBotForwarding();
          }
        }
      } catch (e) {}
    }

    function renderPersonalQrState(data) {
      var wrap = document.getElementById('personal-qr-img-wrap');
      var msgEl = document.getElementById('personal-qr-msg');
      if (!data) return;
      if (data.qrDataUri && wrap) {
        wrap.innerHTML = '<img src="' + esc(data.qrDataUri) + '" alt="Zalo QR" style="width:190px; height:190px; object-fit:contain; border-radius:6px;">';
      }
      if (!msgEl) return;
      if (data.status === 'starting') {
        msgEl.textContent = 'Đang lấy mã QR từ máy chủ Zalo...';
      } else if (data.status === 'waiting_scan') {
        msgEl.textContent = 'Mã QR đã sẵn sàng! Hãy mở Zalo trên điện thoại để quét.';
      } else if (data.status === 'scanned') {
        msgEl.textContent = 'Đã quét mã! Hãy bấm nút Xác nhận / Đăng nhập trên điện thoại.';
      } else if (data.status === 'success') {
        msgEl.textContent = '✅ Đã kết nối Zalo cá nhân thành công!';
        if (wrap) wrap.innerHTML = '<span style="font-size:32px;">✅</span>';
      } else if (data.status === 'declined') {
        msgEl.textContent = 'Bạn đã từ chối đăng nhập trên điện thoại. Bấm Lấy mã QR để thử lại.';
      } else if (data.status === 'timeout') {
        msgEl.textContent = 'Mã QR đã hết hạn (3 phút). Bấm Lấy mã QR để tạo mã mới.';
      } else if (data.status === 'error') {
        msgEl.textContent = 'Lỗi kết nối QR: ' + (data.error || 'Không xác định');
      }
    }

    async function disconnectPersonalZalo() {
      if (!isAdminMode) { openAdminLoginModal('settings'); return; }
      await fetch('/portal/api/personal-zalo/disconnect', { method: 'POST', headers: adminHeaders() });
      showToast('Đã ngắt kết nối tài khoản Zalo cá nhân');
      var box = document.getElementById('personal-qr-box');
      if (box) box.style.display = 'none';
      loadPersonalStatus();
    }

    // Init
    initAdminMode();
    loadPersonalStatus();
    loadProjectsData();
    loadWorkTracker();
  </script>
</body>
</html>`;
}
