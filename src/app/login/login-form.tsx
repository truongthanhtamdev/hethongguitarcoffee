"use client";

import Link from "next/link";
import { useActionState } from "react";
import { loginAction, type LoginState } from "@/actions/auth";
import { IconAlert } from "@/components/icons";
import { btn, field, label } from "@/components/ui";

const initialState: LoginState = {};

export default function LoginForm({ next }: { next: string }) {
  const [state, formAction, pending] = useActionState(loginAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="next" value={next} />
      <div>
        <label className={label} htmlFor="login-email">
          Số điện thoại hoặc email
        </label>
        <input
          id="login-email"
          name="email"
          type="text"
          required
          autoFocus
          autoComplete="username"
          className={field}
          placeholder="09xx xxx xxx"
        />
      </div>
      <div>
        <div className="flex items-baseline justify-between gap-2">
          <label className={label} htmlFor="login-password">
            Mật khẩu
          </label>
          <Link
            href="/quen-mat-khau"
            className="text-xs font-semibold text-wood-600 hover:text-wood-700 mb-1.5"
          >
            Quên mật khẩu?
          </Link>
        </div>
        <input
          id="login-password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className={field}
          placeholder="••••••••"
        />
      </div>

      {state.error && (
        <p className="text-sm text-coral-700 bg-coral-50 border border-coral-100 rounded-xl px-3 py-2 flex items-center gap-2">
          <IconAlert className="w-4 h-4 shrink-0" />
          {state.error}
        </p>
      )}

      <button type="submit" disabled={pending} className={`${btn.primary} w-full py-3 text-base`}>
        {pending ? "Đang đăng nhập..." : "Đăng nhập"}
      </button>

    </form>
  );
}
