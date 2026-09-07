"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { assertRole } from "@/lib/guard";
import {
  HOA_HONG_MAC_DINH,
  courseById,
  slugChuaDung,
  taoSlug,
  thieuGiDeGuiDuyet,
} from "@/lib/courses";

export interface CourseFormState {
  error?: string;
  ok?: boolean;
}

/**
 * Khoá đang bán thì không cho sửa lung tung: người đã trả tiền mua một khoá cụ
 * thể, đổi giá hay đổi nội dung sau lưng họ là không được. Muốn sửa thì ẩn
 * khoá đi đã.
 */
function khoaCuaToi(id: number, teacherId: number) {
  const c = courseById(id);
  if (!c || c.teacher_id !== teacherId) return undefined;
  return c;
}

function soTien(raw: FormDataEntryValue | null): number {
  const n = Number(String(raw ?? "").replace(/[^0-9]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

/** Tạo khoá mới ở trạng thái nháp rồi mở luôn trang soạn. */
export async function taoKhoaAction(
  _prev: CourseFormState,
  formData: FormData
): Promise<CourseFormState> {
  const session = await assertRole(["teacher"]);
  const name = String(formData.get("name") || "").trim();
  if (!name) return { error: "Bạn đặt tên khoá đã nhé" };

  const info = db
    .prepare(
      `INSERT INTO courses (slug, teacher_id, teacher_name, name, commission_percent)
       VALUES (?, ?, ?, ?, ?)`
    )
    .run(slugChuaDung(taoSlug(name)), session.userId, session.name, name, HOA_HONG_MAC_DINH);

  redirect(`/teacher/khoa-hoc/${Number(info.lastInsertRowid)}`);
}

export async function suaKhoaAction(
  _prev: CourseFormState,
  formData: FormData
): Promise<CourseFormState> {
  const session = await assertRole(["teacher"]);
  const id = Number(formData.get("id"));
  const c = khoaCuaToi(id, session.userId);
  if (!c) return { error: "Không tìm thấy khoá này" };
  if (c.status === "published") {
    return { error: "Khoá đang bán thì không sửa được. Bấm Ẩn khoá trước rồi sửa." };
  }

  const name = String(formData.get("name") || "").trim();
  if (!name) return { error: "Tên khoá không được để trống" };

  const price = soTien(formData.get("price"));
  const priceOld = soTien(formData.get("price_old"));
  if (priceOld > 0 && priceOld <= price) {
    return { error: "Giá gốc phải lớn hơn giá bán, không thì bỏ trống" };
  }

  db.prepare(
    `UPDATE courses
        SET name = @name, tagline = @tagline, price = @price, price_old = @priceOld,
            ket_qua = @ketQua, noi_dung = @noiDung, danh_cho = @danhCho,
            updated_at = datetime('now')
      WHERE id = @id`
  ).run({
    id,
    name,
    tagline: String(formData.get("tagline") || "").trim(),
    price,
    priceOld,
    ketQua: String(formData.get("ket_qua") || "").trim(),
    noiDung: String(formData.get("noi_dung") || "").trim(),
    danhCho: String(formData.get("danh_cho") || "").trim(),
  });

  revalidatePath(`/teacher/khoa-hoc/${id}`);
  return { ok: true };
}

export async function themBaiAction(
  _prev: CourseFormState,
  formData: FormData
): Promise<CourseFormState> {
  const session = await assertRole(["teacher"]);
  const courseId = Number(formData.get("course_id"));
  const c = khoaCuaToi(courseId, session.userId);
  if (!c) return { error: "Không tìm thấy khoá này" };

  const title = String(formData.get("title") || "").trim();
  if (!title) return { error: "Bài giảng cần có tên" };

  const max = db
    .prepare("SELECT COALESCE(MAX(position), 0) AS m FROM course_lessons WHERE course_id = ?")
    .get(courseId) as { m: number };

  db.prepare(
    `INSERT INTO course_lessons (course_id, position, title, description, video, free_preview)
     VALUES (?, ?, ?, ?, ?, ?)`
  ).run(
    courseId,
    max.m + 1,
    title,
    String(formData.get("description") || "").trim() || null,
    String(formData.get("video") || "").trim() || null,
    formData.get("free_preview") ? 1 : 0
  );

  revalidatePath(`/teacher/khoa-hoc/${courseId}`);
  return { ok: true };
}

export async function xoaBaiAction(lessonId: number) {
  const session = await assertRole(["teacher"]);
  const bai = db.prepare("SELECT course_id FROM course_lessons WHERE id = ?").get(lessonId) as
    | { course_id: number }
    | undefined;
  if (!bai || !khoaCuaToi(bai.course_id, session.userId)) return;

  db.prepare("DELETE FROM course_lessons WHERE id = ?").run(lessonId);
  revalidatePath(`/teacher/khoa-hoc/${bai.course_id}`);
}

/** Đổi chỗ một bài lên trên hoặc xuống dưới. */
export async function doiThuTuBaiAction(lessonId: number, huong: "len" | "xuong") {
  const session = await assertRole(["teacher"]);
  const bai = db
    .prepare("SELECT id, course_id, position FROM course_lessons WHERE id = ?")
    .get(lessonId) as { id: number; course_id: number; position: number } | undefined;
  if (!bai || !khoaCuaToi(bai.course_id, session.userId)) return;

  const hangXom = db
    .prepare(
      huong === "len"
        ? "SELECT id, position FROM course_lessons WHERE course_id = ? AND position < ? ORDER BY position DESC LIMIT 1"
        : "SELECT id, position FROM course_lessons WHERE course_id = ? AND position > ? ORDER BY position LIMIT 1"
    )
    .get(bai.course_id, bai.position) as { id: number; position: number } | undefined;
  if (!hangXom) return;

  db.transaction(() => {
    const upd = db.prepare("UPDATE course_lessons SET position = ? WHERE id = ?");
    upd.run(hangXom.position, bai.id);
    upd.run(bai.position, hangXom.id);
  })();

  revalidatePath(`/teacher/khoa-hoc/${bai.course_id}`);
}

export async function guiDuyetAction(courseId: number): Promise<{ error?: string }> {
  const session = await assertRole(["teacher"]);
  const c = khoaCuaToi(courseId, session.userId);
  if (!c) return { error: "Không tìm thấy khoá này" };
  if (c.status === "pending") return { error: "Khoá đang chờ duyệt rồi" };
  if (c.status === "published") return { error: "Khoá đang bán rồi" };

  const thieu = thieuGiDeGuiDuyet(c);
  if (thieu.length > 0) return { error: `Còn thiếu: ${thieu.join(", ")}` };

  db.prepare(
    "UPDATE courses SET status = 'pending', reject_note = NULL, updated_at = datetime('now') WHERE id = ?"
  ).run(courseId);

  revalidatePath(`/teacher/khoa-hoc/${courseId}`);
  revalidatePath("/admin/khoa-hoc");
  return {};
}

/** Giáo viên rút khoá về sửa. Người đã mua vẫn xem được, chỉ là ngừng bán. */
export async function anKhoaAction(courseId: number) {
  const session = await assertRole(["teacher"]);
  if (!khoaCuaToi(courseId, session.userId)) return;

  db.prepare(
    "UPDATE courses SET status = 'hidden', updated_at = datetime('now') WHERE id = ? AND status IN ('published','pending')"
  ).run(courseId);

  revalidatePath(`/teacher/khoa-hoc/${courseId}`);
  revalidatePath("/khoa-hoc");
}

export async function xoaKhoaAction(courseId: number): Promise<{ error?: string }> {
  const session = await assertRole(["teacher"]);
  const c = khoaCuaToi(courseId, session.userId);
  if (!c) return { error: "Không tìm thấy khoá này" };

  const daBan = db
    .prepare("SELECT COUNT(*) AS c FROM course_orders WHERE course_slug = ? AND status = 'paid'")
    .get(c.slug) as { c: number };
  if (daBan.c > 0) {
    return { error: "Khoá đã có người mua nên không xoá được. Bạn ẩn khoá đi là ngừng bán." };
  }

  db.prepare("DELETE FROM courses WHERE id = ?").run(courseId);
  redirect("/teacher/khoa-hoc");
}

// ----- Quản trị duyệt -----

export async function duyetKhoaAction(courseId: number) {
  await assertRole(["admin"]);
  db.prepare(
    `UPDATE courses
        SET status = 'published', reject_note = NULL,
            published_at = COALESCE(published_at, datetime('now')),
            updated_at = datetime('now')
      WHERE id = ?`
  ).run(courseId);

  revalidatePath("/admin/khoa-hoc");
  revalidatePath("/khoa-hoc");
}

export async function traLaiKhoaAction(courseId: number, lyDo: string) {
  await assertRole(["admin"]);
  db.prepare(
    "UPDATE courses SET status = 'draft', reject_note = ?, updated_at = datetime('now') WHERE id = ?"
  ).run(lyDo.trim() || null, courseId);

  revalidatePath("/admin/khoa-hoc");
}

export async function ngungBanKhoaAction(courseId: number) {
  await assertRole(["admin"]);
  db.prepare(
    "UPDATE courses SET status = 'hidden', updated_at = datetime('now') WHERE id = ?"
  ).run(courseId);

  revalidatePath("/admin/khoa-hoc");
  revalidatePath("/khoa-hoc");
}

/** Quản trị đổi tỉ lệ ăn chia của một khoá. */
export async function doiTiLeChiaAction(courseId: number, phanTram: number) {
  await assertRole(["admin"]);
  const p = Math.max(0, Math.min(100, Math.round(phanTram)));
  db.prepare(
    "UPDATE courses SET commission_percent = ?, updated_at = datetime('now') WHERE id = ?"
  ).run(p, courseId);

  revalidatePath("/admin/khoa-hoc");
  revalidatePath("/teacher/khoa-hoc");
}
