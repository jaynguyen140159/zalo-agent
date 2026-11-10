import fs from "node:fs";
import path from "node:path";
import { Hono } from "hono";
import { db } from "../../conversation/database.js";
import { layBotTokenGiaiMa } from "../../config/account-store.js";
import { taoLinkGoogleCalendarWeb, taoIcalFeed } from "../../google/google-calendar-service.js";
import { quetVaGuiNhacViecTuDong } from "../../notification/auto-reminder-worker.js";
import { getSmtpConfig, guiEmailNhacViec } from "../../notification/email-service.js";
import { taoZaloBotClient } from "../../zalo-bot/zalo-bot-api-client.js";

export const portalRoutes = new Hono()
  // Trang Giao Diện Portal (Theme Xanh Dương Công Nghệ & Xanh Lá Ngọc, Không Lỗi Tràn Màn Hình)
  .get("/", (c) => {
    return c.html(`<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>Zalo Agent Studio // Modern Tech Blue & Emerald Green</title>
  <link rel="icon" type="image/svg+xml" href="/favicon.svg">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    /* ==========================================================================
       DESIGN TOKENS - MODERN TECH BLUE (#2563EB) & EMERALD GREEN (#10B981)
       ========================================================================== */
    :root {
      /* Brand Accents */
      --brand-primary: #2563EB;        /* Tech Blue */
      --brand-primary-hover: #1D4ED8;
      --brand-primary-light: #EFF6FF;
      --brand-primary-border: #BFDBFE;

      --brand-success: #10B981;        /* Emerald Green */
      --brand-success-hover: #059669;
      --brand-success-light: #ECFDF5;
      --brand-success-border: #A7F3D0;

      --brand-accent: #2563EB;
      --brand-dark: #0F172A;          /* Deep Navy Charcoal */

      /* Background & Neutral Surfaces */
      --bg-canvas: #F8FAFC;            /* Clean Slate White Canvas */
      --bg-surface: #FFFFFF;           /* Pure White */
      --bg-subtle: #F1F5F9;            /* Slate 100 */
      --bg-hover: #E2E8F0;

      /* Borders */
      --border-subtle: #E2E8F0;
      --border-soft: #CBD5E1;
      --border-focus: #3B82F6;

      /* Typography */
      --text-main: #0F172A;            /* Crisp Dark Navy */
      --text-muted: #64748B;           /* Slate 500 */
      --text-light: #94A3B8;           /* Slate 400 */

      /* Pill & Card Radii */
      --radius-pill: 9999px;
      --radius-sm: 10px;
      --radius-md: 16px;
      --radius-lg: 20px;
      --radius-xl: 28px;

      /* Clean Shadows */
      --shadow-sm: 0 1px 3px rgba(15, 23, 42, 0.05);
      --shadow-md: 0 4px 16px rgba(15, 23, 42, 0.05);
      --shadow-lg: 0 10px 30px rgba(15, 23, 42, 0.08);
      --shadow-glow-blue: 0 4px 16px rgba(37, 99, 235, 0.25);
      --shadow-glow-green: 0 4px 16px rgba(16, 185, 129, 0.25);
    }

    /* GLOBAL RESET & PREVENT ALL HORIZONTAL WINDOW OVERFLOW */
    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    html, body {
      max-width: 100vw;
      width: 100%;
      overflow-x: hidden;
      font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
      background-color: var(--bg-canvas);
      background-image: 
        radial-gradient(circle at 100% 0%, rgba(37, 99, 235, 0.08) 0%, transparent 40%),
        radial-gradient(circle at 0% 100%, rgba(16, 185, 129, 0.08) 0%, transparent 40%),
        radial-gradient(circle at 50% 50%, #FFFFFF 0%, transparent 100%);
      background-attachment: fixed;
      color: var(--text-main);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      -webkit-font-smoothing: antialiased;
      padding: 16px;
    }

    /* THE FLOATING APP SHELL (NO HORIZONTAL OVERFLOW) */
    .crextio-app-shell {
      max-width: 1720px;
      width: 100%;
      min-width: 0;
      margin: 0 auto;
      background: #FFFFFF;
      border-radius: var(--radius-xl);
      box-shadow: var(--shadow-lg);
      padding: 24px 28px;
      border: 1px solid var(--border-subtle);
      position: relative;
      overflow-x: hidden;
    }

    /* ==========================================================================
       TOP FLOATING NAVIGATION (RESPONSIVE & NO TEXT WRAPPING)
       ========================================================================== */
    .crextio-topbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      gap: 16px;
      flex-wrap: wrap;
      width: 100%;
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
      background: var(--bg-subtle);
      box-shadow: var(--shadow-sm);
      display: flex;
      align-items: center;
      justify-content: center;
      border: 1px solid var(--border-subtle);
      transition: transform 0.2s;
    }
    .brand-logo-circle:hover {
      transform: scale(1.05);
    }
    .brand-name {
      font-size: 19px;
      font-weight: 800;
      letter-spacing: -0.5px;
      color: var(--brand-dark);
      white-space: nowrap;
    }
    .brand-sub {
      font-size: 11px;
      color: var(--brand-primary);
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      white-space: nowrap;
      background: var(--brand-primary-light);
      padding: 2px 8px;
      border-radius: var(--radius-pill);
      border: 1px solid var(--brand-primary-border);
      display: inline-block;
      margin-left: 6px;
    }

    /* FLOATING PILL NAV GROUP (SINGLE LINE, ZERO WRAP, SCROLLS IF NARROW) */
    .nav-pill-group {
      display: flex;
      flex-direction: row;
      flex-wrap: nowrap;
      align-items: center;
      background: var(--bg-subtle);
      border-radius: var(--radius-pill);
      padding: 5px 6px;
      box-shadow: inset 0 1px 2px rgba(15, 23, 42, 0.05);
      border: 1px solid var(--border-subtle);
      gap: 4px;
      flex-shrink: 1;
      min-width: 0;
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
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
      display: inline-flex;
      flex-direction: row;
      align-items: center;
      gap: 8px;
      white-space: nowrap !important;
      flex-shrink: 0;
      line-height: 1;
    }
    .nav-pill:hover {
      color: var(--brand-primary);
      background: rgba(37, 99, 235, 0.08);
    }
    .nav-pill.active {
      background: var(--brand-primary);
      color: #FFFFFF;
      box-shadow: var(--shadow-glow-blue);
      font-weight: 700;
    }

    /* TOPBAR TOOLS & PROJECT SELECTOR */
    .topbar-tools {
      display: flex;
      align-items: center;
      gap: 10px;
      flex-shrink: 0;
      flex-wrap: wrap;
    }
    .topbar-project-pill {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: #FFFFFF;
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-pill);
      padding: 7px 16px;
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
      border-color: var(--brand-primary);
      background: var(--brand-primary-light);
    }
    #topbarProjectName {
      white-space: nowrap;
      max-width: 180px;
      overflow: hidden;
      text-overflow: ellipsis;
      display: inline-block;
    }
    .badge-percent-pill {
      background: var(--brand-success-light);
      color: var(--brand-success);
      padding: 2px 8px;
      border-radius: var(--radius-pill);
      font-size: 11px;
      font-weight: 800;
      white-space: nowrap;
      border: 1px solid var(--brand-success-border);
    }

    .tool-circle-btn {
      width: 38px;
      height: 38px;
      border-radius: var(--radius-pill);
      background: var(--bg-subtle);
      border: 1px solid var(--border-subtle);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      color: var(--text-main);
      text-decoration: none;
      cursor: pointer;
      transition: all 0.2s ease;
      box-shadow: var(--shadow-sm);
      font-size: 15px;
    }
    .tool-circle-btn:hover {
      background: var(--brand-primary-light);
      border-color: var(--brand-primary-border);
      color: var(--brand-primary);
      transform: translateY(-1px);
    }

    .user-pill-btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: var(--bg-subtle);
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-pill);
      padding: 5px 14px 5px 6px;
      cursor: pointer;
      box-shadow: var(--shadow-sm);
      transition: all 0.2s ease;
    }
    .user-pill-btn:hover {
      background: var(--bg-hover);
    }
    .user-avatar-circle {
      width: 28px;
      height: 28px;
      border-radius: var(--radius-pill);
      background: var(--brand-primary);
      color: #FFFFFF;
      font-size: 12px;
      font-weight: 800;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    /* BUTTONS */
    .crextio-btn {
      border: none;
      border-radius: var(--radius-pill);
      padding: 9px 20px;
      font-size: 13.5px;
      font-weight: 700;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
      text-decoration: none;
      white-space: nowrap !important;
      line-height: 1;
    }
    .crextio-btn.primary {
      background: var(--brand-primary);
      color: #FFFFFF;
      box-shadow: var(--shadow-glow-blue);
    }
    .crextio-btn.primary:hover {
      background: var(--brand-primary-hover);
      transform: translateY(-1px);
    }
    .crextio-btn.success {
      background: var(--brand-success);
      color: #FFFFFF;
      box-shadow: var(--shadow-glow-green);
    }
    .crextio-btn.success:hover {
      background: var(--brand-success-hover);
      transform: translateY(-1px);
    }
    .crextio-btn.secondary {
      background: #FFFFFF;
      border: 1px solid var(--border-subtle);
      color: var(--text-main);
    }
    .crextio-btn.secondary:hover {
      background: var(--bg-subtle);
      border-color: var(--border-soft);
    }
    .crextio-btn.dark {
      background: var(--brand-dark);
      color: #FFFFFF;
    }
    .crextio-btn.dark:hover {
      background: #1E293B;
    }

    /* ==========================================================================
       HORIZONTAL PROJECT OVERVIEW BANNER (COMPACT TOP BANNER + COMPACT RIGHT ASSIGNEES)
       ========================================================================== */
    .project-banner-horizontal {
      background: #FFFFFF;
      border-radius: 22px;
      padding: 20px 24px;
      box-shadow: var(--shadow-md);
      border: 1px solid var(--border-subtle);
      margin-bottom: 20px;
      display: flex;
      flex-direction: column;
      gap: 16px;
      width: 100%;
      min-width: 0;
    }

    .banner-top-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 16px;
      flex-wrap: wrap;
    }

    .banner-identity {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
    }
    .project-code-badge {
      background: var(--brand-primary-light);
      color: var(--brand-primary);
      padding: 5px 12px;
      border-radius: var(--radius-pill);
      font-size: 12px;
      font-weight: 800;
      font-family: 'JetBrains Mono', monospace;
      border: 1px solid var(--brand-primary-border);
    }
    .project-title-heading {
      font-size: 21px;
      font-weight: 800;
      letter-spacing: -0.4px;
      color: var(--text-main);
    }
    .status-pill-active {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: var(--brand-success-light);
      color: var(--brand-success);
      padding: 4px 12px;
      border-radius: var(--radius-pill);
      font-size: 12px;
      font-weight: 700;
      border: 1px solid var(--brand-success-border);
    }
    .project-desc-text {
      width: 100%;
      font-size: 13px;
      color: var(--text-muted);
      margin-top: -4px;
    }

    /* COMPACT TOP-RIGHT ASSIGNEES BOX */
    .banner-assignees-box {
      display: flex;
      align-items: center;
      gap: 8px;
      background: var(--bg-subtle);
      border-radius: var(--radius-pill);
      padding: 5px 12px 5px 14px;
      border: 1px solid var(--border-subtle);
      flex-shrink: 0;
    }
    .assignees-box-label {
      font-size: 11px;
      font-weight: 800;
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
      font-size: 12px;
      font-weight: 700;
      color: var(--text-main);
      cursor: pointer;
      transition: all 0.2s ease;
      box-shadow: var(--shadow-sm);
    }
    .compact-assignee-chip:hover {
      border-color: var(--brand-primary);
      background: var(--brand-primary-light);
      color: var(--brand-primary);
    }
    .compact-assignee-chip.active {
      background: var(--brand-primary);
      color: #FFFFFF;
      border-color: var(--brand-primary);
    }
    .compact-assignee-chip.active .chip-avatar {
      background: #FFFFFF;
      color: var(--brand-primary);
    }
    .chip-avatar {
      width: 22px;
      height: 22px;
      border-radius: var(--radius-pill);
      background: var(--brand-primary);
      color: #FFFFFF;
      font-size: 10px;
      font-weight: 800;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .chip-name {
      white-space: nowrap;
    }
    .chip-stats {
      font-size: 10px;
      color: var(--text-muted);
      font-weight: 600;
      background: var(--bg-subtle);
      padding: 1px 6px;
      border-radius: 9999px;
    }

    /* HORIZONTAL METRICS ROW */
    .banner-metrics-row {
      display: flex;
      align-items: center;
      gap: 20px;
      background: var(--bg-subtle);
      border-radius: var(--radius-md);
      padding: 12px 18px;
      flex-wrap: wrap;
      border: 1px solid var(--border-subtle);
    }
    .metric-col {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .metric-lbl {
      font-size: 11px;
      color: var(--text-muted);
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.4px;
    }
    .metric-val {
      font-size: 15px;
      font-weight: 800;
      color: var(--text-main);
      font-family: 'JetBrains Mono', monospace;
    }
    .metric-divider {
      width: 1px;
      height: 28px;
      background: var(--border-soft);
    }
    .banner-quick-actions {
      margin-left: auto;
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
    }

    /* PROGRESS BAR (BLUE & GREEN SEGMENTED) */
    .banner-progress-bar-wrapper {
      width: 100%;
    }
    .crextio-seg-bar {
      width: 100%;
      height: 9px;
      border-radius: 9999px;
      background: #E2E8F0;
      overflow: hidden;
      display: flex;
      gap: 2px;
    }
    .seg-green {
      background: var(--brand-success);
      height: 100%;
      border-radius: 9999px 0 0 9999px;
      transition: width 0.4s ease;
    }
    .seg-blue {
      background: var(--brand-primary);
      height: 100%;
      transition: width 0.4s ease;
    }
    .seg-gray {
      flex: 1;
      background: #E2E8F0;
      height: 100%;
    }

    /* ==========================================================================
       ACTION & FILTER BAR
       ========================================================================== */
    .crextio-action-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      gap: 16px;
      flex-wrap: wrap;
      width: 100%;
    }
    .action-bar-left {
      display: flex;
      align-items: center;
      gap: 10px;
      background: #FFFFFF;
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-pill);
      padding: 7px 18px;
      box-shadow: var(--shadow-sm);
      flex: 1;
      max-width: 480px;
      min-width: 220px;
    }
    .action-bar-left:focus-within {
      border-color: var(--brand-primary);
      box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
    }
    .action-search-input {
      border: none;
      background: transparent;
      outline: none;
      font-size: 13.5px;
      width: 100%;
      color: var(--text-main);
    }
    .action-bar-right {
      display: flex;
      align-items: center;
      gap: 10px;
      flex-wrap: wrap;
    }

    /* ==========================================================================
       MAIN WORKSPACE & TAB PANELS (100% WIDTH, ZERO WINDOW OVERFLOW)
       ========================================================================== */
    main {
      width: 100%;
      min-width: 0;
      max-width: 100%;
    }

    .tab-panel {
      display: none;
      width: 100%;
      min-width: 0;
      max-width: 100%;
    }
    .tab-panel.active {
      display: block;
    }

    /* ==========================================================================
       HORIZONTAL KANBAN BOARD (SINGLE ROW, HORIZONTAL SCROLL TO THE RIGHT)
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
      max-width: 100%;
      min-width: 0;
      scroll-behavior: smooth;
      -webkit-overflow-scrolling: touch;
    }
    /* Sleek Blue/Emerald Custom Scrollbar */
    .kanban-board-scrollable::-webkit-scrollbar {
      height: 9px;
    }
    .kanban-board-scrollable::-webkit-scrollbar-track {
      background: #F1F5F9;
      border-radius: 9999px;
    }
    .kanban-board-scrollable::-webkit-scrollbar-thumb {
      background: #CBD5E1;
      border-radius: 9999px;
    }
    .kanban-board-scrollable::-webkit-scrollbar-thumb:hover {
      background: var(--brand-primary);
    }

    /* FIXED-WIDTH COLUMN (NEVER WRAPS DOWN) */
    .kanban-col-container {
      flex: 0 0 340px;
      width: 340px;
      min-width: 340px;
      max-width: 340px;
      background: #F8FAFC;
      border-radius: var(--radius-lg);
      padding: 16px;
      border: 1px solid var(--border-subtle);
      box-shadow: var(--shadow-sm);
      display: flex;
      flex-direction: column;
      gap: 14px;
    }
    .kanban-col-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
    }
    .col-title-group {
      display: flex;
      align-items: center;
      gap: 10px;
      overflow: hidden;
    }
    .col-step-circle {
      width: 26px;
      height: 26px;
      border-radius: var(--radius-pill);
      background: var(--brand-primary);
      color: #FFFFFF;
      font-size: 12px;
      font-weight: 800;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .col-title {
      font-size: 14.5px;
      font-weight: 800;
      color: var(--text-main);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .col-count-pill {
      background: var(--brand-primary-light);
      color: var(--brand-primary);
      font-size: 11px;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: var(--radius-pill);
      border: 1px solid var(--brand-primary-border);
      flex-shrink: 0;
    }

    /* DROPZONE & TASK CARDS */
    .kanban-dropzone-crextio {
      min-height: 280px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      border-radius: var(--radius-md);
      transition: background 0.2s ease;
    }
    .kanban-dropzone-crextio.drag-over {
      background: var(--brand-primary-light);
      outline: 2px dashed var(--brand-primary);
    }

    .task-card-crextio {
      background: #FFFFFF;
      border-radius: var(--radius-md);
      padding: 16px;
      box-shadow: var(--shadow-sm);
      border: 1px solid var(--border-subtle);
      display: flex;
      flex-direction: column;
      gap: 10px;
      cursor: grab;
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .task-card-crextio:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(37, 99, 235, 0.08);
      border-color: #93C5FD;
    }
    .task-card-crextio.dragging {
      opacity: 0.4;
      cursor: grabbing;
    }

    .task-card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
    }
    .task-assignee-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }
    .task-deadline-pill {
      font-size: 11px;
      font-weight: 700;
      color: var(--brand-primary);
      background: var(--brand-primary-light);
      padding: 2px 8px;
      border-radius: var(--radius-pill);
      border: 1px solid var(--brand-primary-border);
      white-space: nowrap;
    }
    .task-title {
      font-size: 14px;
      font-weight: 700;
      color: var(--text-main);
      line-height: 1.35;
    }
    .task-desc {
      font-size: 12px;
      color: var(--text-muted);
      line-height: 1.4;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .task-card-footer {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-top: 2px;
      flex-wrap: wrap;
    }
    .action-pill-btn {
      border: 1px solid var(--border-subtle);
      background: var(--bg-subtle);
      border-radius: var(--radius-pill);
      padding: 4px 10px;
      font-size: 11.5px;
      font-weight: 700;
      color: var(--text-main);
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 4px;
      text-decoration: none;
      transition: all 0.2s ease;
    }
    .action-pill-btn:hover {
      background: var(--bg-hover);
      transform: translateY(-1px);
    }
    .action-pill-btn.blue {
      background: var(--brand-primary-light);
      border-color: var(--brand-primary-border);
      color: var(--brand-primary);
    }
    .action-pill-btn.blue:hover {
      background: var(--brand-primary);
      color: #FFFFFF;
    }
    .action-pill-btn.green {
      background: var(--brand-success-light);
      border-color: var(--brand-success-border);
      color: var(--brand-success);
    }
    .action-pill-btn.green:hover {
      background: var(--brand-success);
      color: #FFFFFF;
    }

    /* PROJECT CARDS GRID (TAB 1) */
    .project-card-interactive {
      background: #FFFFFF;
      border: 1px solid var(--border-subtle);
      border-radius: var(--radius-lg);
      padding: 22px;
      cursor: pointer;
      box-shadow: var(--shadow-sm);
      transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .project-card-interactive:hover {
      border-color: var(--brand-primary);
      box-shadow: 0 10px 30px rgba(37, 99, 235, 0.12);
      transform: translateY(-3px);
    }
    .project-card-interactive.active {
      border: 2px solid var(--brand-primary);
      background: #FAFCFF;
    }

    /* TABLES & FORMS */
    .crextio-table-card {
      background: #FFFFFF;
      border-radius: var(--radius-lg);
      padding: 22px;
      box-shadow: var(--shadow-md);
      border: 1px solid var(--border-subtle);
      overflow-x: auto;
    }
    .crextio-table {
      width: 100%;
      border-collapse: separate;
      border-spacing: 0 6px;
    }
    .crextio-table th {
      text-align: left;
      font-size: 11.5px;
      font-weight: 800;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      padding: 8px 14px;
    }
    .crextio-table td {
      background: var(--bg-subtle);
      padding: 12px 14px;
      font-size: 13.5px;
      color: var(--text-main);
    }
    .crextio-table tr td:first-child { border-radius: 12px 0 0 12px; }
    .crextio-table tr td:last-child { border-radius: 0 12px 12px 0; }

    /* MODAL */
    .crextio-modal-overlay {
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(15, 23, 42, 0.45);
      backdrop-filter: blur(8px);
      z-index: 9999;
      display: none;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .crextio-modal {
      background: #FFFFFF;
      border-radius: var(--radius-xl);
      padding: 28px;
      max-width: 580px;
      width: 100%;
      box-shadow: 0 20px 60px rgba(15, 23, 42, 0.18);
      border: 1px solid var(--border-subtle);
      position: relative;
      animation: modalSlideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    }
    @keyframes modalSlideUp {
      from { opacity: 0; transform: translateY(16px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .form-group {
      margin-bottom: 14px;
    }
    .form-group label {
      display: block;
      font-size: 12px;
      font-weight: 700;
      color: var(--text-main);
      margin-bottom: 6px;
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }
    .form-control {
      width: 100%;
      border: 1px solid var(--border-subtle);
      background: var(--bg-subtle);
      border-radius: var(--radius-md);
      padding: 10px 14px;
      font-size: 13.5px;
      color: var(--text-main);
      outline: none;
      transition: all 0.2s ease;
      font-family: inherit;
    }
    .form-control:focus {
      border-color: var(--brand-primary);
      background: #FFFFFF;
      box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
    }

    /* POPOVER PROJECT SELECTOR */
    .project-popover {
      position: absolute;
      top: 74px;
      right: 28px;
      width: 380px;
      max-width: 90vw;
      background: #FFFFFF;
      border-radius: var(--radius-lg);
      box-shadow: 0 16px 48px rgba(15, 23, 42, 0.14);
      border: 1px solid var(--border-subtle);
      padding: 16px;
      z-index: 1000;
      display: none;
      flex-direction: column;
      gap: 12px;
    }
    .popover-project-item {
      padding: 12px;
      border-radius: var(--radius-md);
      border: 1px solid var(--border-subtle);
      cursor: pointer;
      transition: all 0.2s ease;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #FFFFFF;
    }
    .popover-project-item:hover {
      border-color: var(--brand-primary);
      background: var(--brand-primary-light);
      transform: translateX(2px);
    }
    .popover-project-item.active {
      border-color: var(--brand-primary);
      background: var(--brand-primary-light);
    }

    /* TOAST NOTIFICATION */
    .portal-toast {
      position: fixed;
      bottom: 24px;
      right: 24px;
      background: var(--brand-dark);
      color: #FFFFFF;
      padding: 12px 20px;
      border-radius: var(--radius-pill);
      font-size: 13px;
      font-weight: 700;
      box-shadow: 0 10px 30px rgba(15, 23, 42, 0.25);
      z-index: 10000;
      display: none;
      align-items: center;
      gap: 8px;
      animation: toastIn 0.25s ease;
    }
    @keyframes toastIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
  </style>
</head>
<body>

  <!-- THE FLOATING LUXURY APP SHELL -->
  <div class="crextio-app-shell">

    <!-- ========================================================================
         TOP FLOATING NAVIGATION
         ======================================================================== -->
    <header class="crextio-topbar">
      <!-- Left: Logo & Portal Identity -->
      <a href="/portal" class="brand-group" title="Zalo Agent Portal">
        <div class="brand-logo-circle">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="28" height="28" fill="none">
            <g transform="translate(24, 24)">
              <g transform="rotate(0)">
                <path d="M0 -4 C7 -18 19 -17 19 -8 C19 1 9 7 0 4 Z" fill="#2563EB"/>
              </g>
              <g transform="rotate(120)">
                <path d="M0 -4 C7 -18 19 -17 19 -8 C19 1 9 7 0 4 Z" fill="#1D4ED8"/>
              </g>
              <g transform="rotate(240)">
                <path d="M0 -4 C7 -18 19 -17 19 -8 C19 1 9 7 0 4 Z" fill="#10B981"/>
              </g>
              <circle cx="0" cy="0" r="3.5" fill="#059669"/>
            </g>
          </svg>
        </div>
        <div>
          <span class="brand-name">Zalo Agent</span>
          <span class="brand-sub">PORTAL</span>
        </div>
      </a>

      <!-- Center: Nav Pills (Single Line, Never Wraps) -->
      <nav class="nav-pill-group" id="topNavPills">
        <button class="nav-pill" data-tab="projects" onclick="switchTab('projects')">
          <span>📁</span><span>Dự Án</span>
        </button>
        <button class="nav-pill active" data-tab="kanban" onclick="switchTab('kanban')">
          <span>📌</span><span>Bảng Tiến Độ</span>
        </button>
        <button class="nav-pill" data-tab="tasks" onclick="switchTab('tasks')">
          <span>📋</span><span>Danh Sách</span>
        </button>
        <button class="nav-pill" data-tab="budget" onclick="switchTab('budget')">
          <span>💰</span><span>Chi Phí</span>
        </button>
        <button class="nav-pill" data-tab="zalo" onclick="switchTab('zalo')">
          <span>🤖</span><span>Zalo Bot</span>
        </button>
        <button class="nav-pill" data-tab="gcal" onclick="switchTab('gcal')">
          <span>📅</span><span>Google Lịch</span>
        </button>
        <button class="nav-pill admin-only" data-tab="members" onclick="switchTab('members')">
          <span>👥</span><span>Phân Quyền</span>
        </button>
      </nav>

      <!-- Right: Tools, Project Selector & Account -->
      <div class="topbar-tools">
        <!-- Project Selector Dropdown Button -->
        <button class="topbar-project-pill" id="topbarProjectBtn" onclick="toggleProjectPopover(event)" title="Nhấn để đổi dự án">
          <span>📁</span>
          <span id="topbarProjectName">Đang tải...</span>
          <span class="badge-percent-pill" id="topbarProjectProgressBadge">0%</span>
          <span style="font-size:10px; color:var(--text-light);">▼</span>
        </button>

        <!-- Quick Add Task -->
        <button class="crextio-btn primary admin-only" onclick="openAddTaskModal()">+ Thêm Việc</button>

        <a href="/" class="tool-circle-btn" title="Mở Dashboard Zalo Core">⚙️</a>
        <a href="/upload" class="tool-circle-btn" title="Kho Lưu Trữ Tài Liệu">📁</a>

        <div class="user-pill-btn" onclick="openSwitchAccountModal()" title="Nhấn để đổi tài khoản">
          <div class="user-avatar-circle" id="currentUserAvatarLetter">Q</div>
          <span style="font-size:12.5px; font-weight:700;" id="currentUserName">Quản Trị Viên</span>
        </div>
      </div>
    </header>

    <!-- POPOVER DROPDOWN CHỌN DỰ ÁN -->
    <div class="project-popover" id="projectPopover" onclick="event.stopPropagation()">
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <span style="font-size:13px; font-weight:800; color:var(--text-main);">CHỌN DỰ ÁN</span>
        <button class="crextio-btn primary admin-only" style="padding:4px 10px; font-size:11px;" onclick="openAddProjectModal()">+ Mới</button>
      </div>
      <input type="text" class="form-control" placeholder="Tìm kiếm dự án..." oninput="filterPopoverProjects(this.value)">
      <div style="display:flex; gap:6px;">
        <button class="action-pill-btn blue active popover-filter-btn" onclick="setPopoverFilter('all', this)">Tất cả (<span id="popoverAllCount">0</span>)</button>
        <button class="action-pill-btn popover-filter-btn" onclick="setPopoverFilter('active', this)">Đang chạy</button>
        <button class="action-pill-btn popover-filter-btn" onclick="setPopoverFilter('completed', this)">Hoàn thành</button>
      </div>
      <div id="popoverProjectList" style="max-height:240px; overflow-y:auto; display:flex; flex-direction:column; gap:8px;">
        <!-- Populated via JS -->
      </div>
    </div>

    <!-- ========================================================================
         HORIZONTAL PROJECT OVERVIEW BANNER (COMPACT TOP & RIGHT ASSIGNEES)
         ======================================================================== -->
    <div class="project-banner-horizontal" id="projectBannerHorizontal">
      <div class="banner-top-row">
        <!-- Left: Project Identity & Status -->
        <div class="banner-identity">
          <span class="project-code-badge" id="sideProjectCodeBadge">#PRJ-01</span>
          <h2 class="project-title-heading" id="sideCurrentProjectName">Đang tải dự án...</h2>
          <span class="status-pill-active" id="drawerProjectStatus">🟢 Đang chạy</span>
          <p class="project-desc-text" id="sideProjectDesc">Dự án triển khai trợ lý AI Zalo và cổng quản lý công việc</p>
        </div>

        <!-- Right: Small Compact Assignees Box -->
        <div class="banner-assignees-box">
          <div class="assignees-box-label">NHÂN SỰ:</div>
          <div class="assignees-avatars-row" id="bannerAssigneesList">
            <!-- Populated via JS with compact chips -->
          </div>
        </div>
      </div>

      <!-- Middle: Metrics Row & Quick Actions -->
      <div class="banner-metrics-row">
        <div class="metric-col">
          <span class="metric-lbl">Tiến Độ Dự Án</span>
          <span class="metric-val" id="bannerProgressVal" style="color:var(--brand-primary);">0%</span>
        </div>
        <div class="metric-divider"></div>
        <div class="metric-col">
          <span class="metric-lbl">Ngân Sách Dự Kiến</span>
          <span class="metric-val" id="drawerProjectBudget">0 đ</span>
        </div>
        <div class="metric-divider"></div>
        <div class="metric-col">
          <span class="metric-lbl">Đã Giải Ngân</span>
          <span class="metric-val" id="drawerProjectSpent" style="color:var(--brand-success);">0 đ</span>
        </div>
        <div class="metric-divider"></div>
        <div class="metric-col">
          <span class="metric-lbl">Còn Lại</span>
          <span class="metric-val" id="drawerProjectRemaining">0 đ</span>
        </div>
        <div class="metric-divider"></div>
        <div class="metric-col">
          <span class="metric-lbl">Khối Lượng</span>
          <span class="metric-val" id="bannerTasksCountText">0 / 0 hoàn thành</span>
        </div>

        <!-- Quick actions right -->
        <div class="banner-quick-actions">
          <button class="crextio-btn primary" style="padding: 6px 14px; font-size: 12px;" onclick="triggerManualSyncReminders()">⚡ Quét Nhắc Zalo</button>
          <button class="crextio-btn secondary" style="padding: 6px 14px; font-size: 12px;" onclick="copyIcalFeedUrl()">📋 Link iCal Feed</button>
          <a href="/upload" class="crextio-btn secondary" style="padding: 6px 14px; font-size: 12px;">📁 Tài Liệu</a>
        </div>
      </div>

      <!-- Segmented Overall Progress Bar (Green = Done, Blue = In Progress, Gray = Remaining) -->
      <div class="banner-progress-bar-wrapper">
        <div class="crextio-seg-bar">
          <div class="seg-green" id="centerSegGreen" style="width: 0%;"></div>
          <div class="seg-blue" id="centerSegBlue" style="width: 0%;"></div>
          <div class="seg-gray"></div>
        </div>
      </div>
    </div>

    <!-- ========================================================================
         MAIN CONTENT TABS (ZERO HORIZONTAL WINDOW OVERFLOW)
         ======================================================================== -->
    <main>
      
      <!-- TAB 1: DANH MỤC DỰ ÁN (BẤM VÀO SẼ CHUYỂN NGAY SANG BẢNG TIẾN ĐỘ CỦA DỰ ÁN ĐÓ) -->
      <section id="tab-projects" class="tab-panel">
        <div class="crextio-table-card">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; flex-wrap:wrap; gap:12px;">
            <div>
              <h3 style="font-size:19px; font-weight:800; color:var(--text-main);">📁 Danh Mục Tất Cả Dự Án</h3>
              <p style="font-size:13px; color:var(--text-muted);">Bấm vào bất kỳ dự án nào để mở ngay bảng tiến độ và công việc chi tiết</p>
            </div>
            <button class="crextio-btn primary admin-only" onclick="openAddProjectModal()">+ Tạo Dự Án Mới</button>
          </div>
          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(320px, 1fr)); gap:18px;" id="allProjectsGrid">
            <!-- Rendered via JS -->
          </div>
        </div>
      </section>

      <!-- TAB 2: KANBAN BOARD (CÁC BƯỚC NẰM NGANG, KÉO SANG PHẢI) -->
      <section id="tab-kanban" class="tab-panel active">
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
            <button class="crextio-btn secondary admin-only" onclick="openAddStageModal()">+ Thêm Bước / Giai Đoạn</button>
            <button class="crextio-btn primary admin-only" onclick="openAddTaskModal()">+ Thêm Công Việc</button>
          </div>
        </div>

        <!-- Horizontal Scrollable Kanban Container -->
        <div class="kanban-board-scrollable" id="kanbanBoardContainer">
          <!-- Kanban columns rendered horizontally side-by-side via JS -->
        </div>
      </section>

      <!-- TAB 3: TASKS TABLE (DANH SÁCH CHI TIẾT) -->
      <section id="tab-tasks" class="tab-panel">
        <div class="crextio-table-card">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; flex-wrap:wrap; gap:12px;">
            <h3 style="font-size:18px; font-weight:800; color:var(--text-main);">📋 Danh Sách Chi Tiết Công Việc & Tiến Độ</h3>
            <button class="crextio-btn primary admin-only" onclick="openAddTaskModal()">+ Thêm Công Việc</button>
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
                <th>Thao Tác</th>
              </tr>
            </thead>
            <tbody id="tasksTableBody">
              <!-- Rendered via JS -->
            </tbody>
          </table>
        </div>
      </section>

      <!-- TAB 4: BUDGET & EXPENSES -->
      <section id="tab-budget" class="tab-panel">
        <div class="crextio-table-card">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; flex-wrap:wrap; gap:12px;">
            <div>
              <h3 style="font-size:18px; font-weight:800; color:var(--text-main);">💰 Sổ Thu Chi & Ngân Sách Dự Án</h3>
              <p style="font-size:13px; color:var(--text-muted);" id="budgetSubHeading">Theo dõi chi phí theo từng đầu việc</p>
            </div>
            <button class="crextio-btn primary admin-only" onclick="openAddExpenseModal()">+ Ghi Nhận Chi Phí</button>
          </div>
          <table class="crextio-table">
            <thead>
              <tr>
                <th>Ngày</th>
                <th>Khoản Chi / Nội Dung</th>
                <th>Công Việc Liên Quan</th>
                <th>Số Tiền</th>
                <th>Người Chi</th>
              </tr>
            </thead>
            <tbody id="expensesTableBody">
              <!-- Rendered via JS -->
            </tbody>
          </table>
        </div>
      </section>

      <!-- TAB 5: ZALO BOT AUTOMATION -->
      <section id="tab-zalo" class="tab-panel">
        <div class="crextio-table-card">
          <h3 style="font-size:18px; font-weight:800; margin-bottom:8px; color:var(--text-main);">🤖 Tự Động Hóa Nhắc Việc Qua Zalo</h3>
          <p style="font-size:13px; color:var(--text-muted); margin-bottom:20px;">Trợ lý AI tự động quét deadline và gửi thông báo nhắc việc đến Zalo cá nhân</p>
          
          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:18px;">
            <div style="background:var(--bg-subtle); padding:20px; border-radius:var(--radius-lg); border:1px solid var(--border-subtle);">
              <h4 style="font-size:15px; font-weight:800; margin-bottom:10px; color:var(--text-main);">⚡ Gửi Thử Tin Nhắn Zalo</h4>
              <p style="font-size:12.5px; color:var(--text-muted); margin-bottom:14px;">Gửi tin nhắn test từ Bot Zalo đến số điện thoại bất kỳ</p>
              <div class="form-group">
                <label>Số điện thoại nhận</label>
                <input type="text" id="zaloTestPhone" class="form-control" placeholder="0988...">
              </div>
              <div class="form-group">
                <label>Nội dung tin nhắn</label>
                <input type="text" id="zaloTestMsg" class="form-control" value="[Zalo Agent] Xin chào! Đây là thông báo tự động từ hệ thống quản lý dự án.">
              </div>
              <button class="crextio-btn primary admin-only" onclick="sendTestZaloMsg()">Gửi Thử Nghiệm Ngay</button>
            </div>

            <div style="background:var(--bg-subtle); padding:20px; border-radius:var(--radius-lg); border:1px solid var(--border-subtle);">
              <h4 style="font-size:15px; font-weight:800; margin-bottom:10px; color:var(--text-main);">🔔 Quét Nhắc Việc Định Kỳ</h4>
              <p style="font-size:12.5px; color:var(--text-muted); margin-bottom:14px;">Worker tự động chạy nền mỗi 60 giây quét task sắp đến hạn (trong vòng 24h) để nhắc Zalo</p>
              <div style="display:flex; flex-direction:column; gap:8px;">
                <div style="display:flex; justify-content:space-between; font-size:13px;">
                  <span>Trạng thái Worker:</span>
                  <span style="font-weight:700; color:var(--brand-success);">🟢 Đang chạy</span>
                </div>
                <div style="display:flex; justify-content:space-between; font-size:13px;">
                  <span>Tài khoản Bot:</span>
                  <span style="font-weight:700; color:var(--brand-primary);">Bot Trợ Lý Jay</span>
                </div>
              </div>
              <button class="crextio-btn success admin-only" style="margin-top:20px;" onclick="triggerManualSyncReminders()">⚡ Quét Thủ Công Toàn Bộ Hạn Chót</button>
            </div>
          </div>
        </div>
      </section>

      <!-- TAB 6: GOOGLE CALENDAR -->
      <section id="tab-gcal" class="tab-panel">
        <div class="crextio-table-card">
          <h3 style="font-size:18px; font-weight:800; margin-bottom:8px; color:var(--text-main);">📅 Đồng Bộ Lịch Google Calendar Tự Động</h3>
          <p style="font-size:13px; color:var(--text-muted); margin-bottom:20px;">Đồng bộ toàn bộ deadline và lịch công việc vào ứng dụng Google Calendar, Apple Calendar hoặc Outlook</p>

          <div style="background:var(--brand-primary-light); border:1px solid var(--brand-primary-border); border-radius:var(--radius-lg); padding:20px; margin-bottom:20px;">
            <h4 style="font-size:15px; font-weight:800; color:var(--brand-primary); margin-bottom:8px;">🔗 Đường Dẫn iCal Feed Trực Tiếp</h4>
            <p style="font-size:13px; color:var(--brand-primary); margin-bottom:14px;">Dán đường dẫn này vào Google Calendar (Mục "Thêm lịch khác" -> "Từ URL") để tự động cập nhật lịch:</p>
            <div style="display:flex; gap:10px; align-items:center;">
              <input type="text" id="gcalFeedUrlInput" class="form-control" readonly style="background:#FFFFFF; font-family:'JetBrains Mono', monospace; font-size:12.5px;">
              <button class="crextio-btn primary" onclick="copyIcalFeedUrl()">Sao Chép</button>
              <a id="downloadIcsBtn" href="/portal/api/calendar.ics" class="crextio-btn secondary">Tải Tệp .ics</a>
            </div>
          </div>
        </div>
      </section>

      <!-- TAB 7: MEMBERS & ROLES -->
      <section id="tab-members" class="tab-panel">
        <div class="crextio-table-card">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; flex-wrap:wrap; gap:12px;">
            <div>
              <h3 style="font-size:18px; font-weight:800; color:var(--text-main);">👥 Phân Quyền Thành Viên & Tài Khoản</h3>
              <p style="font-size:13px; color:var(--text-muted);">Admin có toàn quyền quản trị, Manager quản lý công việc, Member phụ trách task</p>
            </div>
            <button class="crextio-btn primary admin-only" onclick="openAddMemberModal()">+ Thêm Thành Viên</button>
          </div>
          <table class="crextio-table">
            <thead>
              <tr>
                <th>Thành Viên</th>
                <th>Số Điện Thoại</th>
                <th>Email</th>
                <th>Vai Trò</th>
                <th>Trạng Thái Zalo</th>
                <th>Thao Tác</th>
              </tr>
            </thead>
            <tbody id="membersTableBody">
              <!-- Rendered via JS -->
            </tbody>
          </table>
        </div>
      </section>

    </main>

  </div>

  <!-- TOAST NOTIFICATION -->
  <div class="portal-toast" id="portalToast">Thông báo</div>

  <!-- ========================================================================
       MODALS
       ======================================================================== -->

  <!-- MODAL: ADD / EDIT TASK -->
  <div class="crextio-modal-overlay" id="taskModal">
    <div class="crextio-modal">
      <h3 style="font-size:18px; font-weight:800; margin-bottom:16px; color:var(--text-main);" id="taskModalTitle">Thêm Công Việc Mới</h3>
      <input type="hidden" id="editTaskId">
      <div class="form-group">
        <label>Tên công việc *</label>
        <input type="text" id="taskTitleInput" class="form-control" placeholder="VD: Thiết kế giao diện...">
      </div>
      <div class="form-group">
        <label>Mô tả chi tiết</label>
        <textarea id="taskDescInput" class="form-control" rows="2" placeholder="Chi tiết yêu cầu công việc..."></textarea>
      </div>
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
        <div class="form-group">
          <label>Giai đoạn / Bước *</label>
          <select id="taskStageSelect" class="form-control"></select>
        </div>
        <div class="form-group">
          <label>Người phụ trách</label>
          <select id="taskAssigneeSelect" class="form-control"></select>
        </div>
      </div>
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
        <div class="form-group">
          <label>Hạn chót (Deadline)</label>
          <input type="datetime-local" id="taskDeadlineInput" class="form-control">
        </div>
        <div class="form-group">
          <label>Tiến độ hoàn thành (%)</label>
          <input type="number" id="taskProgressInput" class="form-control" min="0" max="100" value="0">
        </div>
      </div>
      <div style="display:flex; justify-content:flex-end; gap:10px; margin-top:20px;">
        <button class="crextio-btn secondary" onclick="closeModal('taskModal')">Hủy</button>
        <button class="crextio-btn primary" onclick="saveTaskModal()">Lưu Công Việc</button>
      </div>
    </div>
  </div>

  <!-- MODAL: ADD PROJECT -->
  <div class="crextio-modal-overlay" id="projectModal">
    <div class="crextio-modal">
      <h3 style="font-size:18px; font-weight:800; margin-bottom:16px; color:var(--text-main);">Tạo Dự Án Mới</h3>
      <div class="form-group">
        <label>Tên dự án *</label>
        <input type="text" id="newProjectName" class="form-control" placeholder="VD: Dự Án Triển Khai ERP 2026">
      </div>
      <div class="form-group">
        <label>Mô tả</label>
        <textarea id="newProjectDesc" class="form-control" rows="2" placeholder="Mục tiêu và phạm vi dự án..."></textarea>
      </div>
      <div class="form-group">
        <label>Ngân sách dự kiến (VNĐ)</label>
        <input type="number" id="newProjectBudget" class="form-control" placeholder="50000000">
      </div>
      <div style="display:flex; justify-content:flex-end; gap:10px; margin-top:20px;">
        <button class="crextio-btn secondary" onclick="closeModal('projectModal')">Hủy</button>
        <button class="crextio-btn primary" onclick="saveNewProject()">Tạo Dự Án</button>
      </div>
    </div>
  </div>

  <!-- MODAL: ADD STAGE -->
  <div class="crextio-modal-overlay" id="stageModal">
    <div class="crextio-modal">
      <h3 style="font-size:18px; font-weight:800; margin-bottom:16px; color:var(--text-main);">Thêm Giai Đoạn / Bước Mới</h3>
      <div class="form-group">
        <label>Tên giai đoạn *</label>
        <input type="text" id="newStageTitle" class="form-control" placeholder="VD: Bước 5: Bàn Giao & Vận Hành">
      </div>
      <div class="form-group">
        <label>Mô tả giai đoạn</label>
        <input type="text" id="newStageDesc" class="form-control" placeholder="Mô tả tóm tắt...">
      </div>
      <div style="display:flex; justify-content:flex-end; gap:10px; margin-top:20px;">
        <button class="crextio-btn secondary" onclick="closeModal('stageModal')">Hủy</button>
        <button class="crextio-btn primary" onclick="saveNewStage()">Thêm Giai Đoạn</button>
      </div>
    </div>
  </div>

  <!-- MODAL: ADD EXPENSE -->
  <div class="crextio-modal-overlay" id="expenseModal">
    <div class="crextio-modal">
      <h3 style="font-size:18px; font-weight:800; margin-bottom:16px; color:var(--text-main);">Ghi Nhận Chi Phí Dự Án</h3>
      <div class="form-group">
        <label>Nội dung chi *</label>
        <input type="text" id="expenseDesc" class="form-control" placeholder="VD: Thuê server, thiết kế logo...">
      </div>
      <div class="form-group">
        <label>Số tiền (VNĐ) *</label>
        <input type="number" id="expenseAmount" class="form-control" placeholder="1500000">
      </div>
      <div class="form-group">
        <label>Gắn vào công việc</label>
        <select id="expenseTaskSelect" class="form-control"></select>
      </div>
      <div style="display:flex; justify-content:flex-end; gap:10px; margin-top:20px;">
        <button class="crextio-btn secondary" onclick="closeModal('expenseModal')">Hủy</button>
        <button class="crextio-btn primary" onclick="saveExpense()">Lưu Khoản Chi</button>
      </div>
    </div>
  </div>

  <!-- MODAL: ADD MEMBER -->
  <div class="crextio-modal-overlay" id="memberModal">
    <div class="crextio-modal">
      <h3 style="font-size:18px; font-weight:800; margin-bottom:16px; color:var(--text-main);">Thêm Thành Viên & Phân Quyền</h3>
      <div class="form-group">
        <label>Họ và tên *</label>
        <input type="text" id="newMemberName" class="form-control" placeholder="VD: Nguyễn Văn Tuấn">
      </div>
      <div class="form-group">
        <label>Số điện thoại *</label>
        <input type="text" id="newMemberPhone" class="form-control" placeholder="0901234567">
      </div>
      <div class="form-group">
        <label>Email (Đồng bộ Lịch Google)</label>
        <input type="email" id="newMemberEmail" class="form-control" placeholder="tuan.nguyen@gmail.com">
      </div>
      <div class="form-group">
        <label>Vai trò hệ thống</label>
        <select id="newMemberRole" class="form-control">
          <option value="member">Thành viên (Member - Nhận việc & cập nhật tiến độ)</option>
          <option value="manager">Quản lý (Manager - Giao việc & xem ngân sách)</option>
          <option value="admin">Quản trị viên (Admin - Toàn quyền cấu hình)</option>
          <option value="viewer">Người xem (Viewer - Chỉ xem, không sửa)</option>
        </select>
      </div>
      <div style="display:flex; justify-content:flex-end; gap:10px; margin-top:20px;">
        <button class="crextio-btn secondary" onclick="closeModal('memberModal')">Hủy</button>
        <button class="crextio-btn primary" onclick="saveNewMember()">Thêm Thành Viên</button>
      </div>
    </div>
  </div>

  <!-- MODAL: SWITCH ACCOUNT -->
  <div class="crextio-modal-overlay" id="switchAccountModal">
    <div class="crextio-modal">
      <h3 style="font-size:18px; font-weight:800; margin-bottom:16px; color:var(--text-main);">Đổi Tài Khoản / Phân Quyền</h3>
      <p style="font-size:13px; color:var(--text-muted); margin-bottom:14px;">Chọn tài khoản để trải nghiệm góc nhìn phân quyền tương ứng:</p>
      <div id="switchAccountList" style="display:flex; flex-direction:column; gap:8px;"></div>
      <div style="display:flex; justify-content:flex-end; margin-top:20px;">
        <button class="crextio-btn secondary" onclick="closeModal('switchAccountModal')">Đóng</button>
      </div>
    </div>
  </div>

  <!-- ========================================================================
       CLIENT APPLICATION SCRIPT
       ======================================================================== -->
  <script>
    let globalData = {};
    let popoverFilter = 'all';

    function getQueryParam(key) {
      const p = new URLSearchParams(window.location.search);
      return p.get(key);
    }

    function showToast(msg) {
      const t = document.getElementById('portalToast');
      if (!t) return;
      t.textContent = msg;
      t.style.display = 'flex';
      setTimeout(() => { t.style.display = 'none'; }, 2800);
    }

    function switchTab(tabId) {
      document.querySelectorAll('.nav-pill').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tabId);
      });
      document.querySelectorAll('.tab-panel').forEach(panel => {
        panel.classList.toggle('active', panel.id === ('tab-' + tabId));
      });
      if (tabId === 'kanban') renderKanban();
      if (tabId === 'projects') renderAllProjectsGrid();
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

    /* CHỌN DỰ ÁN: LUÔN TẢI DỮ LIỆU VÀ CHUYỂN NGAY SANG BẢNG TIẾN ĐỘ CỦA DỰ ÁN ĐÓ */
    function selectProject(pid) {
      closeProjectPopover();
      const url = new URL(window.location.href);
      url.searchParams.set('projectId', pid);
      window.history.pushState({}, '', url);

      // Chuyển tab sang bảng tiến độ
      switchTab('kanban');

      // Nạp dữ liệu dự án mới
      loadPortalData(pid);
      showToast('Đã chuyển sang dự án #' + pid);
    }
    function selectProjectFromPopover(pid) {
      selectProject(pid);
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
        document.getElementById('drawerProjectBudget').textContent = formatVnd(p.budget || 0);
        document.getElementById('drawerProjectSpent').textContent = formatVnd(p.expenses_sum || 0);
        document.getElementById('drawerProjectRemaining').textContent = formatVnd(Math.max(0, (p.budget || 0) - (p.expenses_sum || 0)));
        document.getElementById('bannerTasksCountText').textContent = (p.completed_tasks || 0) + ' / ' + (p.tasks_count || 0) + ' hoàn thành';

        // Segmented Bar (Green done, Blue in progress)
        const pctDone = p.overall_progress || 0;
        const pctInProgress = Math.min(100 - pctDone, Math.round(((p.tasks_count - p.completed_tasks) / Math.max(1, p.tasks_count)) * 50));
        document.getElementById('centerSegGreen').style.width = pctDone + '%';
        document.getElementById('centerSegBlue').style.width = pctInProgress + '%';
      }

      // Permissions
      const isAdmin = !!u.isAdmin;
      document.querySelectorAll('.admin-only').forEach(el => {
        el.style.display = isAdmin ? '' : 'none';
      });

      // Google Calendar link
      const icsUrl = window.location.origin + '/portal/api/calendar.ics';
      const gcalInput = document.getElementById('gcalFeedUrlInput');
      if (gcalInput) gcalInput.value = icsUrl;

      // Populate elements
      renderAssigneesList();
      renderMemberFilterDropdown();
      renderKanban();
      renderAllProjectsGrid();
      renderPopoverProjects();
      renderTasksTable();
      renderExpensesTable();
      renderMembersTable();
    }

    function renderAssigneesList() {
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
        renderAssigneesList();
      }
    }

    function renderMemberFilterDropdown() {
      const sel = document.getElementById('memberFilterSelect');
      if (!sel) return;
      const current = sel.value;
      const members = globalData.members || [];
      sel.innerHTML = '<option value="">Tất cả nhân sự (' + members.length + ')</option>' +
        members.map(m => '<option value="' + m.phone + '"' + (m.phone === current ? ' selected' : '') + '>' + escapeHtml(m.name) + '</option>').join('');
    }

    /* KANBAN BOARD RENDER (HORIZONTAL COLUMNS) */
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
                  '<div class="seg-green" style="width:' + (t.progress || 0) + '%;"></div>' +
                  '<div class="seg-gray"></div>' +
                '</div>' +
                '<div class="task-card-footer">' +
                  (t.gcal_link ? '<a href="' + t.gcal_link + '" target="_blank" class="action-pill-btn blue" title="Thêm vào Google Calendar">📅 Lịch</a>' : '') +
                  (!isViewer ? '<button class="action-pill-btn green" onclick="sendZaloRemind(' + t.id + ')" title="Gửi nhắc Zalo">🔔 Nhắc</button>' : '') +
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
      draggedTaskId = e.target.closest('.task-card-crextio').dataset.taskId;
      e.target.classList.add('dragging');
    }
    function dragOver(e) {
      e.preventDefault();
      const zone = e.target.closest('.kanban-dropzone-crextio');
      if (zone) zone.classList.add('drag-over');
    }
    function dragLeave(e) {
      const zone = e.target.closest('.kanban-dropzone-crextio');
      if (zone) zone.classList.remove('drag-over');
    }
    async function drop(e) {
      e.preventDefault();
      const zone = e.target.closest('.kanban-dropzone-crextio');
      if (!zone || !draggedTaskId) return;
      zone.classList.remove('drag-over');
      const newStageId = zone.dataset.stageId;

      try {
        const res = await fetch('/portal/api/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: Number(draggedTaskId), stage_id: Number(newStageId) })
        });
        if (res.ok) {
          showToast('Đã chuyển giai đoạn công việc thành công');
          loadPortalData();
        }
      } catch (err) {
        console.error('Lỗi di chuyển task:', err);
      }
    }

    /* ALL PROJECTS GRID (TAB 1) - BẤM VÀO LÀ CHUYỂN SANG BẢNG TIẾN ĐỘ NGAY */
    function renderAllProjectsGrid() {
      const grid = document.getElementById('allProjectsGrid');
      if (!grid) return;
      const projects = globalData.projects || [];
      const currentPid = globalData.activeProject?.id;

      grid.innerHTML = projects.map(p => {
        const isCurrent = p.id === currentPid;
        return '<div class="project-card-interactive ' + (isCurrent ? 'active' : '') + '" onclick="selectProject(' + p.id + ')">' +
          '<div style="display:flex; justify-content:space-between; align-items:center;">' +
            '<span class="project-code-badge">#PRJ-' + String(p.id).padStart(2, '0') + '</span>' +
            '<span class="badge-percent-pill" style="font-size:12px;">' + (p.overall_progress || 0) + '%</span>' +
          '</div>' +
          '<h4 style="font-size:17px; font-weight:800; color:var(--text-main); margin-top:2px;">' + escapeHtml(p.name) + '</h4>' +
          '<p style="font-size:12.5px; color:var(--text-muted); line-height:1.4;">' + escapeHtml(p.description || 'Chưa có mô tả') + '</p>' +
          '<div class="crextio-seg-bar" style="height:7px;">' +
            '<div class="seg-green" style="width:' + (p.overall_progress || 0) + '%;"></div>' +
            '<div class="seg-gray"></div>' +
          '</div>' +
          '<div style="display:flex; justify-content:space-between; font-size:12px; font-weight:700; color:var(--text-muted);">' +
            '<span>' + (p.tasks_count || 0) + ' công việc</span>' +
            '<span style="color:var(--brand-primary); font-family:JetBrains Mono;">' + formatVnd(p.budget || 0) + '</span>' +
          '</div>' +
          '<button class="crextio-btn primary" style="width:100%; justify-content:center; margin-top:6px; font-size:13px;" onclick="event.stopPropagation(); selectProject(' + p.id + ')">📊 Mở Bảng Tiến Độ Dự Án →</button>' +
        '</div>';
      }).join('');
    }

    /* POPOVER PROJECT LIST */
    function renderPopoverProjects(query = '') {
      const list = document.getElementById('popoverProjectList');
      if (!list) return;
      const q = (query || '').toLowerCase().trim();
      let projects = globalData.projects || [];
      const countEl = document.getElementById('popoverAllCount');
      if (countEl) countEl.textContent = projects.length;

      if (popoverFilter === 'active') projects = projects.filter(p => p.status === 'active');
      if (popoverFilter === 'completed') projects = projects.filter(p => p.status === 'completed');
      if (q) projects = projects.filter(p => p.name.toLowerCase().includes(q) || (p.description && p.description.toLowerCase().includes(q)));

      const currentPid = globalData.activeProject?.id;
      list.innerHTML = projects.map(p => {
        const isCurrent = p.id === currentPid;
        return '<div class="popover-project-item ' + (isCurrent ? 'active' : '') + '" onclick="selectProject(' + p.id + ')">' +
          '<div>' +
            '<div style="font-size:13.5px; font-weight:700; color:var(--text-main);">' + escapeHtml(p.name) + '</div>' +
            '<div style="font-size:11.5px; color:var(--text-muted);">' + (p.tasks_count || 0) + ' việc • ' + formatVnd(p.budget || 0) + '</div>' +
          '</div>' +
          '<span class="badge-percent-pill">' + (p.overall_progress || 0) + '%</span>' +
        '</div>';
      }).join('');
    }

    /* TASKS TABLE RENDER */
    function renderTasksTable() {
      const tbody = document.getElementById('tasksTableBody');
      if (!tbody) return;
      const tasks = globalData.tasks || [];
      const isViewer = globalData.currentUser?.isViewer;

      tbody.innerHTML = tasks.map(t => {
        return '<tr>' +
          '<td style="font-weight:700;">' + escapeHtml(t.title) + '</td>' +
          '<td>' + escapeHtml(t.stage_title || '') + '</td>' +
          '<td>' + escapeHtml(t.assigned_name || 'Chưa gán') + '</td>' +
          '<td>' + (t.deadline ? t.deadline.slice(0, 16).replace('T', ' ') : '—') + '</td>' +
          '<td><span class="badge-percent-pill">' + (t.progress || 0) + '%</span></td>' +
          '<td style="font-family:JetBrains Mono;">' + formatVnd(t.expenses_sum || 0) + '</td>' +
          '<td>' +
            (!isViewer ? '<button class="action-pill-btn" onclick="openEditTaskModal(' + t.id + ')">Sửa</button>' : '—') +
          '</td>' +
        '</tr>';
      }).join('');
    }

    /* EXPENSES TABLE RENDER */
    function renderExpensesTable() {
      const tbody = document.getElementById('expensesTableBody');
      if (!tbody) return;
      const expenses = globalData.expenses || [];
      tbody.innerHTML = expenses.map(e => {
        return '<tr>' +
          '<td>' + (e.created_at ? e.created_at.slice(0, 10) : '—') + '</td>' +
          '<td style="font-weight:700;">' + escapeHtml(e.description) + '</td>' +
          '<td>' + escapeHtml(e.task_title || 'Chi phí chung') + '</td>' +
          '<td style="font-family:JetBrains Mono; font-weight:700; color:var(--brand-primary);">' + formatVnd(e.amount) + '</td>' +
          '<td>' + escapeHtml(e.created_by_name || 'Quản trị viên') + '</td>' +
        '</tr>';
      }).join('');
    }

    /* MEMBERS TABLE RENDER */
    function renderMembersTable() {
      const tbody = document.getElementById('membersTableBody');
      if (!tbody) return;
      const members = globalData.members || [];
      const isViewer = globalData.currentUser?.isViewer;

      tbody.innerHTML = members.map(m => {
        return '<tr>' +
          '<td style="font-weight:700;">' + escapeHtml(m.name) + '</td>' +
          '<td>' + escapeHtml(m.phone) + '</td>' +
          '<td>' + escapeHtml(m.email || '—') + '</td>' +
          '<td><span class="action-pill-btn blue">' + escapeHtml(m.role) + '</span></td>' +
          '<td><span style="color:var(--brand-success); font-weight:700;">' + (m.thread_id ? '🟢 Đã kết nối' : '⚪ Chưa kết nối') + '</span></td>' +
          '<td>' +
            (!isViewer && m.phone !== 'admin' ? '<button class="action-pill-btn" data-phone="' + m.phone + '" onclick="changeMemberRole(this.dataset.phone)">Đổi Quyền</button>' : '—') +
          '</td>' +
        '</tr>';
      }).join('');
    }

    /* ACTIONS & MODAL CONTROLS */
    function closeModal(id) {
      const m = document.getElementById(id);
      if (m) m.style.display = 'none';
    }

    function openAddTaskModal() {
      document.getElementById('taskModalTitle').textContent = 'Thêm Công Việc Mới';
      document.getElementById('editTaskId').value = '';
      document.getElementById('taskTitleInput').value = '';
      document.getElementById('taskDescInput').value = '';
      document.getElementById('taskDeadlineInput').value = '';
      document.getElementById('taskProgressInput').value = '0';

      const sSel = document.getElementById('taskStageSelect');
      sSel.innerHTML = (globalData.stages || []).map(s => '<option value="' + s.id + '">' + escapeHtml(s.title) + '</option>').join('');

      const aSel = document.getElementById('taskAssigneeSelect');
      aSel.innerHTML = '<option value="">-- Chưa phân công --</option>' +
        (globalData.members || []).map(m => '<option value="' + m.phone + '">' + escapeHtml(m.name) + '</option>').join('');

      document.getElementById('taskModal').style.display = 'flex';
    }

    function openEditTaskModal(taskId) {
      const t = (globalData.tasks || []).find(x => x.id === taskId);
      if (!t) return;
      document.getElementById('taskModalTitle').textContent = 'Sửa Chi Tiết Công Việc';
      document.getElementById('editTaskId').value = t.id;
      document.getElementById('taskTitleInput').value = t.title || '';
      document.getElementById('taskDescInput').value = t.description || '';
      document.getElementById('taskDeadlineInput').value = t.deadline ? t.deadline.slice(0, 16) : '';
      document.getElementById('taskProgressInput').value = t.progress || 0;

      const sSel = document.getElementById('taskStageSelect');
      sSel.innerHTML = (globalData.stages || []).map(s => '<option value="' + s.id + '"' + (s.id === t.stage_id ? ' selected' : '') + '>' + escapeHtml(s.title) + '</option>').join('');

      const aSel = document.getElementById('taskAssigneeSelect');
      aSel.innerHTML = '<option value="">-- Chưa phân công --</option>' +
        (globalData.members || []).map(m => '<option value="' + m.phone + '"' + (m.phone === t.assigned_phone ? ' selected' : '') + '>' + escapeHtml(m.name) + '</option>').join('');

      document.getElementById('taskModal').style.display = 'flex';
    }

    async function saveTaskModal() {
      const id = document.getElementById('editTaskId').value;
      const title = document.getElementById('taskTitleInput').value.trim();
      if (!title) { alert('Vui lòng nhập tên công việc'); return; }

      const body = {
        title,
        description: document.getElementById('taskDescInput').value.trim(),
        stage_id: Number(document.getElementById('taskStageSelect').value),
        assigned_phone: document.getElementById('taskAssigneeSelect').value || null,
        deadline: document.getElementById('taskDeadlineInput').value || null,
        progress: Number(document.getElementById('taskProgressInput').value) || 0,
        project_id: globalData.activeProject?.id
      };
      if (id) body.id = Number(id);

      try {
        const res = await fetch('/portal/api/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        });
        if (res.ok) {
          closeModal('taskModal');
          showToast('Đã lưu công việc thành công');
          loadPortalData();
        }
      } catch (err) {
        console.error(err);
      }
    }

    function openAddProjectModal() {
      document.getElementById('newProjectName').value = '';
      document.getElementById('newProjectDesc').value = '';
      document.getElementById('newProjectBudget').value = '';
      document.getElementById('projectModal').style.display = 'flex';
    }

    async function saveNewProject() {
      const name = document.getElementById('newProjectName').value.trim();
      if (!name) { alert('Vui lòng nhập tên dự án'); return; }

      try {
        const res = await fetch('/portal/api/projects', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name,
            description: document.getElementById('newProjectDesc').value.trim(),
            budget: Number(document.getElementById('newProjectBudget').value) || 0
          })
        });
        if (res.ok) {
          const data = await res.json();
          closeModal('projectModal');
          showToast('Đã tạo dự án mới!');
          selectProject(data.id);
        }
      } catch (err) {
        console.error(err);
      }
    }

    function openAddStageModal() {
      document.getElementById('newStageTitle').value = '';
      document.getElementById('newStageDesc').value = '';
      document.getElementById('stageModal').style.display = 'flex';
    }

    async function saveNewStage() {
      const title = document.getElementById('newStageTitle').value.trim();
      if (!title) { alert('Vui lòng nhập tên giai đoạn'); return; }

      try {
        const res = await fetch('/portal/api/stages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title,
            description: document.getElementById('newStageDesc').value.trim(),
            project_id: globalData.activeProject?.id
          })
        });
        if (res.ok) {
          closeModal('stageModal');
          showToast('Đã thêm bước mới thành công');
          loadPortalData();
        }
      } catch (err) {
        console.error(err);
      }
    }

    function openAddExpenseModal() {
      document.getElementById('expenseDesc').value = '';
      document.getElementById('expenseAmount').value = '';
      const tSel = document.getElementById('expenseTaskSelect');
      tSel.innerHTML = '<option value="">-- Khoản chi chung dự án --</option>' +
        (globalData.tasks || []).map(t => '<option value="' + t.id + '">' + escapeHtml(t.title) + '</option>').join('');
      document.getElementById('expenseModal').style.display = 'flex';
    }

    async function saveExpense() {
      const description = document.getElementById('expenseDesc').value.trim();
      const amount = Number(document.getElementById('expenseAmount').value) || 0;
      if (!description || amount <= 0) { alert('Vui lòng nhập nội dung và số tiền hợp lệ'); return; }

      try {
        const res = await fetch('/portal/api/expenses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            description,
            amount,
            project_id: globalData.activeProject?.id,
            task_id: document.getElementById('expenseTaskSelect').value ? Number(document.getElementById('expenseTaskSelect').value) : null
          })
        });
        if (res.ok) {
          closeModal('expenseModal');
          showToast('Đã ghi nhận chi phí');
          loadPortalData();
        }
      } catch (err) {
        console.error(err);
      }
    }

    function openAddMemberModal() {
      document.getElementById('newMemberName').value = '';
      document.getElementById('newMemberPhone').value = '';
      document.getElementById('newMemberEmail').value = '';
      document.getElementById('memberModal').style.display = 'flex';
    }

    async function saveNewMember() {
      const name = document.getElementById('newMemberName').value.trim();
      const phone = document.getElementById('newMemberPhone').value.trim();
      if (!name || !phone) { alert('Vui lòng nhập tên và số điện thoại'); return; }

      try {
        const res = await fetch('/portal/api/members', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name,
            phone,
            email: document.getElementById('newMemberEmail').value.trim(),
            role: document.getElementById('newMemberRole').value
          })
        });
        if (res.ok) {
          closeModal('memberModal');
          showToast('Đã thêm thành viên mới');
          loadPortalData();
        }
      } catch (err) {
        console.error(err);
      }
    }

    async function changeMemberRole(phone) {
      const newRole = prompt('Nhập vai trò mới (admin, manager, member, viewer):', 'member');
      if (!newRole) return;
      try {
        const res = await fetch('/portal/api/members/role', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone, role: newRole })
        });
        if (res.ok) {
          showToast('Đã cập nhật vai trò');
          loadPortalData();
        }
      } catch (err) {
        console.error(err);
      }
    }

    async function sendZaloRemind(taskId) {
      try {
        const res = await fetch('/portal/api/remind/' + taskId, { method: 'POST' });
        const data = await res.json();
        if (data.ok) showToast('Đã gửi tin nhắn nhắc Zalo!');
        else alert('Không thể gửi nhắc: ' + (data.error || 'Chưa liên kết tài khoản'));
      } catch (err) {
        alert('Lỗi gửi nhắc Zalo');
      }
    }

    async function triggerManualSyncReminders() {
      try {
        const res = await fetch('/portal/api/sync-reminders', { method: 'POST' });
        const data = await res.json();
        showToast('Đã quét xong: gửi ' + (data.sent || 0) + ' thông báo');
      } catch (err) {
        alert('Lỗi kích hoạt quét');
      }
    }

    async function sendTestZaloMsg() {
      const phone = document.getElementById('zaloTestPhone').value.trim();
      const message = document.getElementById('zaloTestMsg').value.trim();
      if (!phone) { alert('Vui lòng nhập số điện thoại'); return; }
      try {
        const res = await fetch('/portal/api/zalo/send-test', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone, message })
        });
        const data = await res.json();
        if (data.ok) showToast('Đã gửi tin nhắn Zalo thành công!');
        else alert('Lỗi gửi Zalo: ' + (data.error || 'Chưa liên kết tài khoản Zalo'));
      } catch (err) {
        alert('Lỗi gửi tin nhắn');
      }
    }

    function copyIcalFeedUrl() {
      const val = document.getElementById('gcalFeedUrlInput')?.value;
      if (val) {
        navigator.clipboard.writeText(val);
        showToast('Đã sao chép link iCal Feed!');
      }
    }

    function openSwitchAccountModal() {
      const list = document.getElementById('switchAccountList');
      const members = globalData.members || [];
      const currentPhone = globalData.currentUser?.phone || 'admin';

      list.innerHTML = members.map(m => {
        const isCurrent = m.phone === currentPhone;
        return '<div class="popover-project-item ' + (isCurrent ? 'active' : '') + '" data-phone="' + m.phone + '" onclick="switchAccount(this.dataset.phone)">' +
          '<div>' +
            '<div style="font-weight:700;">' + escapeHtml(m.name) + ' (' + m.role + ')</div>' +
            '<div style="font-size:11.5px; color:var(--text-muted);">' + m.phone + '</div>' +
          '</div>' +
          (isCurrent ? '<span style="color:var(--brand-primary); font-weight:800; font-size:12px;">Đang chọn</span>' : '') +
        '</div>';
      }).join('');

      document.getElementById('switchAccountModal').style.display = 'flex';
    }

    function switchAccount(phone) {
      localStorage.setItem('pm_user_phone', phone);
      closeModal('switchAccountModal');
      loadPortalData();
      showToast('Đã chuyển sang tài khoản ' + phone);
    }

    // Formatters
    function formatVnd(val) {
      return (Number(val) || 0).toLocaleString('vi-VN') + ' đ';
    }

    function escapeHtml(str) {
      if (!str) return '';
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    }

    // Close Popover on Outside Click
    window.addEventListener('click', () => {
      closeProjectPopover();
    });

    // Initialize
    window.addEventListener('DOMContentLoaded', () => {
      loadPortalData();
    });
  </script>
</body>
</html>`);
  })

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

      return {
        ...p,
        tasks_count,
        completed_tasks,
        overall_progress,
        stages_count,
        expenses_sum
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

  // API Phục vụ Trang Trình Chiếu Slide Thuyết Trình Khởi Minh
  .get("/pitch", (c) => {
    try {
      const html = fs.readFileSync("/Users/m1/Desktop/Slide_Khoi_Minh/index.html", "utf-8");
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
  });

