# Khởi Minh Portal Redesign, Google Drive AI Sync & Personal Account `@mention` Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign `/portal` with a modern workspace UI, enable personal Zalo account (`zca-js`) passive & historical collection of images/files/links classified by AI into Google Drive project folders, and send real `@mention` group reminders via personal account.

**Architecture:**
1. Extend `zalo-message-parser.ts` and `database.ts` to capture files and URLs alongside images into `pm_collected_assets`.
2. Add `src/drive/` (`google-drive-client.ts`, `zalo-history-collector.ts`, `ai-project-classifier.ts`) using native `fetch` for Drive v3 REST API and `resolveLanguageModel()` for context-aware project classification.
3. Add `src/notification/group-mention-reminder.ts` using `zca-js` `getGroupInfo` + `sendMessage({ msg, mentions })` for real blue `@mention` tags in Zalo groups.
4. Redesign `/portal` UI in `src/server/routes/portal-routes.ts` with a 3-color (`#F8FAFC`, `#2563EB`, `#EFF6FF`) sidebar workspace layout, and update `presentation/index.html` with persuasive client-focused slides & speaker notes.

**Tech Stack:** TypeScript, Hono, `node:sqlite`, `zca-js`, Vercel AI SDK (`generateText`), Google Drive REST API v3, Vanilla HTML/CSS/JS + GSAP.

---

### Task 1: Database Schema & Message Parser for Files/Links
- **Files:** `src/conversation/database.ts`, `src/zalo/zalo-message-parser.ts`, `src/conversation/media-store.ts`, `src/zalo/record-incoming-message.ts`
- **Deliverable:** `pm_collected_assets` & `pm_drive_settings` tables; `ParsedMessage` extracts `files` and `links`; passive group listener persists images, files, and links into `pm_collected_assets`.
- **Verification:** Unit test for `zalo-message-parser` extracting files & links + `pnpm tsc --noEmit`.

### Task 2: Google Drive v3 Client, History Scanner & AI Project Classifier
- **Files:** `src/drive/google-drive-client.ts`, `src/drive/zalo-history-collector.ts`, `src/drive/ai-project-classifier.ts`
- **Deliverable:** Folder hierarchy `Khởi Minh Drive / [Dự án] / [Ảnh | Tài liệu | Link]`, `getGroupChatHistory` scanner, and AI context-window classifier matching `pm_work_tracker_tasks` / `pm_projects`.
- **Verification:** Unit tests for Drive folder/upload payload & AI JSON parser + `pnpm tsc --noEmit`.

### Task 3: Personal Account `@mention` Group Reminders & Portal API Routes
- **Files:** `src/notification/group-mention-reminder.ts`, `src/notification/auto-reminder-worker.ts`, `src/server/routes/portal-routes.ts`
- **Deliverable:** Real `@mention` tagging in Zalo groups by matching member names via `getGroupInfo`; API routes for `/portal/api/zalo-groups`, `/portal/api/scan-history`, `/portal/api/assets`, `/portal/api/drive/*`, `/portal/api/remind-group`.
- **Verification:** Unit test for mention position/length calculation + `pnpm tsc --noEmit`.

### Task 4: Complete Portal UI/UX Redesign (`/portal`)
- **Files:** `src/server/routes/portal-routes.ts`
- **Deliverable:** Modern sidebar workspace UI (3-color system `#F8FAFC` / `#2563EB` / `#EFF6FF`) with 4 sections: Tiến độ công việc (+ In/PDF), Kho tài liệu & Google Drive, Nhắc việc & Tag nhóm, Cài đặt kết nối.
- **Verification:** Server restart, HTTP 200 check, Chrome DevTools inspection (no console/JS errors, responsive layout verified).

### Task 5: Redesign Presentation Slides & Persuasive Client Copy
- **Files:** `presentation/index.html`
- **Deliverable:** Updated presentation deck showcasing the new Portal, Personal Account passive + historical capture, AI Project Classification -> Google Drive, and real `@mention` group reminders with compelling, pain-point-driven Vietnamese copy and presenter notes.
- **Verification:** Visual & interactive check of `presentation/index.html`.
