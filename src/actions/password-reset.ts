"use server";

import crypto from "crypto";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getUserByEmailOrPhone } from "@/lib/auth";
import { assertRole } from "@/lib/guard";

export interface QuenMatKhauState {
  error?: string;
  ok?: boolean;
}

/**
 * Khách báo quên mật khẩu. Chưa có dịch vụ gửi email nên không dựng link đặt
 * lại tự động: yêu cầu vào bảng password_resets, quản trị gọi lại xác nhận
 * đúng người rồi cấp mật khẩu tạm.
 */
export async function baoQuenMatKhauAction(
  _prev: QuenMatKhauState,
  formData: FormData
): Promise<QuenMatKhauState> {
  const contact = String(formData.get("contact") || "").trim();
  if (!contact) return { error: "Bạn nhập email hoặc số điện thoại đã đăng ký nhé" };

  const user = getUserByEmailOrPhone(contact);

  // Gửi đi rồi mới tra tài khoản, và câu trả lời luôn giống nhau — không để
  // người lạ dò xem email nào đã có tài khoản.
  db.prepare("INSERT INTO password_resets (user_id, contact) VALUES (?, ?)").run(
    user?.id ?? null,
    contact
  );

  revalidatePath("/admin/quen-mat-khau");
  return { ok: true };
}

/** Mật khẩu tạm đọc qua điện thoại: bỏ các ký tự dễ nghe nhầm (0/O, 1/l/I). */
function matKhauTam(): string {
  const chars = "abcdefghijkmnpqrstuvwxyz23456789";
  const bytes = crypto.randomBytes(8);
  return [...bytes].map((b) => chars[b % chars.length]).join("");
}

export interface CapMatKhauKetQua {
  error?: string;
  matKhau?: string;
}

/**
 * Quản trị cấp mật khẩu tạm cho một yêu cầu. Trả về mật khẩu để đọc cho khách
 * ngay lúc đang gọi — chỗ này là lần duy nhất nó hiện ra, trong cơ sở dữ liệu
 * chỉ còn bản băm.
 */
export async function capMatKhauTamAction(resetId: number): Promise<CapMatKhauKetQua> {
  const session = await assertRole(["admin", "coordinator"]);

  const yeuCau = db
    .prepare("SELECT id, user_id, status FROM password_resets WHERE id = ?")
    .get(resetId) as { id: number; user_id: number | null; status: string } | undefined;

  if (!yeuCau) return { error: "Không tìm thấy yêu cầu này" };
  if (yeuCau.status !== "new") return { error: "Yêu cầu này đã xử lý rồi" };
  if (!yeuCau.user_id) {
    return { error: "Email/SĐT này chưa có tài khoản — gọi hỏi lại khách rồi tạo tài khoản mới" };
  }

  const matKhau = matKhauTam();
  db.transaction(() => {
    db.prepare("UPDATE users SET password_hash = ? WHERE id = ?").run(
      bcrypt.hashSync(matKhau, 10),
      yeuCau.user_id
    );
    db.prepare(
      "UPDATE password_resets SET status = 'done', handled_at = datetime('now'), handled_by = ? WHERE id = ?"
    ).run(session.userId, resetId);
  })();

  revalidatePath("/admin/quen-mat-khau");
  return { matKhau };
}

export async function huyYeuCauAction(resetId: number) {
  const session = await assertRole(["admin", "coordinator"]);
  db.prepare(
    "UPDATE password_resets SET status = 'cancelled', handled_at = datetime('now'), handled_by = ? WHERE id = ? AND status = 'new'"
  ).run(session.userId, resetId);
  revalidatePath("/admin/quen-mat-khau");
}
