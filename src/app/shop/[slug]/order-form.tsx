"use client";

import { useActionState } from "react";
import { placeOrderAction, type OrderState } from "@/actions/orders";
import { BRAND, prettyPhone } from "@/components/brand";

const initialState: OrderState = {};

export default function OrderForm({
  slug,
  name,
  price,
}: {
  slug: string;
  name: string;
  price: string;
}) {
  const [state, formAction, pending] = useActionState(placeOrderAction, initialState);
  const v = state.values;

  if (state.ok) {
    return (
      <div className="rounded-2xl border border-mint-300 bg-mint-50 p-5">
        <p className="font-bold text-mint-700 text-lg">Đã nhận đơn của bạn</p>
        <p className="text-ink-700 mt-1.5">
          Bên mình sẽ gọi lại trong hôm nay để xác nhận cây <b>{name}</b> ({price}) và hẹn ngày
          giao hoặc ngày bạn ghé thử đàn.
        </p>
        <p className="text-sm text-ink-500 mt-3">
          Cần gấp thì gọi thẳng{" "}
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
      <p className="font-bold text-ink-900">Đặt mua</p>
      <p className="text-sm text-ink-500 -mt-2">
        Để lại tên và số điện thoại, bên mình gọi lại xác nhận. Không phải trả trước.
      </p>

      <input type="hidden" name="slug" value={slug} />

      <div>
        <label className="block text-sm font-medium text-ink-700 mb-1.5" htmlFor="o-name">
          Họ và tên
        </label>
        <input
          id="o-name"
          defaultValue={v?.name ?? ""}
          name="name"
          required
          className="w-full rounded-xl border border-navy-200 bg-white px-3.5 py-2.5 text-sm focus:border-wood-400 focus:ring-2 focus:ring-wood-500/20 focus:outline-none"
          placeholder="Nguyễn Văn A"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-ink-700 mb-1.5" htmlFor="o-phone">
          Số điện thoại
        </label>
        <input
          id="o-phone"
          defaultValue={v?.phone ?? ""}
          name="phone"
          type="tel"
          required
          className="w-full rounded-xl border border-navy-200 bg-white px-3.5 py-2.5 text-sm focus:border-wood-400 focus:ring-2 focus:ring-wood-500/20 focus:outline-none"
          placeholder="09xx xxx xxx"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-ink-700 mb-1.5" htmlFor="o-address">
          Địa chỉ giao <span className="font-normal text-ink-400">(để trống nếu ghé quán lấy)</span>
        </label>
        <input
          id="o-address"
          defaultValue={v?.address ?? ""}
          name="address"
          className="w-full rounded-xl border border-navy-200 bg-white px-3.5 py-2.5 text-sm focus:border-wood-400 focus:ring-2 focus:ring-wood-500/20 focus:outline-none"
          placeholder="Số nhà, đường, quận"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-ink-700 mb-1.5" htmlFor="o-note">
          Ghi chú <span className="font-normal text-ink-400">(không bắt buộc)</span>
        </label>
        <textarea
          id="o-note"
          defaultValue={v?.note ?? ""}
          name="note"
          rows={2}
          className="w-full rounded-xl border border-navy-200 bg-white px-3.5 py-2.5 text-sm focus:border-wood-400 focus:ring-2 focus:ring-wood-500/20 focus:outline-none"
          placeholder="Ví dụ: mình mới tập, cần đàn dễ bấm"
        />
      </div>

      {state.error && (
        <p className="text-sm text-coral-700 bg-coral-50 border border-coral-100 rounded-xl px-3 py-2">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl bg-wood-500 hover:bg-wood-600 disabled:opacity-60 text-white font-semibold py-3"
      >
        {pending ? "Đang gửi..." : "Đặt mua — bên mình gọi lại"}
      </button>
    </form>
  );
}
