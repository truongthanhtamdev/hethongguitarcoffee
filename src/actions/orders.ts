"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { assertRole } from "@/lib/guard";
import { guitarBySlug } from "@/lib/shop";

export interface OrderState {
  error?: string;
  ok?: boolean;
  /** Giữ lại những gì khách đã gõ để form không bị xoá trắng khi báo lỗi. */
  values?: { name: string; phone: string; address: string; note: string };
}

/** Số Việt Nam: bỏ khoảng trắng/gạch rồi kiểm tra 9-11 chữ số, cho phép +84. */
function normPhone(raw: string): string {
  const d = raw.replace(/[^0-9+]/g, "").replace(/^\+84/, "0");
  return /^0\d{8,10}$/.test(d) ? d : "";
}

export async function placeOrderAction(
  _prev: OrderState,
  formData: FormData
): Promise<OrderState> {
  const slug = String(formData.get("slug") || "");
  const name = String(formData.get("name") || "").trim();
  const phone = normPhone(String(formData.get("phone") || ""));
  const address = String(formData.get("address") || "").trim();
  const note = String(formData.get("note") || "").trim();

  // Giá và tên lấy từ dữ liệu máy chủ, không lấy từ form — người mua sửa
  // được mọi ô ẩn trên trang.
  // React đặt lại các ô nhập sau mỗi lần chạy form action, nên phải trả lại
  // nguyên văn những gì khách gõ, không thì báo lỗi xong là mất sạch.
  const daNhap = {
    name,
    phone: String(formData.get("phone") || ""),
    address,
    note,
  };
  const loi = (m: string): OrderState => ({ error: m, values: daNhap });

  const product = guitarBySlug(slug);
  if (!product) return loi("Không tìm thấy cây đàn này");
  if (product.soldOut) return loi("Cây này đang hết hàng, bạn chọn mẫu khác nhé");

  if (!name) return loi("Bạn nhập giúp họ tên nhé");
  if (!phone) return loi("Số điện thoại chưa đúng. Ví dụ: 0912345678");

  const session = await getSession();

  db.prepare(
    `INSERT INTO orders
       (product_slug, product_name, product_price, customer_name, customer_phone,
        customer_address, note, user_id)
     VALUES (@slug, @pname, @price, @name, @phone, @address, @note, @userId)`
  ).run({
    slug,
    pname: product.name,
    price: product.price,
    name,
    phone,
    address: address || null,
    note: note || null,
    userId: session?.userId ?? null,
  });

  revalidatePath("/admin/orders");
  return { ok: true };
}

export async function setOrderStatusAction(id: number, status: string) {
  await assertRole(["admin", "coordinator"]);
  if (!["new", "contacted", "done", "cancelled"].includes(status)) return;
  db.prepare("UPDATE orders SET status = ? WHERE id = ?").run(status, id);
  revalidatePath("/admin/orders");
}
