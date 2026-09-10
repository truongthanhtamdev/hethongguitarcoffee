"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import {
  clearSessionCookie,
  getUserByEmail,
  getUserByEmailOrPhone,
  setSessionCookie,
} from "@/lib/auth";
import { chuanHoaSoDienThoai, emailTheoSoDienThoai } from "@/lib/format";
import { db } from "@/lib/db";
import { roleHomePath } from "@/lib/types";
import { KHU_VUC, NOI_HOC } from "@/components/brand";

export interface LoginState {
  error?: string;
}

export async function loginAction(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");
  const next = String(formData.get("next") || "");

  if (!email || !password) {
    return { error: "Vui lòng nhập số điện thoại (hoặc email) và mật khẩu" };
  }

  const user = getUserByEmailOrPhone(email);
  if (!user || !user.active) {
    return { error: "Số điện thoại/email hoặc mật khẩu không đúng" };
  }

  const ok = bcrypt.compareSync(password, user.password_hash);
  if (!ok) {
    return { error: "Số điện thoại/email hoặc mật khẩu không đúng" };
  }

  await setSessionCookie({ userId: user.id, role: user.role, name: user.name });

  if (next && next.startsWith("/")) {
    redirect(next);
  }
  redirect(roleHomePath(user.role));
}

export async function logoutAction() {
  await clearSessionCookie();
  redirect("/login");
}

export interface RegisterState {
  error?: string;
  /** React xoá trắng các ô nhập sau mỗi lần chạy form action — trả lại nguyên
   *  văn những gì khách đã gõ để báo lỗi xong không phải nhập lại từ đầu. */
  values?: { name: string; email: string; phone: string; branch: string; area: string };
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Khách tự tạo tài khoản. Luôn tạo với vai trò "student" — các vai trò khác
 * (giáo viên, điều phối, quản trị) vẫn chỉ do admin tạo trong khu vực quản lý,
 * nên form công khai này không nhận tham số role từ client.
 */
export async function registerAction(
  _prevState: RegisterState,
  formData: FormData
): Promise<RegisterState> {
  const name = String(formData.get("name") || "").trim();
  const emailNhap = String(formData.get("email") || "").trim();
  const phoneNhap = String(formData.get("phone") || "").trim();
  const password = String(formData.get("password") || "");
  const confirm = String(formData.get("confirm") || "");
  const branch = String(formData.get("branch") || "").trim();
  const area = String(formData.get("area") || "").trim();

  const daNhap = { name, email: emailNhap, phone: phoneNhap, branch, area };
  const loi = (m: string): RegisterState => ({ error: m, values: daNhap });

  if (!name || !password) {
    return loi("Vui lòng nhập họ tên và mật khẩu");
  }

  // Số điện thoại mới là thứ bắt buộc: khách ở đây gần như ai cũng có số, còn
  // email thì nhiều người không nhớ nổi mật khẩu hòm thư của mình.
  const phone = chuanHoaSoDienThoai(phoneNhap);
  if (!phone) {
    return loi("Số điện thoại chưa đúng. Ví dụ: 0912345678");
  }
  if (emailNhap && !EMAIL_RE.test(emailNhap)) {
    return loi("Email chưa đúng định dạng");
  }
  // Chỉ nhận đúng những lựa chọn có trong danh sách, không tin dữ liệu form.
  if (!NOI_HOC.includes(branch)) {
    return loi("Bạn chọn giúp nơi muốn học nhé");
  }
  if (!KHU_VUC.includes(area)) {
    return loi("Bạn chọn giúp khu vực đang ở nhé");
  }
  if (password.length < 6) {
    return loi("Mật khẩu cần ít nhất 6 ký tự");
  }
  if (password !== confirm) {
    return loi("Mật khẩu nhập lại không khớp");
  }
  if (getUserByEmailOrPhone(phone)) {
    return loi("Số điện thoại này đã có tài khoản. Bạn đăng nhập nhé.");
  }
  if (emailNhap && getUserByEmail(emailNhap)) {
    return loi("Email này đã có tài khoản. Bạn đăng nhập nhé.");
  }

  const email = emailNhap || emailTheoSoDienThoai(phone);

  let userId: number;
  try {
    const info = db
      .prepare(
        `INSERT INTO users (name, email, password_hash, role, phone, branch, area, active)
         VALUES (@name, @email, @password_hash, 'student', @phone, @branch, @area, 1)`
      )
      .run({
        name,
        email,
        password_hash: bcrypt.hashSync(password, 10),
        phone,
        branch,
        area,
      });
    userId = Number(info.lastInsertRowid);
  } catch (err) {
    // Hai người đăng ký cùng lúc bằng cùng email/số: UNIQUE(email) chặn ở đây.
    if ((err as { code?: string }).code === "SQLITE_CONSTRAINT_UNIQUE") {
      return loi("Số điện thoại hoặc email này đã có tài khoản. Bạn đăng nhập nhé.");
    }
    throw err;
  }

  await setSessionCookie({ userId, role: "student", name });
  redirect("/student/learn");
}
