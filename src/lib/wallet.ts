import { db } from "./db";

export interface WalletEntry {
  id: number;
  user_id: number;
  amount: number;
  kind: "topup" | "purchase" | "refund" | "adjust";
  note: string | null;
  course_order_id: number | null;
  created_at: string;
}

export interface TopupRow {
  id: number;
  user_id: number;
  amount: number;
  method: "transfer" | "cash";
  note: string | null;
  status: string;
  created_at: string;
  handled_at: string | null;
  user_name?: string;
  user_phone?: string | null;
  user_email?: string;
}

/** Số dư = tổng các dòng trong sổ ví. */
export function soDu(userId: number): number {
  const r = db
    .prepare("SELECT COALESCE(SUM(amount), 0) AS s FROM wallet_entries WHERE user_id = ?")
    .get(userId) as { s: number };
  return r.s;
}

export function soDuNhieuNguoi(userIds: number[]): Map<number, number> {
  const m = new Map<number, number>();
  if (userIds.length === 0) return m;
  const rows = db
    .prepare(
      `SELECT user_id, COALESCE(SUM(amount), 0) AS s
         FROM wallet_entries
        WHERE user_id IN (${userIds.map(() => "?").join(",")})
        GROUP BY user_id`
    )
    .all(...userIds) as { user_id: number; s: number }[];
  for (const r of rows) m.set(r.user_id, r.s);
  return m;
}

export function soGhiVi(userId: number, gioiHan = 50): WalletEntry[] {
  return db
    .prepare("SELECT * FROM wallet_entries WHERE user_id = ? ORDER BY id DESC LIMIT ?")
    .all(userId, gioiHan) as WalletEntry[];
}

export function yeuCauNapCuaToi(userId: number): TopupRow[] {
  return db
    .prepare("SELECT * FROM wallet_topups WHERE user_id = ? ORDER BY id DESC LIMIT 20")
    .all(userId) as TopupRow[];
}

export function tatCaYeuCauNap(): TopupRow[] {
  return db
    .prepare(
      `SELECT t.*, u.name AS user_name, u.phone AS user_phone, u.email AS user_email
         FROM wallet_topups t
         JOIN users u ON u.id = t.user_id
        ORDER BY t.id DESC`
    )
    .all() as TopupRow[];
}

export function demYeuCauNapCho(): number {
  const r = db
    .prepare("SELECT COUNT(*) AS c FROM wallet_topups WHERE status = 'new'")
    .get() as { c: number };
  return r.c;
}

export const NHAN_GHI_VI: Record<WalletEntry["kind"], string> = {
  topup: "Nạp tiền",
  purchase: "Mua khoá học",
  refund: "Hoàn tiền",
  adjust: "Điều chỉnh",
};
