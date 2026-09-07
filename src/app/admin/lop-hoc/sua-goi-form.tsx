"use client";

import { useActionState } from "react";
import { suaGoiAction, type PackageFormState } from "@/actions/packages";
import type { ClassPackage } from "@/lib/packages";
import { btn, field, label } from "@/components/ui";

const initialState: PackageFormState = {};

export default function SuaGoiForm({ goi }: { goi: ClassPackage }) {
  const [state, formAction, pending] = useActionState(suaGoiAction, initialState);

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="id" value={goi.id} />

      <div>
        <label className={label} htmlFor={`g${goi.id}-name`}>
          Tên gói
        </label>
        <input id={`g${goi.id}-name`} name="name" required defaultValue={goi.name} className={field} />
      </div>

      <div>
        <label className={label} htmlFor={`g${goi.id}-tagline`}>
          Giới thiệu ngắn
        </label>
        <input
          id={`g${goi.id}-tagline`}
          name="tagline"
          defaultValue={goi.tagline}
          className={field}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={label} htmlFor={`g${goi.id}-price`}>
            Giá bán <span className="font-normal text-ink-400">(0 = liên hệ)</span>
          </label>
          <input
            id={`g${goi.id}-price`}
            name="price"
            inputMode="numeric"
            defaultValue={goi.price || ""}
            className={field}
            placeholder="0"
          />
        </div>
        <div>
          <label className={label} htmlFor={`g${goi.id}-priceold`}>
            Giá gốc gạch ngang
          </label>
          <input
            id={`g${goi.id}-priceold`}
            name="price_old"
            inputMode="numeric"
            defaultValue={goi.price_old || ""}
            className={field}
            placeholder="bỏ trống nếu không giảm"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={label} htmlFor={`g${goi.id}-sobuoi`}>
            Số buổi
          </label>
          <input
            id={`g${goi.id}-sobuoi`}
            name="so_buoi"
            inputMode="numeric"
            defaultValue={goi.so_buoi || ""}
            className={field}
          />
        </div>
        <div>
          <label className={label} htmlFor={`g${goi.id}-phut`}>
            Phút mỗi buổi
          </label>
          <input
            id={`g${goi.id}-phut`}
            name="phut_moi_buoi"
            inputMode="numeric"
            defaultValue={goi.phut_moi_buoi || ""}
            className={field}
          />
        </div>
      </div>

      <div>
        <label className={label} htmlFor={`g${goi.id}-lich`}>
          Lịch học
        </label>
        <input
          id={`g${goi.id}-lich`}
          name="lich_hoc"
          defaultValue={goi.lich_hoc}
          className={field}
          placeholder="Thứ 2 - 4 - 6, 19h30 đến 21h"
        />
      </div>

      <div>
        <label className={label} htmlFor={`g${goi.id}-banggia`}>
          Bảng giá nhiều mức{" "}
          <span className="font-normal text-ink-400">— mỗi dòng: nhãn | số tiền</span>
        </label>
        <textarea
          id={`g${goi.id}-banggia`}
          name="bang_gia"
          rows={3}
          defaultValue={goi.bang_gia}
          className={field}
          placeholder={"1 tháng | 1500000\n3 tháng | 3500000"}
        />
        <p className="text-xs text-ink-400 mt-1.5">
          Điền vào đây thì trang hiện cả bảng thay cho một con số. Để trống thì dùng ô Giá bán ở
          trên.
        </p>
      </div>

      <div>
        <label className={label} htmlFor={`g${goi.id}-ghichu`}>
          Ghi chú hiện trên trang
        </label>
        <textarea
          id={`g${goi.id}-ghichu`}
          name="ghi_chu"
          rows={2}
          defaultValue={goi.ghi_chu}
          className={field}
          placeholder="Quận nào đủ 2-3 học viên là mở thêm điểm học"
        />
      </div>

      <div>
        <label className={label} htmlFor={`g${goi.id}-quyenloi`}>
          Quyền lợi <span className="font-normal text-ink-400">— mỗi dòng một ý</span>
        </label>
        <textarea
          id={`g${goi.id}-quyenloi`}
          name="quyen_loi"
          rows={4}
          defaultValue={goi.quyen_loi}
          className={field}
        />
      </div>

      <div>
        <label className={label} htmlFor={`g${goi.id}-danhcho`}>
          Gói này hợp với ai
        </label>
        <textarea
          id={`g${goi.id}-danhcho`}
          name="danh_cho"
          rows={2}
          defaultValue={goi.danh_cho}
          className={field}
        />
      </div>

      <label className="flex items-center gap-2 text-sm text-ink-700">
        <input
          type="checkbox"
          name="active"
          defaultChecked={!!goi.active}
          className="rounded border-navy-300"
        />
        Đang bán (bỏ tick là ẩn khỏi trang)
      </label>

      {state.error && (
        <p className="text-sm text-coral-700 bg-coral-50 border border-coral-100 rounded-xl px-3 py-2">
          {state.error}
        </p>
      )}
      {state.ok && !state.error && (
        <p className="text-sm text-mint-700 bg-mint-50 border border-mint-300 rounded-xl px-3 py-2">
          Đã lưu.
        </p>
      )}

      <button type="submit" disabled={pending} className={`${btn.primary} px-4 py-2`}>
        {pending ? "Đang lưu..." : "Lưu gói"}
      </button>
    </form>
  );
}
