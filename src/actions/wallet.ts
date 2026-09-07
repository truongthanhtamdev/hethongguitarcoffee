"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { assertRole } from "@/lib/guard";
import { getSession } from "@/lib/auth";
import { courseBySlug, hoaHongCuaKhoa } from "@/lib/courses";
import { coQuyenXem } from "@/lib/course-sales";
import { soDu } from "@/lib/wallet";

export interface TopupState {
  error?: string;
  ok?: boolean;
}

function soTien(raw: FormDataEntryValue | null): number {
  const n = Number(String(raw ?? "").replace(/[^0-9]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

/** Học viên xin nạp tiền. Tiền chỉ vào ví khi quản trị xác nhận đã nhận được. */
export async function xinNapTienAction(
  _prev: TopupState,
  formData: FormData
): Promise<TopupState> {
  const session = await assertRole(["student"]);
  const amount = soTien(formData.get("amount"));
  const method = String(formData.get("method") || "transfer");

  if (amount < 10_000) return { error: "Nạp ít nhất 10.000 ₫" };
  if (amount > 50_000_000) return { error: "Số tiền lớn quá, bạn gọi cho bên mình nhé" };
  if (method !== "transfer" && method !== "cash") return { error: "Chọn cách nạp giúp mình nhé" };

  const dangCho = db
    .prepare("SELECT COUNT(*) AS c FROM wallet_topups WHERE user_id = ? AND status = 'new'")
    .get(session.userId) as { c: number };
  if (dangCho.c >= 3) {
    return { error: "Bạn đang có yêu cầu nạp chờ xử lý rồi. Đợi bên mình xác nhận đã nhé." };
  }

  db.prepare(
    "INSERT INTO wallet_topups (user_id, amount, method, note) VALUES (?, ?, ?, ?)"
  ).run(session.userId, amount, method, String(formData.get("note") || "").trim() || null);

  revalidatePath("/student/vi");
  revalidatePath("/admin/vi");
  return { ok: true };
}

/** Quản trị xác nhận đã nhận tiền: cộng vào ví học viên. */
export async function duyetNapTienAction(topupId: number): Promise<{ error?: string }> {
  const session = await assertRole(["admin", "coordinator"]);

  const yc = db.prepare("SELECT * FROM wallet_topups WHERE id = ?").get(topupId) as
    | { id: number; user_id: number; amount: number; status: string }
    | undefined;
  if (!yc) return { error: "Không tìm thấy yêu cầu này" };
  if (yc.status !== "new") return { error: "Yêu cầu này xử lý rồi" };

  db.transaction(() => {
    const info = db
      .prepare(
        `INSERT INTO wallet_entries (user_id, amount, kind, note, created_by)
         VALUES (?, ?, 'topup', ?, ?)`
      )
      .run(yc.user_id, yc.amount, `Nạp tiền — yêu cầu #${yc.id}`, session.userId);

    db.prepare(
      `UPDATE wallet_topups
          SET status = 'done', entry_id = ?, handled_at = datetime('now'), handled_by = ?
        WHERE id = ?`
    ).run(Number(info.lastInsertRowid), session.userId, topupId);
  })();

  revalidatePath("/admin/vi");
  revalidatePath("/student/vi");
  return {};
}

export async function tuChoiNapTienAction(topupId: number) {
  const session = await assertRole(["admin", "coordinator"]);
  db.prepare(
    `UPDATE wallet_topups
        SET status = 'cancelled', handled_at = datetime('now'), handled_by = ?
      WHERE id = ? AND status = 'new'`
  ).run(session.userId, topupId);
  revalidatePath("/admin/vi");
}

/**
 * Quản trị cộng/trừ thẳng vào ví một học viên — nhận tiền mặt tại quán, tặng
 * tiền khuyến mãi, hay sửa lại một lần ghi nhầm.
 */
export async function congTienAction(
  _prev: TopupState,
  formData: FormData
): Promise<TopupState> {
  const session = await assertRole(["admin"]);
  const userId = Number(formData.get("user_id"));
  const amount = soTien(formData.get("amount"));
  const tru = !!formData.get("tru");
  const note = String(formData.get("note") || "").trim();

  if (!userId) return { error: "Chọn học viên đã nhé" };
  if (amount <= 0) return { error: "Nhập số tiền lớn hơn 0" };

  const hocVien = db
    .prepare("SELECT id FROM users WHERE id = ? AND role = 'student'")
    .get(userId) as { id: number } | undefined;
  if (!hocVien) return { error: "Không tìm thấy học viên này" };

  if (tru && soDu(userId) < amount) {
    return { error: "Ví của học viên không đủ để trừ chừng đó" };
  }

  db.prepare(
    `INSERT INTO wallet_entries (user_id, amount, kind, note, created_by)
     VALUES (?, ?, 'adjust', ?, ?)`
  ).run(userId, tru ? -amount : amount, note || null, session.userId);

  revalidatePath("/admin/vi");
  revalidatePath("/student/vi");
  return { ok: true };
}

/**
 * Học viên mua khoá bằng ví. Trừ tiền, ghi đơn đã thu và mở khoá trong cùng
 * một giao dịch — bấm hai lần hay hai tab cùng bấm cũng không trừ được hai
 * lần, vì số dư và quyền xem đều kiểm lại bên trong giao dịch.
 */
export async function muaBangViAction(slug: string): Promise<{ error?: string; ok?: boolean }> {
  const session = await getSession();
  if (!session || session.role !== "student") {
    return { error: "Bạn đăng nhập bằng tài khoản học viên để mua nhé" };
  }

  const course = courseBySlug(slug);
  if (!course || course.status !== "published") {
    return { error: "Khoá này hiện không mở bán" };
  }
  if (coQuyenXem(session.userId, slug)) return { ok: true };

  try {
    db.transaction(() => {
      const duCu = db
        .prepare("SELECT COALESCE(SUM(amount), 0) AS s FROM wallet_entries WHERE user_id = ?")
        .get(session.userId) as { s: number };
      if (duCu.s < course.price) throw new Error("KHONG_DU");

      const daCo = db
        .prepare("SELECT 1 FROM course_access WHERE user_id = ? AND course_slug = ?")
        .get(session.userId, slug);
      if (daCo) throw new Error("DA_CO");

      const don = db
        .prepare(
          `INSERT INTO course_orders
             (course_slug, course_name, price, customer_name, customer_phone, note,
              user_id, teacher_id, commission_percent, commission_amount,
              status, paid_at)
           VALUES (@slug, @cname, @price, @name, @phone, 'Mua bằng ví',
                   @userId, @teacherId, @percent, @amount,
                   'paid', datetime('now'))`
        )
        .run({
          slug,
          cname: course.name,
          price: course.price,
          name: session.name,
          phone:
            (
              db.prepare("SELECT phone FROM users WHERE id = ?").get(session.userId) as {
                phone: string | null;
              }
            )?.phone ?? "",
          userId: session.userId,
          teacherId: course.teacher_id,
          percent: course.commission_percent,
          amount: hoaHongCuaKhoa(course),
        });

      const donId = Number(don.lastInsertRowid);

      db.prepare(
        `INSERT INTO wallet_entries (user_id, amount, kind, note, course_order_id, created_by)
         VALUES (?, ?, 'purchase', ?, ?, ?)`
      ).run(session.userId, -course.price, course.name, donId, session.userId);

      db.prepare(
        `INSERT INTO course_access (user_id, course_slug, order_id, granted_by)
         VALUES (?, ?, ?, ?)`
      ).run(session.userId, slug, donId, session.userId);
    })();
  } catch (err) {
    const m = (err as Error).message;
    if (m === "KHONG_DU") return { error: "Ví không đủ tiền. Bạn nạp thêm rồi mua nhé." };
    if (m === "DA_CO") return { ok: true };
    throw err;
  }

  revalidatePath("/student/khoa-hoc");
  revalidatePath("/student/vi");
  revalidatePath(`/khoa-hoc/${slug}`);
  revalidatePath("/admin/khoa-hoc");
  return { ok: true };
}
