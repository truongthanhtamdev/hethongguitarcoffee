"use client";

import { useState, useTransition } from "react";
import {
  doiTiLeChiaAction,
  duyetKhoaAction,
  ngungBanKhoaAction,
  traLaiKhoaAction,
} from "@/actions/teacher-courses";
import type { CourseStatus } from "@/lib/courses";
import { btn, field } from "@/components/ui";

export default function DuyetKhoaActions({
  id,
  status,
  phanTram,
}: {
  id: number;
  status: CourseStatus;
  phanTram: number;
}) {
  const [pending, start] = useTransition();
  const [dangTraLai, setDangTraLai] = useState(false);
  const [lyDo, setLyDo] = useState("");

  if (dangTraLai) {
    return (
      <div className="text-left w-56 ml-auto space-y-2">
        <textarea
          rows={2}
          autoFocus
          value={lyDo}
          onChange={(e) => setLyDo(e.target.value)}
          className={`${field} text-xs`}
          placeholder="Vì sao trả lại? Giáo viên sẽ đọc được."
        />
        <div className="flex gap-2 justify-end">
          <button
            type="button"
            disabled={pending}
            className={`${btn.primary} px-3 py-1.5 text-xs`}
            onClick={() =>
              start(async () => {
                await traLaiKhoaAction(id, lyDo);
                setDangTraLai(false);
                setLyDo("");
              })
            }
          >
            Gửi lại cho giáo viên
          </button>
          <button
            type="button"
            className={`${btn.ghost} px-3 py-1.5 text-xs`}
            onClick={() => setDangTraLai(false)}
          >
            Thôi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1.5">
      <div className="flex flex-wrap gap-2 justify-end">
        {status === "pending" && (
          <>
            <button
              type="button"
              disabled={pending}
              className={`${btn.primary} px-3 py-1.5 text-xs`}
              onClick={() => start(() => void duyetKhoaAction(id))}
            >
              Duyệt, cho lên bán
            </button>
            <button
              type="button"
              className={`${btn.ghost} px-3 py-1.5 text-xs`}
              onClick={() => setDangTraLai(true)}
            >
              Trả lại
            </button>
          </>
        )}

        {status === "hidden" && (
          <button
            type="button"
            disabled={pending}
            className={`${btn.primary} px-3 py-1.5 text-xs`}
            onClick={() => start(() => void duyetKhoaAction(id))}
          >
            Cho bán lại
          </button>
        )}

        {status === "published" && (
          <button
            type="button"
            disabled={pending}
            className={`${btn.ghost} px-3 py-1.5 text-xs`}
            onClick={() => start(() => void ngungBanKhoaAction(id))}
          >
            Ngừng bán
          </button>
        )}
      </div>

      {/* Tỉ lệ ăn chia đổi được cả khi khoá đang bán — chỉ ảnh hưởng đơn sau,
          đơn cũ đã chốt số tiền riêng. */}
      <label className="flex items-center gap-1.5 text-xs text-ink-500">
        GV hưởng
        <input
          type="number"
          min={0}
          max={100}
          defaultValue={phanTram}
          disabled={pending}
          className="w-16 rounded-lg border border-navy-200 px-2 py-1 text-xs tabular"
          onBlur={(e) => {
            const v = Number(e.target.value);
            if (v !== phanTram) start(() => void doiTiLeChiaAction(id, v));
          }}
        />
        %
      </label>
    </div>
  );
}
