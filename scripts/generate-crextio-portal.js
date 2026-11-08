import fs from "node:fs";
import path from "node:path";

const currentPortalRoutes = fs.readFileSync(
  path.join(process.cwd(), "src/server/routes/portal-routes.ts"),
  "utf8"
);
const apiIndex = currentPortalRoutes.indexOf("  // API Đăng nhập / Kiểm tra mã PIN bảo mật");
const apiRoutesPart = currentPortalRoutes.slice(apiIndex);

const htmlContent = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Zalo Agent Studio // Crextio Soft Luxury</title>
  <link rel="icon" type="image/svg+xml" href="/favicon.svg">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    /* ==========================================================================
       CREXTIO SOFT LUXURY DESIGN SYSTEM
       ========================================================================== */
    :root {
      --bg-canvas: #F4F3ED;
      --bg-surface: #FFFFFF;
      --bg-subtle: #EAE8DF;
      --bg-tile: #F8F7F2;
      
      --brand-dark: #18181B;
      --brand-dark-hover: #27272A;
      --brand-accent: #F5C744;     /* Crextio Warm Golden Mustard */
      --brand-amber: #EAB308;
      --accent-soft: #FEF3C7;
      --accent-blue: #0284C7;
      
      --status-done: #10B981;
      --status-done-bg: #ECFDF5;
      --status-todo: #71717A;
      
      --text-main: #18181B;
      --text-body: #3F3F46;
      --text-muted: #71717A;
      --text-light: #A1A1AA;

      --border-soft: rgba(0, 0, 0, 0.04);
      --border-subtle: #E4E4E7;
      
      --shadow-sm: 0 2px 8px rgba(24, 24, 27, 0.02);
      --shadow-md: 0 10px 30px rgba(24, 24, 27, 0.035), 0 1px 3px rgba(24, 24, 27, 0.02);
      --shadow-lg: 0 25px 60px rgba(24, 24, 27, 0.06), 0 2px 8px rgba(24, 24, 27, 0.02);
      
      --radius-sm: 12px;
      --radius-md: 20px;
      --radius-lg: 26px;
      --radius-xl: 36px;
      --radius-pill: 9999px;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Plus Jakarta Sans', sans-serif; }
    
    body {
      background-color: var(--bg-canvas);
      background-image: 
        radial-gradient(circle at 100% 100%, rgba(245, 199, 68, 0.14) 0%, transparent 45%),
        radial-gradient(circle at 0% 0%, rgba(255, 255, 255, 0.9) 0%, transparent 50%),
        radial-gradient(circle at 50% 50%, rgba(244, 243, 237, 1) 0%, transparent 100%);
      background-attachment: fixed;
      color: var(--text-main);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      -webkit-font-smoothing: antialiased;
      padding: 20px;
    }

    /* THE FLOATING LUXURY APP SHELL */
    .crextio-app-shell {
      max-width: 1720px;
      width: 100%;
      margin: 0 auto;
      background: #FAF9F5;
      border-radius: var(--radius-xl);
      box-shadow: var(--shadow-lg);
      padding: 24px 32px 36px 32px;
      border: 1px solid rgba(255, 255, 255, 0.85);
      position: relative;
    }

    /* ==========================================================================
       TOP FLOATING NAVIGATION (NO TEXT WRAPPING)
       ========================================================================== */
    .crextio-topbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      gap: 16px;
      flex-wrap: nowrap;
    }

    .brand-group {
      display: flex;
      align-items: center;
      gap: 12px;
      text-decoration: none;
      color: var(--text-main);
      flex-shrink: 0;
    }
    .brand-logo-circle {
      width: 44px;
      height: 44px;
      border-radius: var(--radius-pill);
      background: #FFFFFF;
      box-shadow: var(--shadow-sm);
      display: flex;
      align-items: center;
      justify-content: center;
      border: 1px solid rgba(0,0,0,0.03);
    }
    .brand-name {
      font-size: 19px;
      font-weight: 800;
      letter-spacing: -0.5px;
      color: var(--brand-dark);
      white-space: nowrap;
    }
    .brand-sub {
      font-size: 10.5px;
      color: var(--text-muted);
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      white-space: nowrap;
    }

    /* FLOATING PILL NAV GROUP (SINGLE LINE, ZERO WRAP) */
    .nav-pill-group {
      display: flex;
      flex-direction: row;
      flex-wrap: nowrap;
      align-items: center;
      background: rgba(255, 255, 255, 0.9);
      backdrop-filter: blur(12px);
      border-radius: var(--radius-pill);
      padding: 6px 8px;
      box-shadow: var(--shadow-sm);
      border: 1px solid rgba(0, 0, 0, 0.04);
      gap: 4px;
      flex-shrink: 0;
      overflow-x: auto;
      scrollbar-width: none;
    }
    .nav-pill-group::-webkit-scrollbar { display: none; }

    .nav-pill {
      background: transparent;
      border: none;
      padding: 9px 18px;
      border-radius: var(--radius-pill);
      font-size: 13.5px;
      font-weight: 600;
      color: var(--text-muted);
      cursor: pointer;
      transition: all 0.2s ease;
      display: inline-flex;
      flex-direction: row;
      align-items: center;
      gap: 8px;
      white-space: nowrap !important;
      flex-shrink: 0;
      line-height: 1;
    }
    .nav-pill:hover:not(.active) {
      background: rgba(0, 0, 0, 0.04);
      color: var(--text-main);
    }
    .nav-pill.active {
      background: var(--brand-dark);
      color: #FFFFFF;
      box-shadow: 0 4px 14px rgba(24, 24, 27, 0.2);
    }

    /* RIGHT TOOLS GROUP */
    .topbar-tools {
      display: flex;
      align-items: center;
      gap: 10px;
      flex-shrink: 0;
    }
    .topbar-project-pill {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: #FFFFFF;
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-pill);
      padding: 8px 16px;
      font-size: 13px;
      font-weight: 700;
      color: var(--text-main);
      cursor: pointer;
      box-shadow: var(--shadow-sm);
      transition: all 0.2s ease;
      white-space: nowrap !important;
      flex-shrink: 0;
    }
    .topbar-project-pill:hover {
      border-color: var(--brand-accent);
      background: #FFFDF5;
    }
    #topbarProjectName {
      white-space: nowrap;
      max-width: 190px;
      overflow: hidden;
      text-overflow: ellipsis;
      display: inline-block;
    }
    .badge-percent-pill {
      background: var(--brand-accent);
      color: var(--brand-dark);
      padding: 2px 8px;
      border-radius: var(--radius-pill);
      font-size: 11px;
      font-weight: 800;
      white-space: nowrap;
    }

    .tool-circle-btn {
      width: 40px;
      height: 40px;
      border-radius: var(--radius-pill);
      background: #FFFFFF;
      border: 1px solid var(--border-soft);
      box-shadow: var(--shadow-sm);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: var(--text-body);
      transition: all 0.2s ease;
      font-size: 15px;
      text-decoration: none;
      flex-shrink: 0;
    }
    .tool-circle-btn:hover { background: #F4F4F5; transform: translateY(-1px); }

    .user-pill-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      background: #FFFFFF;
      padding: 4px 12px 4px 6px;
      border-radius: var(--radius-pill);
      box-shadow: var(--shadow-sm);
      border: 1px solid var(--border-soft);
      cursor: pointer;
      white-space: nowrap;
      flex-shrink: 0;
    }
    .user-avatar-circle {
      width: 32px;
      height: 32px;
      border-radius: var(--radius-pill);
      background: linear-gradient(135deg, #F5C744 0%, #D97706 100%);
      color: #18181B;
      font-weight: 800;
      font-size: 13px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    /* PROJECT POPOVER */
    .project-popover {
      position: absolute;
      top: 80px;
      right: 140px;
      width: 440px;
      background: #FFFFFF;
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-lg);
      border: 1px solid rgba(0,0,0,0.06);
      z-index: 150;
      display: none;
      flex-direction: column;
      overflow: hidden;
    }
    .popover-header {
      padding: 16px 20px;
      background: #FAF9F5;
      border-bottom: 1px solid var(--border-subtle);
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 13px;
      font-weight: 700;
    }
    .popover-search-box { padding: 12px 18px; border-bottom: 1px solid var(--border-subtle); }
    .popover-search-input {
      width: 100%;
      padding: 10px 16px;
      border-radius: var(--radius-pill);
      border: 1px solid var(--border-subtle);
      background: #F8F7F2;
      font-size: 13px;
      outline: none;
    }
    .popover-filter-row { display: flex; gap: 6px; padding: 8px 18px; background: #FAF9F5; border-bottom: 1px solid var(--border-subtle); }
    .popover-filter-btn {
      padding: 4px 12px;
      border-radius: var(--radius-pill);
      border: none;
      background: #FFFFFF;
      font-size: 11.5px;
      font-weight: 600;
      color: var(--text-muted);
      cursor: pointer;
    }
    .popover-filter-btn.active { background: var(--brand-dark); color: #FFFFFF; }
    .popover-project-list { max-height: 280px; overflow-y: auto; padding: 8px; }
    .popover-project-item {
      padding: 12px 16px;
      border-radius: 14px;
      margin-bottom: 4px;
      cursor: pointer;
      display: flex;
      justify-content: space-between;
      align-items: center;
      transition: background 0.15s;
    }
    .popover-project-item:hover { background: #F4F3ED; }
    .popover-project-item.active { background: #FFFDF5; border: 1.5px solid var(--brand-accent); }
    .popover-footer {
      padding: 12px 18px;
      background: #FAF9F5;
      border-top: 1px solid var(--border-subtle);
      display: flex;
      justify-content: space-between;
    }

    /* ==========================================================================
       TOP HORIZONTAL PROJECT OVERVIEW BANNER (NẰM NGANG PHÍA TRÊN DỰ ÁN)
       ========================================================================== */
    .project-banner-horizontal {
      background: #FFFFFF;
      border-radius: 26px;
      padding: 22px 28px;
      box-shadow: var(--shadow-md);
      border: 1px solid rgba(0, 0, 0, 0.02);
      margin-bottom: 24px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .banner-top-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 20px;
      flex-wrap: wrap;
    }
    .banner-identity {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
    }
    .project-code-badge {
      background: var(--brand-dark);
      color: var(--brand-accent);
      padding: 4px 10px;
      border-radius: var(--radius-pill);
      font-size: 11.5px;
      font-weight: 800;
      font-family: 'JetBrains Mono', monospace;
    }
    .project-title-heading {
      font-size: 22px;
      font-weight: 800;
      color: var(--brand-dark);
      letter-spacing: -0.3px;
    }
    .status-pill-active {
      background: #ECFDF5;
      color: #065F46;
      padding: 4px 12px;
      border-radius: var(--radius-pill);
      font-size: 12px;
      font-weight: 700;
    }
    .project-desc-text {
      width: 100%;
      font-size: 13px;
      color: var(--text-muted);
      margin-top: 2px;
    }

    /* COMPACT ASSIGNEES BOX (NHÂN SỰ PHỤ TRÁCH LÀM NHỎ BÊN GÓC PHẢI) */
    .banner-assignees-box {
      display: flex;
      align-items: center;
      gap: 10px;
      background: #FAF9F5;
      border-radius: var(--radius-pill);
      padding: 6px 14px 6px 16px;
      border: 1px solid var(--border-soft);
    }
    .assignees-box-label {
      font-size: 11px;
      font-weight: 700;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      white-space: nowrap;
    }
    .assignees-avatars-row {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .compact-assignee-chip {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: #FFFFFF;
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-pill);
      padding: 3px 10px 3px 4px;
      cursor: pointer;
      transition: all 0.15s ease;
      white-space: nowrap;
    }
    .compact-assignee-chip:hover {
      background: #FFFDF5;
      border-color: var(--brand-accent);
      transform: translateY(-1px);
    }
    .compact-assignee-chip.active {
      background: #FFFDF5;
      border-color: var(--brand-accent);
      box-shadow: 0 0 0 2px rgba(245, 199, 68, 0.3);
    }
    .chip-avatar {
      width: 24px;
      height: 24px;
      border-radius: var(--radius-pill);
      background: #EAE8DF;
      color: var(--brand-dark);
      font-size: 11px;
      font-weight: 800;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .chip-name {
      font-size: 12px;
      font-weight: 700;
      color: var(--brand-dark);
    }
    .chip-stats {
      font-size: 11px;
      color: var(--text-muted);
      font-weight: 600;
    }

    /* BANNER METRICS & PROGRESS ROW */
    .banner-metrics-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      padding-top: 12px;
      border-top: 1px solid #F4F4F5;
      flex-wrap: wrap;
    }
    .metric-col {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .metric-lbl {
      font-size: 11.5px;
      color: var(--text-muted);
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .metric-val {
      font-size: 16px;
      font-weight: 800;
      color: var(--brand-dark);
    }
    .metric-divider {
      width: 1px;
      height: 32px;
      background: #E4E4E7;
    }
    .banner-quick-actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    /* SEGMENTED OVERALL PROGRESS BAR */
    .banner-progress-bar-wrapper {
      margin-top: 2px;
    }
    .crextio-seg-bar {
      height: 9px;
      background: #E4E4E7;
      border-radius: var(--radius-pill);
      display: flex;
      overflow: hidden;
      gap: 2px;
    }
    .seg-yellow { background: var(--brand-accent); height: 100%; border-radius: var(--radius-pill) 0 0 var(--radius-pill); transition: width 0.3s; }
    .seg-dark { background: var(--brand-dark); height: 100%; transition: width 0.3s; }
    .seg-gray { background: #D4D4D8; height: 100%; flex: 1; border-radius: 0 var(--radius-pill) var(--radius-pill) 0; }

    /* ==========================================================================
       ACTION & FILTER CAPSULE BAR
       ========================================================================== */
    .crextio-action-bar {
      background: #FFFFFF;
      border-radius: var(--radius-pill);
      padding: 8px 18px;
      box-shadow: var(--shadow-sm);
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 14px;
      border: 1px solid rgba(0, 0, 0, 0.02);
      margin-bottom: 20px;
    }
    .action-bar-left {
      display: flex;
      align-items: center;
      gap: 12px;
      flex: 1;
    }
    .action-search-input {
      border: none;
      background: transparent;
      outline: none;
      font-size: 14px;
      color: var(--text-main);
      width: 100%;
      padding: 4px 8px;
    }
    .action-bar-right {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .crextio-btn {
      border-radius: var(--radius-pill);
      padding: 8px 18px;
      font-size: 13px;
      font-weight: 700;
      border: none;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: all 0.2s ease;
      text-decoration: none;
      white-space: nowrap;
    }
    .crextio-btn.primary {
      background: var(--brand-accent);
      color: var(--brand-dark);
      box-shadow: 0 4px 14px rgba(245, 199, 68, 0.25);
    }
    .crextio-btn.primary:hover { background: #EAB308; transform: translateY(-1px); }
    .crextio-btn.dark {
      background: var(--brand-dark);
      color: #FFFFFF;
      box-shadow: 0 4px 14px rgba(24, 24, 27, 0.2);
    }
    .crextio-btn.dark:hover { background: var(--brand-dark-hover); transform: translateY(-1px); }
    .crextio-btn.secondary { background: #F4F4F5; color: var(--brand-dark); }
    .crextio-btn.secondary:hover { background: #E4E4E7; }

    /* ==========================================================================
       HORIZONTAL KANBAN BOARD (CÁC BƯỚC NẰM NGANG, CUỘN / KÉO SANG PHẢI)
       ========================================================================== */
    .kanban-board-scrollable {
      display: flex;
      flex-direction: row;
      align-items: flex-start;
      gap: 20px;
      overflow-x: auto;
      padding-bottom: 24px;
      padding-top: 4px;
      width: 100%;
      scroll-behavior: smooth;
      -webkit-overflow-scrolling: touch;
    }
    /* Sleek custom scrollbar */
    .kanban-board-scrollable::-webkit-scrollbar {
      height: 8px;
    }
    .kanban-board-scrollable::-webkit-scrollbar-track {
      background: #EAE8DF;
      border-radius: 9999px;
    }
    .kanban-board-scrollable::-webkit-scrollbar-thumb {
      background: #D4D4D8;
      border-radius: 9999px;
    }
    .kanban-board-scrollable::-webkit-scrollbar-thumb:hover {
      background: var(--brand-accent);
    }

    /* Fixed-width Column (Never squished, never wraps down) */
    .kanban-col-container {
      flex: 0 0 340px;
      width: 340px;
      min-width: 340px;
      max-width: 340px;
      background: #F1EFE8;
      border-radius: var(--radius-lg);
      padding: 18px 16px;
      min-height: 580px;
      display: flex;
      flex-direction: column;
    }
    .kanban-col-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 14px;
      padding: 0 4px;
    }
    .col-title-group {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .col-step-circle {
      width: 24px;
      height: 24px;
      border-radius: var(--radius-pill);
      background: var(--brand-dark);
      color: #FFFFFF;
      font-size: 11px;
      font-weight: 800;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .col-title {
      font-size: 14px;
      font-weight: 700;
      color: var(--brand-dark);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 220px;
    }
    .col-count-pill {
      background: #FFFFFF;
      padding: 2px 8px;
      border-radius: var(--radius-pill);
      font-size: 11px;
      font-weight: 700;
      color: var(--text-muted);
    }
    .kanban-dropzone-crextio {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 12px;
      transition: background 0.2s ease;
      border-radius: var(--radius-md);
      padding: 4px;
    }
    .kanban-dropzone-crextio.drag-over {
      background: #E8E5DC;
      outline: 2px dashed var(--brand-accent);
    }

    /* SOFT TASK CARD (WHITE, ROUNDED, PILLOWED) */
    .task-card-crextio {
      background: #FFFFFF;
      border-radius: var(--radius-md);
      padding: 16px 18px;
      box-shadow: var(--shadow-md);
      border: 1px solid rgba(0, 0, 0, 0.02);
      cursor: grab;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
    }
    .task-card-crextio:hover {
      box-shadow: var(--shadow-lg);
      transform: translateY(-2px);
    }
    .task-card-crextio.dragging {
      opacity: 0.5;
      transform: scale(0.97);
    }
    .task-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }
    .task-assignee-badge {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      font-weight: 600;
      color: var(--text-body);
    }
    .task-deadline-pill {
      background: var(--accent-soft);
      color: #92400E;
      padding: 2px 8px;
      border-radius: var(--radius-pill);
      font-size: 11px;
      font-weight: 700;
      white-space: nowrap;
    }
    .task-title {
      font-size: 14.5px;
      font-weight: 700;
      color: var(--brand-dark);
      line-height: 1.35;
      margin-bottom: 6px;
    }
    .task-desc {
      font-size: 12.5px;
      color: var(--text-muted);
      line-height: 1.4;
      margin-bottom: 12px;
    }
    .task-card-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: 12px;
      padding-top: 10px;
      border-top: 1px solid #F4F4F5;
      gap: 6px;
    }
    .action-pill-btn {
      background: #F4F4F5;
      border: none;
      border-radius: var(--radius-pill);
      padding: 4px 10px;
      font-size: 11px;
      font-weight: 700;
      color: var(--text-body);
      cursor: pointer;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 4px;
      transition: background 0.15s;
      white-space: nowrap;
    }
    .action-pill-btn:hover {
      background: #E4E4E7;
      color: var(--brand-dark);
    }
    .action-pill-btn.yellow {
      background: #FEF3C7;
      color: #92400E;
    }
    .action-pill-btn.yellow:hover {
      background: #FDE68A;
    }

    /* TABLES (ROUNDED LUXURY) */
    .tab-panel { display: none; }
    .tab-panel.active { display: block; }

    .crextio-table-card {
      background: #FFFFFF;
      border-radius: 24px;
      box-shadow: var(--shadow-md);
      overflow: hidden;
      padding: 24px;
    }
    .crextio-table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
    }
    .crextio-table th {
      padding: 12px 16px;
      font-size: 12px;
      font-weight: 700;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      border-bottom: 1px solid #F4F4F5;
    }
    .crextio-table td {
      padding: 14px 16px;
      font-size: 13.5px;
      border-bottom: 1px solid #FAF9F5;
      color: var(--brand-dark);
    }
    .crextio-table tr:hover td { background: #FAF9F5; }

    /* MODAL WINDOWS */
    .modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(24, 24, 27, 0.4);
      backdrop-filter: blur(6px);
      display: none;
      align-items: center;
      justify-content: center;
      z-index: 200;
      padding: 20px;
    }
    .modal-card {
      background: #FFFFFF;
      border-radius: 28px;
      box-shadow: var(--shadow-lg);
      width: 100%;
      max-width: 520px;
      padding: 28px;
      animation: modalSlide 0.2s ease;
    }
    @keyframes modalSlide {
      from { opacity: 0; transform: translateY(12px) scale(0.98); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }
    .form-group { margin-bottom: 16px; }
    .form-label {
      display: block;
      font-size: 12.5px;
      font-weight: 700;
      margin-bottom: 6px;
      color: var(--brand-dark);
    }
    .form-control {
      width: 100%;
      padding: 10px 16px;
      border-radius: var(--radius-sm);
      border: 1px solid var(--border-subtle);
      background: #FAF9F5;
      font-size: 13.5px;
      outline: none;
      color: var(--brand-dark);
      transition: border-color 0.2s;
    }
    .form-control:focus {
      border-color: var(--brand-accent);
      background: #FFFFFF;
    }

    @media (max-width: 1200px) {
      .crextio-app-shell { padding: 18px; }
      .crextio-topbar { flex-wrap: wrap; }
      .banner-top-row { flex-direction: column; align-items: flex-start; }
      .banner-assignees-box { width: 100%; justify-content: space-between; }
    }
  </style>
</head>
<body>

  <!-- THE LUXURY FLOATING APP SHELL -->
  <div class="crextio-app-shell" onclick="closeProjectPopover()">
    
    <!-- TOP FLOATING NAVIGATION (SINGLE LINE, ZERO WRAP) -->
    <header class="crextio-topbar">
      <!-- Brand Logo -->
      <a href="/portal" class="brand-group">
        <div class="brand-logo-circle">
          <svg width="24" height="24" viewBox="0 0 48 48" fill="none">
            <g transform="translate(24, 24)">
              <g transform="rotate(0)"><path d="M0 -4 C7 -18 19 -17 19 -8 C19 1 9 7 0 4 Z" fill="#18181B"/></g>
              <g transform="rotate(120)"><path d="M0 -4 C7 -18 19 -17 19 -8 C19 1 9 7 0 4 Z" fill="#18181B"/></g>
              <g transform="rotate(240)"><path d="M0 -4 C7 -18 19 -17 19 -8 C19 1 9 7 0 4 Z" fill="#18181B"/></g>
              <circle cx="0" cy="0" r="3.5" fill="#F5C744"/>
            </g>
          </svg>
        </div>
        <div>
          <div class="brand-name">Zalo<span style="color:#71717A; font-weight:500;">Agent</span></div>
          <div class="brand-sub">Crextio Workspace</div>
        </div>
      </a>

      <!-- Center Floating Pill Nav (Strict Single Line) -->
      <nav class="nav-pill-group">
        <button class="nav-pill" data-tab="all-projects" onclick="switchTab('all-projects')">
          <span>🗂️</span><span>Dự Án</span>
        </button>
        <button class="nav-pill active" data-tab="kanban" onclick="switchTab('kanban')">
          <span>📌</span><span>Bảng Tiến Độ</span>
        </button>
        <button class="nav-pill" data-tab="tasks" onclick="switchTab('tasks')">
          <span>📋</span><span>Danh Sách</span>
        </button>
        <button class="nav-pill" data-tab="expenses" onclick="switchTab('expenses')">
          <span>💰</span><span>Chi Phí</span>
        </button>
        <button class="nav-pill" data-tab="zalo-agent" onclick="switchTab('zalo-agent')">
          <span>🤖</span><span>Zalo Bot</span>
        </button>
        <button class="nav-pill admin-only" data-tab="calendar" onclick="switchTab('calendar')">
          <span>📅</span><span>Google Lịch</span>
        </button>
        <button class="nav-pill admin-only" data-tab="members" onclick="switchTab('members')">
          <span>👥</span><span>Phân Quyền</span>
        </button>
      </nav>

      <!-- Right Tools & Switchers -->
      <div class="topbar-tools">
        <!-- Project Selector Dropdown -->
        <button class="topbar-project-pill" id="topbarProjectBtn" onclick="toggleProjectPopover(event)" title="Nhấn để đổi dự án">
          <span>📁</span>
          <span id="topbarProjectName">Đang tải...</span>
          <span class="badge-percent-pill" id="topbarProjectProgressBadge">0%</span>
          <span style="font-size:10px; color:#A1A1AA;">▼</span>
        </button>

        <!-- Quick Add Task -->
        <button class="crextio-btn primary" onclick="openAddTaskModal()">+ Thêm Việc</button>

        <a href="/dashboard" class="tool-circle-btn" title="Mở Dashboard Zalo Core">⚙️</a>
        <a href="/upload" class="tool-circle-btn" title="Kho Lưu Trữ Tài Liệu">📁</a>

        <div class="user-pill-btn" onclick="openSwitchAccountModal()" title="Nhấn để đổi vai trò tài khoản">
          <div class="user-avatar-circle" id="currentUserAvatarLetter">Q</div>
          <span style="font-size:12.5px; font-weight:700;" id="currentUserName">Quản Trị Viên</span>
        </div>
      </div>

      <!-- PROJECT POPOVER -->
      <div class="project-popover" id="projectPopover" onclick="event.stopPropagation()">
        <div class="popover-header">
          <span>// CHỌN DỰ ÁN LÀM VIỆC</span>
          <span style="cursor:pointer;" onclick="closeProjectPopover()">[✕ Đóng]</span>
        </div>
        <div class="popover-search-box">
          <input type="text" id="popoverSearchInput" class="popover-search-input" placeholder="🔍 Gõ tên dự án để tìm nhanh..." oninput="filterPopoverProjects(this.value)">
        </div>
        <div class="popover-filter-row">
          <button class="popover-filter-btn active" onclick="setPopoverFilter('all', this)">TẤT CẢ (<span id="popoverAllCount">0</span>)</button>
          <button class="popover-filter-btn" onclick="setPopoverFilter('active', this)">🟢 ĐANG CHẠY</button>
          <button class="popover-filter-btn" onclick="setPopoverFilter('completed', this)">🔵 HOÀN THÀNH</button>
        </div>
        <div class="popover-project-list" id="popoverProjectList"></div>
        <div class="popover-footer">
          <button class="crextio-btn secondary" style="font-size: 11.5px; padding: 6px 12px;" onclick="switchTab('all-projects'); closeProjectPopover();">
            🗂️ Mở Bảng Tất Cả Dự Án
          </button>
          <button class="crextio-btn primary admin-only" style="font-size: 11.5px; padding: 6px 12px;" onclick="openAddProjectModal(); closeProjectPopover();">
            + Tạo Dự Án Mới
          </button>
        </div>
      </div>
    </header>

    <!-- TOP HORIZONTAL PROJECT OVERVIEW BANNER (NẰM NGANG PHÍA TRÊN DỰ ÁN) -->
    <div class="project-banner-horizontal">
      <div class="banner-top-row">
        <!-- Left: Project Identity & Status -->
        <div class="banner-identity">
          <span class="project-code-badge" id="sideProjectCodeBadge">#PRJ-01</span>
          <h2 class="project-title-heading" id="sideCurrentProjectName">Dự Án Nâng Cấp Hệ Thống 2026</h2>
          <span class="status-pill-active" id="drawerProjectStatus">🟢 Đang chạy</span>
          <p class="project-desc-text" id="sideProjectDesc">Dự án triển khai trợ lý AI Zalo và cổng quản lý công việc</p>
        </div>

        <!-- Right: Small Compact Assignees Box (Nhân sự phụ trách làm nhỏ bên góc phải) -->
        <div class="banner-assignees-box">
          <div class="assignees-box-label">NHÂN SỰ PHỤ TRÁCH:</div>
          <div class="assignees-avatars-row" id="bannerAssigneesList">
            <!-- Populated via JS with compact chips -->
          </div>
        </div>
      </div>

      <!-- Middle: Metrics Row & Action Pills -->
      <div class="banner-metrics-row">
        <div class="metric-col">
          <span class="metric-lbl">Tiến Độ Dự Án</span>
          <span class="metric-val" id="bannerProgressVal" style="color:#D97706;">32%</span>
        </div>
        <div class="metric-divider"></div>
        <div class="metric-col">
          <span class="metric-lbl">Ngân Sách Dự Kiến</span>
          <span class="metric-val" id="drawerProjectBudget">50.000.000 đ</span>
        </div>
        <div class="metric-divider"></div>
        <div class="metric-col">
          <span class="metric-lbl">Đã Giải Ngân</span>
          <span class="metric-val" id="drawerProjectSpent">4.800.000 đ</span>
        </div>
        <div class="metric-divider"></div>
        <div class="metric-col">
          <span class="metric-lbl">Còn Lại</span>
          <span class="metric-val" id="drawerProjectRemaining">45.200.000 đ</span>
        </div>
        <div class="metric-divider"></div>
        <div class="metric-col">
          <span class="metric-lbl">Khối Lượng</span>
          <span class="metric-val" id="bannerTasksCountText">1 / 10 hoàn thành</span>
        </div>

        <!-- Quick actions right -->
        <div class="banner-quick-actions">
          <button class="crextio-btn dark" style="padding: 6px 14px; font-size: 12px;" onclick="triggerManualSyncReminders()">⚡ Quét Nhắc Zalo</button>
          <button class="crextio-btn secondary" style="padding: 6px 14px; font-size: 12px;" onclick="copyIcalFeedUrl()">📋 Link iCal Feed</button>
          <a href="/upload" class="crextio-btn secondary" style="padding: 6px 14px; font-size: 12px;">📁 Tài Liệu</a>
        </div>
      </div>

      <!-- Segmented Overall Progress Bar -->
      <div class="banner-progress-bar-wrapper">
        <div class="crextio-seg-bar">
          <div class="seg-yellow" id="centerSegYellow" style="width: 32%;"></div>
          <div class="seg-dark" id="centerSegDark" style="width: 25%;"></div>
          <div class="seg-gray"></div>
        </div>
      </div>
    </div>

    <!-- MAIN CORE WORKSPACE -->
    <main>
      
      <!-- Search & Filter Capsule Bar -->
      <div class="crextio-action-bar">
        <div class="action-bar-left">
          <span>🔍</span>
          <input type="text" id="taskSearchInput" class="action-search-input" placeholder="Tìm kiếm công việc, mô tả hoặc người phụ trách..." oninput="renderKanban()">
        </div>
        <div class="action-bar-right">
          <select id="memberFilterSelect" class="form-control" style="width:auto; padding:6px 14px; border-radius:var(--radius-pill); font-size:12px;" onchange="renderKanban()">
            <option value="">Tất cả nhân sự</option>
          </select>
          <button class="crextio-btn secondary admin-only" onclick="openAddStageModal()">+ Thêm Giai Đoạn</button>
          <button class="crextio-btn primary" onclick="openAddTaskModal()">+ Thêm Việc Mới</button>
        </div>
      </div>

      <!-- TAB 1: ALL PROJECTS -->
      <section id="tab-all-projects" class="tab-panel">
        <div class="crextio-table-card">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
            <h3 style="font-size:18px; font-weight:800;">🗂️ Danh Mục Tất Cả Dự Án</h3>
            <button class="crextio-btn primary admin-only" onclick="openAddProjectModal()">+ Tạo Dự Án Mới</button>
          </div>
          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(300px, 1fr)); gap:16px;" id="allProjectsGrid">
            <!-- Rendered via JS -->
          </div>
        </div>
      </section>

      <!-- TAB 2: KANBAN BOARD (CÁC BƯỚC NẰM NGANG, CUỘN / KÉO SANG PHẢI) -->
      <section id="tab-kanban" class="tab-panel active">
        <div class="kanban-board-scrollable" id="kanbanBoardContainer">
          <!-- Kanban columns rendered horizontally side-by-side via JS -->
        </div>
      </section>

      <!-- TAB 3: TASKS TABLE -->
      <section id="tab-tasks" class="tab-panel">
        <div class="crextio-table-card">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
            <h3 style="font-size:18px; font-weight:800;">📋 Danh Sách Chi Tiết Công Việc</h3>
            <button class="crextio-btn primary" onclick="openAddTaskModal()">+ Thêm Việc Mới</button>
          </div>
          <table class="crextio-table">
            <thead>
              <tr>
                <th>Công Việc</th>
                <th>Giai Đoạn</th>
                <th>Phụ Trách</th>
                <th>Hạn Chót</th>
                <th>Tiến Độ</th>
                <th>Chi Phí</th>
                <th style="text-align:right;">Thao Tác</th>
              </tr>
            </thead>
            <tbody id="tasksTableBody"></tbody>
          </table>
        </div>
      </section>

      <!-- TAB 4: EXPENSES TABLE -->
      <section id="tab-expenses" class="tab-panel">
        <div class="crextio-table-card">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
            <div>
              <h3 style="font-size:18px; font-weight:800;">💰 Quản Lý Ngân Sách & Chi Phí Dự Án</h3>
              <p style="font-size:12.5px; color:var(--text-muted); margin-top:2px;">Theo dõi định mức 50.000.000 đ và hóa đơn thực tế phát sinh</p>
            </div>
            <button class="crextio-btn primary admin-only" onclick="openAddExpenseModal()">+ Ghi Nhận Chi Phí</button>
          </div>
          <table class="crextio-table">
            <thead>
              <tr>
                <th>Khoản Chi</th>
                <th>Công Việc Gắn Liền</th>
                <th>Danh Mục</th>
                <th>Người Chi</th>
                <th>Ngày Chi</th>
                <th>Số Tiền</th>
              </tr>
            </thead>
            <tbody id="expensesTableBody"></tbody>
          </table>
        </div>
      </section>

      <!-- TAB 5: ZALO BOT HUB -->
      <section id="tab-zalo-agent" class="tab-panel">
        <div class="crextio-table-card">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
            <div>
              <h3 style="font-size:18px; font-weight:800;">🤖 Trung Tâm Điều Khiển Zalo Bot & Nhắc Việc</h3>
              <p style="font-size:12.5px; color:var(--text-muted); margin-top:2px;">Quản lý bot thường trú, worker tự động quét deadline và nhắc việc liên nhóm</p>
            </div>
            <span class="col-count-pill" style="background:#ECFDF5; color:#065F46; font-weight:700;">🟢 ACTIVE 24/7</span>
          </div>

          <!-- Test Message Dispatcher -->
          <div style="background:#FAF9F5; border-radius:20px; padding:20px; margin-bottom:20px;">
            <h4 style="font-size:14px; font-weight:700; margin-bottom:6px;">✉️ Gửi Thử Tin Nhắn & Nhắc Việc Liên Nhóm Qua Bot</h4>
            <p style="font-size:12px; color:var(--text-muted); margin-bottom:14px;">Bot có thể nhắc trực tiếp cá nhân hoặc gửi tin sang nhóm điều hành khác bằng Thread ID.</p>
            
            <div style="display:grid; grid-template-columns:1fr 1fr 2fr auto; gap:10px; align-items:flex-end;">
              <div>
                <label class="form-label">Người nhận dự án</label>
                <select id="zaloTestRecipientSelect" class="form-control" onchange="onSelectRecipientChange(this)"></select>
              </div>
              <div>
                <label class="form-label">Hoặc Group Thread ID</label>
                <input type="text" id="zaloCustomThreadInput" class="form-control" placeholder="Thread ID nhóm khác...">
              </div>
              <div>
                <label class="form-label">Nội dung tin</label>
                <input type="text" id="zaloTestMsgInput" class="form-control" value="🔔 [ZALO AGENT] Thông báo kiểm tra tiến độ dự án tự động!">
              </div>
              <div>
                <button class="crextio-btn dark" onclick="sendCustomZaloTestMsg()">🚀 Gửi Qua Zalo</button>
              </div>
            </div>
          </div>

          <div style="display:flex; gap:12px;">
            <button class="crextio-btn primary" onclick="triggerManualSyncReminders()">⚡ Kích Hoạt Quét Toàn Bộ Deadline Ngay</button>
            <a href="/dashboard" class="crextio-btn secondary">⚙️ Mở Cấu Hình Bot Chi Tiết</a>
          </div>
        </div>
      </section>

      <!-- TAB 6: GOOGLE CALENDAR -->
      <section id="tab-calendar" class="tab-panel">
        <div class="crextio-table-card">
          <h3 style="font-size:18px; font-weight:800; margin-bottom:8px;">📅 Đồng Bộ Google Calendar 2 Chiều (iCal Feed)</h3>
          <p style="font-size:13px; color:var(--text-muted); margin-bottom:20px;">
            Đồng bộ lịch trình dự án tự động vào Google Calendar cá nhân (trên máy tính và điện thoại).
          </p>

          <div style="background:#FFFDF5; border:1.5px solid var(--brand-accent); border-radius:20px; padding:20px; margin-bottom:20px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; flex-wrap:wrap; gap:10px;">
              <div>
                <h4 style="font-size:14px; font-weight:800; color:#92400E;">🔗 ĐƯỜNG DẪN FEED GOOGLE CALENDAR CÁ NHÂN HÓA:</h4>
                <p style="font-size:12.5px; color:#78350F; margin-top:2px;">Dán liên kết này vào Google Calendar (Mục "Lịch khác" ➔ "Từ URL") để tự động cập nhật.</p>
              </div>
              <a href="https://calendar.google.com/" target="_blank" class="crextio-btn dark" style="font-size:12px;">📅 Mở Google Calendar (Web) ↗</a>
            </div>

            <div style="display:flex; gap:10px; margin-bottom:16px;">
              <input type="text" id="icalUrlInput" class="form-control" style="background:#FFFFFF; font-family:'JetBrains Mono',monospace; font-size:12px;" readonly>
              <button class="crextio-btn primary" onclick="copyIcalFeedUrl()">📋 Sao Chép Link</button>
              <a id="btnDownloadIcs" href="/portal/api/calendar.ics" class="crextio-btn secondary" download="project-calendar.ics">💾 Tải .ICS</a>
            </div>

            <div style="background:#FFFFFF; border-radius:14px; padding:14px; font-size:12.5px; line-height:1.6; color:#78350F;">
              <b>📌 Hướng Dẫn Kết Nối Trong 30 Giây:</b>
              <ol style="margin-left:20px; margin-top:4px;">
                <li>Bấm <b>[Sao Chép Link]</b> ở trên.</li>
                <li>Mở <b>Google Calendar</b>, nhìn sang cột bên trái tìm mục <b>"Lịch khác (Other calendars)"</b> ➔ Bấm dấu <b><code>+</code></b> ➔ Chọn <b>"Từ URL"</b>.</li>
                <li>Dán link vừa chép và bấm <b>"Thêm lịch"</b>. Mọi công việc dự án sẽ tự động xuất hiện trên điện thoại và máy tính!</li>
              </ol>
            </div>
          </div>

          <div style="background:#FAF9F5; border-radius:20px; padding:18px;">
            <h4 style="font-size:13.5px; font-weight:700; margin-bottom:6px;">📧 Máy Chủ Gửi Email Thông Báo (SMTP)</h4>
            <p style="font-size:12.5px; color:var(--text-muted); margin-bottom:12px;" id="smtpStatusText">Trạng thái: Đang kiểm tra...</p>
            <div style="display:flex; gap:10px; max-width:400px;">
              <input type="email" id="testEmailInput" placeholder="nhap-email@gmail.com" class="form-control" style="font-size:12.5px;">
              <button class="crextio-btn dark" onclick="sendTestEmail()">Gửi Thử</button>
            </div>
          </div>
        </div>
      </section>

      <!-- TAB 7: MEMBERS & ROLES -->
      <section id="tab-members" class="tab-panel">
        <div class="crextio-table-card">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
            <div>
              <h3 style="font-size:18px; font-weight:800;">👥 Quản Lý Thành Viên & Phân Quyền</h3>
              <p style="font-size:12.5px; color:var(--text-muted); margin-top:2px;">Phân quyền Admin, Quản lý (Manager), Thành viên (Member) và Người xem (Viewer)</p>
            </div>
            <button class="crextio-btn primary admin-only" onclick="openAddMemberModal()">+ Thêm Thành Viên</button>
          </div>
          <table class="crextio-table">
            <thead>
              <tr>
                <th>Họ Tên</th>
                <th>Số Điện Thoại</th>
                <th>Email</th>
                <th>Vai Trò</th>
                <th>Thread Zalo</th>
                <th style="text-align:right;">Thao Tác</th>
              </tr>
            </thead>
            <tbody id="membersTableBody"></tbody>
          </table>
        </div>
      </section>

    </main>
  </div>

  <!-- MODALS -->
  <!-- ADD TASK MODAL -->
  <div class="modal-overlay" id="addTaskModal">
    <div class="modal-card">
      <h3 style="font-size:18px; font-weight:800; margin-bottom:16px;">+ Thêm Công Việc Mới</h3>
      <div class="form-group">
        <label class="form-label">Tên công việc *</label>
        <input type="text" id="newTaskTitle" class="form-control" placeholder="Ví dụ: Rà soát hợp đồng và biểu mẫu...">
      </div>
      <div class="form-group">
        <label class="form-label">Mô tả công việc</label>
        <textarea id="newTaskDesc" class="form-control" rows="2" placeholder="Ghi chú chi tiết yêu cầu..."></textarea>
      </div>
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
        <div class="form-group">
          <label class="form-label">Giai đoạn</label>
          <select id="newTaskStageId" class="form-control"></select>
        </div>
        <div class="form-group">
          <label class="form-label">Người phụ trách</label>
          <select id="newTaskAssignedPhone" class="form-control"></select>
        </div>
      </div>
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
        <div class="form-group">
          <label class="form-label">Hạn chót (Deadline)</label>
          <input type="datetime-local" id="newTaskDeadline" class="form-control">
        </div>
        <div class="form-group">
          <label class="form-label">Tiến độ (%)</label>
          <input type="number" id="newTaskProgress" class="form-control" value="0" min="0" max="100">
        </div>
      </div>
      <div style="display:flex; justify-content:flex-end; gap:8px; margin-top:20px;">
        <button class="crextio-btn secondary" onclick="closeModal('addTaskModal')">Hủy</button>
        <button class="crextio-btn primary" onclick="saveNewTask()">Lưu Công Việc</button>
      </div>
    </div>
  </div>

  <!-- EDIT TASK MODAL -->
  <div class="modal-overlay" id="editTaskModal">
    <div class="modal-card">
      <h3 style="font-size:18px; font-weight:800; margin-bottom:16px;">✏️ Chỉnh Sửa Công Việc</h3>
      <input type="hidden" id="editTaskId">
      <div class="form-group">
        <label class="form-label">Tên công việc *</label>
        <input type="text" id="editTaskTitle" class="form-control">
      </div>
      <div class="form-group">
        <label class="form-label">Mô tả</label>
        <textarea id="editTaskDesc" class="form-control" rows="2"></textarea>
      </div>
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
        <div class="form-group">
          <label class="form-label">Giai đoạn</label>
          <select id="editTaskStageId" class="form-control"></select>
        </div>
        <div class="form-group">
          <label class="form-label">Người phụ trách</label>
          <select id="editTaskAssignedPhone" class="form-control"></select>
        </div>
      </div>
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
        <div class="form-group">
          <label class="form-label">Hạn chót (Deadline)</label>
          <input type="datetime-local" id="editTaskDeadline" class="form-control">
        </div>
        <div class="form-group">
          <label class="form-label">Tiến độ (%)</label>
          <input type="number" id="editTaskProgress" class="form-control" min="0" max="100">
        </div>
      </div>
      <div style="display:flex; justify-content:space-between; align-items:center; margin-top:20px;">
        <button class="crextio-btn secondary admin-only" onclick="deleteCurrentTask()" style="color:#DC2626;">🗑️ Xóa</button>
        <div style="display:flex; gap:8px;">
          <button class="crextio-btn secondary" onclick="closeModal('editTaskModal')">Đóng</button>
          <button class="crextio-btn primary" onclick="saveEditTask()">Cập Nhật</button>
        </div>
      </div>
    </div>
  </div>

  <!-- ADD PROJECT MODAL -->
  <div class="modal-overlay" id="addProjectModal">
    <div class="modal-card">
      <h3 style="font-size:18px; font-weight:800; margin-bottom:16px;">+ Tạo Dự Án Mới</h3>
      <div class="form-group">
        <label class="form-label">Tên dự án *</label>
        <input type="text" id="newProjectName" class="form-control" placeholder="Ví dụ: Triển khai chiến dịch Quý 1...">
      </div>
      <div class="form-group">
        <label class="form-label">Mô tả dự án</label>
        <textarea id="newProjectDesc" class="form-control" rows="2" placeholder="Mục tiêu và phạm vi công việc..."></textarea>
      </div>
      <div class="form-group">
        <label class="form-label">Ngân sách dự kiến (VND)</label>
        <input type="number" id="newProjectBudget" class="form-control" placeholder="50000000" value="50000000">
      </div>
      <div style="display:flex; justify-content:flex-end; gap:8px; margin-top:20px;">
        <button class="crextio-btn secondary" onclick="closeModal('addProjectModal')">Hủy</button>
        <button class="crextio-btn primary" onclick="saveNewProject()">Tạo Dự Án</button>
      </div>
    </div>
  </div>

  <!-- ADD STAGE MODAL -->
  <div class="modal-overlay" id="addStageModal">
    <div class="modal-card">
      <h3 style="font-size:18px; font-weight:800; margin-bottom:16px;">+ Thêm Giai Đoạn Dự Án</h3>
      <div class="form-group">
        <label class="form-label">Tên giai đoạn / bước *</label>
        <input type="text" id="newStageTitle" class="form-control" placeholder="Ví dụ: Bước 5: Đào tạo & Bàn giao">
      </div>
      <div class="form-group">
        <label class="form-label">Mô tả giai đoạn</label>
        <textarea id="newStageDesc" class="form-control" rows="2"></textarea>
      </div>
      <div style="display:flex; justify-content:flex-end; gap:8px; margin-top:20px;">
        <button class="crextio-btn secondary" onclick="closeModal('addStageModal')">Hủy</button>
        <button class="crextio-btn primary" onclick="saveNewStage()">Lưu Giai Đoạn</button>
      </div>
    </div>
  </div>

  <!-- ADD EXPENSE MODAL -->
  <div class="modal-overlay" id="addExpenseModal">
    <div class="modal-card">
      <h3 style="font-size:18px; font-weight:800; margin-bottom:16px;">+ Ghi Nhận Chi Phí</h3>
      <input type="hidden" id="expenseTaskId">
      <div class="form-group">
        <label class="form-label">Nội dung chi phí *</label>
        <input type="text" id="newExpenseTitle" class="form-control" placeholder="Ví dụ: Mua máy chủ VPS, Mua vật tư...">
      </div>
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
        <div class="form-group">
          <label class="form-label">Số tiền (VND) *</label>
          <input type="number" id="newExpenseAmount" class="form-control" placeholder="1500000">
        </div>
        <div class="form-group">
          <label class="form-label">Danh mục</label>
          <select id="newExpenseCategory" class="form-control">
            <option value="Hạ tầng">Hạ tầng</option>
            <option value="Hành chính">Hành chính</option>
            <option value="Nhân sự">Nhân sự</option>
            <option value="Phần mềm">Phần mềm</option>
            <option value="Khác">Khác</option>
          </select>
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Ghi chú thêm</label>
        <input type="text" id="newExpenseNote" class="form-control" placeholder="Ghi chú hóa đơn hoặc chứng từ...">
      </div>
      <div style="display:flex; justify-content:flex-end; gap:8px; margin-top:20px;">
        <button class="crextio-btn secondary" onclick="closeModal('addExpenseModal')">Hủy</button>
        <button class="crextio-btn primary" onclick="saveNewExpense()">Lưu Chi Phí</button>
      </div>
    </div>
  </div>

  <!-- SWITCH ACCOUNT MODAL -->
  <div class="modal-overlay" id="switchAccountModal">
    <div class="modal-card">
      <h3 style="font-size:18px; font-weight:800; margin-bottom:16px;">👤 Chuyển Đổi Tài Khoản / Xem Thử Vai Trò</h3>
      <p style="font-size:12.5px; color:var(--text-muted); margin-bottom:16px;">
        Chọn nhân sự để kiểm tra phân quyền truy cập (Admin: toàn quyền, Viewer: chỉ xem).
      </p>
      <div class="form-group">
        <label class="form-label">Chọn tài khoản</label>
        <select id="switchAccountSelect" class="form-control"></select>
      </div>
      <div class="form-group">
        <label class="form-label">Mã PIN bảo mật</label>
        <input type="password" id="switchAccountPin" class="form-control" value="123456" placeholder="Mặc định: 123456">
      </div>
      <div style="display:flex; justify-content:flex-end; gap:8px; margin-top:20px;">
        <button class="crextio-btn secondary" onclick="closeModal('switchAccountModal')">Hủy</button>
        <button class="crextio-btn primary" onclick="performSwitchAccount()">Chuyển Tài Khoản</button>
      </div>
    </div>
  </div>

  <!-- JAVASCRIPT LOGIC -->
  <script>
    let globalData = {
      currentUser: null,
      projects: [],
      activeProject: null,
      stages: [],
      tasks: [],
      expenses: [],
      members: [],
      smtpConfigured: false
    };

    let popoverFilter = 'all';

    window.addEventListener('DOMContentLoaded', () => {
      const icalInput = document.getElementById('icalUrlInput');
      if (icalInput) icalInput.value = window.location.origin + '/portal/api/calendar.ics';

      document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', (e) => {
          if (e.target === overlay) overlay.style.display = 'none';
        });
      });

      loadPortalData();
    });

    function getQueryParam(key) {
      const p = new URLSearchParams(window.location.search);
      return p.get(key);
    }

    async function loadPortalData(targetProjectId = null) {
      const phone = localStorage.getItem('pm_user_phone') || getQueryParam('phone') || 'admin';
      const pid = targetProjectId || getQueryParam('projectId') || '';
      
      try {
        const res = await fetch('/portal/api/data?phone=' + encodeURIComponent(phone) + (pid ? '&projectId=' + encodeURIComponent(pid) : ''));
        if (!res.ok) throw new Error('Không thể tải dữ liệu portal');
        globalData = await res.json();
        renderEntireUI();
      } catch (err) {
        console.error('Lỗi nạp dữ liệu:', err);
      }
    }

    function renderEntireUI() {
      const u = globalData.currentUser;
      if (!u) return;

      document.getElementById('currentUserName').textContent = u.name || u.phone;
      document.getElementById('currentUserAvatarLetter').textContent = (u.name || 'Q').charAt(0).toUpperCase();

      const p = globalData.activeProject;
      if (p) {
        // Topbar
        document.getElementById('topbarProjectName').textContent = p.name;
        document.getElementById('topbarProjectProgressBadge').textContent = (p.overall_progress || 0) + '%';
        
        // Horizontal Project Banner
        document.getElementById('sideCurrentProjectName').textContent = p.name;
        document.getElementById('sideProjectCodeBadge').textContent = '#PRJ-' + String(p.id).padStart(2, '0');
        document.getElementById('sideProjectDesc').textContent = p.description || 'Dự án đang triển khai';
        document.getElementById('drawerProjectStatus').textContent = p.status === 'completed' ? '🔵 Hoàn thành' : '🟢 Đang chạy';

        document.getElementById('bannerProgressVal').textContent = (p.overall_progress || 0) + '%';
        document.getElementById('drawerProjectBudget').textContent = formatVND(p.budget || 0);
        document.getElementById('drawerProjectSpent').textContent = formatVND(p.expenses_sum || 0);
        const remaining = Math.max(0, (p.budget || 0) - (p.expenses_sum || 0));
        document.getElementById('drawerProjectRemaining').textContent = formatVND(remaining);
        document.getElementById('bannerTasksCountText').textContent = (p.completed_tasks || 0) + ' / ' + (p.tasks_count || 0) + ' hoàn thành';

        document.getElementById('centerSegYellow').style.width = Math.min(100, p.overall_progress || 0) + '%';
        const activeTasksPercent = Math.min(100 - (p.overall_progress || 0), ((p.tasks_count || 1) - (p.completed_tasks || 0)) * 10);
        document.getElementById('centerSegDark').style.width = activeTasksPercent + '%';
      }

      // Check Admin permissions
      const isViewer = u.isViewer;
      const isAdmin = u.isAdmin;
      document.querySelectorAll('.admin-only').forEach(el => {
        el.style.display = isAdmin ? '' : 'none';
      });

      renderCompactAssignees();
      renderPopoverProjects();
      renderAllProjectsGrid();
      renderKanban();
      renderTasksTable();
      renderExpensesTable();
      renderZaloAgentTab();
      renderCalendarAndSmtp();
      renderMembersTable();
    }

    // NHÂN SỰ PHỤ TRÁCH LÀM NHỎ BÊN GÓC PHẢI
    function renderCompactAssignees() {
      const container = document.getElementById('bannerAssigneesList');
      if (!container) return;
      const members = globalData.members || [];
      const tasks = globalData.tasks || [];
      const activeFilter = document.getElementById('memberFilterSelect')?.value || '';

      container.innerHTML = members.map(m => {
        const memTasks = tasks.filter(t => t.assigned_phone === m.phone);
        const total = memTasks.length;
        const done = memTasks.filter(t => t.status === 'done' || t.progress >= 100).length;
        const isSelected = activeFilter === m.phone;
        
        return '<div class="compact-assignee-chip ' + (isSelected ? 'active' : '') + '" data-phone="' + m.phone + '" onclick="filterByMember(this.dataset.phone)" title="' + escapeHtml(m.name) + ' (' + m.role + ') - ' + done + '/' + total + ' việc xong">' +
          '<div class="chip-avatar">' + escapeHtml(m.name.charAt(0)) + '</div>' +
          '<span class="chip-name">' + escapeHtml(m.name) + '</span>' +
          '<span class="chip-stats">' + done + '/' + total + '</span>' +
        '</div>';
      }).join('');
    }

    function filterByMember(phone) {
      const sel = document.getElementById('memberFilterSelect');
      if (sel) {
        sel.value = (sel.value === phone) ? '' : phone;
        renderKanban();
        renderCompactAssignees();
      }
    }

    function switchTab(tabId) {
      document.querySelectorAll('.nav-pill').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tabId);
      });
      document.querySelectorAll('.tab-panel').forEach(panel => {
        panel.classList.toggle('active', panel.id === ('tab-' + tabId));
      });
    }

    function toggleProjectPopover(e) {
      e.stopPropagation();
      const p = document.getElementById('projectPopover');
      p.style.display = (p.style.display === 'flex') ? 'none' : 'flex';
    }

    function closeProjectPopover() {
      const p = document.getElementById('projectPopover');
      if (p) p.style.display = 'none';
    }

    function setPopoverFilter(f, btn) {
      popoverFilter = f;
      document.querySelectorAll('.popover-filter-btn').forEach(b => b.classList.remove('active'));
      if (btn) btn.classList.add('active');
      renderPopoverProjects();
    }

    function filterPopoverProjects(query) {
      renderPopoverProjects(query);
    }

    function renderPopoverProjects(query = '') {
      const list = document.getElementById('popoverProjectList');
      if (!list) return;
      const q = query.toLowerCase().trim();
      let projects = globalData.projects || [];
      document.getElementById('popoverAllCount').textContent = projects.length;

      if (popoverFilter === 'active') projects = projects.filter(p => p.status === 'active');
      if (popoverFilter === 'completed') projects = projects.filter(p => p.status === 'completed');
      if (q) projects = projects.filter(p => p.name.toLowerCase().includes(q) || (p.description && p.description.toLowerCase().includes(q)));

      const currentPid = globalData.activeProject?.id;
      list.innerHTML = projects.map(p => {
        const isCurrent = p.id === currentPid;
        return '<div class="popover-project-item ' + (isCurrent ? 'active' : '') + '" onclick="selectProjectFromPopover(' + p.id + ')">' +
          '<div>' +
            '<div style="font-size:13.5px; font-weight:700;">' + escapeHtml(p.name) + '</div>' +
            '<div style="font-size:11.5px; color:var(--text-muted);">' + (p.tasks_count || 0) + ' việc • Đã chi: ' + formatVND(p.expenses_sum || 0) + '</div>' +
          '</div>' +
          '<div style="display:flex; align-items:center; gap:8px;">' +
            '<span class="badge-percent-pill">' + (p.overall_progress || 0) + '%</span>' +
            (isCurrent ? '<span style="color:#059669; font-weight:800;">✓</span>' : '') +
          '</div>' +
        '</div>';
      }).join('');
    }

    function selectProjectFromPopover(pid) {
      closeProjectPopover();
      const url = new URL(window.location.href);
      url.searchParams.set('projectId', pid);
      window.history.pushState({}, '', url);
      loadPortalData(pid);
    }

    function renderAllProjectsGrid() {
      const grid = document.getElementById('allProjectsGrid');
      if (!grid) return;
      const projects = globalData.projects || [];
      const currentPid = globalData.activeProject?.id;

      grid.innerHTML = projects.map(p => {
        const isCurrent = p.id === currentPid;
        return '<div class="task-card-crextio ' + (isCurrent ? 'active' : '') + '" style="padding:22px; cursor:pointer;" onclick="selectProjectFromPopover(' + p.id + ')">' +
          '<div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:10px;">' +
            '<div class="project-code-badge">#PRJ-' + String(p.id).padStart(2, '0') + '</div>' +
            '<span class="badge-percent-pill">' + (p.overall_progress || 0) + '%</span>' +
          '</div>' +
          '<h4 style="font-size:16px; font-weight:800; margin-bottom:6px; color:var(--brand-dark);">' + escapeHtml(p.name) + '</h4>' +
          '<p style="font-size:12.5px; color:var(--text-muted); margin-bottom:14px; min-height:36px;">' + escapeHtml(p.description || 'Không có mô tả') + '</p>' +
          '<div class="crextio-seg-bar" style="margin-bottom:12px;">' +
            '<div class="seg-yellow" style="width:' + (p.overall_progress || 0) + '%;"></div>' +
            '<div class="seg-gray"></div>' +
          '</div>' +
          '<div style="display:flex; justify-content:space-between; font-size:12px; font-weight:600; color:var(--text-muted);">' +
            '<span>' + (p.tasks_count || 0) + ' công việc</span>' +
            '<span>' + formatVND(p.budget || 0) + '</span>' +
          '</div>' +
        '</div>';
      }).join('');
    }

    // KANBAN NẰM NGANG (CUỘN KÉO SANG PHẢI, CÁC BƯỚC KHÔNG BAO GIỜ BỊ NHẢY XUỐNG DƯỚI)
    function renderKanban() {
      const container = document.getElementById('kanbanBoardContainer');
      if (!container) return;
      const stages = globalData.stages || [];
      const allTasks = globalData.tasks || [];
      const memberFilter = document.getElementById('memberFilterSelect')?.value || '';
      const searchQuery = (document.getElementById('taskSearchInput')?.value || '').toLowerCase().trim();
      const isViewer = globalData.currentUser?.isViewer;

      let filteredTasks = allTasks;
      if (memberFilter) filteredTasks = filteredTasks.filter(t => t.assigned_phone === memberFilter);
      if (searchQuery) filteredTasks = filteredTasks.filter(t => t.title.toLowerCase().includes(searchQuery) || (t.description && t.description.toLowerCase().includes(searchQuery)));

      container.innerHTML = stages.map(s => {
        const stageTasks = filteredTasks.filter(t => t.stage_id === s.id);
        
        return '<div class="kanban-col-container">' +
          '<div class="kanban-col-header">' +
            '<div class="col-title-group">' +
              '<div class="col-step-circle">' + s.step_order + '</div>' +
              '<div class="col-title" title="' + escapeHtml(s.title) + '">' + escapeHtml(s.title) + '</div>' +
            '</div>' +
            '<span class="col-count-pill">' + stageTasks.length + ' việc</span>' +
          '</div>' +
          '<div class="kanban-dropzone-crextio" data-stage-id="' + s.id + '" ondragover="dragOver(event)" ondragleave="dragLeave(event)" ondrop="drop(event)">' +
            stageTasks.map(t => {
              const deadlineStr = t.deadline ? t.deadline.slice(5, 16).replace('T', ' ') : '';
              return '<div class="task-card-crextio" draggable="' + (!isViewer) + '" ondragstart="drag(event)" data-task-id="' + t.id + '">' +
                '<div class="task-card-header">' +
                  '<div class="task-assignee-badge">' +
                    '<div class="chip-avatar" style="width:22px; height:22px; font-size:10px;">' + escapeHtml((t.assigned_name || 'U').charAt(0)) + '</div>' +
                    '<span style="font-size:12px; font-weight:700;">' + escapeHtml(t.assigned_name || 'Chưa gán') + '</span>' +
                  '</div>' +
                  (deadlineStr ? '<span class="task-deadline-pill">⏳ ' + deadlineStr + '</span>' : '') +
                '</div>' +
                '<div class="task-title">' + escapeHtml(t.title) + '</div>' +
                (t.description ? '<div class="task-desc">' + escapeHtml(t.description) + '</div>' : '') +
                '<div class="crextio-seg-bar" style="margin-bottom:8px;">' +
                  '<div class="seg-yellow" style="width:' + (t.progress || 0) + '%;"></div>' +
                  '<div class="seg-gray"></div>' +
                '</div>' +
                '<div class="task-card-footer">' +
                  (t.gcal_link ? '<a href="' + t.gcal_link + '" target="_blank" class="action-pill-btn yellow" title="Thêm vào Google Calendar">📅 Lịch</a>' : '') +
                  (!isViewer ? '<button class="action-pill-btn" onclick="sendZaloRemind(' + t.id + ')" title="Gửi nhắc Zalo">🔔 Nhắc</button>' : '') +
                  (!isViewer ? '<button class="action-pill-btn" onclick="openEditTaskModal(' + t.id + ')" title="Sửa chi tiết">✏️ Sửa</button>' : '') +
                '</div>' +
              '</div>';
            }).join('') +
          '</div>' +
        '</div>';
      }).join('');
    }

    // Drag & Drop
    let draggedTaskId = null;
    function drag(e) {
      draggedTaskId = e.currentTarget.dataset.taskId;
      e.dataTransfer.setData('text/plain', draggedTaskId);
      e.currentTarget.classList.add('dragging');
    }
    function dragOver(e) {
      e.preventDefault();
      const dropzone = e.currentTarget;
      dropzone.classList.add('drag-over');
    }
    function dragLeave(e) {
      e.currentTarget.classList.remove('drag-over');
    }
    async function drop(e) {
      e.preventDefault();
      const dropzone = e.currentTarget;
      dropzone.classList.remove('drag-over');
      const stageId = dropzone.dataset.stageId;
      document.querySelectorAll('.task-card-crextio').forEach(c => c.classList.remove('dragging'));
      if (!draggedTaskId || !stageId) return;

      try {
        await fetch('/portal/api/tasks/' + draggedTaskId, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ stage_id: Number(stageId) })
        });
        loadPortalData();
      } catch (err) {
        console.error('Lỗi chuyển bước công việc:', err);
      }
    }

    function renderTasksTable() {
      const tbody = document.getElementById('tasksTableBody');
      if (!tbody) return;
      const tasks = globalData.tasks || [];
      const isViewer = globalData.currentUser?.isViewer;

      tbody.innerHTML = tasks.map(t => {
        return '<tr>' +
          '<td><b>' + escapeHtml(t.title) + '</b></td>' +
          '<td><span class="col-count-pill">' + escapeHtml(t.stage_title || '---') + '</span></td>' +
          '<td>' + escapeHtml(t.assigned_name || '---') + '</td>' +
          '<td>' + (t.deadline ? escapeHtml(t.deadline.slice(0, 16).replace('T', ' ')) : '---') + '</td>' +
          '<td><span class="badge-percent-pill">' + (t.progress || 0) + '%</span></td>' +
          '<td>' + (t.expenses_sum ? formatVND(t.expenses_sum) : '0 đ') + '</td>' +
          '<td style="text-align:right;">' +
            (!isViewer ? '<button class="action-pill-btn" onclick="openEditTaskModal(' + t.id + ')">Sửa</button>' : '') +
          '</td>' +
        '</tr>';
      }).join('');
    }

    function renderExpensesTable() {
      const tbody = document.getElementById('expensesTableBody');
      if (!tbody) return;
      const expenses = globalData.expenses || [];
      tbody.innerHTML = expenses.map(e => {
        return '<tr>' +
          '<td><b>' + escapeHtml(e.title) + '</b></td>' +
          '<td>' + (e.task_id ? ('Công việc #' + e.task_id) : 'Chi phí chung dự án') + '</td>' +
          '<td>' + escapeHtml(e.category || 'Khác') + '</td>' +
          '<td>' + escapeHtml(e.spent_by || '---') + '</td>' +
          '<td>' + (e.spent_at ? escapeHtml(e.spent_at.slice(0, 10)) : '---') + '</td>' +
          '<td><b style="color:#059669;">' + formatVND(e.amount) + '</b></td>' +
        '</tr>';
      }).join('');
    }

    function renderMembersTable() {
      const tbody = document.getElementById('membersTableBody');
      if (!tbody) return;
      const members = globalData.members || [];
      tbody.innerHTML = members.map(m => {
        return '<tr>' +
          '<td><b>' + escapeHtml(m.name) + '</b></td>' +
          '<td>' + escapeHtml(m.phone) + '</td>' +
          '<td>' + escapeHtml(m.email || '---') + '</td>' +
          '<td><span class="badge-percent-pill" style="background:#FAF9F5; color:var(--brand-dark);">' + escapeHtml(m.role) + '</span></td>' +
          '<td>' + (m.thread_id ? '<span style="color:#059669;">Đã liên kết</span>' : '<span style="color:#A1A1AA;">Chưa có</span>') + '</td>' +
          '<td style="text-align:right;">' +
            (globalData.currentUser?.isAdmin ? '<button class="action-pill-btn" data-phone="' + m.phone + '" data-name="' + escapeHtml(m.name) + '" data-role="' + m.role + '" onclick="openEditMemberModal(this.dataset.phone, this.dataset.name, this.dataset.role)">Phân Quyền</button>' : '') +
          '</td>' +
        '</tr>';
      }).join('');
    }

    function renderZaloAgentTab() {
      const select = document.getElementById('zaloTestRecipientSelect');
      if (!select) return;
      const members = globalData.members || [];
      select.innerHTML = '<option value="">-- Chọn nhân sự mặc định --</option>' + members.map(m => {
        return '<option value="' + (m.thread_id || m.phone) + '" data-thread="' + (m.thread_id || '') + '">' + escapeHtml(m.name) + ' (' + m.phone + ')</option>';
      }).join('');
    }

    function onSelectRecipientChange(el) {
      const selectedOpt = el.options[el.selectedIndex];
      const customInput = document.getElementById('zaloCustomThreadInput');
      if (selectedOpt && selectedOpt.dataset.thread) {
        customInput.value = selectedOpt.dataset.thread;
      }
    }

    async function sendCustomZaloTestMsg() {
      const select = document.getElementById('zaloTestRecipientSelect');
      const customInput = document.getElementById('zaloCustomThreadInput');
      let targetThread = customInput ? customInput.value.trim() : '';
      if (!targetThread && select) targetThread = select.value.trim();

      const msg = document.getElementById('zaloTestMsgInput').value.trim();
      if (!targetThread || !msg) return alert('Vui lòng chọn nhân sự hoặc nhập Thread ID/Group ID và nhập nội dung tin nhắn');

      try {
        const res = await fetch('/portal/api/zalo/send-test', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ targetThread: targetThread, message: msg })
        });
        const data = await res.json();
        if (data.ok) alert('Thành công: ' + (data.message || 'Đã gửi tin nhắn qua Zalo Bot!'));
        else alert('Chưa gửi được: ' + (data.error || 'Lỗi gửi tin'));
      } catch (err) {
        alert('Lỗi kết nối máy chủ Zalo');
      }
    }

    function renderCalendarAndSmtp() {
      const smtpText = document.getElementById('smtpStatusText');
      if (globalData.smtpConfigured) {
        smtpText.innerHTML = '<span style="color:#059669; font-weight:700;">🟢 ĐÃ KẾT NỐI MÁY CHỦ SMTP EMAIL</span>';
      } else {
        smtpText.innerHTML = '<span style="color:#D97706; font-weight:700;">⚠️ Chưa cấu hình biến môi trường SMTP trong file .env</span>';
      }
    }

    function copyIcalFeedUrl() {
      const icalInput = document.getElementById('icalUrlInput');
      if (!icalInput) return;
      navigator.clipboard.writeText(icalInput.value).then(() => {
        alert('Đã sao chép liên kết iCal Feed:\\\\n' + icalInput.value + '\\\\n\\\\nBây giờ bạn có thể dán vào Google Calendar (Mục "Lịch khác" ➔ "Từ URL") để đồng bộ tự động!');
      }).catch(() => {
        alert('Đường dẫn: ' + icalInput.value);
      });
    }

    async function triggerManualSyncReminders() {
      try {
        const res = await fetch('/portal/api/sync-reminders', { method: 'POST' });
        const data = await res.json();
        alert('Đã quét kiểm tra ' + (data.checked || 0) + ' công việc, phát ' + (data.reminded || 0) + ' cảnh báo Zalo & Email!');
      } catch (err) {
        alert('Lỗi quét nhắc việc tự động');
      }
    }

    async function sendZaloRemind(taskId) {
      try {
        const res = await fetch('/portal/api/remind/' + taskId, { method: 'POST' });
        const data = await res.json();
        if (data.ok) alert('Đã gửi tin nhắc việc qua Zalo thành công!');
        else alert('Chưa gửi được: ' + (data.error || 'Lỗi'));
      } catch (err) {
        alert('Lỗi kết nối Zalo');
      }
    }

    async function sendTestEmail() {
      const email = document.getElementById('testEmailInput').value.trim();
      if (!email) return alert('Vui lòng nhập địa chỉ email nhận');
      try {
        const res = await fetch('/portal/api/test-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        });
        const data = await res.json();
        if (data.ok) alert('Đã gửi email thử nghiệm thành công đến ' + email);
        else alert('Chưa gửi được: ' + (data.error || 'Lỗi SMTP'));
      } catch (err) {
        alert('Lỗi gửi email');
      }
    }

    // Modals
    function closeModal(id) {
      const el = document.getElementById(id);
      if (el) el.style.display = 'none';
    }

    function openAddTaskModal(stageId = null) {
      const stages = globalData.stages || [];
      const members = globalData.members || [];
      const stageSelect = document.getElementById('newTaskStageId');
      const memberSelect = document.getElementById('newTaskAssignedPhone');

      stageSelect.innerHTML = stages.map(s => '<option value="' + s.id + '" ' + (stageId === s.id ? 'selected' : '') + '>' + escapeHtml(s.title) + '</option>').join('');
      memberSelect.innerHTML = '<option value="">-- Chưa gán người --</option>' + members.map(m => '<option value="' + m.phone + '">' + escapeHtml(m.name) + ' (' + m.phone + ')</option>').join('');

      document.getElementById('newTaskTitle').value = '';
      document.getElementById('newTaskDesc').value = '';
      document.getElementById('newTaskDeadline').value = '';
      document.getElementById('newTaskProgress').value = '0';
      document.getElementById('addTaskModal').style.display = 'flex';
    }

    async function saveNewTask() {
      const title = document.getElementById('newTaskTitle').value.trim();
      if (!title) return alert('Vui lòng nhập tên công việc');
      const pid = globalData.activeProject?.id;
      const stage_id = Number(document.getElementById('newTaskStageId').value);
      const assigned_phone = document.getElementById('newTaskAssignedPhone').value;
      const deadline = document.getElementById('newTaskDeadline').value;
      const progress = Number(document.getElementById('newTaskProgress').value) || 0;

      try {
        await fetch('/portal/api/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ project_id: pid, stage_id, title, description: document.getElementById('newTaskDesc').value, assigned_phone, deadline, progress })
        });
        closeModal('addTaskModal');
        loadPortalData();
      } catch (err) {
        alert('Lỗi lưu công việc');
      }
    }

    function openEditTaskModal(taskId) {
      const task = (globalData.tasks || []).find(t => t.id === taskId);
      if (!task) return;
      document.getElementById('editTaskId').value = task.id;
      document.getElementById('editTaskTitle').value = task.title || '';
      document.getElementById('editTaskDesc').value = task.description || '';

      const stages = globalData.stages || [];
      const members = globalData.members || [];
      const stageSelect = document.getElementById('editTaskStageId');
      const memberSelect = document.getElementById('editTaskAssignedPhone');

      stageSelect.innerHTML = stages.map(s => '<option value="' + s.id + '" ' + (task.stage_id === s.id ? 'selected' : '') + '>' + escapeHtml(s.title) + '</option>').join('');
      memberSelect.innerHTML = '<option value="">-- Chưa gán người --</option>' + members.map(m => '<option value="' + m.phone + '" ' + (task.assigned_phone === m.phone ? 'selected' : '') + '>' + escapeHtml(m.name) + '</option>').join('');

      document.getElementById('editTaskDeadline').value = task.deadline ? task.deadline.slice(0, 16) : '';
      document.getElementById('editTaskProgress').value = task.progress || 0;
      document.getElementById('editTaskModal').style.display = 'flex';
    }

    async function saveEditTask() {
      const taskId = document.getElementById('editTaskId').value;
      const title = document.getElementById('editTaskTitle').value.trim();
      if (!title) return alert('Vui lòng nhập tên công việc');

      try {
        await fetch('/portal/api/tasks/' + taskId, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title,
            description: document.getElementById('editTaskDesc').value,
            stage_id: Number(document.getElementById('editTaskStageId').value),
            assigned_phone: document.getElementById('editTaskAssignedPhone').value,
            deadline: document.getElementById('editTaskDeadline').value,
            progress: Number(document.getElementById('editTaskProgress').value) || 0
          })
        });
        closeModal('editTaskModal');
        loadPortalData();
      } catch (err) {
        alert('Lỗi cập nhật công việc');
      }
    }

    async function deleteCurrentTask() {
      const taskId = document.getElementById('editTaskId').value;
      if (!confirm('Bạn có chắc chắn muốn xóa công việc này?')) return;
      try {
        await fetch('/portal/api/tasks/' + taskId, { method: 'DELETE' });
        closeModal('editTaskModal');
        loadPortalData();
      } catch (err) {
        alert('Lỗi xóa công việc');
      }
    }

    function openAddProjectModal() {
      document.getElementById('newProjectName').value = '';
      document.getElementById('newProjectDesc').value = '';
      document.getElementById('addProjectModal').style.display = 'flex';
    }

    async function saveNewProject() {
      const name = document.getElementById('newProjectName').value.trim();
      if (!name) return alert('Vui lòng nhập tên dự án');
      const budget = Number(document.getElementById('newProjectBudget').value) || 0;
      const description = document.getElementById('newProjectDesc').value;

      try {
        const res = await fetch('/portal/api/projects', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, description, budget })
        });
        const data = await res.json();
        closeModal('addProjectModal');
        loadPortalData(data.project?.id);
      } catch (err) {
        alert('Lỗi tạo dự án');
      }
    }

    function openAddStageModal() {
      document.getElementById('newStageTitle').value = '';
      document.getElementById('newStageDesc').value = '';
      document.getElementById('addStageModal').style.display = 'flex';
    }

    async function saveNewStage() {
      const title = document.getElementById('newStageTitle').value.trim();
      if (!title) return alert('Vui lòng nhập tên giai đoạn');
      const pid = globalData.activeProject?.id;

      try {
        await fetch('/portal/api/stages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ project_id: pid, title, description: document.getElementById('newStageDesc').value })
        });
        closeModal('addStageModal');
        loadPortalData();
      } catch (err) {
        alert('Lỗi tạo giai đoạn');
      }
    }

    function openAddExpenseModal(taskId = null) {
      document.getElementById('expenseTaskId').value = taskId || '';
      document.getElementById('newExpenseTitle').value = '';
      document.getElementById('newExpenseAmount').value = '';
      document.getElementById('newExpenseNote').value = '';
      document.getElementById('addExpenseModal').style.display = 'flex';
    }

    async function saveNewExpense() {
      const title = document.getElementById('newExpenseTitle').value.trim();
      const amount = Number(document.getElementById('newExpenseAmount').value);
      if (!title || !amount) return alert('Vui lòng nhập đầy đủ nội dung và số tiền');
      const pid = globalData.activeProject?.id;
      const category = document.getElementById('newExpenseCategory').value;
      const note = document.getElementById('newExpenseNote').value;
      const taskId = document.getElementById('expenseTaskId').value;

      try {
        await fetch('/portal/api/expenses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ project_id: pid, task_id: taskId ? Number(taskId) : null, title, amount, category, spent_by: globalData.currentUser?.name, note })
        });
        closeModal('addExpenseModal');
        loadPortalData();
      } catch (err) {
        alert('Lỗi lưu chi phí');
      }
    }

    function openSwitchAccountModal() {
      const select = document.getElementById('switchAccountSelect');
      const members = globalData.members || [];
      const currentPhone = globalData.currentUser?.phone;

      select.innerHTML = members.map(m => '<option value="' + m.phone + '" ' + (m.phone === currentPhone ? 'selected' : '') + '>' + escapeHtml(m.name) + ' (' + m.role + ' - ' + m.phone + ')</option>').join('');
      document.getElementById('switchAccountModal').style.display = 'flex';
    }

    function performSwitchAccount() {
      const phone = document.getElementById('switchAccountSelect').value;
      localStorage.setItem('pm_user_phone', phone);
      closeModal('switchAccountModal');
      const url = new URL(window.location.href);
      url.searchParams.set('phone', phone);
      window.location.href = url.toString();
    }

    function formatVND(num) {
      return (Number(num) || 0).toLocaleString('vi-VN') + ' đ';
    }

    function escapeHtml(str) {
      if (!str) return '';
      return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }
  </script>
</body>
</html>`;

const fullFile = `import { Hono } from "hono";
import { layBotTokenGiaiMa } from "../../config/account-store.js";
import { db } from "../../conversation/database.js";
import { taoIcalFeed, taoLinkGoogleCalendarWeb } from "../../google/google-calendar-service.js";
import { getSmtpConfig, guiEmailNhacViec } from "../../notification/email-service.js";
import { quetVaGuiNhacViecTuDong } from "../../notification/auto-reminder-worker.js";
import { taoZaloBotClient } from "../../zalo-bot/zalo-bot-api-client.js";

export const portalRoutes = new Hono()
  // Trang giao diện chính của Portal (Phong cách Crextio Luxury Soft-Minimalist)
  .get("/", (c) => {
    return c.html(\`${htmlContent.replace(/`/g, "\\`").replace(/\\${/g, "\\${")}\`);
  })
${apiRoutesPart}
`;

fs.writeFileSync(
  path.join(process.cwd(), "src/server/routes/portal-routes.ts"),
  fullFile,
  "utf8"
);
console.log("Successfully generated portal-routes.ts with horizontal kanban and compact assignees!");
