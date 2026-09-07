"use client";

import { useActionState, useState } from "react";
import { xinNapTienAction, type TopupState } from "@/actions/wallet";
import { btn, field, label } from "@/components/ui";

const initialState: TopupState = {};
const GOI_Y = [200_000, 500_000, 800_000, 1_000_000];

export default function NapTienForm() {
  const [state, formAction, pending] = useActionState(xinNapTienAction, initialState);
  const [soTien, setSoTien] = useState("");

  if (state.ok) {
    return (
      <div className="rounded-xl border border-mint-300 bg-mint-50 p-4">
        <p className="font-bold text-mint-700">Đã gửi yêu cầu nạp</p>
        <p className="text-sm text-ink-700 mt-1">
          Bên mình nhận được tiền là cộng vào ví bạn ngay. Bạn tải lại trang để thấy số dư mới.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-3">
      <div>
        <label className={label} htmlFor="v-amount">
          Số tiền muốn nạp
        </label>
        <input
          id="v-amount"
          name="amount"
          inputMode="numeric"
          required
          value={soTien}
          onChange={(e) => setSoTien(e.target.value)}
          className={field}
          placeholder="500000"
        />
        <div className="flex flex-wrap gap-2 mt-2">
          {GOI_Y.map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setSoTien(String(n))}
              className="rounded-xl border border-navy-200 px-3 py-1.5 text-sm text-ink-700 hover:bg-ivory-100 tabular"
            >
              {n.toLocaleString("vi-VN")}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className={label} htmlFor="v-method">
          Nạp bằng cách nào
        </label>
        <select id="v-method" name="method" className={field} defaultValue="transfer">
          <option value="transfer">Chuyển khoản</option>
          <option value="cash">Đưa tiền mặt tại quán</option>
        </select>
      </div>

      <div>
        <label className={label} htmlFor="v-note">
          Ghi chú <span className="font-normal text-ink-400">(không bắt buộc)</span>
        </label>
        <input
          id="v-note"
          name="note"
          className={field}
          placeholder="Ví dụ: đã chuyển lúc 9h sáng"
        />
      </div>

      {state.error && (
        <p className="text-sm text-coral-700 bg-coral-50 border border-coral-100 rounded-xl px-3 py-2">
          {state.error}
        </p>
      )}

      <button type="submit" disabled={pending} className={`${btn.primary} px-5 py-2.5`}>
        {pending ? "Đang gửi..." : "Gửi yêu cầu nạp"}
      </button>
    </form>
  );
}
