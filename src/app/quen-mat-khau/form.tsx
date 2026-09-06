"use client";

import { useActionState } from "react";
import { baoQuenMatKhauAction, type QuenMatKhauState } from "@/actions/password-reset";
import { IconAlert, IconCheckCircle } from "@/components/icons";
import { btn, field, label } from "@/components/ui";

const initialState: QuenMatKhauState = {};

export default function QuenMatKhauForm() {
  const [state, formAction, pending] = useActionState(baoQuenMatKhauAction, initialState);

  if (state.ok) {
    return (
      <div className="rounded-xl border border-mint-300 bg-mint-50 p-4">
        <p className="font-bold text-mint-700 flex items-center gap-2">
          <IconCheckCircle className="w-5 h-5 shrink-0" />
          Đã nhận yêu cầu
        </p>
        <p className="text-sm text-ink-700 mt-1.5">
          Nếu email/số điện thoại này có tài khoản, bên mình sẽ gọi lại trong hôm nay để xác nhận
          rồi đọc mật khẩu tạm cho bạn. Đăng nhập xong bạn nhớ đổi lại mật khẩu riêng nhé.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label className={label} htmlFor="qmk-contact">
          Email hoặc số điện thoại đã đăng ký
        </label>
        <input
          id="qmk-contact"
          name="contact"
          type="text"
          required
          autoFocus
          autoComplete="username"
          className={field}
          placeholder="ban@email.com hoặc 09xx xxx xxx"
        />
      </div>

      {state.error && (
        <p className="text-sm text-coral-700 bg-coral-50 border border-coral-100 rounded-xl px-3 py-2 flex items-center gap-2">
          <IconAlert className="w-4 h-4 shrink-0" />
          {state.error}
        </p>
      )}

      <button type="submit" disabled={pending} className={`${btn.primary} w-full py-3 text-base`}>
        {pending ? "Đang gửi..." : "Gửi yêu cầu"}
      </button>
    </form>
  );
}
