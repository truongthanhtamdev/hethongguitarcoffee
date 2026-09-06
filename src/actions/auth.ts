"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import {
  clearSessionCookie,
  getUserByEmail,
  getUserByEmailOrPhone,
  setSessionCookie,
} from "@/lib/auth";
import { db } from "@/lib/db";
import { roleHomePath } from "@/lib/types";

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
    return { error: "Vui lòng nhập email và mật khẩu" };
  }

  const user = getUserByEmailOrPhone(email);
  if (!user || !user.active) {
    return { error: "Email hoặc mật khẩu không đúng" };
  }

  const ok = bcrypt.compareSync(password, user.password_hash);
  if (!ok) {
    return { error: "Email hoặc mật khẩu không đúng" };
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
  const email = String(formData.get("email") || "").trim();
  const phone = String(formData.get("phone") || "").trim();
  const password = String(formData.get("password") || "");
  const confirm = String(formData.get("confirm") || "");

  if (!name || !email || !password) {
    return { error: "Vui lòng nhập họ tên, email và mật khẩu" };
  }
  if (!EMAIL_RE.test(email)) {
    return { error: "Email chưa đúng định dạng" };
  }
  if (password.length < 6) {
    return { error: "Mật khẩu cần ít nhất 6 ký tự" };
  }
  if (password !== confirm) {
    return { error: "Mật khẩu nhập lại không khớp" };
  }
  if (getUserByEmail(email)) {
    return { error: "Email này đã có tài khoản. Bạn đăng nhập nhé." };
  }

  let userId: number;
  try {
    const info = db
      .prepare(
        `INSERT INTO users (name, email, password_hash, role, phone, active)
         VALUES (@name, @email, @password_hash, 'student', @phone, 1)`
      )
      .run({
        name,
        email,
        password_hash: bcrypt.hashSync(password, 10),
        phone: phone || null,
      });
    userId = Number(info.lastInsertRowid);
  } catch (err) {
    // Hai người đăng ký cùng email gần như cùng lúc: UNIQUE(email) sẽ chặn ở đây.
    if ((err as { code?: string }).code === "SQLITE_CONSTRAINT_UNIQUE") {
      return { error: "Email này đã có tài khoản. Bạn đăng nhập nhé." };
    }
    throw err;
  }

  await setSessionCookie({ userId, role: "student", name });
  redirect("/student/learn");
}
