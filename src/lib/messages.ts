import { db } from "./db";
import type { Role, UserRow } from "./types";

export interface MessageRow {
  id: number;
  from_user_id: number;
  to_user_id: number;
  body: string;
  read_at: string | null;
  created_at: string;
}

/** Một dòng trong danh sách trò chuyện: người bên kia + tin gần nhất. */
export interface ThreadRow {
  userId: number;
  name: string;
  role: Role;
  lastBody: string;
  lastAt: string;
  lastFromMe: number;
  unread: number;
}

const STAFF: Role[] = ["admin", "coordinator"];

/**
 * Ai được nhắn cho ai. Quy tắc:
 * - Quản trị và giáo vụ nhắn được với tất cả, và ai cũng nhắn ngược lại được.
 * - Giáo viên và học viên chỉ nhắn được khi có ít nhất một lớp chung.
 *
 * Kiểm ở đây chứ không chỉ ẩn nút trên giao diện: người dùng gõ tay id là
 * qua được lớp giao diện.
 */
export function canMessage(a: UserRow, b: UserRow): boolean {
  if (a.id === b.id) return false;
  if (!a.active || !b.active) return false;
  if (STAFF.includes(a.role) || STAFF.includes(b.role)) return true;

  const teacher = a.role === "teacher" ? a : b.role === "teacher" ? b : null;
  const student = a.role === "student" ? a : b.role === "student" ? b : null;
  if (!teacher || !student) return false;

  const row = db
    .prepare(
      "SELECT 1 FROM classes WHERE teacher_id = ? AND student_user_id = ? LIMIT 1"
    )
    .get(teacher.id, student.id);
  return !!row;
}

/** Những người mà `user` được phép mở lời nhắn trước. */
export function listContacts(user: UserRow): UserRow[] {
  if (STAFF.includes(user.role)) {
    return db
      .prepare("SELECT * FROM users WHERE id != ? AND active = 1 ORDER BY role, name")
      .all(user.id) as UserRow[];
  }

  if (user.role === "teacher") {
    return db
      .prepare(
        `SELECT DISTINCT u.* FROM users u
         JOIN classes c ON c.student_user_id = u.id
         WHERE c.teacher_id = ? AND u.active = 1
         UNION
         SELECT * FROM users WHERE role IN ('admin','coordinator') AND active = 1
         ORDER BY name`
      )
      .all(user.id) as UserRow[];
  }

  // Học viên: giáo viên của các lớp mình đang học, cộng thêm quản trị.
  return db
    .prepare(
      `SELECT DISTINCT u.* FROM users u
       JOIN classes c ON c.teacher_id = u.id
       WHERE c.student_user_id = ? AND u.active = 1
       UNION
       SELECT * FROM users WHERE role IN ('admin','coordinator') AND active = 1
       ORDER BY name`
    )
    .all(user.id) as UserRow[];
}

/** Danh sách trò chuyện, mới nhất lên đầu. */
export function listThreads(userId: number): ThreadRow[] {
  return db
    .prepare(
      `WITH doi_phuong AS (
         SELECT
           CASE WHEN from_user_id = @me THEN to_user_id ELSE from_user_id END AS other_id,
           id, body, created_at, from_user_id, to_user_id, read_at
         FROM messages
         WHERE from_user_id = @me OR to_user_id = @me
       ),
       moi_nhat AS (
         SELECT other_id, MAX(id) AS max_id FROM doi_phuong GROUP BY other_id
       )
       SELECT
         u.id   AS userId,
         u.name AS name,
         u.role AS role,
         d.body AS lastBody,
         d.created_at AS lastAt,
         CASE WHEN d.from_user_id = @me THEN 1 ELSE 0 END AS lastFromMe,
         (SELECT COUNT(*) FROM messages m
           WHERE m.to_user_id = @me AND m.from_user_id = u.id AND m.read_at IS NULL) AS unread
       FROM moi_nhat mn
       JOIN doi_phuong d ON d.id = mn.max_id
       JOIN users u ON u.id = mn.other_id
       ORDER BY d.id DESC`
    )
    .all({ me: userId }) as ThreadRow[];
}

export function listMessages(userId: number, otherId: number): MessageRow[] {
  return db
    .prepare(
      `SELECT * FROM messages
       WHERE (from_user_id = @me AND to_user_id = @other)
          OR (from_user_id = @other AND to_user_id = @me)
       ORDER BY id`
    )
    .all({ me: userId, other: otherId }) as MessageRow[];
}

export function sendMessage(fromId: number, toId: number, body: string) {
  db.prepare("INSERT INTO messages (from_user_id, to_user_id, body) VALUES (?, ?, ?)").run(
    fromId,
    toId,
    body
  );
}

/** Đánh dấu đã đọc mọi tin người kia gửi cho mình. */
export function markThreadRead(userId: number, otherId: number) {
  db.prepare(
    `UPDATE messages SET read_at = datetime('now')
     WHERE to_user_id = ? AND from_user_id = ? AND read_at IS NULL`
  ).run(userId, otherId);
}

export function countUnread(userId: number): number {
  const row = db
    .prepare("SELECT COUNT(*) AS c FROM messages WHERE to_user_id = ? AND read_at IS NULL")
    .get(userId) as { c: number };
  return row.c;
}
