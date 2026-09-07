"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { anKhoaAction, guiDuyetAction, xoaKhoaAction } from "@/actions/teacher-courses";
import type { CourseStatus } from "@/lib/courses";
import { btn } from "@/components/ui";

export default function TrangThaiKhoa({
  id,
  status,
  thieu,
  daBan,
  slug,
}: {
  id: number;
  status: CourseStatus;
  thieu: string[];
  daBan: number;
  slug: string;
}) {
  const [pending, start] = useTransition();
  const [loi, setLoi] = useState<string>();

  return (
    <div className="rounded-2xl border border-navy-100 bg-white p-5">
      {status === "published" && (
        <>
          <p className="font-semibold text-mint-700">Khoá đang bán trên trang công khai</p>
          <p className="text-sm text-ink-600 mt-1">
            Khách xem tại{" "}
            <Link href={`/khoa-hoc/${slug}`} className="font-semibold text-wood-600">
              /khoa-hoc/{slug}
            </Link>
            . Muốn sửa nội dung hay giá thì ẩn khoá đi đã — người đã mua vẫn xem được bình thường.
          </p>
          <button
            type="button"
            disabled={pending}
            className={`${btn.ghost} px-4 py-2 text-sm mt-3`}
            onClick={() => start(() => void anKhoaAction(id))}
          >
            Ẩn khoá để sửa
          </button>
        </>
      )}

      {status === "pending" && (
        <>
          <p className="font-semibold text-amber-700">Đang chờ trung tâm duyệt</p>
          <p className="text-sm text-ink-600 mt-1">
            Trung tâm xem xong sẽ đưa khoá lên trang bán, hoặc trả lại kèm lý do để bạn sửa.
          </p>
          <button
            type="button"
            disabled={pending}
            className={`${btn.ghost} px-4 py-2 text-sm mt-3`}
            onClick={() => start(() => void anKhoaAction(id))}
          >
            Rút lại để sửa tiếp
          </button>
        </>
      )}

      {(status === "draft" || status === "hidden") && (
        <>
          <p className="font-semibold text-ink-900">
            {status === "hidden" ? "Khoá đang tạm ẩn" : "Khoá đang soạn"}
          </p>
          {thieu.length > 0 ? (
            <p className="text-sm text-ink-600 mt-1">
              Gửi duyệt được khi có đủ: <b>{thieu.join(", ")}</b>.
            </p>
          ) : (
            <p className="text-sm text-ink-600 mt-1">
              Đủ thông tin rồi. Gửi duyệt để trung tâm đưa khoá lên trang bán.
            </p>
          )}

          <div className="flex flex-wrap gap-2 mt-3">
            <button
              type="button"
              disabled={pending || thieu.length > 0}
              className={`${btn.primary} px-4 py-2 text-sm disabled:opacity-50`}
              onClick={() =>
                start(async () => {
                  const kq = await guiDuyetAction(id);
                  setLoi(kq.error);
                })
              }
            >
              {pending ? "Đang gửi..." : "Gửi duyệt"}
            </button>

            {daBan === 0 && (
              <button
                type="button"
                disabled={pending}
                className={`${btn.ghost} px-4 py-2 text-sm text-coral-700`}
                onClick={() =>
                  start(async () => {
                    const kq = await xoaKhoaAction(id);
                    setLoi(kq?.error);
                  })
                }
              >
                Xoá khoá
              </button>
            )}
          </div>
        </>
      )}

      {loi && <p className="text-sm text-coral-700 mt-2">{loi}</p>}
    </div>
  );
}
