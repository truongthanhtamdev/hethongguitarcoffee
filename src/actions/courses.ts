"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { assertRole } from "@/lib/guard";
import { courseBySlug, hoaHongCuaKhoa } from "@/lib/courses";
import { giaoVienCuaKhoa } from "@/lib/course-sales";

export interface CourseOrderState {
  error?: string;
  ok?: boolean;
  /** Giữ lại những gì khách đã gõ để form không bị xoá trắng khi báo lỗi. */
  values?: { name: string; phone: string; note: string };
}

function normPhone(raw: string): string {
  const d = raw.replace(/[^0-9+]/g, "").replace(/^\+84/, "0");
  return /^0\d{8,10}$/.test(d) ? d : "";
}

/**
 * Khách đăng ký mua khoá. Chưa thu tiền ở bước này — đơn nằm chờ, quản trị gọi
 * lại thu tiền rồi mới mở khoá. Giá và hoa hồng lấy từ dữ liệu máy chủ theo
 * slug, không lấy từ form.
 */
export async function datMuaKhoaHocAction(
  _prev: CourseOrderState,
  formData: FormData
): Promise<CourseOrderState> {
  const slug = String(formData.get("slug") || "");
  const name = String(formData.get("name") || "").trim();
  const phoneRaw = String(formData.get("phone") || "");
  const phone = normPhone(phoneRaw);
  const note = String(formData.get("note") || "").trim();

  const daNhap = { name, phone: phoneRaw, note };
  const loi = (m: string): CourseOrderState => ({ error: m, values: daNhap });

  const course = courseBySlug(slug);
  if (!course || !course.active) return loi("Khoá học này hiện không mở đăng ký");
  if (!name) return loi("Bạn nhập giúp họ tên nhé");
  if (!phone) return loi("Số điện thoại chưa đúng. Ví dụ: 0912345678");

  const session = await getSession();
  const teacher = giaoVienCuaKhoa(course);

  db.prepare(
    `INSERT INTO course_orders
       (course_slug, course_name, price, customer_name, customer_phone, note,
        user_id, teacher_id, commission_percent, commission_amount)
     VALUES (@slug, @cname, @price, @name, @phone, @note,
             @userId, @teacherId, @percent, @amount)`
  ).run({
    slug,
    cname: course.name,
    price: course.price,
    name,
    phone,
    note: note || null,
    userId: session?.userId ?? null,
    teacherId: teacher?.id ?? null,
    percent: course.commissionPercent,
    amount: hoaHongCuaKhoa(course),
  });

  revalidatePath("/admin/khoa-hoc");
  return { ok: true };
}

/**
 * Quản trị xác nhận đã thu được tiền: mở khoá cho học viên và chốt hoa hồng.
 * Chỉ mở được khi đơn gắn với một tài khoản — khách mua lúc chưa đăng nhập thì
 * phải gắn tài khoản trước, không thì không biết mở cho ai.
 */
export async function xacNhanDaThuTienAction(orderId: number): Promise<{ error?: string }> {
  const session = await assertRole(["admin", "coordinator"]);

  const don = db.prepare("SELECT * FROM course_orders WHERE id = ?").get(orderId) as
    | { id: number; status: string; user_id: number | null; course_slug: string }
    | undefined;

  if (!don) return { error: "Không tìm thấy đơn này" };
  if (don.status !== "new") return { error: "Đơn này đã xử lý rồi" };
  if (!don.user_id) {
    return {
      error:
        "Đơn chưa gắn tài khoản. Bảo khách đăng ký tài khoản bằng đúng số điện thoại này rồi bấm Gắn tài khoản.",
    };
  }

  db.transaction(() => {
    db.prepare(
      "UPDATE course_orders SET status = 'paid', paid_at = datetime('now'), handled_by = ? WHERE id = ?"
    ).run(session.userId, orderId);
    db.prepare(
      `INSERT INTO course_access (user_id, course_slug, order_id, granted_by)
       VALUES (?, ?, ?, ?)
       ON CONFLICT(user_id, course_slug) DO NOTHING`
    ).run(don.user_id, don.course_slug, orderId, session.userId);
  })();

  revalidatePath("/admin/khoa-hoc");
  revalidatePath("/teacher/hoa-hong");
  return {};
}

/**
 * Gắn đơn với tài khoản học viên trùng số điện thoại. Khách hay đặt mua trước
 * rồi mới đăng ký tài khoản, nên phải nối lại được.
 */
export async function ganTaiKhoanChoDonAction(orderId: number): Promise<{ error?: string }> {
  await assertRole(["admin", "coordinator"]);

  const don = db.prepare("SELECT * FROM course_orders WHERE id = ?").get(orderId) as
    | { id: number; customer_phone: string; user_id: number | null }
    | undefined;
  if (!don) return { error: "Không tìm thấy đơn này" };
  if (don.user_id) return {};

  const user = db
    .prepare("SELECT id FROM users WHERE phone = ? AND role = 'student' AND active = 1")
    .get(don.customer_phone) as { id: number } | undefined;

  if (!user) {
    return { error: `Chưa có tài khoản học viên nào dùng số ${don.customer_phone}` };
  }

  db.prepare("UPDATE course_orders SET user_id = ? WHERE id = ?").run(user.id, orderId);
  revalidatePath("/admin/khoa-hoc");
  return {};
}

export async function huyDonKhoaHocAction(orderId: number) {
  const session = await assertRole(["admin", "coordinator"]);
  db.prepare(
    "UPDATE course_orders SET status = 'cancelled', handled_by = ? WHERE id = ? AND status = 'new'"
  ).run(session.userId, orderId);
  revalidatePath("/admin/khoa-hoc");
}

/** Đánh dấu đã trả hoa hồng cho giáo viên. Bấm lại lần nữa là bỏ đánh dấu. */
export async function danhDauTraHoaHongAction(orderId: number, daTra: boolean) {
  await assertRole(["admin"]);
  db.prepare(
    "UPDATE course_orders SET commission_paid_at = ? WHERE id = ? AND status = 'paid'"
  ).run(daTra ? new Date().toISOString().slice(0, 19).replace("T", " ") : null, orderId);
  revalidatePath("/admin/khoa-hoc");
  revalidatePath("/teacher/hoa-hong");
}

/** Tặng khoá cho một học viên (ví dụ học viên đang học lớp tại quán). */
export async function tangKhoaAction(userId: number, slug: string): Promise<{ error?: string }> {
  const session = await assertRole(["admin"]);
  if (!courseBySlug(slug)) return { error: "Không có khoá này" };

  db.prepare(
    `INSERT INTO course_access (user_id, course_slug, granted_by)
     VALUES (?, ?, ?)
     ON CONFLICT(user_id, course_slug) DO NOTHING`
  ).run(userId, slug, session.userId);

  revalidatePath("/admin/khoa-hoc");
  return {};
}
