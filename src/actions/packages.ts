"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { assertRole } from "@/lib/guard";
import { goiBySlug } from "@/lib/packages";

export interface PackageOrderState {
  error?: string;
  ok?: boolean;
  values?: { name: string; phone: string; note: string };
}

function normPhone(raw: string): string {
  const d = raw.replace(/[^0-9+]/g, "").replace(/^\+84/, "0");
  return /^0\d{8,10}$/.test(d) ? d : "";
}

function soTien(raw: FormDataEntryValue | null): number {
  const n = Number(String(raw ?? "").replace(/[^0-9]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

/** Khách đăng ký một gói lớp. Không thu tiền trên web — gọi lại xếp lịch. */
export async function dangKyGoiAction(
  _prev: PackageOrderState,
  formData: FormData
): Promise<PackageOrderState> {
  const slug = String(formData.get("slug") || "");
  const name = String(formData.get("name") || "").trim();
  const phoneRaw = String(formData.get("phone") || "");
  const phone = normPhone(phoneRaw);
  const note = String(formData.get("note") || "").trim();

  const daNhap = { name, phone: phoneRaw, note };
  const loi = (m: string): PackageOrderState => ({ error: m, values: daNhap });

  const goi = goiBySlug(slug);
  if (!goi || !goi.active) return loi("Gói này hiện không mở đăng ký");
  if (!name) return loi("Bạn nhập giúp họ tên nhé");
  if (!phone) return loi("Số điện thoại chưa đúng. Ví dụ: 0912345678");

  const session = await getSession();

  // Giá chép vào đơn để sau này đổi bảng giá thì đơn cũ vẫn giữ đúng con số
  // lúc khách đăng ký.
  db.prepare(
    `INSERT INTO package_orders
       (package_slug, package_name, price, customer_name, customer_phone, note, user_id)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).run(slug, goi.name, goi.price, name, phone, note || null, session?.userId ?? null);

  revalidatePath("/admin/lop-hoc");
  revalidatePath("/student/lop-hoc");
  return { ok: true };
}

export async function doiTrangThaiDonGoiAction(id: number, status: string) {
  const session = await assertRole(["admin", "coordinator"]);
  if (!["new", "contacted", "done", "cancelled"].includes(status)) return;

  db.prepare(
    "UPDATE package_orders SET status = ?, handled_at = datetime('now'), handled_by = ? WHERE id = ?"
  ).run(status, session.userId, id);

  revalidatePath("/admin/lop-hoc");
  revalidatePath("/student/lop-hoc");
}

export interface PackageFormState {
  error?: string;
  ok?: boolean;
}

/** Quản trị sửa một gói lớp: tên, giá, số buổi, quyền lợi, hiện hay ẩn. */
export async function suaGoiAction(
  _prev: PackageFormState,
  formData: FormData
): Promise<PackageFormState> {
  await assertRole(["admin"]);
  const id = Number(formData.get("id"));
  if (!id) return { error: "Không tìm thấy gói này" };

  const name = String(formData.get("name") || "").trim();
  if (!name) return { error: "Tên gói không được để trống" };

  const price = soTien(formData.get("price"));
  const priceOld = soTien(formData.get("price_old"));
  if (priceOld > 0 && priceOld <= price) {
    return { error: "Giá gốc phải lớn hơn giá bán, không thì bỏ trống" };
  }

  db.prepare(
    `UPDATE class_packages
        SET name = @name, tagline = @tagline, so_buoi = @soBuoi,
            phut_moi_buoi = @phut, price = @price, price_old = @priceOld,
            quyen_loi = @quyenLoi, danh_cho = @danhCho, active = @active,
            lich_hoc = @lichHoc, bang_gia = @bangGia, ghi_chu = @ghiChu
      WHERE id = @id`
  ).run({
    id,
    name,
    tagline: String(formData.get("tagline") || "").trim(),
    soBuoi: soTien(formData.get("so_buoi")),
    phut: soTien(formData.get("phut_moi_buoi")) || 60,
    price,
    priceOld,
    quyenLoi: String(formData.get("quyen_loi") || "").trim(),
    danhCho: String(formData.get("danh_cho") || "").trim(),
    active: formData.get("active") ? 1 : 0,
    lichHoc: String(formData.get("lich_hoc") || "").trim(),
    bangGia: String(formData.get("bang_gia") || "").trim(),
    ghiChu: String(formData.get("ghi_chu") || "").trim(),
  });

  revalidatePath("/admin/lop-hoc");
  revalidatePath("/lop-hoc");
  revalidatePath("/student/lop-hoc");
  return { ok: true };
}
