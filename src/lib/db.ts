import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { DAY_ORDER, TIME_SLOTS } from "./types";
import { addMinutesToTime } from "./format";

const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), "data");
if (!fs.existsSync(/* turbopackIgnore: true */ DATA_DIR)) {
  fs.mkdirSync(/* turbopackIgnore: true */ DATA_DIR, { recursive: true });
}
const DB_PATH = path.join(DATA_DIR, "musicnote.db");

declare global {
  var __musicnoteDb: Database.Database | undefined;
}

function createConnection() {
  const db = new Database(DB_PATH);
  // Set busy_timeout FIRST: several worker processes can import this module
  // concurrently against the same file (e.g. during `next build`), and even
  // the journal_mode/foreign_keys pragmas below can need a brief write lock
  // (e.g. while another worker is mid-migration). Waiting for that lock
  // instead of failing immediately requires busy_timeout to already be set
  // before any other statement runs on this connection.
  db.pragma("busy_timeout = 5000");
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  return db;
}

export const db = global.__musicnoteDb ?? createConnection();
if (process.env.NODE_ENV !== "production") global.__musicnoteDb = db;

function migrate() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('admin','coordinator','teacher','student')),
      phone TEXT,
      pay_per_session INTEGER,
      languages TEXT NOT NULL DEFAULT 'vi',
      subjects TEXT NOT NULL DEFAULT '',
      active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS packages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      total_sessions INTEGER NOT NULL,
      started_at TEXT NOT NULL,
      -- A manually-entered baseline for "sessions used" (e.g. backfilling an
      -- old class that already had N sessions before it was entered into the
      -- system). From the moment it's set, the count becomes
      -- used_override + completed attendance recorded after
      -- used_override_set_at — so it keeps counting up automatically rather
      -- than freezing. NULL means use the plain computed count.
      used_override INTEGER,
      used_override_set_at TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS classes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_name TEXT NOT NULL,
      student_phone TEXT,
      guardian_name TEXT,
      student_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      level TEXT,
      subject TEXT NOT NULL DEFAULT 'Guitar',
      schedule_type TEXT NOT NULL DEFAULT 'fixed' CHECK(schedule_type IN ('fixed','flexible')),
      language TEXT NOT NULL DEFAULT 'vi' CHECK(language IN ('vi','en')),
      source TEXT NOT NULL DEFAULT 'center' CHECK(source IN ('center','self')),
      package_total_sessions INTEGER,
      package_started_at TEXT,
      package_id INTEGER REFERENCES packages(id) ON DELETE SET NULL,
      day_of_week INTEGER NOT NULL,
      start_time TEXT NOT NULL,
      duration_minutes INTEGER NOT NULL DEFAULT 60,
      teacher_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active','paused','ended')),
      notes TEXT,
      -- Set when this class is created (or later assigned a teacher) through
      -- the normal admin "giao lớp mới" flow — marks that its very next
      -- recorded attendance should count as the trial session. Left off for
      -- a teacher's own self-added classes, since those are often old
      -- classes being backfilled rather than genuinely new assignments.
      trial_pending INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- Each row is a half-hour block the teacher has marked BUSY (personal,
    -- not already covered by a class) — the grid defaults every other slot
    -- to free, so teachers only need to mark exceptions.
    CREATE TABLE IF NOT EXISTS availability (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      teacher_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      day_of_week INTEGER NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      UNIQUE(teacher_id, day_of_week, start_time)
    );

    CREATE TABLE IF NOT EXISTS schema_migrations (
      name TEXT PRIMARY KEY,
      applied_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS attendance (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      class_id INTEGER NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
      teacher_id INTEGER NOT NULL REFERENCES users(id),
      session_date TEXT NOT NULL,
      status TEXT NOT NULL CHECK(status IN ('completed','teacher_absent','student_absent','rescheduled')),
      check_in_time TEXT,
      check_out_time TEXT,
      fb_checkin_confirmed INTEGER NOT NULL DEFAULT 0,
      lesson_content TEXT,
      is_trial INTEGER NOT NULL DEFAULT 0,
      note TEXT,
      rescheduled_to_date TEXT,
      rescheduled_to_time TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(class_id, session_date)
    );

    CREATE TABLE IF NOT EXISTS payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      class_id INTEGER REFERENCES classes(id) ON DELETE SET NULL,
      amount INTEGER NOT NULL,
      paid_at TEXT NOT NULL,
      note TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS expenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category TEXT NOT NULL DEFAULT 'Quảng cáo (Ads)',
      amount INTEGER NOT NULL,
      expense_date TEXT NOT NULL,
      note TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      message TEXT NOT NULL,
      class_id INTEGER REFERENCES classes(id) ON DELETE SET NULL,
      read_at TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- Tiến độ tự học của học viên trong phần "Học guitar" (28 bài).
    -- Tách khỏi attendance: attendance là buổi đã dạy có giáo viên điểm danh,
    -- còn đây là bài học viên tự đánh dấu đã làm xong ở nhà.
    CREATE TABLE IF NOT EXISTS learning_progress (
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      lesson_no INTEGER NOT NULL,
      completed_at TEXT NOT NULL DEFAULT (datetime('now')),
      PRIMARY KEY (user_id, lesson_no)
    );

    CREATE TABLE IF NOT EXISTS learned_chords (
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      chord TEXT NOT NULL,
      learned_at TEXT NOT NULL DEFAULT (datetime('now')),
      PRIMARY KEY (user_id, chord)
    );

    -- Mỗi ngày một dòng, cộng dồn số phút luyện tập để tính chuỗi ngày liên tiếp.
    CREATE TABLE IF NOT EXISTS practice_log (
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      practice_date TEXT NOT NULL,
      minutes INTEGER NOT NULL DEFAULT 0,
      PRIMARY KEY (user_id, practice_date)
    );

    -- Tin nhắn 1-1 giữa hai người dùng. Không có bảng "cuộc trò chuyện" riêng:
    -- một cuộc trò chuyện chính là toàn bộ tin nhắn giữa một cặp user, nên
    -- không phải giữ hai bảng khớp nhau.
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      from_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      to_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      body TEXT NOT NULL,
      read_at TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_messages_cap ON messages(from_user_id, to_user_id, id);
    CREATE INDEX IF NOT EXISTS idx_messages_chua_doc ON messages(to_user_id, read_at);

    -- Don dat dan khach gui tu trang ban hang. Khong buoc phai dang nhap:
    -- khach de lai ten va so dien thoai la trung tam goi lai duoc.
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_slug TEXT NOT NULL,
      product_name TEXT NOT NULL,
      product_price TEXT NOT NULL,
      customer_name TEXT NOT NULL,
      customer_phone TEXT NOT NULL,
      customer_address TEXT,
      note TEXT,
      user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      status TEXT NOT NULL DEFAULT 'new' CHECK(status IN ('new','contacted','done','cancelled')),
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_orders_moi ON orders(status, id);

    -- Học viên quên mật khẩu. Hệ thống chưa gửi được email nên không dùng link
    -- đặt lại tự động: khách bấm "Quên mật khẩu", yêu cầu rơi vào đây, quản trị
    -- gọi lại xác nhận rồi cấp một mật khẩu tạm đọc qua điện thoại/Zalo.
    CREATE TABLE IF NOT EXISTS password_resets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      -- Nguyên văn email/SĐT khách gõ, kể cả khi không khớp tài khoản nào:
      -- gõ nhầm một chữ cũng là lý do hay gặp, giữ lại để còn gọi hỏi.
      contact TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'new' CHECK(status IN ('new','done','cancelled')),
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      handled_at TEXT,
      handled_by INTEGER REFERENCES users(id) ON DELETE SET NULL
    );

    CREATE INDEX IF NOT EXISTS idx_password_resets_moi ON password_resets(status, id);

    -- Khoá học quay sẵn có thu tiền. Giáo viên tự soạn giáo trình và tự đăng
    -- khoá; quản trị duyệt rồi mới lên trang công khai. Doanh thu chia đôi với
    -- nền tảng — tỉ lệ ghi ngay trên khoá để mỗi khoá thoả thuận riêng được.
    --
    -- Khoá đệm hát 28 bài KHÔNG nằm ở đây: nó là giáo trình cứng của trung tâm
    -- trong src/lib/curriculum.ts và luôn miễn phí.
    CREATE TABLE IF NOT EXISTS courses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT UNIQUE NOT NULL,
      teacher_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      -- Tên hiển thị chép lại, để khoá vẫn đứng tên đúng người kể cả khi tài
      -- khoản giáo viên bị xoá.
      teacher_name TEXT NOT NULL,
      name TEXT NOT NULL,
      tagline TEXT NOT NULL DEFAULT '',
      price INTEGER NOT NULL DEFAULT 0,
      price_old INTEGER NOT NULL DEFAULT 0,
      commission_percent INTEGER NOT NULL DEFAULT 50,
      -- Ba ô nội dung nhập nhiều dòng, mỗi dòng một ý.
      ket_qua TEXT NOT NULL DEFAULT '',
      noi_dung TEXT NOT NULL DEFAULT '',
      danh_cho TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'draft'
        CHECK(status IN ('draft','pending','published','hidden')),
      -- Lý do quản trị trả lại, để giáo viên biết đường sửa.
      reject_note TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      published_at TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_courses_teacher ON courses(teacher_id);
    CREATE INDEX IF NOT EXISTS idx_courses_status ON courses(status);

    -- Từng bài trong khoá của giáo viên.
    CREATE TABLE IF NOT EXISTS course_lessons (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
      position INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      /* Link YouTube hoặc file video. Rỗng nghĩa là chưa quay xong. */
      video TEXT,
      /* Bài cho xem thử ngay trên trang bán, chưa mua cũng xem được. */
      free_preview INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_course_lessons ON course_lessons(course_id, position);

    -- Đơn mua khoá học quay sẵn có thu tiền (khoá đệm hát 28 bài vẫn miễn phí,
    -- không đi qua bảng này).
    --
    -- Giá, tên khoá và hoa hồng đều chép lại vào đơn chứ không tra ngược sang
    -- danh sách khoá: sau này đổi giá hay đổi tỉ lệ chia thì các đơn cũ vẫn
    -- giữ đúng con số lúc chốt, không thì sổ hoa hồng sai hết.
    CREATE TABLE IF NOT EXISTS course_orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      course_slug TEXT NOT NULL,
      course_name TEXT NOT NULL,
      price INTEGER NOT NULL,
      customer_name TEXT NOT NULL,
      customer_phone TEXT NOT NULL,
      note TEXT,
      user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      -- Giáo viên đứng khoá, người được chia hoa hồng. Rỗng khi khoá chưa gắn
      -- được với tài khoản giáo viên nào — lúc đó hoa hồng vẫn ghi nhận để
      -- quản trị tự đối chiếu.
      teacher_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      commission_percent INTEGER NOT NULL DEFAULT 0,
      commission_amount INTEGER NOT NULL DEFAULT 0,
      commission_paid_at TEXT,
      status TEXT NOT NULL DEFAULT 'new' CHECK(status IN ('new','paid','cancelled')),
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      paid_at TEXT,
      handled_by INTEGER REFERENCES users(id) ON DELETE SET NULL
    );

    CREATE INDEX IF NOT EXISTS idx_course_orders_moi ON course_orders(status, id);
    CREATE INDEX IF NOT EXISTS idx_course_orders_teacher ON course_orders(teacher_id, status);

    -- Đăng ký học thử. Khách vãng lai lẫn học viên đã có tài khoản đều gửi
    -- được, nên user_id để rỗng cũng không sao — cái cần là số điện thoại để
    -- gọi lại xếp lịch.
    CREATE TABLE IF NOT EXISTS trial_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      /* Học tại quán, online theo nhóm, hay kèm 1 kèm 1 */
      hinh_thuc TEXT NOT NULL,
      /* Chi nhánh muốn tới, rỗng khi học online */
      branch TEXT,
      /* Khu vực đang ở — để biết nên mở quán tiếp ở đâu */
      area TEXT,
      /* Khung giờ khách rảnh, khách tự gõ */
      thoi_gian TEXT,
      note TEXT,
      status TEXT NOT NULL DEFAULT 'new'
        CHECK(status IN ('new','contacted','scheduled','done','cancelled')),
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      handled_at TEXT,
      handled_by INTEGER REFERENCES users(id) ON DELETE SET NULL
    );

    CREATE INDEX IF NOT EXISTS idx_trial_moi ON trial_requests(status, id);
    CREATE INDEX IF NOT EXISTS idx_trial_user ON trial_requests(user_id, id);

    -- Ví của học viên. Là sổ ghi từng lần cộng trừ chứ không phải một ô số dư:
    -- số dư = tổng các dòng. Cách này lúc lệch tiền còn lần ra được vì sao,
    -- chứ một ô số dư thì sửa xong không ai biết đường nào mà tra.
    CREATE TABLE IF NOT EXISTS wallet_entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      /* Dương là cộng vào ví, âm là trừ ra. */
      amount INTEGER NOT NULL,
      kind TEXT NOT NULL CHECK(kind IN ('topup','purchase','refund','adjust')),
      note TEXT,
      course_order_id INTEGER REFERENCES course_orders(id) ON DELETE SET NULL,
      created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_wallet_user ON wallet_entries(user_id, id);

    -- Học viên xin nạp tiền. Chưa có cổng thanh toán nên tiền vào ví chỉ khi
    -- quản trị xác nhận đã nhận được — chuyển khoản hay đưa tiền mặt tại quán.
    CREATE TABLE IF NOT EXISTS wallet_topups (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      amount INTEGER NOT NULL,
      method TEXT NOT NULL CHECK(method IN ('transfer','cash')),
      note TEXT,
      status TEXT NOT NULL DEFAULT 'new' CHECK(status IN ('new','done','cancelled')),
      entry_id INTEGER REFERENCES wallet_entries(id) ON DELETE SET NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      handled_at TEXT,
      handled_by INTEGER REFERENCES users(id) ON DELETE SET NULL
    );

    CREATE INDEX IF NOT EXISTS idx_wallet_topups_moi ON wallet_topups(status, id);

    -- Ai được xem khoá nào. Tách khỏi course_orders vì còn cấp tay: học viên
    -- đang học lớp tại quán có thể được tặng khoá mà không có đơn nào.
    CREATE TABLE IF NOT EXISTS course_access (
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      course_slug TEXT NOT NULL,
      order_id INTEGER REFERENCES course_orders(id) ON DELETE SET NULL,
      granted_at TEXT NOT NULL DEFAULT (datetime('now')),
      granted_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
      PRIMARY KEY (user_id, course_slug)
    );

    CREATE INDEX IF NOT EXISTS idx_classes_teacher ON classes(teacher_id);
    CREATE INDEX IF NOT EXISTS idx_classes_student_user ON classes(student_user_id);
    CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, read_at);
    CREATE INDEX IF NOT EXISTS idx_attendance_teacher_date ON attendance(teacher_id, session_date);
    CREATE INDEX IF NOT EXISTS idx_attendance_class_date ON attendance(class_id, session_date);
    CREATE INDEX IF NOT EXISTS idx_availability_teacher ON availability(teacher_id);
    CREATE INDEX IF NOT EXISTS idx_payments_paid_at ON payments(paid_at);
    CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(expense_date);
  `);

  // CREATE TABLE IF NOT EXISTS above only helps on a brand-new database file;
  // a database created before these columns existed needs them added
  // explicitly, or older deployments crash on the first query that touches
  // one of them.
  ensureColumn("classes", "guardian_name", "TEXT");
  ensureColumn("classes", "subject", "TEXT NOT NULL DEFAULT 'Guitar'");
  ensureColumn("classes", "schedule_type", "TEXT NOT NULL DEFAULT 'fixed'");
  ensureColumn("classes", "language", "TEXT NOT NULL DEFAULT 'vi'");
  ensureColumn("classes", "source", "TEXT NOT NULL DEFAULT 'center'");
  ensureColumn("classes", "student_user_id", "INTEGER REFERENCES users(id) ON DELETE SET NULL");
  ensureColumn("classes", "package_total_sessions", "INTEGER");
  ensureColumn("classes", "package_started_at", "TEXT");
  ensureColumn("classes", "package_id", "INTEGER REFERENCES packages(id) ON DELETE SET NULL");
  ensureColumn("packages", "used_override", "INTEGER");
  ensureColumn("packages", "used_override_set_at", "TEXT");
  ensureColumn("users", "languages", "TEXT NOT NULL DEFAULT 'vi'");
  ensureColumn("users", "subjects", "TEXT NOT NULL DEFAULT ''");
  ensureColumn("attendance", "lesson_content", "TEXT");
  ensureColumn("attendance", "is_trial", "INTEGER NOT NULL DEFAULT 0");
  ensureColumn("attendance", "rescheduled_to_date", "TEXT");
  ensureColumn("attendance", "rescheduled_to_time", "TEXT");
  ensureColumn("classes", "trial_pending", "INTEGER NOT NULL DEFAULT 0");
  ensureStudentRoleSupported();

  // Khách tự đăng ký chọn nơi muốn học và khu vực đang ở — để biết nên mở
  // thêm chi nhánh ở đâu.
  ensureColumn("users", "branch", "TEXT");
  ensureColumn("users", "area", "TEXT");
  migratePackagesToTable();
  invertAvailabilityToBusyOnce();
}

// Packages used to live as two columns directly on `classes`
// (package_total_sessions/package_started_at), one package per weekly slot.
// Now multiple weekly slots for the same student can share a single package
// pool via `classes.package_id` -> `packages`. Move any pre-existing
// per-class package data into its own `packages` row the first time this
// runs against an older database; the old columns are left in place
// unused (harmless) rather than dropped, since SQLite migrations that drop
// columns are riskier than they're worth here.
function migratePackagesToTable() {
  const rows = db
    .prepare(
      `SELECT id, package_total_sessions, package_started_at FROM classes
       WHERE package_total_sessions IS NOT NULL AND package_started_at IS NOT NULL AND package_id IS NULL`
    )
    .all() as { id: number; package_total_sessions: number; package_started_at: string }[];
  for (const r of rows) {
    const info = db
      .prepare("INSERT INTO packages (total_sessions, started_at) VALUES (?, ?)")
      .run(r.package_total_sessions, r.package_started_at);
    db.prepare("UPDATE classes SET package_id = ? WHERE id = ?").run(info.lastInsertRowid, r.id);
  }
}

// `availability` rows used to mean "teacher marked this half-hour as FREE"
// (opt-in; anything unmarked defaulted to busy). The grid now works the
// opposite way — unmarked defaults to free, and a row means "marked BUSY" —
// which is both a better default (most teachers are free most of the time)
// and lets the busy grid merge visually with the class-schedule grid. For
// any teacher who already recorded free slots under the old model, rebuild
// their rows as the exact complement over the standard grid so no
// information is lost: a previously-free slot stays free (no row), and
// every previously-unmarked (implicitly busy) slot gets an explicit busy
// row. Teachers who never touched the old grid are left with zero rows,
// which now correctly means "free all week" instead of "busy all week".
// Runs exactly once, guarded by schema_migrations.
function invertAvailabilityToBusyOnce() {
  const name = "invert_availability_to_busy";
  if (db.prepare("SELECT 1 FROM schema_migrations WHERE name = ?").get(name)) return;

  const run = db.transaction(() => {
    const wasFreeByTeacher = new Map<number, Set<string>>();
    for (const r of db
      .prepare("SELECT teacher_id, day_of_week, start_time FROM availability")
      .all() as { teacher_id: number; day_of_week: number; start_time: string }[]) {
      const set = wasFreeByTeacher.get(r.teacher_id) ?? new Set<string>();
      set.add(`${r.day_of_week}-${r.start_time}`);
      wasFreeByTeacher.set(r.teacher_id, set);
    }

    db.prepare("DELETE FROM availability").run();
    const insert = db.prepare(
      "INSERT INTO availability (teacher_id, day_of_week, start_time, end_time) VALUES (?, ?, ?, ?)"
    );
    for (const [teacherId, wasFree] of wasFreeByTeacher) {
      for (const day of DAY_ORDER) {
        for (const time of TIME_SLOTS) {
          if (!wasFree.has(`${day}-${time}`)) {
            insert.run(teacherId, day, time, addMinutesToTime(time, 30));
          }
        }
      }
    }
    db.prepare("INSERT INTO schema_migrations (name) VALUES (?)").run(name);
  });
  run();
}

function ensureColumn(table: string, column: string, definition: string) {
  const cols = db.prepare(`PRAGMA table_info(${table})`).all() as { name: string }[];
  if (!cols.some((c) => c.name === column)) {
    db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
  }
}

// SQLite can't ALTER a CHECK constraint in place. A database created before
// the 'student' role existed still has the old
// CHECK(role IN ('admin','coordinator','teacher')) baked into its schema, so
// inserting a student would fail — rebuild the table (preserving all rows)
// the one time that's detected.
function ensureStudentRoleSupported() {
  const rebuild = () => {
    const row = db
      .prepare("SELECT sql FROM sqlite_master WHERE type='table' AND name='users'")
      .get() as { sql: string } | undefined;
    if (!row || row.sql.includes("'student'")) return;

    db.exec(`
      ALTER TABLE users RENAME TO users_role_migration;
      CREATE TABLE users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL CHECK(role IN ('admin','coordinator','teacher','student')),
        phone TEXT,
        pay_per_session INTEGER,
        languages TEXT NOT NULL DEFAULT 'vi',
        subjects TEXT NOT NULL DEFAULT '',
        active INTEGER NOT NULL DEFAULT 1,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );
      INSERT INTO users SELECT * FROM users_role_migration;
      DROP TABLE users_role_migration;
    `);
  };

  // Exclusive transaction: several worker processes may import this module
  // concurrently against the same on-disk file (e.g. during `next build`).
  // The lock serializes them so only one actually rebuilds the table; the
  // others block, then see the 'student' role already present and no-op.
  try {
    db.transaction(rebuild).exclusive();
  } catch (err) {
    const code = (err as { code?: string }).code;
    if (code !== "SQLITE_BUSY") throw err;
  }
}

function seedInner() {
  const userCount = db.prepare("SELECT COUNT(*) as c FROM users").get() as { c: number };
  if (userCount.c > 0) return;

  // Mã nguồn để công khai nên không đặt sẵn mật khẩu trong code: đặt
  // ADMIN_PASSWORD lúc chạy. Không đặt thì sinh ngẫu nhiên và in ra log một
  // lần — thà bắt đi đọc log còn hơn để mật khẩu ai cũng đoán được.
  const email = process.env.ADMIN_EMAIL || "admin@musicnote.local";
  const password = process.env.ADMIN_PASSWORD || crypto.randomBytes(9).toString("base64url");

  db.prepare(
    `INSERT INTO users (name, email, password_hash, role, active)
     VALUES (@name, @email, @password_hash, 'admin', 1)`
  ).run({
    name: "Quản trị viên",
    email,
    password_hash: bcrypt.hashSync(password, 10),
  });

  if (!process.env.ADMIN_PASSWORD) {
    console.log(
      "\n=== TAI KHOAN QUAN TRI VUA TAO ===\n" +
        `  Email    : ${email}\n` +
        `  Mat khau : ${password}\n` +
        "  Doi mat khau ngay sau khi dang nhap lan dau.\n" +
        "==================================\n"
    );
  }
}

function seed() {
  // Exclusive transaction: several worker processes may import this module
  // concurrently against the same on-disk file (e.g. during `next build`).
  // The exclusive lock serializes them so only one actually inserts the
  // seed rows; the others block, then see userCount > 0 and no-op.
  try {
    db.transaction(seedInner).exclusive();
  } catch (err) {
    const code = (err as { code?: string }).code;
    if (code !== "SQLITE_CONSTRAINT_UNIQUE" && code !== "SQLITE_BUSY") throw err;
  }
}

migrate();
seed();
