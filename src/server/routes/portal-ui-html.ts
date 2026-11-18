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
        <button class="nav-item" data-tab="projects" data-bu="Homeplanner" onclick="openBusinessUnit('Homeplanner')">
          <span class="nav-icon">🏠</span> Dự án Homeplanner
        </button>
        <button class="nav-item" data-tab="tracker" onclick="switchTab('tracker')">
          <span class="nav-icon">📊</span> Theo dõi tiến độ chung
        </button>
        <button class="nav-item" data-tab="drive" onclick="switchTab('drive')">
          <span class="nav-icon">📁</span> Kho tài liệu &amp; Drive
        </button>
        <button class="nav-item" data-tab="mention" onclick="switchTab('mention')">
          <span class="nav-icon">🔔</span> Nhắc việc &amp; Tag nhóm
        </button>
        <button class="nav-item" data-tab="settings" onclick="switchTab('settings')">
          <span class="nav-icon">⚙️</span> Cài đặt kết nối
        </button>
      </nav>

      <div class="sidebar-footer">
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
          <a href="../" onclick="window.open(location.hostname.indexOf('github.io') !== -1 ? '../' : '/portal/pitch', '_blank'); return false;" class="btn btn-soft">📽️ Xem Slide</a>
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
                <div class="kpi-label">Tổng Cost đầu vào</div>
                <div class="kpi-val" id="bu-kpi-cost" style="font-size:20px;">0 ₫</div>
                <div class="kpi-sub">Tổng hợp từ các hạng mục chi phí</div>
              </div>
              <div class="kpi-card">
                <div class="kpi-label">Tổng Báo giá (Chưa VAT)</div>
                <div class="kpi-val" id="bu-kpi-quote" style="font-size:20px; color:var(--primary);">0 ₫</div>
                <div class="kpi-sub">Công thức: Cost × Hệ số từng dự án</div>
              </div>
              <div class="kpi-card">
                <div class="kpi-label">Lợi nhuận dự kiến</div>
                <div class="kpi-val" id="bu-kpi-profit" style="font-size:20px; color:#059669;">0 ₫</div>
                <div class="kpi-sub">Chênh lệch Báo giá - Cost</div>
              </div>
            </div>

            <div class="card">
              <div class="card-header">
                <div>
                  <div class="card-title" id="master-bu-title">Bảng Tổng Hợp Dự Án — Khởi Minh Gift</div>
                  <div style="font-size:12px; color:var(--text-muted); margin-top:2px;">
                    Bấm vào một dự án bất kỳ để mở công cụ tính SLA theo ngày tạm ứng &amp; lập bảng báo giá gửi khách.
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
                      <option value="Homeplanner">Homeplanner</option>
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
                    <label>Ngày ký HĐ / Tạm ứng (Mốc tính SLA)</label>
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
                      <th>Khách hàng / Dự án</th>
                      <th>Hạng mục triển khai</th>
                      <th>Freelancer / NCC</th>
                      <th>Ký HĐ/TƯ &amp; Luồng</th>
                      <th style="text-align:right;">Tổng Cost</th>
                      <th style="text-align:right;">Báo giá</th>
                      <th>Tiến độ</th>
                      <th>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody id="master-projects-tbody">
                    <tr><td colspan="9" style="text-align:center; color:var(--text-muted); padding:28px;">Đang tải bảng tổng hợp dự án...</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <!-- CẤP 2: CHI TIẾT 1 DỰ ÁN CỤ THỂ (SLA + CHI PHÍ & BÁO GIÁ) -->
          <div id="project-detail-view" style="display:none;">
            <div style="margin-bottom:14px; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:10px;">
              <button class="btn btn-sm" onclick="backToMasterProjects()">← Quay lại Bảng Tổng Hợp Dự Án</button>
              <span class="badge" id="detail-bu-badge">Khởi Minh Gift</span>
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
                  <span style="font-size:13px; font-weight:700; color:var(--text-main);">⏱️ Ngày ký HĐ / Tạm ứng:</span>
                  <input type="date" class="input" id="sla-deposit-date" style="height:34px; width:150px;" onchange="recalculateProjectSla()">
                  <span id="sla-flow-badge" class="badge"></span>
                </div>
                <button class="btn btn-primary btn-sm" onclick="recalculateProjectSla()">⚡ Tính lại toàn bộ deadline SLA</button>
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
                  <div class="kpi-label">Tổng Cost nội bộ</div>
                  <div class="kpi-val" id="cost-kpi-total" style="font-size:20px;">0 ₫</div>
                  <div class="kpi-sub">Chi phí Freelancer / Xưởng / NCC</div>
                </div>
                <div class="kpi-card">
                  <div class="kpi-label">Báo giá (Chưa VAT)</div>
                  <div class="kpi-val" id="cost-kpi-quote" style="font-size:20px; color:var(--primary);">0 ₫</div>
                  <div class="kpi-sub">Tổng (Cost × Hệ số)</div>
                </div>
                <div class="kpi-card">
                  <div class="kpi-label">Tổng thanh toán (Gồm VAT)</div>
                  <div class="kpi-val" id="cost-kpi-vat" style="font-size:20px;">0 ₫</div>
                  <div class="kpi-sub" id="cost-kpi-vat-sub">VAT 8%</div>
                </div>
                <div class="kpi-card">
                  <div class="kpi-label">Lợi nhuận gộp dự kiến</div>
                  <div class="kpi-val" id="cost-kpi-profit" style="font-size:20px; color:#059669;">0 ₫</div>
                  <div class="kpi-sub" id="cost-kpi-margin">Biên lợi nhuận: 0%</div>
                </div>
              </div>

              <div style="background:var(--aux-tint); border:1px solid var(--border); border-radius:10px; padding:16px; margin-bottom:16px;">
                <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; margin-bottom:12px;">
                  <div style="font-size:14px; font-weight:700; color:var(--text-main);">Thông tin Báo giá &amp; Hệ số theo Tệp khách hàng</div>
                  <div style="display:flex; gap:8px; flex-wrap:wrap;">
                    <button class="btn btn-soft btn-sm" onclick="saveQuotationMeta(false)">💾 Lưu thông tin báo giá</button>
                    <button class="btn btn-primary btn-sm" onclick="openPrintableQuotation()">📄 Xem &amp; Xuất PDF Báo Giá Khách Hàng</button>
                  </div>
                </div>
                <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(180px, 1fr)); gap:10px; align-items:end;">
                  <div class="field">
                    <label>Khách hàng</label>
                    <input class="input" id="q-cust-name" placeholder="VD: Đại học Quốc Gia">
                  </div>
                  <div class="field">
                    <label>Đại diện &amp; SĐT</label>
                    <input class="input" id="q-cust-rep" placeholder="VD: Anh Long - 0909...">
                  </div>
                  <div class="field">
                    <label>Tệp khách hàng</label>
                    <select class="select" id="q-client-tier" onchange="applyTierPreset()">
                      <option value="Khách lẻ">Khách lẻ (Hệ số x1.7)</option>
                      <option value="Doanh nghiệp">Doanh nghiệp (Hệ số x1.5)</option>
                      <option value="Đối tác / Đại lý">Đối tác / Đại lý (Hệ số x1.35)</option>
                      <option value="VIP / Chuỗi">VIP / Chuỗi (Hệ số x1.6)</option>
                    </select>
                  </div>
                  <div class="field">
                    <label>Hệ số chung (Markup)</label>
                    <div style="display:flex; gap:6px;">
                      <input class="input" type="number" step="0.05" min="1" id="q-default-markup" value="1.5" style="width:85px;">
                      <button class="btn btn-soft btn-sm" style="height:38px;" onclick="saveQuotationMeta(true)">Áp dụng tất cả</button>
                    </div>
                  </div>
                  <div class="field">
                    <label>VAT (%)</label>
                    <input class="input" type="number" step="1" min="0" max="20" id="q-vat-percent" value="8" style="width:80px;">
                  </div>
                </div>
              </div>

              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                <div style="font-size:14px; font-weight:700;">Chi tiết Cost từng Hạng mục &amp; Giá bán tự động</div>
                <button class="btn btn-primary btn-sm" onclick="addProjectCostItem()">+ Thêm khoản chi / Hạng mục</button>
              </div>
              <div class="table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th>Giai đoạn</th>
                      <th>Hạng mục &amp; Quy cách</th>
                      <th>Freelancer / NCC</th>
                      <th>SLA (ngày)</th>
                      <th>Cost / ĐV</th>
                      <th>SL</th>
                      <th>Hệ số</th>
                      <th>Đơn giá báo khách</th>
                      <th>Thành tiền</th>
                      <th>Trạng thái</th>
                      <th>Xóa</th>
                    </tr>
                  </thead>
                  <tbody id="project-costs-tbody">
                    <tr><td colspan="11" style="text-align:center; color:var(--text-muted); padding:20px;">Đang tải bảng chi phí...</td></tr>
                  </tbody>
                </table>
              </div>
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

        <!-- TAB 3: NHẮC VIỆC & TAG NHÓM + CHUYỂN TIẾP BOT -->
        <section class="panel" id="panel-mention">
          <div class="card">
            <div class="card-header">
              <div>
                <div class="card-title">📨 Chuyển tiếp tin nhắn sang nhóm khác (Qua Zalo Bot Trợ Lý Jay)</div>
                <div style="font-size:12px; color:var(--text-muted); margin-top:2px;">
                  Chuyển tiếp nhanh sang 1 hoặc nhiều nhóm cùng lúc, hoặc cài cầu nối tự động chuyển từ Nhóm A sang Nhóm B. Trên Zalo gõ: <code>chuyển sang Nhóm Test: Nội dung</code> hoặc <code>đặt tên nhóm 1: Tên mới</code>.
                </div>
              </div>
              <button class="btn btn-soft btn-sm" onclick="loadBotForwarding()">↻ Làm mới danh sách Bot</button>
            </div>
            <div class="card-body">
              <div style="margin-bottom:16px;">
                <div style="font-size:13px; font-weight:700; margin-bottom:8px;">1. Danh sách Nhóm &amp; Người nhận đã kết nối với Bot (tick chọn để chuyển tiếp &amp; có thể sửa tên nhóm)</div>
                <div class="table-scroll" style="margin-bottom:12px; border:1px solid var(--border); border-radius:8px;">
                  <table>
                    <thead>
                      <tr>
                        <th style="width:44px; text-align:center;">Chọn</th>
                        <th style="width:44px; text-align:center;">STT</th>
                        <th style="width:90px;">Loại</th>
                        <th style="min-width:240px;">Tên nhóm / Người nhận (Sửa &amp; Lưu)</th>
                        <th>Thành viên &amp; Tin nhắn nhận diện</th>
                      </tr>
                    </thead>
                    <tbody id="bot-targets-tbody">
                      <tr><td colspan="5" style="text-align:center; color:var(--text-muted); padding:16px;">Đang tải danh sách nhóm của Bot...</td></tr>
                    </tbody>
                  </table>
                </div>
                <div class="form-grid" style="margin-bottom:10px;">
                  <div class="field">
                    <label>Nhãn người gửi / nguồn chuyển tiếp (tuỳ chọn)</label>
                    <input class="input" id="fw-sender-label" placeholder="VD: Quản lý Khởi Minh / Nhóm Khách Hàng">
                  </div>
                  <div class="field">
                    <label>Nội dung cần chuyển tiếp sang các nhóm đã tick</label>
                    <textarea class="textarea" id="fw-message" rows="2" placeholder="Nhập nội dung hoặc dán thông báo cần gửi sang nhóm khác..."></textarea>
                  </div>
                </div>
                <button class="btn btn-primary" id="btn-fw-send" onclick="sendBotForwardNow()">📨 Chuyển tiếp sang các nhóm đã chọn</button>
              </div>

              <div style="border-top:1px solid var(--border); padding-top:16px;">
                <div style="font-size:13px; font-weight:700; margin-bottom:8px;">2. Cầu nối Tự động chuyển tiếp (Hễ có tin từ Nhóm Nguồn → Tự đẩy sang Nhóm Đích)</div>
                <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(170px, 1fr)); gap:10px; align-items:end; margin-bottom:12px;">
                  <div class="field">
                    <label>Nhóm nguồn</label>
                    <select class="select" id="fw-rule-source"></select>
                  </div>
                  <div class="field">
                    <label>Nhóm đích</label>
                    <select class="select" id="fw-rule-target"></select>
                  </div>
                  <div class="field">
                    <label>Lọc từ khóa (để trống = mọi tin)</label>
                    <input class="input" id="fw-rule-kw" placeholder="VD: báo cáo, mẫu, gấp">
                  </div>
                  <button class="btn btn-soft" onclick="addBotForwardRule()">+ Tạo cầu nối tự động</button>
                </div>
                <div id="bot-rules-list" style="display:flex; flex-direction:column; gap:6px;"></div>
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

        <!-- TAB 4: CÀI ĐẶT KẾT NỐI -->
        <section class="panel" id="panel-settings">
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
      document.getElementById('topbar-title').textContent = 'Dự án ' + (activeBu === 'KM Gift' ? 'Khởi Minh Gift' : 'Homeplanner');
      loadProjectsData(activeProjectId);
    }

    async function openProjectDetail(pid) {
      projectLevel = 'detail';
      activeProjectId = pid;
      document.getElementById('projects-master-view').style.display = 'none';
      document.getElementById('project-detail-view').style.display = 'block';
      await loadProjectsData(pid);
      setProjectView('costs');
    }

    function switchTab(tab) {
      var titles = {
        projects: 'Dự án ' + (activeBu === 'KM Gift' ? 'Khởi Minh Gift' : 'Homeplanner'),
        tracker: 'Theo dõi tiến độ công việc',
        drive: 'Kho tài liệu & Google Drive AI',
        mention: 'Nhắc việc & Tag thành viên nhóm',
        settings: 'Cài đặt kết nối hệ thống'
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
      if (tab === 'drive') loadAssets();
      if (tab === 'mention') {
        loadBotForwarding();
        if (zaloGroups.length === 0) loadZaloGroups();
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

    function renderProjectCosts() {
      var sum = projectCostsData.summary || {};
      var q = projectCostsData.quotation || {};
      var costs = projectCostsData.costs || [];
      var stages = pmData.stages || [];

      document.getElementById('cost-kpi-total').textContent = fmtVnd(sum.totalCost);
      document.getElementById('cost-kpi-quote').textContent = fmtVnd(sum.totalQuoteExclVat);
      document.getElementById('cost-kpi-vat').textContent = fmtVnd(sum.totalQuoteInclVat);
      document.getElementById('cost-kpi-vat-sub').textContent = 'VAT ' + (q.vat_percent ?? 8) + '%';
      document.getElementById('cost-kpi-profit').textContent = fmtVnd(sum.estimatedProfit);
      document.getElementById('cost-kpi-margin').textContent = 'Biên lợi nhuận: ' + (sum.profitMarginPct || 0) + '%';

      document.getElementById('q-cust-name').value = q.customer_name || '';
      document.getElementById('q-cust-rep').value = q.customer_rep || '';
      document.getElementById('q-client-tier').value = q.client_tier || 'Doanh nghiệp';
      document.getElementById('q-default-markup').value = q.default_markup || 1.5;
      document.getElementById('q-vat-percent').value = q.vat_percent ?? 8;

      var tbody = document.getElementById('project-costs-tbody');
      if (costs.length === 0) {
        tbody.innerHTML = '<tr><td colspan="11" style="text-align:center; color:var(--text-muted); padding:24px;">Chưa có khoản chi nào. Bấm "+ Thêm khoản chi / Hạng mục" để nhập cost và tự tính báo giá.</td></tr>';
        return;
      }

      tbody.innerHTML = costs.map(function(c) {
        var stageOpts = '<option value="">--</option>';
        for (var i = 0; i < stages.length; i++) {
          var st = stages[i];
          stageOpts += '<option value="' + st.id + '"' + (Number(st.id) === Number(c.stage_id) ? ' selected' : '') + '>' + esc(st.title) + '</option>';
        }
        return '<tr>' +
          '<td><select class="select" style="height:30px; font-size:12px; max-width:115px;" onchange="updateCostRow(' + c.id + ', {stage_id: Number(this.value) || null})">' + stageOpts + '</select></td>' +
          '<td><input class="wt-cell-input" style="font-weight:600; min-width:140px;" value="' + esc(c.item_name) + '" onchange="updateCostRow(' + c.id + ', {item_name: this.value})"></td>' +
          '<td><input class="wt-cell-input" style="min-width:120px;" value="' + esc(c.vendor_name) + '" onchange="updateCostRow(' + c.id + ', {vendor_name: this.value})"></td>' +
          '<td><input type="number" min="0" class="wt-cell-input" style="width:48px; font-family:JetBrains Mono,monospace;" value="' + (c.duration_days || 0) + '" onchange="updateCostRow(' + c.id + ', {duration_days: Number(this.value)})"></td>' +
          '<td><input type="number" min="0" step="10000" class="wt-cell-input" style="width:92px; font-family:JetBrains Mono,monospace;" value="' + (c.cost_amount || 0) + '" onchange="updateCostRow(' + c.id + ', {cost_amount: Number(this.value)})"></td>' +
          '<td><input type="number" min="1" class="wt-cell-input" style="width:44px; font-family:JetBrains Mono,monospace;" value="' + (c.quantity || 1) + '" onchange="updateCostRow(' + c.id + ', {quantity: Number(this.value)})"></td>' +
          '<td><input type="number" min="1" step="0.05" class="wt-cell-input" style="width:52px; font-family:JetBrains Mono,monospace; color:var(--primary); font-weight:700;" value="' + (c.markup_factor || 1.5) + '" onchange="updateCostRow(' + c.id + ', {markup_factor: Number(this.value)})"></td>' +
          '<td style="font-family:JetBrains Mono,monospace; font-weight:600; white-space:nowrap;">' + fmtVnd(c.quote_unit_price) + '</td>' +
          '<td style="font-family:JetBrains Mono,monospace; font-weight:700; color:var(--primary); white-space:nowrap;">' + fmtVnd(c.quote_line_total) + '</td>' +
          '<td><select class="select" style="height:30px; font-size:11.5px;" onchange="updateCostRow(' + c.id + ', {payment_status: this.value})">' +
            '<option value="Chưa thanh toán"' + (c.payment_status === 'Chưa thanh toán' ? ' selected' : '') + '>Chưa TT</option>' +
            '<option value="Đã tạm ứng 50%"' + (c.payment_status === 'Đã tạm ứng 50%' ? ' selected' : '') + '>Tạm ứng 50%</option>' +
            '<option value="Đã TT 100%"' + (c.payment_status === 'Đã TT 100%' ? ' selected' : '') + '>Đã TT 100%</option>' +
          '</select></td>' +
          '<td><button class="btn btn-sm" style="height:28px; color:#DC2626;" onclick="deleteCostItem(' + c.id + ')">✕</button></td>' +
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
      showToast('Đã cập nhật chi phí & tính lại báo giá');
      loadProjectCosts();
    }

    async function addProjectCostItem() {
      var name = prompt('Nhập tên hạng mục chi phí (VD: Thiết kế bao bì / Sản xuất hộp):');
      if (!name || !name.trim()) return;
      var vendor = prompt('Tên Freelancer / Nhà cung cấp (tuỳ chọn):') || '';
      var costStr = prompt('Chi phí gốc / đơn vị (VND, VD: 5000000):') || '0';
      var qtyStr = prompt('Số lượng (mặc định 1):') || '1';
      var defaultMarkup = Number(document.getElementById('q-default-markup').value) || 1.5;

      await fetch('/portal/api/projects/' + activeProjectId + '/costs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          item_name: name.trim(),
          vendor_name: vendor.trim(),
          cost_amount: Number(costStr.replace(/[^0-9.]/g, '')) || 0,
          quantity: Math.max(1, Number(qtyStr) || 1),
          markup_factor: defaultMarkup
        })
      });
      showToast('Đã thêm khoản chi mới');
      loadProjectCosts();
    }

    async function deleteCostItem(costId) {
      if (!confirm('Xóa khoản chi phí này?')) return;
      await fetch('/portal/api/projects/costs/' + costId, { method: 'DELETE' });
      showToast('Đã xóa khoản chi');
      loadProjectCosts();
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
        customer_name: document.getElementById('q-cust-name').value.trim(),
        customer_rep: document.getElementById('q-cust-rep').value.trim(),
        client_tier: document.getElementById('q-client-tier').value,
        default_markup: Number(document.getElementById('q-default-markup').value) || 1.5,
        vat_percent: Number(document.getElementById('q-vat-percent').value) || 0,
        applyMarkupToAll: Boolean(applyMarkupToAll)
      };
      await fetch('/portal/api/projects/' + activeProjectId + '/quotation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      showToast(applyMarkupToAll ? 'Đã áp dụng hệ số mới cho tất cả hạng mục!' : 'Đã lưu thông tin báo giá');
      loadProjectCosts();
    }

    function openPrintableQuotation() {
      if (!activeProjectId) return;
      if (!window.__KM_IS_STATIC) {
        window.open('/portal/api/projects/' + activeProjectId + '/quotation/print', '_blank');
        return;
      }
      var q = projectCostsData.quotation || {};
      var costs = projectCostsData.costs || [];
      var sum = projectCostsData.summary || {};
      var vatPct = Number(q.vat_percent || 8);
      var rows = costs.map(function(item, idx) {
        return '<tr>' +
          '<td style="text-align:center;">' + (idx + 1) + '</td>' +
          '<td><strong>' + esc(item.item_name) + '</strong></td>' +
          '<td style="text-align:center;">' + esc(item.unit || 'gói') + '</td>' +
          '<td style="text-align:center;">' + (item.quantity || 1) + '</td>' +
          '<td style="text-align:right;font-family:monospace;">' + Number(item.quote_unit_price || 0).toLocaleString('vi-VN') + '</td>' +
          '<td style="text-align:right;font-family:monospace;font-weight:700;">' + Number(item.quote_line_total || 0).toLocaleString('vi-VN') + '</td>' +
          '<td style="font-size:12px;color:#475569;">' + (item.duration_days ? 'Dự kiến ' + item.duration_days + ' ngày' : '') + '</td>' +
        '</tr>';
      }).join('');
      var w = window.open('', '_blank');
      if (!w) { showToast('Trình duyệt đã chặn popup, vui lòng cho phép mở tab mới', true); return; }
      w.document.open();
      w.document.write('<!DOCTYPE html><html lang="vi"><head><meta charset="UTF-8"><title>' + esc(q.title || 'BÁO GIÁ KHỞI MINH CST') + '</title>' +
        '<style>@page{size:A4 portrait;margin:14mm;}body{font-family:Segoe UI,Arial,sans-serif;color:#0F172A;margin:0;padding:24px;background:#F8FAFC;}.sheet{max-width:840px;margin:0 auto;background:#fff;padding:32px;border:1px solid #E2E8F0;border-radius:8px;}.header{display:flex;justify-content:space-between;gap:20px;border-bottom:2px solid #2563EB;padding-bottom:16px;margin-bottom:20px;}.co-name{font-size:15px;font-weight:800;color:#2563EB;margin-bottom:6px;}.co-meta,.cust-box{font-size:12.5px;color:#475569;line-height:1.6;}h1{text-align:center;font-size:19px;font-weight:800;margin:10px 0 6px;}table{width:100%;border-collapse:collapse;margin:16px 0;font-size:13px;}th{background:#EFF6FF;border:1px solid #CBD5E1;padding:9px;text-align:left;}td{border:1px solid #CBD5E1;padding:9px;}.totals{width:340px;margin-left:auto;font-size:13.5px;}.totals td{border:none;padding:5px 8px;}.totals tr.grand td{border-top:2px solid #2563EB;font-weight:800;color:#2563EB;}.btn{background:#2563EB;color:#fff;border:none;padding:9px 18px;border-radius:6px;font-weight:600;cursor:pointer;}@media print{.no-p{display:none;}body{background:#fff;padding:0;}.sheet{border:none;}}</style></head><body>' +
        '<div class="sheet"><div class="no-p" style="text-align:right;margin-bottom:12px;"><button class="btn" onclick="window.print()">🖨️ In / Lưu PDF Báo Giá</button></div>' +
        '<div class="header"><div><div class="co-name">CÔNG TY CỔ PHẦN TƯ VẤN, DỊCH VỤ VÀ THƯƠNG MẠI KHỞI MINH (KHOI MINH CST)</div><div class="co-meta">VPGD: 102/6 Lê Thánh Tông, Hoàn Kiếm, Hà Nội<br>Showroom: 6/38 Phố Huế, Cửa Nam, Hà Nội | Liên hệ: 079.338.1666</div></div>' +
        '<div class="cust-box"><div><strong>Khách hàng:</strong> ' + esc(q.customer_name || 'Quý Đối tác') + '</div><div><strong>Đại diện:</strong> ' + esc(q.customer_rep || '-') + '</div><div><strong>Ngày:</strong> ' + esc(q.quote_date || '') + '</div></div></div>' +
        '<h1>' + esc(q.title || 'BÁO GIÁ SẢN PHẨM & DỊCH VỤ') + ' (CHƯA BAO GỒM ' + vatPct + '% VAT)</h1>' +
        '<table><thead><tr><th style="width:40px;text-align:center;">No.</th><th>MÔ TẢ HẠNG MỤC</th><th style="width:65px;text-align:center;">ĐƠN VỊ</th><th style="width:60px;text-align:center;">SL</th><th style="width:110px;text-align:right;">ĐƠN GIÁ</th><th style="width:120px;text-align:right;">THÀNH TIỀN</th><th>GHI CHÚ</th></tr></thead><tbody>' + rows + '</tbody></table>' +
        '<table class="totals"><tr><td>Cộng tiền hàng:</td><td style="text-align:right;font-weight:700;">' + fmtVnd(sum.totalQuoteExclVat) + '</td></tr><tr><td>VAT (' + vatPct + '%):</td><td style="text-align:right;">' + fmtVnd(sum.vatAmount) + '</td></tr><tr class="grand"><td>TỔNG THANH TOÁN:</td><td style="text-align:right;">' + fmtVnd(sum.totalQuoteInclVat) + '</td></tr></table>' +
        '<div style="font-size:12.5px;background:#F8FAFC;padding:12px;border:1px solid #E2E8F0;border-radius:6px;"><strong>Ghi chú:</strong> Tạm ứng 50% giá trị đơn hàng sau khi đặt hàng và thanh toán phần còn lại sau khi bàn giao.</div></div></body></html>');
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
      var flowType = document.getElementById('new-km-flow').value;
      var depositDate = document.getElementById('new-km-deposit').value;
      if (!name) {
        showToast('Vui lòng nhập tên dự án', true);
        return;
      }
      var res = await fetch('/portal/api/projects/km-gift-template', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name, businessUnit: businessUnit, flowType: flowType, depositDate: depositDate })
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

    function renderProjectsTab() {
      var buName = activeBu === 'KM Gift' ? 'Khởi Minh Gift' : 'Homeplanner';
      var rawList = pmData.projects || pmData.allProjects || [];
      var list = rawList.filter(function(p) { return (p.business_unit || 'KM Gift') === activeBu; });

      var totalBuCost = list.reduce(function(s, p) { return s + (Number(p.total_cost) || 0); }, 0);
      var totalBuQuote = list.reduce(function(s, p) { return s + (Number(p.total_quote) || 0); }, 0);
      var totalBuProfit = totalBuQuote - totalBuCost;

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
          masterTbody.innerHTML = '<tr><td colspan="9" style="text-align:center; color:var(--text-muted); padding:28px;">Chưa có dự án nào trong mảng ' + esc(buName) + '. Bấm "+ Tạo Dự án mới (Auto SLA)".</td></tr>';
        } else {
          masterTbody.innerHTML = list.map(function(p, idx) {
            var flowLbl = p.flow_type === 'ready_stock' ? 'Hàng có sẵn' : 'Customised';
            return '<tr style="cursor:pointer;" onclick="openProjectDetail(' + p.id + ')">' +
              '<td style="text-align:center; font-weight:700; color:var(--text-muted);">' + (idx + 1) + '</td>' +
              '<td><div style="font-weight:700; color:var(--text-main);">' + esc(p.name) + '</div><div style="font-size:11.5px; color:var(--text-muted);">' + esc(p.payment_summary || '') + '</div></td>' +
              '<td style="font-size:12.5px; color:var(--text-body);">' + esc(p.items_preview || p.description || '-') + '</td>' +
              '<td style="font-size:12.5px; color:var(--text-muted);">' + esc(p.vendors_preview || 'Chưa gán NCC') + '</td>' +
              '<td><div class="badge" style="margin-bottom:4px;">' + flowLbl + '</div><div style="font-size:11.5px; font-family:JetBrains Mono,monospace; color:var(--text-muted);">TƯ: ' + fmtShortDate(p.deposit_date) + '</div></td>' +
              '<td style="text-align:right; font-family:JetBrains Mono,monospace; font-weight:600; white-space:nowrap;">' + fmtVnd(p.total_cost) + '</td>' +
              '<td style="text-align:right; font-family:JetBrains Mono,monospace; font-weight:700; color:var(--primary); white-space:nowrap;">' + fmtVnd(p.total_quote) + '</td>' +
              '<td><span class="badge ' + ((p.overall_progress || 0) >= 100 ? 'done' : '') + '">' + (p.overall_progress || 0) + '%</span></td>' +
              '<td><button class="btn btn-soft btn-sm" onclick="event.stopPropagation(); openProjectDetail(' + p.id + ')">Chi tiết →</button></td>' +
            '</tr>';
          }).join('');
        }
      }

      var ap = pmData.activeProject;
      if (ap) {
        document.getElementById('detail-bu-badge').textContent = ap.business_unit === 'Homeplanner' ? '🏠 Homeplanner' : '🎁 Khởi Minh Gift';
        document.getElementById('active-project-title').textContent = ap.name;
        document.getElementById('active-project-meta').textContent =
          'Đơn vị: ' + (ap.business_unit || 'KM Gift') + '  •  Tiến độ: ' + (ap.overall_progress || 0) + '%  •  Tổng Cost: ' + fmtVnd(ap.total_cost) + '  •  Giá trị Báo giá: ' + fmtVnd(ap.total_quote);
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
          ap.flow_type === 'ready_stock' ? 'Luồng: Hàng có sẵn' : 'Luồng: Customised / Không có sẵn';
        document.getElementById('sla-strip').innerHTML = stages.map(function(st) {
          var isAnchor = st.phase === 'deposit' || String(st.title || '').indexOf('Tạm ứng') !== -1;
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

    async function toggleChecklistItem(taskId, itemId) {
      await fetch('/portal/api/tasks/' + taskId + '/checklist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'toggle', itemId: itemId })
      });
      loadProjectsData(activeProjectId);
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
        var isDone = t.progress >= 100 || t.status === 'completed' || t.status === 'done';
        var pillText = showStageBadge ? (t.stage_title || 'Giai đoạn') : (isDone ? 'Hoàn thành' : (t.progress > 0 ? 'Đang làm' : 'Chờ làm'));
        var pillClass = showStageBadge ? 'muted' : (isDone ? 'done' : (t.progress > 0 ? '' : 'muted'));
        var cl = Array.isArray(t.checklist) ? t.checklist : [];
        var clDone = cl.filter(function(i) { return i.done; }).length;
        var clHtml = cl.map(function(item) {
          return '<label class="cl-item' + (item.done ? ' done' : '') + '">' +
            '<input type="checkbox" data-task-id="' + t.id + '" data-item-id="' + esc(item.id) + '"' + (item.done ? ' checked' : '') + ' onchange="toggleChecklistFromInput(this)">' +
            '<span>' + esc(item.text) + '</span>' +
          '</label>';
        }).join('');

        return '<div class="kanban-card" draggable="true" onmousedown="onCardMouseDown(event, this)" onmouseup="onCardMouseUp(this)" ondragstart="onTaskDragStart(event, ' + t.id + ')" ondragend="onTaskDragEnd(event)">' +
          '<div style="font-weight:700; font-size:13.5px; color:var(--text-main); margin-bottom:4px;">' + esc(t.title) + '</div>' +
          '<div style="display:flex; justify-content:space-between; align-items:center; font-size:11.5px; color:var(--text-muted); margin-bottom:8px;">' +
            '<span>' + esc(t.assigned_name || t.assigned_phone || 'Chưa gán') + '</span>' +
            '<span>Hạn: ' + esc(t.deadline ? t.deadline.slice(0, 10) : 'Chưa đặt') + '</span>' +
          '</div>' +
          '<div style="margin-bottom:8px;">' +
            '<div class="progress-header">' +
              '<span>Tiến độ từ Bot: ' + clDone + '/' + cl.length + ' đầu mục</span>' +
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
            var isDone = t.progress >= 100 || t.status === 'completed' || t.status === 'done';
            var st = isDone ? 'done' : (t.status === 'in_progress' || t.progress > 0 ? 'in_progress' : 'pending');
            return st === col.key;
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
        var stBadge = (t.progress >= 100 || t.status === 'completed' || t.status === 'done')
          ? '<span class="badge done">Hoàn thành</span>'
          : (t.progress > 0 ? '<span class="badge">Đang làm</span>' : '<span class="badge muted">Chờ làm</span>');
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
          '<td><input class="wt-cell-input" value="' + esc(t.title) + '" onchange="updateWtTask(' + t.id + ', {title: this.value})"></td>' +
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
      try {
        var res = await fetch('/portal/api/bot-forwarding');
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
        headers: { 'Content-Type': 'application/json' },
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
          tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; color:var(--text-muted); padding:16px;">Chưa có nhóm nào từng nhắn với Bot. Hãy tag @Bot trong nhóm Zalo 1 lần để kết nối.</td></tr>';
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
            '</tr>';
          }).join('');
        }
      }

      var opts = targets.map(function(t) {
        return '<option value="' + esc(t.threadId) + '">' + t.index + '. ' + esc(t.displayName) + '</option>';
      }).join('');
      var srcSel = document.getElementById('fw-rule-source');
      var dstSel = document.getElementById('fw-rule-target');
      if (srcSel && dstSel) {
        srcSel.innerHTML = opts;
        dstSel.innerHTML = opts;
        if (targets.length > 1) dstSel.selectedIndex = 1;
      }

      var rList = document.getElementById('bot-rules-list');
      if (rList) {
        if (rules.length === 0) {
          rList.innerHTML = '<div style="font-size:12px; color:var(--text-muted);">Chưa có cầu nối tự động nào.</div>';
        } else {
          var tMap = {};
          targets.forEach(function(t) { tMap[t.threadId] = t.displayName; });
          rList.innerHTML = rules.map(function(r) {
            return '<div style="display:flex; align-items:center; justify-content:space-between; padding:8px 12px; background:var(--bg-canvas); border:1px solid var(--border); border-radius:8px; font-size:12.5px;">' +
              '<span><strong>' + esc(tMap[r.source_thread_id] || r.source_thread_id) + '</strong> → <strong>' + esc(tMap[r.target_thread_id] || r.target_thread_id) + '</strong>' +
              (r.keyword_filter ? ' (Từ khóa: <em>' + esc(r.keyword_filter) + '</em>)' : ' (Tất cả tin nhắn)') + '</span>' +
              '<button class="btn btn-sm" style="height:26px; color:#DC2626;" onclick="deleteBotForwardRule(' + r.id + ')">Xóa</button>' +
            '</div>';
          }).join('');
        }
      }
    }

    async function sendBotForwardNow() {
      var chks = Array.from(document.querySelectorAll('.fw-target-chk:checked'));
      var ids = chks.map(function(c) { return c.value; });
      var msg = document.getElementById('fw-message').value.trim();
      var label = document.getElementById('fw-sender-label').value.trim();
      if (ids.length === 0 || !msg) {
        showToast('Vui lòng tick chọn ít nhất 1 nhóm/người nhận và nhập nội dung', true);
        return;
      }
      var btn = document.getElementById('btn-fw-send');
      btn.disabled = true;
      btn.textContent = 'Đang chuyển tiếp...';
      try {
        var res = await fetch('/portal/api/bot-forwarding/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ targetThreadIds: ids, message: msg, senderLabel: label })
        });
        var data = await res.json();
        if (data.ok) {
          showToast('Đã chuyển tiếp tin nhắn sang ' + data.sentCount + ' nhóm/người nhận!');
          document.getElementById('fw-message').value = '';
        } else {
          showToast((data.errors && data.errors[0]) || data.error || 'Chuyển tiếp thất bại', true);
        }
      } catch (e) {
        showToast('Lỗi kết nối khi chuyển tiếp', true);
      } finally {
        btn.disabled = false;
        btn.textContent = '📨 Chuyển tiếp sang các nhóm đã chọn';
      }
    }

    async function addBotForwardRule() {
      var src = document.getElementById('fw-rule-source').value;
      var dst = document.getElementById('fw-rule-target').value;
      var kw = document.getElementById('fw-rule-kw').value.trim();
      if (!src || !dst || src === dst) {
        showToast('Nhóm nguồn và đích phải khác nhau', true);
        return;
      }
      var res = await fetch('/portal/api/bot-forwarding/rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source_thread_id: src, target_thread_id: dst, keyword_filter: kw })
      });
      var data = await res.json();
      if (data.ok) {
        showToast('Đã tạo cầu nối tự động chuyển tiếp!');
        document.getElementById('fw-rule-kw').value = '';
        loadBotForwarding();
      } else {
        showToast(data.error || 'Lỗi tạo cầu nối', true);
      }
    }

    async function deleteBotForwardRule(id) {
      await fetch('/portal/api/bot-forwarding/rules/' + id, { method: 'DELETE' });
      showToast('Đã xóa cầu nối chuyển tiếp');
      loadBotForwarding();
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

    var qrPollTimer = null;

    async function startPersonalZaloQr() {
      var box = document.getElementById('personal-qr-box');
      var wrap = document.getElementById('personal-qr-img-wrap');
      var msgEl = document.getElementById('personal-qr-msg');
      if (box) box.style.display = 'flex';
      if (wrap) wrap.innerHTML = '<span style="font-size:12px; color:var(--text-muted);">Đang tạo mã QR...</span>';
      if (msgEl) msgEl.textContent = 'Đang khởi tạo phiên đăng nhập QR...';
      try {
        var res = await fetch('/portal/api/personal-zalo/qr-start', { method: 'POST' });
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
      await fetch('/portal/api/personal-zalo/disconnect', { method: 'POST' });
      showToast('Đã ngắt kết nối tài khoản Zalo cá nhân');
      var box = document.getElementById('personal-qr-box');
      if (box) box.style.display = 'none';
      loadPersonalStatus();
    }

    // Init
    loadPersonalStatus();
    loadProjectsData();
    loadWorkTracker();
  </script>
</body>
</html>`;
}
