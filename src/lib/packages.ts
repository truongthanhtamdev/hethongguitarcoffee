/**
 * Gói lớp có giáo viên dạy trực tiếp — khác khoá quay sẵn ở chỗ bán suất học
 * chứ không bán video. Khách đăng ký, trung tâm gọi lại thu tiền và xếp lịch.
 */

import { db } from "./db";
import { tachDong, tienVN } from "./courses";

export interface ClassPackage {
  id: number;
  slug: string;
  name: string;
  hinh_thuc: string;
  tagline: string;
  so_buoi: number;
  phut_moi_buoi: number;
  price: number;
  price_old: number;
  quyen_loi: string;
  danh_cho: string;
  lich_hoc: string;
  /** Mỗi dòng một mức: "Nhãn | số tiền" */
  bang_gia: string;
  ghi_chu: string;
  active: number;
  position: number;
}

export interface PackageOrderRow {
  id: number;
  package_slug: string;
  package_name: string;
  price: number;
  customer_name: string;
  customer_phone: string;
  note: string | null;
  user_id: number | null;
  status: string;
  created_at: string;
  handled_at: string | null;
}

export function goiDangBan(): ClassPackage[] {
  return db
    .prepare("SELECT * FROM class_packages WHERE active = 1 ORDER BY position, id")
    .all() as ClassPackage[];
}

export function tatCaGoi(): ClassPackage[] {
  return db
    .prepare("SELECT * FROM class_packages ORDER BY position, id")
    .all() as ClassPackage[];
}

export function goiBySlug(slug: string): ClassPackage | undefined {
  return db.prepare("SELECT * FROM class_packages WHERE slug = ?").get(slug) as
    | ClassPackage
    | undefined;
}

export function listPackageOrders(): PackageOrderRow[] {
  return db.prepare("SELECT * FROM package_orders ORDER BY id DESC").all() as PackageOrderRow[];
}

export function demDonGoiMoi(): number {
  const r = db
    .prepare("SELECT COUNT(*) AS c FROM package_orders WHERE status = 'new'")
    .get() as { c: number };
  return r.c;
}

export function donGoiDangChoCuaToi(userId: number, slug: string): PackageOrderRow | undefined {
  return db
    .prepare(
      "SELECT * FROM package_orders WHERE user_id = ? AND package_slug = ? AND status IN ('new','contacted') ORDER BY id DESC LIMIT 1"
    )
    .get(userId, slug) as PackageOrderRow | undefined;
}

/**
 * Giá 0 nghĩa là chưa công bố. Hiện "Liên hệ báo giá" thay vì "0 ₫" — số 0
 * trên trang bán trông như miễn phí, khách hiểu nhầm là mất khách thật.
 */
export function hienGia(price: number): string {
  return price > 0 ? tienVN(price) : "Liên hệ báo giá";
}

export interface MucGia {
  nhan: string;
  tien: number;
}

/**
 * Tách bảng giá nhiều mức. Mỗi dòng dạng "1 tháng | 1500000". Dòng sai định
 * dạng thì bỏ qua chứ không làm hỏng cả trang.
 */
export function tachBangGia(s: string): MucGia[] {
  return tachDong(s)
    .map((d) => {
      const [nhan, tien] = d.split("|");
      const n = Number(String(tien ?? "").replace(/[^0-9]/g, ""));
      return { nhan: (nhan ?? "").trim(), tien: Number.isFinite(n) ? n : 0 };
    })
    .filter((m) => m.nhan && m.tien > 0);
}

export { tachDong };
