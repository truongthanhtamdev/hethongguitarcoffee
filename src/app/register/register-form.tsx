"use client";

import { useActionState } from "react";
import { registerAction, type RegisterState } from "@/actions/auth";
import { KHU_VUC, NOI_HOC } from "@/components/brand";
import { IconAlert } from "@/components/icons";
import { btn, field, label } from "@/components/ui";

const initialState: RegisterState = {};

export default function RegisterForm() {
  const [state, formAction, pending] = useActionState(registerAction, initialState);
  const v = state.values;
  // React reset lại form sau mỗi lần chạy action. Với <input> thì defaultValue
  // mới được áp lại, nhưng <select> chỉ nhận defaultValue lúc mount — đổi key
  // để nó mount lại, không thì báo lỗi xong hai ô chọn nhảy về trống.

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label className={label} htmlFor="reg-name">
          Họ và tên
        </label>
        <input
          id="reg-name"
          name="name"
          type="text"
          required
          autoFocus
          autoComplete="name"
          defaultValue={v?.name ?? ""}
          className={field}
          placeholder="Nguyễn Văn A"
        />
      </div>

      <div>
        <label className={label} htmlFor="reg-email">
          Email
        </label>
        <input
          id="reg-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          defaultValue={v?.email ?? ""}
          className={field}
          placeholder="ban@email.com"
        />
      </div>

      <div>
        <label className={label} htmlFor="reg-phone">
          Số điện thoại
        </label>
        <input
          id="reg-phone"
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
        <label className={label} htmlFor="reg-branch">
          Bạn muốn học ở đâu?
        </label>
        <select
          key={`branch-${v?.branch ?? ""}`}
          id="reg-branch"
          name="branch"
          required
          defaultValue={v?.branch ?? ""}
          className={field}
        >
          <option value="" disabled>
            — Chọn nơi học —
          </option>
          {NOI_HOC.map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className={label} htmlFor="reg-area">
          Khu vực bạn đang ở
        </label>
        <select
          key={`area-${v?.area ?? ""}`}
          id="reg-area"
          name="area"
          required
          defaultValue={v?.area ?? ""}
          className={field}
        >
          <option value="" disabled>
            — Chọn khu vực —
          </option>
          {KHU_VUC.map((k) => (
            <option key={k} value={k}>
              {k}
            </option>
          ))}
        </select>
        <p className="text-xs text-ink-400 mt-1.5">
          Bên mình dựa vào đây để mở thêm quán gần chỗ bạn.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className={label} htmlFor="reg-password">
            Mật khẩu
          </label>
          <input
            id="reg-password"
            name="password"
            type="password"
            required
            minLength={6}
            autoComplete="new-password"
            className={field}
            placeholder="Ít nhất 6 ký tự"
          />
        </div>
        <div>
          <label className={label} htmlFor="reg-confirm">
            Nhập lại mật khẩu
          </label>
          <input
            id="reg-confirm"
            name="confirm"
            type="password"
            required
            minLength={6}
            autoComplete="new-password"
            className={field}
            placeholder="••••••••"
          />
        </div>
      </div>

      {state.error && (
        <p className="text-sm text-coral-700 bg-coral-50 border border-coral-100 rounded-xl px-3 py-2 flex items-center gap-2">
          <IconAlert className="w-4 h-4 shrink-0" />
          {state.error}
        </p>
      )}

      <button type="submit" disabled={pending} className={`${btn.primary} w-full py-3 text-base`}>
        {pending ? "Đang tạo tài khoản..." : "Tạo tài khoản miễn phí"}
      </button>

      <p className="text-xs text-ink-500 text-center leading-relaxed">
        Tạo xong là vào học 28 bài video ngay. Bên mình sẽ gọi lại để xếp lịch buổi học tại quán
        nếu bạn muốn.
      </p>
    </form>
  );
}
