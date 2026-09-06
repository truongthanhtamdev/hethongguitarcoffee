import { db } from "./db";
import { listClassesForStudent } from "./queries";
import { TOTAL_LESSONS, nextLesson, stageOf, type Lesson, type Stage } from "./curriculum";

/** Ngày hôm nay theo giờ máy chủ, dạng YYYY-MM-DD (khớp cách attendance lưu ngày). */
export function todayISO(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export interface LearningState {
  done: number[];
  chords: string[];
  minutesToday: number;
  totalMinutes: number;
  practiceDays: number;
  streak: number;
  next: Lesson;
  stage: Stage;
  completedCount: number;
  percent: number;
  /** Số buổi giáo viên đã điểm danh có mặt, để đối chiếu với tiến độ tự học. */
  attendedSessions: number;
}

export function listDoneLessons(userId: number): number[] {
  const rows = db
    .prepare("SELECT lesson_no FROM learning_progress WHERE user_id = ? ORDER BY lesson_no")
    .all(userId) as { lesson_no: number }[];
  return rows.map((r) => r.lesson_no);
}

export function listLearnedChords(userId: number): string[] {
  const rows = db
    .prepare("SELECT chord FROM learned_chords WHERE user_id = ? ORDER BY learned_at")
    .all(userId) as { chord: string }[];
  return rows.map((r) => r.chord);
}

/**
 * Chuỗi ngày luyện liên tiếp tính ngược từ hôm nay. Nếu hôm nay chưa luyện thì
 * bắt đầu đếm từ hôm qua, để chuỗi không bị coi là đứt ngay đầu ngày.
 */
export function practiceStreak(userId: number): number {
  const rows = db
    .prepare(
      "SELECT practice_date FROM practice_log WHERE user_id = ? AND minutes >= 0 ORDER BY practice_date DESC LIMIT 400"
    )
    .all(userId) as { practice_date: string }[];
  const days = new Set(rows.map((r) => r.practice_date));
  if (days.size === 0) return 0;

  const cursor = new Date();
  const iso = (d: Date) => {
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  };
  if (!days.has(iso(cursor))) cursor.setDate(cursor.getDate() - 1);

  let streak = 0;
  while (days.has(iso(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

function countAttendedSessions(studentUserId: number): number {
  const classes = listClassesForStudent(studentUserId);
  if (classes.length === 0) return 0;
  const ids = classes.map((c) => c.id);
  const placeholders = ids.map(() => "?").join(",");
  const row = db
    .prepare(
      `SELECT COUNT(*) AS c FROM attendance
       WHERE class_id IN (${placeholders}) AND status = 'completed'`
    )
    .get(...ids) as { c: number };
  return row.c;
}

export function getLearningState(userId: number): LearningState {
  const done = listDoneLessons(userId);
  const chords = listLearnedChords(userId);
  const next = nextLesson(done);

  const today = db
    .prepare("SELECT minutes FROM practice_log WHERE user_id = ? AND practice_date = ?")
    .get(userId, todayISO()) as { minutes: number } | undefined;

  const totals = db
    .prepare(
      "SELECT COALESCE(SUM(minutes), 0) AS total, COUNT(*) AS days FROM practice_log WHERE user_id = ?"
    )
    .get(userId) as { total: number; days: number };

  return {
    done,
    chords,
    minutesToday: today?.minutes ?? 0,
    totalMinutes: totals.total,
    practiceDays: totals.days,
    streak: practiceStreak(userId),
    next,
    stage: stageOf(next.n),
    completedCount: done.length,
    percent: Math.round((done.length / TOTAL_LESSONS) * 100),
    attendedSessions: countAttendedSessions(userId),
  };
}

/**
 * Số buổi tự học đã xong của nhiều học viên trong một truy vấn, cho các bảng
 * danh sách bên quản trị (tránh gọi getLearningState cho từng dòng).
 */
export function countDoneLessonsByUser(userIds: number[]): Map<number, number> {
  const result = new Map<number, number>();
  if (userIds.length === 0) return result;

  const placeholders = userIds.map(() => "?").join(",");
  const rows = db
    .prepare(
      `SELECT user_id, COUNT(*) AS c FROM learning_progress
       WHERE user_id IN (${placeholders}) GROUP BY user_id`
    )
    .all(...userIds) as { user_id: number; c: number }[];

  for (const r of rows) result.set(r.user_id, r.c);
  return result;
}

export function setLessonDone(userId: number, lessonNo: number, done: boolean) {
  if (done) {
    db.prepare(
      "INSERT OR IGNORE INTO learning_progress (user_id, lesson_no) VALUES (?, ?)"
    ).run(userId, lessonNo);
  } else {
    db.prepare("DELETE FROM learning_progress WHERE user_id = ? AND lesson_no = ?").run(
      userId,
      lessonNo
    );
  }
}

export function setChordLearned(userId: number, chord: string, learned: boolean) {
  if (learned) {
    db.prepare("INSERT OR IGNORE INTO learned_chords (user_id, chord) VALUES (?, ?)").run(
      userId,
      chord
    );
  } else {
    db.prepare("DELETE FROM learned_chords WHERE user_id = ? AND chord = ?").run(userId, chord);
  }
}

/** Cộng thêm số phút luyện vào hôm nay. minutes = 0 vẫn ghi nhận "có mở app luyện". */
export function addPracticeMinutes(userId: number, minutes: number) {
  db.prepare(
    `INSERT INTO practice_log (user_id, practice_date, minutes) VALUES (?, ?, ?)
     ON CONFLICT(user_id, practice_date) DO UPDATE SET minutes = minutes + excluded.minutes`
  ).run(userId, todayISO(), Math.max(0, Math.round(minutes)));
}
