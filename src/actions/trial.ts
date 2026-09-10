"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getSession, getUserByEmailOrPhone, setSessionCookie } from "@/lib/auth";
import { chuanHoaSoDienThoai, emailTheoSoDienThoai } from "@/lib/format";
import { assertRole } from "@/lib/guard";
import { HINH_THUC_HOC, KHU_VUC, BRAND } from "@/components/brand";

export interface TrialState {
  error?: string;
  ok?: boolean;
  /** Vừa tạo tài khoản và đã đăng nhập luôn — mời khách vào học ngay. */
  taoTaiKhoan?: boolean;
  /** Số này đã có tài khoản từ trước — mời đăng nhập chứ không tạo thêm. */
  daCoTaiKhoan?: boolean;
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

const TEN_CHI_NHANH = BRAND.branches.map((b) => b.name);

/** Ghi vào users.branch cùng dạng với lựa chọn ở form đăng ký, để trang quản
 *  trị gom nhóm được "khách muốn học ở đâu" mà không phải quy đổi hai kiểu. */
function noiHocTuHinhThuc(hinhThucId: string, chiNhanh: string): string {
  const b = BRAND.branches.find((x) => x.name === chiNhanh);
  if (b) return `${b.name} — ${b.address}`;
  return HINH_THUC_HOC.find((h) => h.id === hinhThucId)?.ten ?? "";
}

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
  const phone = chuanHoaSoDienThoai(phoneRaw);
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

  // Khách gửi form này là muốn học — tạo luôn tài khoản để vào xem được khoá
  // video quay sẵn ngay, khỏi phải điền thêm một form đăng ký nữa.
  let userId = session?.userId ?? null;
  let taoTaiKhoan = false;
  let daCoTaiKhoan = false;

  if (!session) {
    const daCo = getUserByEmailOrPhone(phone);
    if (daCo) {
      // Đã có tài khoản thì không tạo thêm, và cũng không tự đăng nhập hộ —
      // chưa kiểm tra mật khẩu thì chỉ cần biết số của người khác là vào được.
      userId = daCo.id;
      daCoTaiKhoan = true;
    } else {
      const password = String(formData.get("password") || "");
      if (password.length < 6) {
        return loi("Đặt giúp mật khẩu ít nhất 6 ký tự để vào học được luôn nhé");
      }
      try {
        const info = db
          .prepare(
            `INSERT INTO users (name, email, password_hash, role, phone, branch, area, active)
             VALUES (@name, @email, @password_hash, 'student', @phone, @branch, @area, 1)`
          )
          .run({
            name,
            email: emailTheoSoDienThoai(phone),
            password_hash: bcrypt.hashSync(password, 10),
            phone,
            branch: noiHocTuHinhThuc(hinhThuc, chiNhanh) || null,
            area: area || null,
          });
        userId = Number(info.lastInsertRowid);
        taoTaiKhoan = true;
      } catch (err) {
        // Hai lần bấm gửi gần như cùng lúc: UNIQUE(email) chặn lần thứ hai.
        if ((err as { code?: string }).code !== "SQLITE_CONSTRAINT_UNIQUE") throw err;
        userId = getUserByEmailOrPhone(phone)?.id ?? null;
        daCoTaiKhoan = true;
      }
    }
  }

  if (taoTaiKhoan && userId) {
    await setSessionCookie({ userId, role: "student", name });
  }

  // Chặn gửi trùng: cùng số điện thoại đang có một đơn chưa xử lý thì thôi,
  // nhưng tài khoản ở trên vẫn tạo — đó mới là thứ khách cần dùng ngay.
  const dangCho = db
    .prepare("SELECT COUNT(*) AS c FROM trial_requests WHERE phone = ? AND status = 'new'")
    .get(phone) as { c: number };

  if (dangCho.c === 0) {
    db.prepare(
      `INSERT INTO trial_requests
         (user_id, name, phone, hinh_thuc, branch, area, thoi_gian, note)
       VALUES (@userId, @name, @phone, @hinhThuc, @branch, @area, @thoiGian, @note)`
    ).run({
      userId,
      name,
      phone,
      hinhThuc,
      branch: chiNhanh || null,
      area: area || null,
      thoiGian: thoiGian || null,
      note: note || null,
    });
  }

  revalidatePath("/admin/hoc-thu");
  revalidatePath("/student/hoc-thu");
  return { ok: true, taoTaiKhoan, daCoTaiKhoan };
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
