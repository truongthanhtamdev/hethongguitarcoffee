"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { assertRole } from "@/lib/guard";
import { HINH_THUC_HOC, KHU_VUC, BRAND } from "@/components/brand";

export interface TrialState {
  error?: string;
  ok?: boolean;
  /** React xoá trắng ô nhập sau mỗi lần chạy action — trả lại nguyên văn. */
  values?: {
    name: string;
    phone: string;
    hinhThuc: string;
    branch: string;
    area: string;
    thoiGian: string;
    note: string;
  };
}

function normPhone(raw: string): string {
  const d = raw.replace(/[^0-9+]/g, "").replace(/^\+84/, "0");
  return /^0\d{8,10}$/.test(d) ? d : "";
}

const TEN_CHI_NHANH = BRAND.branches.map((b) => b.name);

/**
 * Đăng ký học thử. Khách chưa có tài khoản cũng gửi được — bắt đăng ký trước
 * mới cho thử là mất khách.
 */
export async function dangKyHocThuAction(
  _prev: TrialState,
  formData: FormData
): Promise<TrialState> {
  const name = String(formData.get("name") || "").trim();
  const phoneRaw = String(formData.get("phone") || "");
  const phone = normPhone(phoneRaw);
  const hinhThuc = String(formData.get("hinh_thuc") || "");
  const branch = String(formData.get("branch") || "").trim();
  const area = String(formData.get("area") || "").trim();
  const thoiGian = String(formData.get("thoi_gian") || "").trim();
  const note = String(formData.get("note") || "").trim();

  const daNhap = { name, phone: phoneRaw, hinhThuc, branch, area, thoiGian, note };
  const loi = (m: string): TrialState => ({ error: m, values: daNhap });

  if (!name) return loi("Bạn nhập giúp họ tên nhé");
  if (!phone) return loi("Số điện thoại chưa đúng. Ví dụ: 0912345678");

  const ht = HINH_THUC_HOC.find((h) => h.id === hinhThuc);
  if (!ht) return loi("Bạn chọn giúp hình thức học nhé");

  // Học tại quán mới cần chi nhánh; học online thì không hỏi, và cũng không
  // nhận giá trị gửi lên để khỏi ghi dữ liệu vô nghĩa vào đơn.
  const chiNhanh = ht.canChiNhanh ? branch : "";
  if (ht.canChiNhanh && !TEN_CHI_NHANH.includes(chiNhanh)) {
    return loi("Bạn chọn giúp chi nhánh muốn tới nhé");
  }
  if (area && !KHU_VUC.includes(area)) return loi("Khu vực chưa hợp lệ");

  const session = await getSession();

  // Chặn gửi trùng: cùng số điện thoại đang có một đơn chưa xử lý thì thôi.
  const dangCho = db
    .prepare("SELECT COUNT(*) AS c FROM trial_requests WHERE phone = ? AND status = 'new'")
    .get(phone) as { c: number };
  if (dangCho.c > 0) {
    return {
      ok: true,
      error: undefined,
    };
  }

  db.prepare(
    `INSERT INTO trial_requests
       (user_id, name, phone, hinh_thuc, branch, area, thoi_gian, note)
     VALUES (@userId, @name, @phone, @hinhThuc, @branch, @area, @thoiGian, @note)`
  ).run({
    userId: session?.userId ?? null,
    name,
    phone,
    hinhThuc,
    branch: chiNhanh || null,
    area: area || null,
    thoiGian: thoiGian || null,
    note: note || null,
  });

  revalidatePath("/admin/hoc-thu");
  revalidatePath("/student/hoc-thu");
  return { ok: true };
}

export async function doiTrangThaiHocThuAction(id: number, status: string) {
  const session = await assertRole(["admin", "coordinator"]);
  if (!["new", "contacted", "scheduled", "done", "cancelled"].includes(status)) return;

  db.prepare(
    `UPDATE trial_requests
        SET status = ?, handled_at = datetime('now'), handled_by = ?
      WHERE id = ?`
  ).run(status, session.userId, id);

  revalidatePath("/admin/hoc-thu");
  revalidatePath("/student/hoc-thu");
}
