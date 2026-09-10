"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef, useState } from "react";
import { dangKyHocThuAction, type TrialState } from "@/actions/trial";
import { BRAND, HINH_THUC_HOC, KHU_VUC, prettyPhone } from "@/components/brand";
import { btn, field, label } from "@/components/ui";

const initialState: TrialState = {};

/**
 * Form đăng ký học thử, dùng chung cho trang công khai và trang học viên.
 * Học viên đã đăng nhập thì tên và số điện thoại điền sẵn.
 */
export default function HocThuForm({
  tenSan = "",
  sdtSan = "",
  khuVucSan = "",
  daDangNhap = false,
}: {
  tenSan?: string;
  sdtSan?: string;
  khuVucSan?: string;
  /** Đã đăng nhập thì không hỏi mật khẩu nữa — tài khoản có sẵn rồi. */
  daDangNhap?: boolean;
}) {
  const [state, formAction, pending] = useActionState(dangKyHocThuAction, initialState);
  const v = state.values;
  const [hinhThuc, setHinhThuc] = useState<string>(v?.hinhThuc ?? HINH_THUC_HOC[0].id);
  const formRef = useRef<HTMLFormElement>(null);

  // Tải lại trang là trình duyệt tự khôi phục lựa chọn cũ của các ô radio,
  // nhưng React thì không biết nên vẫn giữ giá trị ban đầu — hậu quả là chấm
  // radio nằm ở "1 kèm 1" mà khung tô sáng với ô chọn chi nhánh lại theo "học
  // tại quán". Đọc lại đúng ô đang được chọn trong trang rồi đồng bộ về.
  useEffect(() => {
    const daChon = formRef.current?.querySelector<HTMLInputElement>(
      'input[name="hinh_thuc"]:checked'
    );
    if (daChon && daChon.value !== hinhThuc) setHinhThuc(daChon.value);
    // Chỉ chạy một lần lúc trang vừa dựng xong.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const canChiNhanh = HINH_THUC_HOC.find((h) => h.id === hinhThuc)?.canChiNhanh ?? false;

  if (state.ok) {
    return (
      <div className="rounded-2xl border border-mint-300 bg-mint-50 p-5">
        <p className="font-bold text-mint-700 text-lg">Đã nhận đăng ký học thử</p>
        <p className="text-ink-700 mt-1.5">
          Bên mình sẽ gọi lại trong hôm nay để hẹn giờ buổi học thử. Buổi thử không mất phí, bạn
          cũng chưa cần mang đàn — bên mình có đàn cho mượn.
        </p>

        {state.taoTaiKhoan && (
          <div className="mt-4 rounded-xl bg-white border border-mint-200 p-4">
            <p className="font-semibold text-ink-900">Tài khoản của bạn đã tạo xong</p>
            <p className="text-sm text-ink-600 mt-1">
              Trong lúc chờ bên mình gọi, bạn xem trước khoá 28 bài video quay sẵn được luôn. Lần
              sau đăng nhập bằng số điện thoại và mật khẩu vừa đặt.
            </p>
            <Link
              href="/student/learn"
              className={`${btn.primary} mt-3 inline-flex px-4 py-2.5 no-underline`}
            >
              Vào học ngay
            </Link>
          </div>
        )}

        {state.daCoTaiKhoan && (
          <div className="mt-4 rounded-xl bg-white border border-navy-200 p-4">
            <p className="font-semibold text-ink-900">Số này đã có tài khoản</p>
            <p className="text-sm text-ink-600 mt-1">
              Bạn đăng nhập để xem khoá 28 bài video quay sẵn nhé. Quên mật khẩu thì bấm
              &quot;Quên mật khẩu&quot; ở trang đăng nhập.
            </p>
            <Link
              href="/login"
              className={`${btn.primary} mt-3 inline-flex px-4 py-2.5 no-underline`}
            >
              Đăng nhập
            </Link>
          </div>
        )}
        <p className="text-sm text-ink-500 mt-3">
          Cần gấp thì gọi{" "}
          <a href={`tel:${BRAND.phone}`} className="font-semibold text-wood-600">
            {prettyPhone()}
          </a>{" "}
          hoặc{" "}
          <a
            href={`https://m.me/${BRAND.fanpage}`}
            target="_blank"
            rel="noopener"
            className="font-semibold text-wood-600"
          >
            nhắn fanpage
          </a>
          .
        </p>
      </div>
    );
  }

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      <fieldset>
        <legend className={label}>Bạn muốn thử hình thức nào?</legend>
        <div className="space-y-2 mt-1">
          {HINH_THUC_HOC.map((h) => (
            <label
              key={h.id}
              className={`flex gap-3 rounded-xl border p-3.5 cursor-pointer transition ${
                hinhThuc === h.id
                  ? "border-wood-400 bg-wood-50"
                  : "border-navy-200 hover:bg-ivory-50"
              }`}
            >
              <input
                type="radio"
                name="hinh_thuc"
                value={h.id}
                checked={hinhThuc === h.id}
                onChange={() => setHinhThuc(h.id)}
                className="mt-1 shrink-0"
              />
              <span className="min-w-0">
                <span className="block font-semibold text-ink-900">{h.ten}</span>
                <span className="block text-sm text-ink-500 mt-0.5">{h.mo}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      {canChiNhanh && (
        <div>
          <label className={label} htmlFor="ht-branch">
            Chi nhánh bạn muốn tới
          </label>
          <select
            id="ht-branch"
            name="branch"
            required
            defaultValue={v?.branch ?? BRAND.branches[0]?.name ?? ""}
            className={field}
          >
            {BRAND.branches.map((b) => (
              <option key={b.name} value={b.name}>
                {b.name} — {b.address}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className={label} htmlFor="ht-name">
            Họ và tên
          </label>
          <input
            id="ht-name"
            name="name"
            required
            autoComplete="name"
            defaultValue={v?.name ?? tenSan}
            className={field}
            placeholder="Nguyễn Văn A"
          />
        </div>
        <div>
          <label className={label} htmlFor="ht-phone">
            Số điện thoại
          </label>
          <input
            id="ht-phone"
            name="phone"
            type="tel"
            required
            autoComplete="tel"
            defaultValue={v?.phone ?? sdtSan}
            className={field}
            placeholder="09xx xxx xxx"
          />
        </div>
      </div>

      {!daDangNhap && (
        <div>
          <label className={label} htmlFor="ht-password">
            Đặt mật khẩu
          </label>
          <input
            id="ht-password"
            name="password"
            type="password"
            required
            minLength={6}
            autoComplete="new-password"
            className={field}
            placeholder="Ít nhất 6 ký tự"
          />
          <p className="text-xs text-ink-400 mt-1.5">
            Gửi xong là có luôn tài khoản để xem khoá 28 bài video quay sẵn, không cần điền lại
            form nào nữa.
          </p>
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className={label} htmlFor="ht-area">
            Khu vực bạn đang ở{" "}
            <span className="font-normal text-ink-400">(không bắt buộc)</span>
          </label>
          <select id="ht-area" name="area" defaultValue={v?.area ?? khuVucSan} className={field}>
            <option value="">— Chưa chọn —</option>
            {KHU_VUC.map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={label} htmlFor="ht-time">
            Bạn rảnh giờ nào
          </label>
          <input
            id="ht-time"
            name="thoi_gian"
            defaultValue={v?.thoiGian ?? ""}
            className={field}
            placeholder="Tối thứ 3, 5 sau 19h"
          />
        </div>
      </div>

      <div>
        <label className={label} htmlFor="ht-note">
          Ghi chú <span className="font-normal text-ink-400">(không bắt buộc)</span>
        </label>
        <textarea
          id="ht-note"
          name="note"
          rows={2}
          defaultValue={v?.note ?? ""}
          className={field}
          placeholder="Ví dụ: mình chưa cầm đàn bao giờ"
        />
      </div>

      {state.error && (
        <p className="text-sm text-coral-700 bg-coral-50 border border-coral-100 rounded-xl px-3 py-2">
          {state.error}
        </p>
      )}

      <button type="submit" disabled={pending} className={`${btn.primary} w-full py-3 text-base`}>
        {pending ? "Đang gửi..." : daDangNhap ? "Đăng ký học thử miễn phí" : "Đăng ký học thử & tạo tài khoản"}
      </button>

      <p className="text-xs text-ink-500 text-center">
        Buổi thử không mất phí và không bắt buộc đăng ký khoá sau đó.
      </p>
    </form>
  );
}
