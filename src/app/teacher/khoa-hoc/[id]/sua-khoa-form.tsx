"use client";

import { useActionState } from "react";
import { suaKhoaAction, type CourseFormState } from "@/actions/teacher-courses";
import type { Course } from "@/lib/courses";
import { btn, field, label } from "@/components/ui";

const initialState: CourseFormState = {};

export default function SuaKhoaForm({
  khoa,
  khoaDangBan,
}: {
  khoa: Course;
  khoaDangBan: boolean;
}) {
  const [state, formAction, pending] = useActionState(suaKhoaAction, initialState);

  if (khoaDangBan) {
    return (
      <p className="text-sm text-ink-600 rounded-xl border border-navy-100 bg-ivory-50 px-3.5 py-3">
        Khoá đang bán nên khoá thông tin lại. Người đã trả tiền mua đúng khoá này, đổi giá hay đổi
        nội dung sau lưng họ là không được — muốn sửa thì bấm <b>Ẩn khoá</b> ở trên rồi sửa, xong
        gửi duyệt lại.
      </p>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="id" value={khoa.id} />

      <div>
        <label className={label} htmlFor="c-name">
          Tên khoá
        </label>
        <input
          id="c-name"
          name="name"
          required
          defaultValue={khoa.name}
          className={field}
          placeholder="Fingerstyle cho người mới"
        />
      </div>

      <div>
        <label className={label} htmlFor="c-tagline">
          Giới thiệu ngắn <span className="font-normal text-ink-400">(một hai câu)</span>
        </label>
        <textarea
          id="c-tagline"
          name="tagline"
          rows={2}
          defaultValue={khoa.tagline}
          className={field}
          placeholder="Học xong chơi được trọn bài bằng ngón, không cần hát."
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className={label} htmlFor="c-price">
            Giá bán (đồng)
          </label>
          <input
            id="c-price"
            name="price"
            inputMode="numeric"
            defaultValue={khoa.price || ""}
            className={field}
            placeholder="800000"
          />
        </div>
        <div>
          <label className={label} htmlFor="c-price-old">
            Giá gốc gạch ngang{" "}
            <span className="font-normal text-ink-400">(bỏ trống nếu không giảm)</span>
          </label>
          <input
            id="c-price-old"
            name="price_old"
            inputMode="numeric"
            defaultValue={khoa.price_old || ""}
            className={field}
            placeholder="1200000"
          />
        </div>
      </div>

      <div>
        <label className={label} htmlFor="c-ketqua">
          Học xong làm được gì <span className="font-normal text-ink-400">— mỗi dòng một ý</span>
        </label>
        <textarea
          id="c-ketqua"
          name="ket_qua"
          rows={4}
          defaultValue={khoa.ket_qua}
          className={field}
          placeholder={"Móc dây đều tiếng, không vấp\nChơi trọn một bài fingerstyle"}
        />
      </div>

      <div>
        <label className={label} htmlFor="c-noidung">
          Khoá dạy những gì <span className="font-normal text-ink-400">— mỗi dòng một ý</span>
        </label>
        <textarea
          id="c-noidung"
          name="noi_dung"
          rows={4}
          defaultValue={khoa.noi_dung}
          className={field}
          placeholder={"Tư thế tay phải\nCác mẫu rải p-i-m-a\nBè trầm luân phiên"}
        />
      </div>

      <div>
        <label className={label} htmlFor="c-danhcho">
          Khoá này dành cho ai
        </label>
        <textarea
          id="c-danhcho"
          name="danh_cho"
          rows={2}
          defaultValue={khoa.danh_cho}
          className={field}
          placeholder="Bạn đã đệm hát được vài bài và muốn chơi đàn một mình mà vẫn ra bài."
        />
      </div>

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

      <button type="submit" disabled={pending} className={`${btn.primary} px-5 py-2.5`}>
        {pending ? "Đang lưu..." : "Lưu thông tin"}
      </button>
    </form>
  );
}
