"use client";

import { useActionState, useTransition } from "react";
import {
  doiThuTuBaiAction,
  themBaiAction,
  xoaBaiAction,
  type CourseFormState,
} from "@/actions/teacher-courses";
import type { CourseLesson } from "@/lib/courses";
import { videoKind } from "@/lib/curriculum";
import { btn, field, label } from "@/components/ui";

const initialState: CourseFormState = {};

function HangBai({
  bai,
  thuTu,
  dauTien,
  cuoiCung,
  khoaLai,
}: {
  bai: CourseLesson;
  thuTu: number;
  dauTien: boolean;
  cuoiCung: boolean;
  khoaLai: boolean;
}) {
  const [pending, start] = useTransition();
  const video = bai.video ? videoKind(bai.video) : null;

  return (
    <li className="flex gap-3 py-3 first:pt-0 last:pb-0">
      <span className="shrink-0 w-7 h-7 rounded-lg bg-ivory-100 text-ink-500 grid place-items-center text-xs font-bold tabular">
        {thuTu}
      </span>

      <div className="min-w-0 flex-1">
        <p className="font-medium text-ink-900">{bai.title}</p>
        {bai.description && <p className="text-sm text-ink-500 mt-0.5">{bai.description}</p>}
        <p className="text-xs mt-1">
          {!bai.video ? (
            <span className="text-amber-700">Chưa có video</span>
          ) : video ? (
            <span className="text-mint-700">
              Video {video.kind === "youtube" ? "YouTube" : "tải lên"} · nhận diện được
            </span>
          ) : (
            <span className="text-coral-700">
              Link video không đọc được — dán link YouTube dạng youtu.be/... hoặc
              youtube.com/watch?v=...
            </span>
          )}
          {!!bai.free_preview && <span className="text-ink-500"> · bài xem thử</span>}
        </p>
      </div>

      {!khoaLai && (
        <div className="shrink-0 flex flex-col items-end gap-1">
          <div className="flex gap-1">
            <button
              type="button"
              disabled={pending || dauTien}
              title="Đưa lên trên"
              className={`${btn.ghost} px-2 py-1 text-xs disabled:opacity-30`}
              onClick={() => start(() => void doiThuTuBaiAction(bai.id, "len"))}
            >
              ↑
            </button>
            <button
              type="button"
              disabled={pending || cuoiCung}
              title="Đưa xuống dưới"
              className={`${btn.ghost} px-2 py-1 text-xs disabled:opacity-30`}
              onClick={() => start(() => void doiThuTuBaiAction(bai.id, "xuong"))}
            >
              ↓
            </button>
          </div>
          <button
            type="button"
            disabled={pending}
            className="text-xs text-coral-700 hover:underline"
            onClick={() => start(() => void xoaBaiAction(bai.id))}
          >
            Xoá bài
          </button>
        </div>
      )}
    </li>
  );
}

export default function DanhSachBai({
  courseId,
  bai,
  khoaDangBan,
}: {
  courseId: number;
  bai: CourseLesson[];
  khoaDangBan: boolean;
}) {
  const [state, formAction, pending] = useActionState(themBaiAction, initialState);

  return (
    <div>
      {bai.length === 0 ? (
        <p className="text-sm text-ink-500">Chưa có bài nào. Thêm bài đầu tiên ở dưới.</p>
      ) : (
        <ul className="divide-y divide-navy-100">
          {bai.map((b, i) => (
            <HangBai
              key={b.id}
              bai={b}
              thuTu={i + 1}
              dauTien={i === 0}
              cuoiCung={i === bai.length - 1}
              khoaLai={khoaDangBan}
            />
          ))}
        </ul>
      )}

      {khoaDangBan ? (
        <p className="text-sm text-ink-600 rounded-xl border border-navy-100 bg-ivory-50 px-3.5 py-3 mt-4">
          Khoá đang bán nên không thêm bớt bài được. Ẩn khoá trước rồi sửa.
        </p>
      ) : (
        <form action={formAction} className="mt-5 pt-5 border-t border-navy-100 space-y-3">
          <p className="font-semibold text-ink-900">Thêm bài giảng</p>
          <input type="hidden" name="course_id" value={courseId} />

          <div>
            <label className={label} htmlFor="b-title">
              Tên bài
            </label>
            <input
              id="b-title"
              name="title"
              required
              className={field}
              placeholder="Bài 1 — Tư thế tay phải"
            />
          </div>

          <div>
            <label className={label} htmlFor="b-desc">
              Mô tả ngắn <span className="font-normal text-ink-400">(không bắt buộc)</span>
            </label>
            <input
              id="b-desc"
              name="description"
              className={field}
              placeholder="Cách để móng và lấy tiếng sạch"
            />
          </div>

          <div>
            <label className={label} htmlFor="b-video">
              Link video
            </label>
            <input
              id="b-video"
              name="video"
              className={field}
              placeholder="https://youtu.be/..."
            />
            <p className="text-xs text-ink-400 mt-1.5">
              Dán link YouTube của bạn. Để video ở chế độ Không công khai (unlisted) là chỉ ai có
              link mới xem được.
            </p>
          </div>

          <label className="flex items-center gap-2 text-sm text-ink-700">
            <input type="checkbox" name="free_preview" className="rounded border-navy-300" />
            Cho xem thử miễn phí trên trang bán
          </label>

          {state.error && (
            <p className="text-sm text-coral-700 bg-coral-50 border border-coral-100 rounded-xl px-3 py-2">
              {state.error}
            </p>
          )}

          <button type="submit" disabled={pending} className={`${btn.primary} px-4 py-2.5`}>
            {pending ? "Đang thêm..." : "Thêm bài"}
          </button>
        </form>
      )}
    </div>
  );
}
