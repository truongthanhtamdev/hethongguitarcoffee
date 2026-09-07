/**
 * Khoá học quay sẵn có thu tiền.
 *
 * Giáo viên tự soạn giáo trình, tự đặt giá và gửi duyệt; quản trị duyệt xong
 * khoá mới lên trang công khai. Bán được thì chia đôi doanh thu với nền tảng
 * — tỉ lệ nằm trên từng khoá nên khoá nào thoả thuận khác cũng được.
 *
 * Khoá đệm hát cơ bản 28 bài không đi qua đây: nó là giáo trình cứng của
 * trung tâm trong curriculum.ts và luôn miễn phí.
 */

import { db } from "./db";

/** Phần trăm giáo viên hưởng khi chưa thoả thuận gì khác. */
export const HOA_HONG_MAC_DINH = 50;

export type CourseStatus = "draft" | "pending" | "published" | "hidden";

export interface Course {
  id: number;
  slug: string;
  teacher_id: number | null;
  teacher_name: string;
  name: string;
  tagline: string;
  price: number;
  price_old: number;
  commission_percent: number;
  /** Mỗi dòng một ý */
  ket_qua: string;
  noi_dung: string;
  danh_cho: string;
  status: CourseStatus;
  reject_note: string | null;
  created_at: string;
  updated_at: string;
  published_at: string | null;
}

export interface CourseLesson {
  id: number;
  course_id: number;
  position: number;
  title: string;
  description: string | null;
  video: string | null;
  free_preview: number;
}

/** 800000 -> "800.000 ₫" */
export function tienVN(n: number): string {
  return `${n.toLocaleString("vi-VN")} ₫`;
}

/** Số tiền giáo viên nhận cho một lượt bán khoá này. */
export function hoaHongCuaKhoa(c: Pick<Course, "price" | "commission_percent">): number {
  return Math.round((c.price * c.commission_percent) / 100);
}

/** Tách ô nhập nhiều dòng thành danh sách, bỏ dòng trống. */
export function tachDong(s: string): string[] {
  return s
    .split("\n")
    .map((d) => d.trim())
    .filter(Boolean);
}

const DAU = "àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ";
const KHONG_DAU = "aaaaaaaaaaaaaaaaaeeeeeeeeeeeiiiiiooooooooooooooooouuuuuuuuuuuyyyyyd";

/** "Fingerpicking nâng cao" -> "fingerpicking-nang-cao" */
export function taoSlug(ten: string): string {
  const s = [...ten.toLowerCase()]
    .map((c) => {
      const i = DAU.indexOf(c);
      return i >= 0 ? KHONG_DAU[i] : c;
    })
    .join("");
  return s.replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60) || "khoa-hoc";
}

/** Thêm hậu tố khi trùng: fingerpicking, fingerpicking-2, fingerpicking-3... */
export function slugChuaDung(goc: string): string {
  let slug = goc;
  let n = 2;
  while (db.prepare("SELECT 1 FROM courses WHERE slug = ?").get(slug)) {
    slug = `${goc}-${n++}`;
  }
  return slug;
}

export function courseById(id: number): Course | undefined {
  return db.prepare("SELECT * FROM courses WHERE id = ?").get(id) as Course | undefined;
}

export function courseBySlug(slug: string): Course | undefined {
  return db.prepare("SELECT * FROM courses WHERE slug = ?").get(slug) as Course | undefined;
}

/** Khoá đang bán trên trang công khai. */
export function khoaDangBan(): Course[] {
  return db
    .prepare("SELECT * FROM courses WHERE status = 'published' ORDER BY published_at DESC, id DESC")
    .all() as Course[];
}

export function khoaCuaGiaoVien(teacherId: number): Course[] {
  return db
    .prepare("SELECT * FROM courses WHERE teacher_id = ? ORDER BY id DESC")
    .all(teacherId) as Course[];
}

export function tatCaKhoa(): Course[] {
  return db.prepare("SELECT * FROM courses ORDER BY id DESC").all() as Course[];
}

export function khoaChoDuyet(): Course[] {
  return db
    .prepare("SELECT * FROM courses WHERE status = 'pending' ORDER BY updated_at")
    .all() as Course[];
}

export function baiCuaKhoa(courseId: number): CourseLesson[] {
  return db
    .prepare("SELECT * FROM course_lessons WHERE course_id = ? ORDER BY position, id")
    .all(courseId) as CourseLesson[];
}

export function demBai(courseId: number): number {
  const r = db
    .prepare("SELECT COUNT(*) AS c FROM course_lessons WHERE course_id = ?")
    .get(courseId) as { c: number };
  return r.c;
}

/**
 * Khoá gửi duyệt được chưa. Kiểm ở một chỗ để trang giáo viên và server action
 * cùng nói một điều — không thì nút hiện ra mà bấm vào lại báo lỗi.
 */
export function thieuGiDeGuiDuyet(c: Course): string[] {
  const thieu: string[] = [];
  if (!c.name.trim()) thieu.push("tên khoá");
  if (!c.tagline.trim()) thieu.push("giới thiệu ngắn");
  if (c.price <= 0) thieu.push("giá bán");
  if (tachDong(c.ket_qua).length === 0) thieu.push("phần học xong làm được gì");
  if (tachDong(c.noi_dung).length === 0) thieu.push("nội dung khoá học");
  if (demBai(c.id) === 0) thieu.push("ít nhất một bài giảng");
  return thieu;
}

export const NHAN_TRANG_THAI: Record<
  CourseStatus,
  { chu: string; tone: "neutral" | "amber" | "mint" }
> = {
  draft: { chu: "Đang soạn", tone: "neutral" },
  pending: { chu: "Chờ duyệt", tone: "amber" },
  published: { chu: "Đang bán", tone: "mint" },
  hidden: { chu: "Đã ẩn", tone: "neutral" },
};
