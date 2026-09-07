"use client";

import { useActionState } from "react";
import { congTienAction, type TopupState } from "@/actions/wallet";
import { btn, field, label } from "@/components/ui";

const initialState: TopupState = {};

export default function CongTienForm({
  hocVien,
}: {
  hocVien: { id: number; name: string; phone: string | null }[];
}) {
  const [state, formAction, pending] = useActionState(congTienAction, initialState);

  return (
    <form action={formAction} className="space-y-3">
      <div>
        <label className={label} htmlFor="ct-user">
          Học viên
        </label>
        <select id="ct-user" name="user_id" required defaultValue="" className={field}>
          <option value="" disabled>
            — Chọn học viên —
          </option>
          {hocVien.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
              {s.phone ? ` — ${s.phone}` : ""}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className={label} htmlFor="ct-amount">
          Số tiền
        </label>
        <input
          id="ct-amount"
          name="amount"
          inputMode="numeric"
          required
          className={field}
          placeholder="500000"
        />
      </div>

      <div>
        <label className={label} htmlFor="ct-note">
          Ghi chú <span className="font-normal text-ink-400">(học viên đọc được)</span>
        </label>
        <input
          id="ct-note"
          name="note"
          className={field}
          placeholder="Nhận tiền mặt tại quán ngày 07/09"
        />
      </div>

      <label className="flex items-center gap-2 text-sm text-ink-700">
        <input type="checkbox" name="tru" className="rounded border-navy-300" />
        Trừ tiền thay vì cộng
      </label>

      {state.error && (
        <p className="text-sm text-coral-700 bg-coral-50 border border-coral-100 rounded-xl px-3 py-2">
          {state.error}
        </p>
      )}
      {state.ok && !state.error && (
        <p className="text-sm text-mint-700 bg-mint-50 border border-mint-300 rounded-xl px-3 py-2">
          Đã ghi vào ví học viên.
        </p>
      )}

      <button type="submit" disabled={pending} className={`${btn.primary} px-4 py-2.5`}>
        {pending ? "Đang ghi..." : "Ghi vào ví"}
      </button>
    </form>
  );
}
