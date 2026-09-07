"use client";

import { useActionState } from "react";
import { datMuaKhoaHocAction, type CourseOrderState } from "@/actions/courses";
import { BRAND, prettyPhone } from "@/components/brand";
import { btn, field, label } from "@/components/ui";

const initialState: CourseOrderState = {};

export default function CourseOrderForm({
  slug,
  name,
  price,
}: {
  slug: string;
  name: string;
  price: string;
}) {
  const [state, formAction, pending] = useActionState(datMuaKhoaHocAction, initialState);
  const v = state.values;

  if (state.ok) {
    return (
      <div className="rounded-2xl border border-mint-300 bg-mint-50 p-5">
        <p className="font-bold text-mint-700 text-lg">Đã nhận đăng ký</p>
        <p className="text-ink-700 mt-1.5 text-sm">
          Bên mình gọi lại trong hôm nay để thu tiền khoá <b>{name}</b> ({price}) rồi mở khoá ngay
          trong tài khoản của bạn.
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
      <p className="font-bold text-ink-900">Đăng ký học</p>
      <p className="text-sm text-ink-500 -mt-2">
        Để lại tên và số điện thoại, bên mình gọi lại thu tiền rồi mở khoá. Không phải trả trước
        trên web.
      </p>

      <input type="hidden" name="slug" value={slug} />

      <div>
        <label className={label} htmlFor="kh-name">
          Họ và tên
        </label>
        <input
          id="kh-name"
          name="name"
          required
          autoComplete="name"
          defaultValue={v?.name ?? ""}
          className={field}
          placeholder="Nguyễn Văn A"
        />
      </div>

      <div>
        <label className={label} htmlFor="kh-phone">
          Số điện thoại
        </label>
        <input
          id="kh-phone"
          name="phone"
          type="tel"
          required
          autoComplete="tel"
          defaultValue={v?.phone ?? ""}
          className={field}
          placeholder="09xx xxx xxx"
        />
      </div>

      <div>
        <label className={label} htmlFor="kh-note">
          Ghi chú <span className="font-normal text-ink-400">(không bắt buộc)</span>
        </label>
        <textarea
          id="kh-note"
          name="note"
          rows={2}
          defaultValue={v?.note ?? ""}
          className={field}
          placeholder="Ví dụ: mình đệm hát được rồi, muốn chơi fingerstyle"
        />
      </div>

      {state.error && (
        <p className="text-sm text-coral-700 bg-coral-50 border border-coral-100 rounded-xl px-3 py-2">
          {state.error}
        </p>
      )}

      <button type="submit" disabled={pending} className={`${btn.primary} w-full py-3`}>
        {pending ? "Đang gửi..." : "Đăng ký — bên mình gọi lại"}
      </button>
    </form>
  );
}
