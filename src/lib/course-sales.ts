import { db } from "./db";
import { COURSES, courseBySlug, hoaHongCuaKhoa, type Course } from "./courses";

export interface CourseOrderRow {
  id: number;
  course_slug: string;
  course_name: string;
  price: number;
  customer_name: string;
  customer_phone: string;
  note: string | null;
  user_id: number | null;
  teacher_id: number | null;
  commission_percent: number;
  commission_amount: number;
  commission_paid_at: string | null;
  status: string;
  created_at: string;
  paid_at: string | null;
}

/**
 * Tài khoản giáo viên đứng khoá. Khoá khai báo bằng email nên khi chưa tạo tài
 * khoản cho giáo viên đó, hàm trả về undefined — đơn vẫn ghi hoa hồng, chỉ là
 * chưa gắn được vào ai.
 */
export function giaoVienCuaKhoa(c: Course): { id: number; name: string } | undefined {
  return db
    .prepare("SELECT id, name FROM users WHERE email = ? AND role = 'teacher' AND active = 1")
    .get(c.teacherEmail) as { id: number; name: string } | undefined;
}

export function coQuyenXem(userId: number, slug: string): boolean {
  const row = db
    .prepare("SELECT 1 FROM course_access WHERE user_id = ? AND course_slug = ?")
    .get(userId, slug);
  return !!row;
}

/** Các khoá có thu tiền mà học viên này đã được mở. */
export function khoaDaMua(userId: number): Course[] {
  const slugs = db
    .prepare("SELECT course_slug FROM course_access WHERE user_id = ?")
    .all(userId) as { course_slug: string }[];
  return slugs
    .map((s) => courseBySlug(s.course_slug))
    .filter((c): c is Course => !!c);
}

/** Đơn học viên này đã gửi nhưng chưa thu tiền xong — để khỏi mời mua lại. */
export function donDangChoCuaHocVien(userId: number, slug: string): CourseOrderRow | undefined {
  return db
    .prepare(
      "SELECT * FROM course_orders WHERE user_id = ? AND course_slug = ? AND status = 'new' ORDER BY id DESC LIMIT 1"
    )
    .get(userId, slug) as CourseOrderRow | undefined;
}

export function listCourseOrders(): CourseOrderRow[] {
  return db.prepare("SELECT * FROM course_orders ORDER BY id DESC").all() as CourseOrderRow[];
}

export function listCourseOrdersForTeacher(teacherId: number): CourseOrderRow[] {
  return db
    .prepare("SELECT * FROM course_orders WHERE teacher_id = ? ORDER BY id DESC")
    .all(teacherId) as CourseOrderRow[];
}

export interface HoaHongTongKet {
  daBan: number;
  daThu: number;
  hoaHongTong: number;
  hoaHongDaTra: number;
  hoaHongConNo: number;
}

/** Sổ hoa hồng của một giáo viên: chỉ tính các đơn đã thu được tiền. */
export function tongKetHoaHong(teacherId: number): HoaHongTongKet {
  const rows = db
    .prepare("SELECT * FROM course_orders WHERE teacher_id = ? AND status = 'paid'")
    .all(teacherId) as CourseOrderRow[];

  const hoaHongTong = rows.reduce((s, r) => s + r.commission_amount, 0);
  const hoaHongDaTra = rows
    .filter((r) => r.commission_paid_at)
    .reduce((s, r) => s + r.commission_amount, 0);

  return {
    daBan: rows.length,
    daThu: rows.reduce((s, r) => s + r.price, 0),
    hoaHongTong,
    hoaHongDaTra,
    hoaHongConNo: hoaHongTong - hoaHongDaTra,
  };
}

/** Khoá do giáo viên này đứng lớp — để hiện ở trang hoa hồng của họ. */
export function khoaCuaGiaoVien(teacherId: number): Course[] {
  return COURSES.filter((c) => giaoVienCuaKhoa(c)?.id === teacherId);
}

export { hoaHongCuaKhoa };
