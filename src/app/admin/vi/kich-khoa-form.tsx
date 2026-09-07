"use client";

import { useState, useTransition } from "react";
import { tangKhoaAction } from "@/actions/courses";
import { btn, field, label } from "@/components/ui";

export default function KichKhoaForm({
  hocVien,
  khoa,
  daCo,
}: {
  hocVien: { id: number; name: string; phone: string | null }[];
  khoa: { slug: string; name: string }[];
  daCo: { user_id: number; course_slug: string }[];
}) {
  const [pending, start] = useTransition();
  const [userId, setUserId] = useState("");
  const [slug, setSlug] = useState("");
  const [ket, setKet] = useState<{ loi?: string; xong?: boolean }>({});

  const daGiu = daCo.some((a) => String(a.user_id) === userId && a.course_slug === slug);

  if (khoa.length === 0) {
    return (
      <p className="text-sm text-ink-500">
        Chưa có khoá nào đang bán. Duyệt khoá của giáo viên trước đã.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <div>
        <label className={label} htmlFor="kk-user">
          Học viên
        </label>
        <select
          id="kk-user"
          value={userId}
          onChange={(e) => {
            setUserId(e.target.value);
            setKet({});
          }}
          className={field}
        >
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
        <label className={label} htmlFor="kk-course">
          Khoá học
        </label>
        <select
          id="kk-course"
          value={slug}
          onChange={(e) => {
            setSlug(e.target.value);
            setKet({});
          }}
          className={field}
        >
          <option value="" disabled>
            — Chọn khoá —
          </option>
          {khoa.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {daGiu && <p className="text-sm text-ink-500">Học viên này đã có khoá đó rồi.</p>}
      {ket.loi && <p className="text-sm text-coral-700">{ket.loi}</p>}
      {ket.xong && !ket.loi && (
        <p className="text-sm text-mint-700 bg-mint-50 border border-mint-300 rounded-xl px-3 py-2">
          Đã mở khoá. Học viên vào mục Khoá của tôi là xem được ngay.
        </p>
      )}

      <button
        type="button"
        disabled={pending || !userId || !slug || daGiu}
        className={`${btn.primary} px-4 py-2.5 disabled:opacity-50`}
        onClick={() =>
          start(async () => {
            const kq = await tangKhoaAction(Number(userId), slug);
            setKet({ loi: kq.error, xong: !kq.error });
          })
        }
      >
        {pending ? "Đang mở..." : "Mở khoá cho học viên"}
      </button>
    </div>
  );
}
