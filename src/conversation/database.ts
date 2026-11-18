import path from "node:path";
// Dùng SQLite built-in của Node (>= 22.13) - không cần native build (better-sqlite3
// yêu cầu Visual Studio Build Tools trên Windows). 1 connection dùng chung cho
// mọi store (history/thread/contact/usage) - node:sqlite là sync nên không cần pool.
import { DatabaseSync } from "node:sqlite";
import { dataDir } from "../config/env.js";
import { calculateKmGiftSchedule, KM_GIFT_CUSTOMISED_FLOW } from "../drive/km-gift-sla.js";
import { taoBangKnowledgeBase } from "../knowledge/kb-schema.js";
import { taoBangMcp } from "../mcp/mcp-schema.js";
import { taoBangFriendRequests } from "./friend-schema.js";
import { taoBangVerbatimNotes } from "./verbatim-note-schema.js";

export const db = new DatabaseSync(path.join(dataDir, "zalo-agent.db"));
db.exec("PRAGMA journal_mode = WAL;");
/**
 * `NORMAL` chứ không phải mặc định `FULL`.
 *
 * `node:sqlite` chạy ĐỒNG BỘ trong tiến trình một luồng, nên mỗi lần ghi là
 * chặn cả bot: không nhận tin mới, không chạy lượt nào khác, không phục vụ
 * dashboard. `FULL` bắt fsync ở MỌI commit, và đo thật trên máy dev:
 *
 *     synchronous=FULL      1.884 us / INSERT
 *     synchronous=NORMAL       37 us / INSERT
 *
 * Gấp 50 lần, và mỗi lượt trả lời ghi vài dòng (tin đến, tin trả lời, usage,
 * trace). Nhiều hội thoại nhắn cùng lúc thì các lần chặn đó cộng dồn.
 *
 * Đánh đổi: đi kèm WAL, `NORMAL` vẫn an toàn tuyệt đối khi tiến trình chết
 * (crash, kill, hết bộ nhớ) - WAL còn nguyên và phục hồi đủ. Chỉ khi MẤT ĐIỆN
 * đột ngột hay OS sập mới có thể mất vài giao dịch cuối. DB không bao giờ hỏng
 * ở cả hai mức. Với bot chat cá nhân, mất vài tin cuối lúc cúp điện là chấp
 * nhận được; treo cả bot 2ms mỗi lần ghi thì không.
 */
db.exec("PRAGMA synchronous = NORMAL;");

runMigrations();

