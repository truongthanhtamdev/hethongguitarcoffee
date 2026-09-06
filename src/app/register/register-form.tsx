"use client";

import { useActionState } from "react";
import { registerAction, type RegisterState } from "@/actions/auth";
import { IconAlert } from "@/components/icons";
import { btn, field, label } from "@/components/ui";

const initialState: RegisterState = {};

export default function RegisterForm() {
  const [state, formAction, pending] = useActionState(registerAction, initialState);

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
          className={field}
          placeholder="ban@email.com"
        />
      </div>

      <div>
        <label className={label} htmlFor="reg-phone">
          Số điện thoại <span className="font-normal text-ink-400">(không bắt buộc)</span>
        </label>
        <input
          id="reg-phone"
          name="phone"
          type="tel"
          className={field}
          placeholder="09xx xxx xxx"
        />
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
        Tài khoản dùng để lưu tiến độ học của bạn. Nếu bạn đang học tại trung tâm, báo email này
        cho trung tâm để được gắn vào lớp và xem lịch học.
      </p>
    </form>
  );
}
