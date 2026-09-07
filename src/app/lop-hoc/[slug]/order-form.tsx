"use client";

import { useActionState } from "react";
import { dangKyGoiAction, type PackageOrderState } from "@/actions/packages";
import { BRAND, prettyPhone } from "@/components/brand";
import { btn, field, label } from "@/components/ui";

const initialState: PackageOrderState = {};

export default function PackageOrderForm({
  slug,
  name,
  coGia,
  tenSan = "",
  sdtSan = "",
}: {
  slug: string;
  name: string;
  coGia: boolean;
  /** Học viên đã đăng nhập thì điền sẵn, khách vãng lai để trống */
  tenSan?: string;
  sdtSan?: string;
}) {
  const [state, formAction, pending] = useActionState(dangKyGoiAction, initialState);
  const v = state.values;

  if (state.ok) {
    return (
      <div className="rounded-2xl border border-mint-300 bg-mint-50 p-5">
        <p className="font-bold text-mint-700 text-lg">Đã nhận đăng ký</p>
        <p className="text-ink-700 mt-1.5 text-sm">
          Bên mình gọi lại trong hôm nay để báo giá, chốt lịch và xếp lớp cho gói <b>{name}</b>.
        </p>
        <p className="text-sm text-ink-500 mt-3">
          Cần gấp thì gọi{" "}
          <a href={`tel:${BRAND.phone}`} className="font-semibold text-wood-600">
            {prettyPhone()}
          </a>
          .
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="rounded-2xl border border-navy-100 bg-white p-5 space-y-3">
      <p className="font-bold text-ink-900">{coGia ? "Đăng ký học" : "Nhận báo giá"}</p>
      <p className="text-sm text-ink-500 -mt-2">
        {coGia
          ? "Để lại tên và số điện thoại, bên mình gọi lại xếp lịch. Không phải trả trước trên web."
          : "Gói này chưa công bố giá. Để lại số điện thoại, bên mình gọi báo giá và xếp lịch."}
      </p>

      <input type="hidden" name="slug" value={slug} />

      <div>
        <label className={label} htmlFor="g-name">
          Họ và tên
        </label>
        <input
          id="g-name"
          name="name"
          required
          autoComplete="name"
          defaultValue={v?.name ?? tenSan}
          className={field}
          placeholder="Nguyễn Văn A"
        />
      </div>

      <div>
        <label className={label} htmlFor="g-phone">
          Số điện thoại
        </label>
        <input
          id="g-phone"
          name="phone"
          type="tel"
          required
          autoComplete="tel"
          defaultValue={v?.phone ?? sdtSan}
          className={field}
          placeholder="09xx xxx xxx"
        />
      </div>

      <div>
        <label className={label} htmlFor="g-note">
          Bạn rảnh giờ nào <span className="font-normal text-ink-400">(không bắt buộc)</span>
        </label>
        <textarea
          id="g-note"
          name="note"
          rows={2}
          defaultValue={v?.note ?? ""}
          className={field}
          placeholder="Tối thứ 3, 5 sau 19h"
        />
      </div>

      {state.error && (
        <p className="text-sm text-coral-700 bg-coral-50 border border-coral-100 rounded-xl px-3 py-2">
          {state.error}
        </p>
      )}

      <button type="submit" disabled={pending} className={`${btn.primary} w-full py-3`}>
        {pending ? "Đang gửi..." : coGia ? "Đăng ký — bên mình gọi lại" : "Nhận báo giá"}
      </button>
    </form>
  );
}