function runMigrations(): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      account_id TEXT NOT NULL,
      thread_id TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
      sender_name TEXT,
      content TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
    );
    CREATE INDEX IF NOT EXISTS idx_messages_account_thread
      ON messages (account_id, thread_id, id);

    CREATE TABLE IF NOT EXISTS threads (
      account_id TEXT NOT NULL,
      thread_id TEXT NOT NULL,
      thread_type INTEGER NOT NULL,
      display_name TEXT NOT NULL DEFAULT '',
      bot_enabled INTEGER NOT NULL DEFAULT 1,
      message_count INTEGER NOT NULL DEFAULT 0,
      last_message_at TEXT,
      last_sender_name TEXT,
      PRIMARY KEY (account_id, thread_id)
    );

    CREATE TABLE IF NOT EXISTS contacts (
      account_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      display_name TEXT NOT NULL DEFAULT '',
      first_seen TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
      last_seen TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
      message_count INTEGER NOT NULL DEFAULT 0,
      PRIMARY KEY (account_id, user_id)
    );

    CREATE TABLE IF NOT EXISTS runtime_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
    );

    -- Não của bot: persona + model override, gắn vào account qua accounts.agent_id.
    -- DB là source of truth (config/accounts.json chỉ seed 1 lần đầu).
    CREATE TABLE IF NOT EXISTS agents (
      id TEXT PRIMARY KEY,
      icon TEXT NOT NULL DEFAULT '🤖',
      name TEXT NOT NULL,
      persona TEXT NOT NULL DEFAULT '',
      model_provider TEXT,
      model_name TEXT,
      max_steps INTEGER,
      is_default INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
    );

    -- Tài khoản Zalo (kênh): policies + gắn não. N account dùng chung 1 agent được.
    CREATE TABLE IF NOT EXISTS accounts (
      id TEXT PRIMARY KEY,
      label TEXT NOT NULL,
      enabled INTEGER NOT NULL DEFAULT 1,
      agent_id TEXT NOT NULL,
      allowlist_mode TEXT NOT NULL DEFAULT 'all' CHECK (allowlist_mode IN ('all', 'list')),
      allowlist_user_ids TEXT NOT NULL DEFAULT '[]',
      group_require_mention INTEGER NOT NULL DEFAULT 1,
      respond_to_groups INTEGER NOT NULL DEFAULT 1,
      group_passive_listen INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
    );

    -- Memory lớp 3: fact bền do agent tự lưu qua tool save_memory.
    -- learned_in_group quyết định quy tắc inject bất đối xứng (private không ra public)
    CREATE TABLE IF NOT EXISTS memories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      account_id TEXT NOT NULL,
      subject_id TEXT NOT NULL,
      content TEXT NOT NULL,
      learned_in_thread_id TEXT NOT NULL,
      learned_in_group INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
    );
    CREATE INDEX IF NOT EXISTS idx_memories_account_subject
      ON memories (account_id, subject_id, id);

    -- Phiên đăng nhập dashboard. Có bản ghi thật thì logout mới thu hồi được
    -- (token HMAC stateless không xóa được), và password_fingerprint cho phép
    -- đổi DASHBOARD_PASSWORD là mọi phiên cũ hết hiệu lực ngay.
    CREATE TABLE IF NOT EXISTS dashboard_sessions (
      id TEXT PRIMARY KEY,
      secret_hash TEXT NOT NULL,
      password_fingerprint TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      expires_at INTEGER NOT NULL
    );

    -- Cache mô tả ảnh do vision sidecar sinh ra (khi model chính không đọc được
    -- ảnh). Key theo đường dẫn file trong data/media - mỗi ảnh chỉ mô tả 1 lần.
    CREATE TABLE IF NOT EXISTS image_descriptions (
      rel_path TEXT PRIMARY KEY,
      description TEXT NOT NULL,
      model TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
    );

    CREATE TABLE IF NOT EXISTS agent_turns (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      account_id TEXT NOT NULL,
      thread_id TEXT NOT NULL,
      input_tokens INTEGER NOT NULL DEFAULT 0,
      output_tokens INTEGER NOT NULL DEFAULT 0,
      total_tokens INTEGER NOT NULL DEFAULT 0,
      steps INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
    );
    CREATE INDEX IF NOT EXISTS idx_agent_turns_account_created
      ON agent_turns (account_id, created_at);

    -- Trace từng step của lượt agent: model nói gì, gọi tool nào với tham số
    -- gì, provider cảnh báo gì. Không có bảng này thì bot trả lời sai chỉ còn
    -- cách suy luận ngược từ câu lỗi (đã dính vụ dò vé số và vụ imageIndex).
    -- Bảng này phình nhanh nhất trong DB nên có dọn theo AGENT_TRACE_RETENTION_DAYS.
    CREATE TABLE IF NOT EXISTS agent_steps (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      turn_id INTEGER NOT NULL,
      step_number INTEGER NOT NULL,
      text TEXT NOT NULL DEFAULT '',
      reasoning TEXT NOT NULL DEFAULT '',
      tool_calls TEXT NOT NULL DEFAULT '[]',
      tool_results TEXT NOT NULL DEFAULT '[]',
      finish_reason TEXT NOT NULL DEFAULT '',
      warnings TEXT NOT NULL DEFAULT '[]',
      input_tokens INTEGER NOT NULL DEFAULT 0,
      output_tokens INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
    );
    CREATE INDEX IF NOT EXISTS idx_agent_steps_turn ON agent_steps (turn_id, step_number);
    CREATE INDEX IF NOT EXISTS idx_agent_steps_created ON agent_steps (created_at);

    -- Lịch hẹn: trạng thái HIỆN TẠI của từng job (bot tự nhắn theo lịch).
    -- Tách khỏi scheduled_job_runs (bảng NGAY DƯỚI) vì last_status ở đây chỉ
    -- nói lần chạy CUỐI - job hỏng 5 lần rồi lần 6 chạy được sẽ trông khoẻ
    -- mạnh hoàn hảo nếu không có log riêng kể lại từng lần.
    CREATE TABLE IF NOT EXISTS scheduled_jobs (
      id TEXT PRIMARY KEY,
      account_id TEXT NOT NULL,
      thread_id TEXT NOT NULL,
      thread_type INTEGER NOT NULL,
      name TEXT NOT NULL,
      kind TEXT NOT NULL CHECK (kind IN ('message', 'agent')),
      payload TEXT NOT NULL,
      schedule_kind TEXT NOT NULL CHECK (schedule_kind IN ('once', 'every', 'cron')),
      run_at TEXT,
      every_minutes INTEGER,
      cron_expr TEXT,
      -- Rỗng = hiểu theo BOT_TIMEZONE tại thời điểm CHẠY (đổi cấu hình là job
      -- đổi theo ngay); có giá trị = job pin cứng đúng zone này bất kể sau
      -- này BOT_TIMEZONE đổi ra sao.
      timezone TEXT NOT NULL DEFAULT '',
      enabled INTEGER NOT NULL DEFAULT 1,
      next_run_at TEXT,
      last_run_at TEXT,
      last_status TEXT,
      last_error TEXT,
      run_count INTEGER NOT NULL DEFAULT 0,
      -- NULL = vô hạn; 'once' mặc định 1. Chạm mức này thì enabled=0 và
      -- next_run_at=NULL nhưng GIỮ NGUYÊN row - xoá hẳn (như Hermes/goclaw)
      -- làm lời nhắc đã hẹn biến mất không dấu vết.
      max_runs INTEGER,
      created_by TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
      updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
    );
    -- Vòng tick quét job đến hạn: WHERE enabled = 1 AND next_run_at <= now
    CREATE INDEX IF NOT EXISTS idx_scheduled_jobs_due ON scheduled_jobs (enabled, next_run_at);
    -- Tool list/cancel/update chỉ được thấy job của đúng (account, thread) đang chat
    CREATE INDEX IF NOT EXISTS idx_scheduled_jobs_thread ON scheduled_jobs (account_id, thread_id);

    -- Sổ ghi ĐÃ XẢY RA GÌ ở từng lần job chạy - khác scheduled_jobs.last_status
    -- vốn chỉ nói lần cuối. turn_id nối sang agent_turns cho job kind='agent',
    -- bấm thẳng sang trang Trace khi cần biết vì sao job trả lời sai.
    CREATE TABLE IF NOT EXISTS scheduled_job_runs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      job_id TEXT NOT NULL,
      turn_id INTEGER,
      status TEXT NOT NULL CHECK (status IN ('running', 'ok', 'silent', 'skipped', 'error', 'interrupted')),
      detail TEXT NOT NULL DEFAULT '',
      delivered_chars INTEGER NOT NULL DEFAULT 0,
      started_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
      finished_at TEXT
    );
    -- Lịch sử của 1 job, mới nhất trước; dọn quá SCHEDULER_RUN_LOG_KEEP theo job_id
    CREATE INDEX IF NOT EXISTS idx_scheduled_job_runs_job ON scheduled_job_runs (job_id, id DESC);

    -- Đếm tin CHỦ ĐỘNG đã gửi mỗi (account, thread, ngày VN) cho trần
    -- SCHEDULER_MAX_PROACTIVE_PER_DAY - bền qua restart. CỐ Ý không đếm từ
    -- scheduled_job_runs: bảng đó bị prune xuống SCHEDULER_RUN_LOG_KEEP dòng
    -- MỖI JOB ngay mỗi lần mở lượt, nên 1 job dày (vd every 5 phút) làm dòng
    -- 'ok' buổi sáng bị xoá trong vài giờ - đếm lại tụt về 0 giữa ngày.
    CREATE TABLE IF NOT EXISTS proactive_send_counters (
      account_id TEXT NOT NULL,
      thread_id TEXT NOT NULL,
      day_key TEXT NOT NULL,
      count INTEGER NOT NULL DEFAULT 0,
      notice_sent INTEGER NOT NULL DEFAULT 0,
      updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
      PRIMARY KEY (account_id, thread_id, day_key)
    );
  `);

  // Kho tri thức (nguồn -> đoạn -> FTS5 -> gán agent) - lược đồ riêng vì có
  // bảng ẢO fts5, khai chung trong template string trên sẽ lẫn với các bảng
  // thường và khó soát khi sửa sau này.
  taoBangKnowledgeBase(db);

  // Yêu cầu kết bạn ĐẾN đang chờ (tab Bạn bè). Bảng riêng vì zca-js không có API
  // list request đến - chỉ bắt được qua sự kiện listener rồi lưu ở đây.
  taoBangFriendRequests(db);

  // MCP client: server ngoài (mcp_servers) + gán theo agent (agent_mcp_servers,
  // default-deny). Xem src/mcp/mcp-schema.ts.
  taoBangMcp(db);

  // Ghi chú NGUYÊN VĂN (tool verbatim_note) - tách khỏi `memories`, lý do ở
  // verbatim-note-schema.ts.
  taoBangVerbatimNotes(db);

  // Tool CHẠY LỖI: AI SDK để chúng ở content dạng tool-error, không vào
  // toolResults, nên trước cột này mọi lần tool hỏng đều mất tăm khỏi trace.
  addColumnIfMissing("agent_steps", "tool_errors", "TEXT NOT NULL DEFAULT '[]'");

  // Lần chạy thứ mấy trong cùng lượt. Không có cột này thì trace của lượt có
  // retry đọc ra 1,1,2,2,3,3 và trông y hệt model lặp vô hạn. Mặc định 1 để
  // mọi dòng ghi trước đây vẫn hợp lệ.
  addColumnIfMissing("agent_steps", "attempt", "INTEGER NOT NULL DEFAULT 1");

  // Mức suy nghĩ riêng cho từng agent (NULL = theo mức mặc định chung)
  addColumnIfMissing("agents", "reasoning_effort", "TEXT");

  // DB tạo trước khi có cột sender_id: ALTER thêm (nullable - tin cũ không có id)
  addColumnIfMissing("messages", "sender_id", "TEXT");
  // Ảnh kèm tin nhắn: JSON array đường dẫn file trong data/media (tương đối DATA_DIR)
  // để lượt sau nạp lại cho model xem; NULL = tin không có ảnh
  addColumnIfMissing("messages", "images", "TEXT");
  // Memory lớp 2: rolling summary per thread
  addColumnIfMissing("threads", "summary", "TEXT NOT NULL DEFAULT ''");
  addColumnIfMissing("threads", "summary_covers_to_message_id", "INTEGER NOT NULL DEFAULT 0");

  // Số lần ngữ cảnh của thread bị xóa sạch. Vào khóa phiên gửi router
  // (`cache-session-id.ts`) để lần xóa nào cũng mở một phiên MỚI - cùng cách
  // goclaw gọi `ResetCLISession` và Hermes xoay `session_id` khi /reset. Không
  // xoay thì router vẫn coi đây là phiên cũ và giữ tiền tố đã cache của cuộc
  // trò chuyện vừa bị xóa. Mặc định 0 để mọi thread cũ giữ nguyên khóa đang có.
  addColumnIfMissing("threads", "context_epoch", "INTEGER NOT NULL DEFAULT 0");

  // Phản hồi tức thì: thả reaction + báo "đang nhập" khi bot bắt đầu xử lý
  addColumnIfMissing("accounts", "auto_react_enabled", "INTEGER NOT NULL DEFAULT 1");
  addColumnIfMissing("accounts", "auto_react_icon", "TEXT NOT NULL DEFAULT 'heart'");
  addColumnIfMissing("accounts", "typing_indicator_enabled", "INTEGER NOT NULL DEFAULT 1");
  // Trang Tools: JSON array key tool bị tắt per account (rỗng = bật hết).
  // Lưu danh sách TẮT thay vì BẬT để tool mới thêm vào code tự bật cho account cũ.
  addColumnIfMissing("accounts", "disabled_tools", "TEXT NOT NULL DEFAULT '[]'");

  // Tab Bạn bè: tự động chấp nhận yêu cầu kết bạn. Mặc định TẮT (0) - manual là
  // lõi. Khi bật, vòng quét accept request đã chờ quá `delay_minutes` phút (mặc
  // định 1). Chỉ có ý nghĩa với kênh cá nhân.
  addColumnIfMissing("accounts", "auto_accept_friends", "INTEGER NOT NULL DEFAULT 0");
  addColumnIfMissing("accounts", "auto_accept_friend_delay_minutes", "INTEGER NOT NULL DEFAULT 1");

  // Loại KÊNH của tài khoản: "ca_nhan" (zca-js, giao thức đảo ngược) hoặc
  // "bot" (Zalo Bot API chính thức). Mặc định "ca_nhan" để mọi dòng đã có từ
  // trước giữ nguyên hành vi - đây là loại duy nhất tồn tại trước cột này.
  addColumnIfMissing("accounts", "loai", "TEXT NOT NULL DEFAULT 'ca_nhan'");
  // Token bot, MÃ HÓA bằng cùng khóa với cookie Zalo (credential-encryption).
  // Rỗng với tài khoản cá nhân.
  addColumnIfMissing("accounts", "bot_token_enc", "TEXT NOT NULL DEFAULT ''");
  // Cấu hình kênh Facebook Fanpage (Messenger Webhook)
  addColumnIfMissing("accounts", "fb_page_id", "TEXT NOT NULL DEFAULT ''");
  addColumnIfMissing("accounts", "fb_verify_token", "TEXT NOT NULL DEFAULT ''");
  addColumnIfMissing("accounts", "fb_app_secret_enc", "TEXT NOT NULL DEFAULT ''");

  // Lớp tool THỨ HAI, theo agent - GIAO với lớp account ở trên, không thay thế.
  // Agent khai NĂNG LỰC (agent này biết làm gì), account áp CHÍNH SÁCH (nick này
  // được phép gì); tool dùng được là phần không bên nào tắt. Nhờ vậy thêm một
  // agent mới không bao giờ nới rộng được quyền của một nick.
  //
  // Cũng lưu danh sách TẮT vì đúng lý do của dòng trên: làm danh sách BẬT thì
  // tool mới thêm vào code sẽ không tự có cho agent cũ.
  addColumnIfMissing("agents", "disabled_tools", "TEXT NOT NULL DEFAULT '[]'");

  // Trần token riêng cho agent này (NULL = theo LLM_CONTEXT_WINDOW ở Cấu hình).
  // Phải nằm ở agent chứ không chỉ ở cấu hình chung: trần phụ thuộc CỬA SỔ của
  // model, mà model đặt được theo từng agent.
  // Bảng Quản lý Dự án & Tiến độ (Cổng Portal)
  taoBangProjectManagement(db);
  taoBangWorkTracker(db);

  addColumnIfMissing("agents", "context_window", "INTEGER");

  // Lượt do lịch hẹn tự bắn (source='schedule') khác lượt trả lời tin nhắn
  // (source='message') - Overview và trang Trace cần phân biệt được "có người
  // đang chat" với "job tự chạy lúc 3 giờ sáng". Mặc định 'message' để mọi
  // lượt ghi TRƯỚC khi có scheduler vẫn đúng nghĩa, không cần backfill.
  addColumnIfMissing("agent_turns", "source", "TEXT NOT NULL DEFAULT 'message'");

  // Đếm số lần THỬ GỬI THẤT BẠI LIÊN TIẾP (delivery-attempt-store.ts) - job
  // gửi hỏng chỉ bị tiêu suất chạy sau khi chạm MAX_DELIVERY_ATTEMPTS, không
  // phải ngay lần đầu (bất biến "chưa từng gửi được thì không coi là đã
  // chạy"). Mặc định 0 để mọi job cũ coi như chưa từng thử hỏng lần nào.
  addColumnIfMissing("scheduled_jobs", "delivery_attempts", "INTEGER NOT NULL DEFAULT 0");
}

function taoBangProjectManagement(database: DatabaseSync): void {
  database.exec(`
    CREATE TABLE IF NOT EXISTS pm_projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT DEFAULT '',
      budget REAL DEFAULT 0,
      status TEXT DEFAULT 'active',
      created_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
    );

    CREATE TABLE IF NOT EXISTS pm_stages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER NOT NULL DEFAULT 1,
      step_order INTEGER NOT NULL DEFAULT 1,
      title TEXT NOT NULL,
      description TEXT DEFAULT '',
      status TEXT DEFAULT 'todo',
      created_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
    );

    CREATE TABLE IF NOT EXISTS pm_tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER NOT NULL DEFAULT 1,
      stage_id INTEGER NOT NULL DEFAULT 1,
      title TEXT NOT NULL,
      description TEXT DEFAULT '',
      assigned_phone TEXT DEFAULT '',
      deadline TEXT DEFAULT '',
      status TEXT DEFAULT 'todo',
      progress INTEGER DEFAULT 0,
      reminded_at TEXT DEFAULT NULL,
      google_event_id TEXT DEFAULT NULL,
      created_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
      updated_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
    );

    CREATE TABLE IF NOT EXISTS pm_members (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      phone TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      role TEXT DEFAULT 'member',
      avatar TEXT DEFAULT '',
      thread_id TEXT DEFAULT '',
      email TEXT DEFAULT '',
      created_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
    );

    CREATE TABLE IF NOT EXISTS pm_expenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER NOT NULL DEFAULT 1,
      task_id INTEGER DEFAULT NULL,
      title TEXT NOT NULL,
      amount REAL NOT NULL DEFAULT 0,
      category TEXT DEFAULT 'Khác',
      spent_by TEXT DEFAULT '',
      spent_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
      receipt_file TEXT DEFAULT '',
      note TEXT DEFAULT '',
      created_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
    );
  `);

  addColumnIfMissing("pm_members", "email", "TEXT NOT NULL DEFAULT ''");
  addColumnIfMissing("pm_members", "pin", "TEXT NOT NULL DEFAULT '123456'");
  addColumnIfMissing("pm_tasks", "reminded_at", "TEXT");
  addColumnIfMissing("pm_tasks", "google_event_id", "TEXT");
  addColumnIfMissing("pm_tasks", "parent_id", "INTEGER DEFAULT NULL");
  addColumnIfMissing("pm_tasks", "checklist", "TEXT NOT NULL DEFAULT '[]'");
  addColumnIfMissing("pm_tasks", "assignees", "TEXT NOT NULL DEFAULT '[]'");
}

function addColumnIfMissing(table: string, column: string, definition: string): void {
  const cols = db.prepare(`SELECT name FROM pragma_table_info('${table}')`).all() as {
    name: string;
  }[];
  if (!cols.some((c) => c.name === column)) {
    db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
  }
}

function taoBangWorkTracker(database: DatabaseSync): void {
  database.exec(`
    CREATE TABLE IF NOT EXISTS pm_work_tracker_settings (
      id INTEGER PRIMARY KEY DEFAULT 1,
      project_start_date TEXT DEFAULT '2026-11-09',
      today_date TEXT DEFAULT '2026-11-10',
      title TEXT DEFAULT 'THEO DÕI TIẾN ĐỘ CÔNG VIỆC',
      weeks_count INTEGER DEFAULT 7
    );

    CREATE TABLE IF NOT EXISTS pm_work_tracker_members (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      member_order INTEGER NOT NULL,
      name TEXT NOT NULL,
      color_name TEXT DEFAULT '',
      color_hex TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS pm_work_tracker_tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      task_order INTEGER NOT NULL,
      title TEXT NOT NULL DEFAULT '',
      assigned_member_id INTEGER DEFAULT NULL,
      start_date TEXT DEFAULT '',
      end_date TEXT DEFAULT '',
      duration_days INTEGER DEFAULT 0,
      progress REAL DEFAULT 0,
      status TEXT DEFAULT 'pending',
      notes TEXT DEFAULT '',
      created_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
      updated_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
    );
  `);

  const hasSettings = database.prepare("SELECT count(*) as c FROM pm_work_tracker_settings").get() as { c: number };
  if (!hasSettings || hasSettings.c === 0) {
    database.exec(`
      INSERT INTO pm_work_tracker_settings (id, project_start_date, today_date, title, weeks_count)
      VALUES (1, '2026-11-09', '2026-11-10', 'THEO DÕI TIẾN ĐỘ CÔNG VIỆC', 7);
    `);
  }

  const hasMembers = database.prepare("SELECT count(*) as c FROM pm_work_tracker_members").get() as { c: number };
  if (!hasMembers || hasMembers.c === 0) {
    database.exec(`
      INSERT INTO pm_work_tracker_members (member_order, name, color_name, color_hex) VALUES
      (1, 'SA', 'Hồng', '#F472B6'),
      (2, 'HUY', 'Cam đào', '#FB923C'),
      (3, 'CHỊ THANH', 'Vàng', '#FBBF24'),
      (4, 'ANH VĂN', 'Bạc hà', '#34D399'),
      (5, 'CHỊ CHÂU', 'Xanh trời', '#38BDF8'),
      (6, 'CHỊ BÊ', 'Tím lavender', '#A78BFA');
    `);
  }

  const hasTasks = database.prepare("SELECT count(*) as c FROM pm_work_tracker_tasks").get() as { c: number };
  if (!hasTasks || hasTasks.c === 0) {
    database.exec(`
      INSERT INTO pm_work_tracker_tasks (task_order, title, assigned_member_id, start_date, end_date, duration_days, progress, status, notes) VALUES
      (1, 'Khảo sát hiện trạng & Chốt concept thiết kế', 1, '2026-11-09', '2026-11-13', 5, 1.0, 'completed', 'Đã chốt với khách'),
      (2, 'Thiết kế bản vẽ kỹ thuật 2D & Sơ đồ M&E', 2, '2026-11-12', '2026-11-16', 5, 0.1, 'in_progress', ''),
      (3, 'Dựng phối cảnh 3D Render không gian chính', 3, '2026-11-16', '2026-11-25', 10, 0.4, 'in_progress', ''),
      (4, 'Bóc tách khối lượng vật tư & Lập báo giá thầu', 4, '2026-11-18', '2026-12-04', 17, 0.2, 'in_progress', ''),
      (5, 'Gia công sản xuất nội thất mộc tại xưởng', 5, '2026-11-26', '2026-12-08', 13, 0.0, 'pending', ''),
      (6, 'Thi công cải tạo thô & Lắp đặt điện nước hiện trường', 6, '2026-12-07', '2026-12-14', 8, 0.0, 'pending', ''),
      (7, 'Lắp đặt hoàn thiện đồ gỗ, phụ kiện & rèm đèn', 2, '2026-12-11', '2026-12-17', 7, 0.0, 'pending', ''),
      (8, 'Vệ sinh công nghiệp, Nghiệm thu & Bàn giao nhà', 1, '2026-12-21', '2026-12-23', 3, 0.0, 'pending', '');
    `);
  }

  database.exec(`
    CREATE TABLE IF NOT EXISTS pm_drive_settings (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      root_folder_name TEXT DEFAULT 'Khởi Minh Drive',
      root_folder_id TEXT DEFAULT '',
      access_token TEXT DEFAULT '',
      refresh_token TEXT DEFAULT '',
      client_id TEXT DEFAULT '',
      client_secret TEXT DEFAULT '',
      token_expires_at INTEGER DEFAULT 0,
      auto_sync INTEGER DEFAULT 0,
      default_account_id TEXT DEFAULT '',
      default_group_id TEXT DEFAULT '',
      updated_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
    );

    CREATE TABLE IF NOT EXISTS pm_collected_assets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      account_id TEXT NOT NULL,
      thread_id TEXT NOT NULL,
      thread_name TEXT DEFAULT '',
      msg_id TEXT NOT NULL,
      sender_id TEXT DEFAULT '',
      sender_name TEXT DEFAULT '',
      asset_type TEXT NOT NULL CHECK (asset_type IN ('image', 'file', 'link')),
      title TEXT NOT NULL DEFAULT '',
      original_url TEXT DEFAULT '',
      local_path TEXT DEFAULT '',
      mime_type TEXT DEFAULT '',
      drive_file_id TEXT DEFAULT '',
      drive_web_url TEXT DEFAULT '',
      project_name TEXT DEFAULT 'Chờ phân loại',
      ai_summary TEXT DEFAULT '',
      context_text TEXT DEFAULT '',
      status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'classified', 'synced', 'error')),
      error_message TEXT DEFAULT '',
      sent_at TEXT DEFAULT '',
      created_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
      UNIQUE(thread_id, msg_id, asset_type, original_url)
    );
    CREATE INDEX IF NOT EXISTS idx_pm_assets_project ON pm_collected_assets(project_name, status);
    CREATE INDEX IF NOT EXISTS idx_pm_assets_thread ON pm_collected_assets(thread_id, sent_at DESC);
  `);

  const hasDriveSettings = database.prepare("SELECT count(*) as c FROM pm_drive_settings").get() as { c: number };
  if (!hasDriveSettings || hasDriveSettings.c === 0) {
    database.exec(`
      INSERT INTO pm_drive_settings (id, root_folder_name) VALUES (1, 'Khởi Minh Drive');
    `);
  }

  // Migration an toàn cho pm_projects & pm_stages (hỗ trợ KM Gift / Homeplanner + SLA tự động)
  const projCols = new Set(
    (database.prepare("PRAGMA table_info(pm_projects)").all() as { name: string }[]).map((r) => r.name),
  );
  if (!projCols.has("business_unit")) {
    database.exec("ALTER TABLE pm_projects ADD COLUMN business_unit TEXT DEFAULT 'KM Gift'");
  }
  if (!projCols.has("flow_type")) {
    database.exec("ALTER TABLE pm_projects ADD COLUMN flow_type TEXT DEFAULT 'customised'");
  }
  if (!projCols.has("contract_date")) {
    database.exec("ALTER TABLE pm_projects ADD COLUMN contract_date TEXT DEFAULT ''");
  }
  if (!projCols.has("deposit_date")) {
    database.exec("ALTER TABLE pm_projects ADD COLUMN deposit_date TEXT DEFAULT ''");
  }

  const stageCols = new Set(
    (database.prepare("PRAGMA table_info(pm_stages)").all() as { name: string }[]).map((r) => r.name),
  );
  if (!stageCols.has("sla_days")) {
    database.exec("ALTER TABLE pm_stages ADD COLUMN sla_days INTEGER DEFAULT 0");
  }
  if (!stageCols.has("phase")) {
    database.exec("ALTER TABLE pm_stages ADD COLUMN phase TEXT DEFAULT 'post_deposit'");
  }
  if (!stageCols.has("start_date")) {
    database.exec("ALTER TABLE pm_stages ADD COLUMN start_date TEXT DEFAULT ''");
  }
  if (!stageCols.has("end_date")) {
    database.exec("ALTER TABLE pm_stages ADD COLUMN end_date TEXT DEFAULT ''");
  }

  // Seed 1 dự án mẫu Khởi Minh Gift (luồng Customised, mốc Tạm ứng 10/11) nếu chưa có
  const hasKmGiftSample = database
    .prepare("SELECT count(*) as c FROM pm_projects WHERE name LIKE '%KM Gift%'")
    .get() as { c: number };
  if (!hasKmGiftSample || hasKmGiftSample.c === 0) {
    const projRow = database
      .prepare(
        `INSERT INTO pm_projects (name, description, budget, status, business_unit, flow_type, deposit_date)
         VALUES (?, ?, ?, 'active', 'KM Gift', 'customised', '2026-11-10')
         RETURNING id`,
      )
      .get(
        "KM Gift - Bộ Quà Tết Doanh Nghiệp (Mẫu SLA)",
        "Dự án mẫu quy trình Khởi Minh Gift (Không có sẵn / Customised) tự động tính deadline từng giai đoạn theo ngày tạm ứng.",
        120000000,
      ) as { id: number };

    const schedule = calculateKmGiftSchedule({
      flowType: "customised",
      depositDate: "2026-11-10",
    });

    const stageStmt = database.prepare(
      `INSERT INTO pm_stages (project_id, step_order, title, description, sla_days, phase, start_date, end_date)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?) RETURNING id`,
    );
    const taskStmt = database.prepare(
      `INSERT INTO pm_tasks (project_id, stage_id, title, description, assigned_phone, deadline, progress, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    );

    for (const st of schedule) {
      const stageRow = stageStmt.get(
        projRow.id,
        st.stepOrder,
        st.title,
        `SLA chuẩn: ${st.slaDays} ngày`,
        st.slaDays,
        st.phase,
        st.startDate,
        st.endDate,
      ) as { id: number };
      const isDone = st.stepOrder <= 3;
      const isInProgress = st.stepOrder === 4;
      taskStmt.run(
        projRow.id,
        stageRow.id,
        st.defaultTaskTitle,
        `Mốc SLA: ${st.startDate} → ${st.endDate} (${st.slaDays} ngày)`,
        null,
        st.endDate,
        isDone ? 100 : isInProgress ? 35 : 0,
        isDone ? "completed" : isInProgress ? "in_progress" : "pending",
      );
    }
  }

  // Bảng Chi phí hạng mục & Báo giá tự động
  database.exec(`
    CREATE TABLE IF NOT EXISTS pm_project_costs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER NOT NULL,
      stage_id INTEGER DEFAULT NULL,
      category TEXT DEFAULT 'Sản xuất',
      item_name TEXT NOT NULL DEFAULT '',
      vendor_name TEXT DEFAULT '',
      cost_amount REAL DEFAULT 0,
      quantity INTEGER DEFAULT 1,
      unit TEXT DEFAULT 'bộ',
      duration_days INTEGER DEFAULT 0,
      markup_factor REAL DEFAULT 1.5,
      description_specs TEXT DEFAULT '',
      payment_status TEXT DEFAULT 'Chưa thanh toán',
      contract_ref TEXT DEFAULT '',
      created_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
    );
    CREATE INDEX IF NOT EXISTS idx_pm_costs_proj ON pm_project_costs(project_id);

    CREATE TABLE IF NOT EXISTS pm_quotations (
      project_id INTEGER PRIMARY KEY,
      customer_name TEXT DEFAULT '',
      customer_rep TEXT DEFAULT '',
      quote_date TEXT DEFAULT '',
      title TEXT DEFAULT 'BÁO GIÁ SẢN PHẨM & DỊCH VỤ',
      client_tier TEXT DEFAULT 'Doanh nghiệp',
      default_markup REAL DEFAULT 1.5,
      vat_percent REAL DEFAULT 8,
      notes TEXT DEFAULT 'Thanh toán: Tạm ứng 50% giá trị đơn hàng sau khi đặt hàng và thanh toán toàn bộ giá trị còn lại sau khi bàn giao sản phẩm.\nVận chuyển: Giá trên đã bao gồm chi phí vận chuyển đến 1 địa điểm trong nội thành Hà Nội.',
      updated_at TEXT DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
    );
  `);

  // Seed chi phí mẫu cho dự án KM Gift mẫu nếu chưa có
  const kmGiftProj = database
    .prepare("SELECT id FROM pm_projects WHERE name LIKE '%KM Gift%' ORDER BY id ASC LIMIT 1")
    .get() as { id: number } | undefined;
  if (kmGiftProj) {
    const hasCosts = database
      .prepare("SELECT count(*) as c FROM pm_project_costs WHERE project_id = ?")
      .get(kmGiftProj.id) as { c: number };
    if (!hasCosts || hasCosts.c === 0) {
      const stages = database
        .prepare("SELECT id, title, sla_days FROM pm_stages WHERE project_id = ? ORDER BY step_order ASC")
        .all(kmGiftProj.id) as Array<{ id: number; title: string; sla_days: number }>;
      const findStageId = (kw: string) => stages.find((s) => s.title.includes(kw))?.id ?? null;

      const insCost = database.prepare(
        `INSERT INTO pm_project_costs
          (project_id, stage_id, category, item_name, vendor_name, cost_amount, quantity, unit, duration_days, markup_factor, description_specs, payment_status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      );
      insCost.run(
        kmGiftProj.id,
        findStageId("Thiết kế"),
        "Thiết kế",
        "Thiết kế Packaging & Keyvisual Bộ Quà Tết",
        "Freelancer - Hà Ngọc Khánh Linh",
        7500000,
        1,
        "gói",
        7,
        1.6,
        "- Thiết kế 02 phương án concept hộp quà & thiệp chúc mừng\n- Xuất file in ấn chuẩn CMYK & mockup 3D",
        "Đã tạm ứng 50%",
      );
      insCost.run(
        kmGiftProj.id,
        findStageId("Sản xuất"),
        "Sản xuất",
        "Sản xuất Bookmark Đồng Mạ Vàng 24K + Đế gỗ",
        "Xưởng gia công Mỹ Nghệ",
        385000,
        100,
        "bộ",
        14,
        1.65,
        "- Chất liệu: Đồng mạ vàng 24K, kích thước 60 x 101 mm\n- Kèm tua rua, thiệp gài & đế gỗ khắc laser cá nhân hóa",
        "Chưa thanh toán",
      );
      insCost.run(
        kmGiftProj.id,
        findStageId("Đóng gói"),
        "In ấn & Bao bì",
        "In ấn Hộp đựng kiểu Notebook & Túi giấy cao cấp",
        "Xưởng in Ấn Packaging",
        65000,
        100,
        "hộp",
        2,
        1.55,
        "- Giấy mỹ thuật ép kim logo Khởi Minh / Khách hàng\n- Khay định hình nhung & túi giấy đồng bộ",
        "Chưa thanh toán",
      );
      insCost.run(
        kmGiftProj.id,
        findStageId("Kiểm hàng"),
        "Media",
        "Chụp ảnh sản phẩm mẫu & nghiệm thu thành phẩm",
        "Freelancer - Khánh Vy",
        2500000,
        1,
        "gói",
        2,
        1.4,
        "- Chụp bộ ảnh studio 10 góc sản phẩm bàn giao tư liệu truyền thông",
        "Đã TT 100%",
      );

      database
        .prepare(
          `INSERT OR IGNORE INTO pm_quotations (project_id, customer_name, customer_rep, quote_date, title, client_tier, default_markup, vat_percent)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        )
        .run(
          kmGiftProj.id,
          "ĐẠI HỌC QUỐC GIA",
          "Hà Cửu Long Hồ - 0909112893",
          "2026-11-16",
          "BÁO GIÁ SET QUÀ TẶNG BOOKMARK & BAO BÌ CAO CẤP",
          "Doanh nghiệp",
          1.6,
          8,
        );
    }
  }

  // Đảm bảo có ít nhất 1 dự án Homeplanner để tách biệt rõ 2 mảng
  const hasHomeplanner = database
    .prepare("SELECT count(*) as c FROM pm_projects WHERE business_unit = 'Homeplanner'")
    .get() as { c: number };
  if (!hasHomeplanner || hasHomeplanner.c === 0) {
    database
      .prepare("UPDATE pm_projects SET business_unit = 'Homeplanner' WHERE id = 1 AND name NOT LIKE '%KM Gift%'")
      .run();
  }

  // Seed 6 dự án thực tế từ sheet CHI PHÍ DỰ ÁN của Khởi Minh (chia đúng KM Gift & Homeplanner)
  const hasRealPortfolio = database
    .prepare("SELECT count(*) as c FROM pm_projects WHERE name LIKE '%HALONG RUM%'")
    .get() as { c: number };

  if (!hasRealPortfolio || hasRealPortfolio.c === 0) {
    const oldDemoRows = database
      .prepare(
        "SELECT id FROM pm_projects WHERE name IN ('Dự Án Nâng Cấp Hệ Thống 2026', 'KM Gift - Bộ Quà Tết Doanh Nghiệp (Mẫu SLA)')",
      )
      .all() as Array<{ id: number }>;

    for (const oldP of oldDemoRows) {
      database.prepare("DELETE FROM pm_expenses WHERE project_id = ?").run(oldP.id);
      database.prepare("DELETE FROM pm_project_costs WHERE project_id = ?").run(oldP.id);
      database.prepare("DELETE FROM pm_quotations WHERE project_id = ?").run(oldP.id);
      database.prepare("DELETE FROM pm_tasks WHERE project_id = ?").run(oldP.id);
      database.prepare("DELETE FROM pm_stages WHERE project_id = ?").run(oldP.id);
      database.prepare("DELETE FROM pm_projects WHERE id = ?").run(oldP.id);
    }

    type SeedCost = {
      stageKeyword: string;
      category: string;
      itemName: string;
      vendorName: string;
      costAmount: number;
      quantity?: number;
      unit?: string;
      durationDays: number;
      markupFactor: number;
      paymentStatus: string;
      contractRef?: string;
      specs?: string;
    };

    type SeedProject = {
      name: string;
      description: string;
      budget: number;
      businessUnit: "KM Gift" | "Homeplanner";
      flowType: "customised" | "ready_stock";
      depositDate: string;
      customerName: string;
      defaultMarkup: number;
      completedSteps: number;
      costs: SeedCost[];
    };

    const seedPortfolio: SeedProject[] = [
      {
        name: "Bookmark Lương Thế Vinh",
        description: "Sản xuất bookmark LTV, tua rua + đế gỗ, in ấn packaging",
        budget: 77052000,
        businessUnit: "KM Gift",
        flowType: "customised",
        depositDate: "2026-11-10",
        customerName: "Trường Lương Thế Vinh",
        defaultMarkup: 2.0,
        completedSteps: 4,
        costs: [
          { stageKeyword: "Sản xuất", category: "Sản xuất", itemName: "Sản xuất bookmark LTV", vendorName: "Xưởng sản xuất", costAmount: 17120000, durationDays: 14, markupFactor: 2.0, paymentStatus: "Đã tạm ứng 50%" },
          { stageKeyword: "Sản xuất", category: "Phụ kiện", itemName: "Tua rua + đế gỗ", vendorName: "Xưởng phụ kiện", costAmount: 1474000, durationDays: 7, markupFactor: 2.0, paymentStatus: "Đã tạm ứng 50%" },
          { stageKeyword: "Đóng gói", category: "In ấn", itemName: "In ấn packaging", vendorName: "Xưởng in packaging", costAmount: 4400000, durationDays: 5, markupFactor: 2.0, paymentStatus: "Đã tạm ứng 50%" },
          { stageKeyword: "Bàn giao", category: "Chiết khấu", itemName: "Chiết khấu c Quyên", vendorName: "Chị Quyên", costAmount: 15410400, durationDays: 2, markupFactor: 2.0, paymentStatus: "Chưa thanh toán" },
        ],
      },
      {
        name: "PVEP - Set Quà Tặng Điêu Khắc & Packaging",
        description: "Landingpage sản phẩm, Set B+C+D có sẵn, Set A+B điêu khắc 3D & Packaging",
        budget: 55000000,
        businessUnit: "KM Gift",
        flowType: "customised",
        depositDate: "2026-11-11",
        customerName: "PVEP (Tổng Công ty Thăm dò Khai thác Dầu khí)",
        defaultMarkup: 1.6,
        completedSteps: 3,
        costs: [
          { stageKeyword: "Thiết kế", category: "Digital", itemName: "Landingpage sản phẩm", vendorName: "Huy", costAmount: 10000000, durationDays: 7, markupFactor: 1.6, paymentStatus: "Chưa thanh toán" },
          { stageKeyword: "Đóng gói", category: "Hàng có sẵn", itemName: "Set quà tặng B + C + D (Mẫu có sẵn)", vendorName: "Kho KM Gift", costAmount: 3264000, durationDays: 3, markupFactor: 1.6, paymentStatus: "Đã tạm ứng 50%" },
          { stageKeyword: "Sản xuất", category: "Điêu khắc 3D", itemName: "Set quà tặng A + B: Thiết kế & SX 2 mẫu điêu khắc 3D", vendorName: "Freelancer - Lam Đoàn", costAmount: 4000000, durationDays: 14, markupFactor: 1.6, paymentStatus: "Đã TT 100%", contractRef: "01/2026/HDKV-KM - LamDoan/Thietke3D" },
          { stageKeyword: "Thiết kế", category: "Bao bì", itemName: "Thiết kế Packaging set quà tặng", vendorName: "Freelance - Hà Linh", costAmount: 15000000, durationDays: 7, markupFactor: 1.6, paymentStatus: "Chưa thanh toán" },
        ],
      },
      {
        name: "KM CST - BST Đồng Vọng (Keycharm & Gác Đũa)",
        description: "Designer BST Keycharm, Copywriter BST Gác đũa, In ấn packaging & Chụp ảnh",
        budget: 18000000,
        businessUnit: "KM Gift",
        flowType: "customised",
        depositDate: "2026-11-08",
        customerName: "KM CST (Bộ Sưu Tập Đồng Vọng)",
        defaultMarkup: 1.5,
        completedSteps: 6,
        costs: [
          { stageKeyword: "Thiết kế", category: "Thiết kế", itemName: "Designer - BST Keycharm Đồng Vọng", vendorName: "Freelancer - Khánh Vy", costAmount: 2500000, durationDays: 7, markupFactor: 1.5, paymentStatus: "Đã TT 100%", contractRef: "03/2026/HDKV-KM - KhanhVy/Thietkepackaging" },
          { stageKeyword: "Thiết kế", category: "Thiết kế", itemName: "Thiết kế phụ trợ BST Đồng Vọng", vendorName: "Freelancer - Hà Linh", costAmount: 2000000, durationDays: 5, markupFactor: 1.5, paymentStatus: "Đã TT 100%" },
          { stageKeyword: "Đóng gói", category: "In ấn", itemName: "In ấn packaging BST Đồng Vọng", vendorName: "Xưởng in", costAmount: 2117203, durationDays: 7, markupFactor: 1.5, paymentStatus: "Đã TT 100%" },
          { stageKeyword: "Kiểm hàng", category: "Media", itemName: "Chụp ảnh sản phẩm BST Đồng Vọng", vendorName: "Studio", costAmount: 500000, durationDays: 2, markupFactor: 1.5, paymentStatus: "Đã TT 100%" },
          { stageKeyword: "Chốt thiết kế", category: "Nội dung", itemName: "Copywriter - BST Gác đũa Đồng Vọng", vendorName: "Freelancer - Mavis", costAmount: 1500000, durationDays: 4, markupFactor: 1.5, paymentStatus: "Đã tạm ứng 50%", contractRef: "262805/HĐKV" },
        ],
      },
      {
        name: "HALONG RUM - Thiết Kế Label Đêm",
        description: "Thiết kế Label Đêm cho dự án HALONG RUM",
        budget: 12000000,
        businessUnit: "KM Gift",
        flowType: "customised",
        depositDate: "2026-11-05",
        customerName: "HALONG RUM",
        defaultMarkup: 1.6,
        completedSteps: 9,
        costs: [
          { stageKeyword: "Thiết kế", category: "Thiết kế", itemName: "Thiết kế Label Đêm", vendorName: "Freelancer - Hà Ngọc Khánh Linh", costAmount: 7500000, durationDays: 7, markupFactor: 1.6, paymentStatus: "Đã TT 100%", contractRef: "260905/HĐKV/KMCST" },
        ],
      },
      {
        name: "Maison Mùi - Brand Strategy & Storestyling",
        description: "Brand Strategy, Storestyling & Media Pre-launch (6 tháng)",
        budget: 320000000,
        businessUnit: "Homeplanner",
        flowType: "customised",
        depositDate: "2026-11-01",
        customerName: "Maison Mùi",
        defaultMarkup: 1.5,
        completedSteps: 4,
        costs: [
          { stageKeyword: "Thiết kế", category: "Chiến lược", itemName: "Brand Strategy & Storestyling", vendorName: "Freelancer - Nguyễn Hoàng Phương Thảo", costAmount: 70000000, durationDays: 30, markupFactor: 1.5, paymentStatus: "Đã tạm ứng 50%", contractRef: "20260821/KMCST-PYY" },
          { stageKeyword: "Sản xuất", category: "Media", itemName: "Media Pre-launch (6 tháng)", vendorName: "Freelancer - Thảo Vũ", costAmount: 132000000, durationDays: 180, markupFactor: 1.5, paymentStatus: "Chưa thanh toán" },
        ],
      },
      {
        name: "Viên Villa - Thiết Kế Biển Chỉ Dẫn & Không Gian",
        description: "Thiết kế biển chỉ dẫn Viên Villa & biển Khởi Minh",
        budget: 12000000,
        businessUnit: "Homeplanner",
        flowType: "customised",
        depositDate: "2026-11-12",
        customerName: "Viên Villa",
        defaultMarkup: 1.6,
        completedSteps: 3,
        costs: [
          { stageKeyword: "Thiết kế", category: "Thiết kế", itemName: "Thiết kế biển chỉ dẫn", vendorName: "Freelancer - Hà Ngọc Khánh Linh", costAmount: 4000000, durationDays: 7, markupFactor: 1.6, paymentStatus: "Chưa thanh toán" },
          { stageKeyword: "Thiết kế", category: "Thiết kế", itemName: "Thiết kế biển Khởi Minh", vendorName: "Freelancer - Hà Ngọc Khánh Linh", costAmount: 2500000, durationDays: 5, markupFactor: 1.6, paymentStatus: "Đã tạm ứng 50%", contractRef: "260806/HĐKV" },
        ],
      },
    ];

    const insProj = database.prepare(
      `INSERT INTO pm_projects (name, description, budget, status, business_unit, flow_type, deposit_date)
       VALUES (?, ?, ?, 'active', ?, ?, ?) RETURNING id`,
    );
    const insStage = database.prepare(
      `INSERT INTO pm_stages (project_id, step_order, title, description, sla_days, phase, start_date, end_date)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?) RETURNING id`,
    );
    const insTask = database.prepare(
      `INSERT INTO pm_tasks (project_id, stage_id, title, description, assigned_phone, deadline, progress, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    );
    const insCost = database.prepare(
      `INSERT INTO pm_project_costs
        (project_id, stage_id, category, item_name, vendor_name, cost_amount, quantity, unit, duration_days, markup_factor, description_specs, payment_status, contract_ref)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    );
    const insQuote = database.prepare(
      `INSERT OR IGNORE INTO pm_quotations (project_id, customer_name, customer_rep, quote_date, title, client_tier, default_markup, vat_percent)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    );

    for (const sp of seedPortfolio) {
      const pRow = insProj.get(
        sp.name,
        sp.description,
        sp.budget,
        sp.businessUnit,
        sp.flowType,
        sp.depositDate,
      ) as { id: number };

      const schedule = calculateKmGiftSchedule({
        flowType: sp.flowType,
        depositDate: sp.depositDate,
      });

      const createdStages: Array<{ id: number; title: string }> = [];
      for (const st of schedule) {
        const sRow = insStage.get(
          pRow.id,
          st.stepOrder,
          st.title,
          `SLA: ${st.slaDays} ngày (${st.startDate} → ${st.endDate})`,
          st.slaDays,
          st.phase,
          st.startDate,
          st.endDate,
        ) as { id: number };
        createdStages.push({ id: sRow.id, title: st.title });

        const isDone = st.stepOrder <= sp.completedSteps;
        const isInProgress = st.stepOrder === sp.completedSteps + 1;
        insTask.run(
          pRow.id,
          sRow.id,
          st.defaultTaskTitle,
          `Mốc SLA: ${st.startDate} → ${st.endDate} (${st.slaDays} ngày)`,
          null,
          st.endDate,
          isDone ? 100 : isInProgress ? 40 : 0,
          isDone ? "completed" : isInProgress ? "in_progress" : "pending",
        );
      }

      for (const cItem of sp.costs) {
        const matchStage =
          createdStages.find((cs) => cs.title.includes(cItem.stageKeyword)) ?? createdStages[0];
        insCost.run(
          pRow.id,
          matchStage ? matchStage.id : null,
          cItem.category,
          cItem.itemName,
          cItem.vendorName,
          cItem.costAmount,
          cItem.quantity ?? 1,
          cItem.unit ?? "gói",
          cItem.durationDays,
          cItem.markupFactor,
          cItem.specs ?? "",
          cItem.paymentStatus,
          cItem.contractRef ?? "",
        );
      }

      insQuote.run(
        pRow.id,
        sp.customerName,
        "",
        sp.depositDate,
        `BÁO GIÁ ${sp.name.toUpperCase()}`,
        "Doanh nghiệp",
        sp.defaultMarkup,
        8,
      );
    }
  }

  // Migration cột last_report và backfill đầu mục công việc con (checklist) cho pm_tasks
  const taskCols = new Set(
    (database.prepare("PRAGMA table_info(pm_tasks)").all() as { name: string }[]).map((r) => r.name),
  );
  if (!taskCols.has("last_report")) {
    database.exec("ALTER TABLE pm_tasks ADD COLUMN last_report TEXT DEFAULT ''");
  }

  const tasksWithoutChecklist = database
    .prepare(
      `SELECT t.id, t.progress, t.status, s.title as stage_title
       FROM pm_tasks t
       LEFT JOIN pm_stages s ON t.stage_id = s.id
       WHERE t.checklist IS NULL OR t.checklist = '' OR t.checklist = '[]'`,
    )
    .all() as Array<{ id: number; progress: number; status: string; stage_title?: string }>;

  if (tasksWithoutChecklist.length > 0) {
    const updTaskCl = database.prepare(
      "UPDATE pm_tasks SET checklist = ?, progress = ?, status = ? WHERE id = ?",
    );
    for (const row of tasksWithoutChecklist) {
      const tpl = KM_GIFT_CUSTOMISED_FLOW.find(
        (s) => row.stage_title && (s.title === row.stage_title || row.stage_title.includes(s.title)),
      );
      const rawItems = tpl?.defaultChecklist ?? [
        "Tiếp nhận yêu cầu & lên kế hoạch",
        "Triển khai thực hiện",
        "Kiểm tra & bàn giao hoàn tất",
      ];
      const targetDone =
        row.status === "completed" || row.status === "done" || (row.progress || 0) >= 100
          ? rawItems.length
          : (row.progress || 0) > 0
            ? Math.max(1, Math.floor((rawItems.length * (row.progress || 0)) / 100))
            : 0;
      const cl = rawItems.map((txt, idx) => ({
        id: `${row.id}_${idx + 1}`,
        text: txt,
        done: idx < targetDone,
      }));
      const newPct = Math.round((targetDone / cl.length) * 100);
      const newStatus = newPct >= 100 ? "completed" : newPct > 0 ? "in_progress" : "pending";
      updTaskCl.run(JSON.stringify(cl), newPct, newStatus, row.id);
    }
  }
}

export function closeDatabase(): void {
  db.close();
}
