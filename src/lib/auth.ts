import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { db } from "./db";
import type { Role, UserRow } from "./types";

const SECRET = process.env.AUTH_SECRET || "musicnote-dev-secret-change-me";
const COOKIE_NAME = "musicnote_session";

export interface SessionPayload {
  userId: number;
  role: Role;
  name: string;
}

export function signSession(payload: SessionPayload): string {
  return jwt.sign(payload, SECRET, { expiresIn: "30d" });
}

export function verifySession(token: string): SessionPayload | null {
  try {
    return jwt.verify(token, SECRET) as SessionPayload;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<SessionPayload | null> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySession(token);
}

export async function setSessionCookie(payload: SessionPayload) {
  const store = await cookies();
  store.set(COOKIE_NAME, signSession(payload), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.COOKIE_SECURE === "true",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function clearSessionCookie() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

export function getUserById(id: number): UserRow | undefined {
  return db.prepare("SELECT * FROM users WHERE id = ?").get(id) as UserRow | undefined;
}

export function getUserByEmail(email: string): UserRow | undefined {
  return db
    .prepare("SELECT * FROM users WHERE email = ? COLLATE NOCASE")
    .get(email) as UserRow | undefined;
}

/**
 * Tra tài khoản theo email hoặc số điện thoại — form đăng nhập nhận cả hai.
 * Số điện thoại được so sánh sau khi bỏ khoảng trắng, dấu chấm và gạch ngang,
 * vì người dùng gõ "0912 345 678" còn trung tâm nhập "0912345678".
 */
export function getUserByEmailOrPhone(input: string): UserRow | undefined {
  const byEmail = getUserByEmail(input);
  if (byEmail) return byEmail;

  const digits = input.replace(/[^0-9]/g, "");
  if (digits.length < 8) return undefined;

  return db
    .prepare(
      `SELECT * FROM users
       WHERE phone IS NOT NULL
         AND REPLACE(REPLACE(REPLACE(REPLACE(phone, ' ', ''), '-', ''), '.', ''), '+', '') = ?
       ORDER BY active DESC, id
       LIMIT 1`
    )
    .get(digits) as UserRow | undefined;
}

export const COOKIE = COOKIE_NAME;
