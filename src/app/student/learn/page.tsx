import Link from "next/link";
import { requireRole } from "@/lib/guard";
import { getLearningState } from "@/lib/learning";
import { TOTAL_LESSONS } from "@/lib/curriculum";
import { Card, ProgressBar, StatusChip } from "@/components/ui";
import LessonList from "./lesson-list";

export default async function StudentLearnPage() {
  const session = await requireRole(["student"]);
  const state = getLearningState(session.userId);

  return (
    <div className="space-y-5">
      <section className="rounded-2xl bg-navy-950 text-white px-5 py-6 sm:px-7">
        <p className="text-xs uppercase tracking-wider text-navy-300 font-semibold">
          Buổi kế tiếp · Chặng {state.stage.id} · {state.stage.tag}
        </p>
        <h1 className="text-2xl font-bold tracking-tight mt-1.5">
          Buổi {String(state.next.n).padStart(2, "0")} — {state.next.title}
        </h1>
        <p className="text-navy-200 text-sm mt-1">{state.next.desc}</p>

        <div className="mt-4 h-2 rounded-full bg-white/15 overflow-hidden">
          <div
            className="h-full bg-wood-500 rounded-full transition-[width] duration-500"
            style={{ width: `${state.percent}%` }}
          />
        </div>
        <p className="text-xs text-navy-300 mt-2 tabular">
          {state.completedCount} / {TOTAL_LESSONS} bài · luyện {state.streak} ngày liên tiếp
        </p>

        <Link
          href={`/student/practice?bpm=${state.next.bpm}`}
          className="inline-flex items-center justify-center gap-2 bg-wood-500 hover:bg-wood-600 text-white font-semibold rounded-xl px-4 py-2.5 text-sm transition mt-4"
        >
          Luyện bài này ở {state.next.bpm} bpm
        </Link>
      </section>

      <div className="grid grid-cols-3 gap-3">
        <Card>
          <p className="text-2xl font-bold text-ink-900 tabular">{state.completedCount}</p>
          <p className="text-xs text-ink-400 mt-0.5">buổi đã xong</p>
        </Card>
        <Card>
          <p className="text-2xl font-bold text-ink-900 tabular">{state.chords.length}</p>
          <p className="text-xs text-ink-400 mt-0.5">hợp âm đã thuộc</p>
        </Card>
        <Card>
          <p className="text-2xl font-bold text-ink-900 tabular">{state.minutesToday}</p>
          <p className="text-xs text-ink-400 mt-0.5">phút luyện hôm nay</p>
        </Card>
      </div>

      {state.attendedSessions > 0 && (
        <Card>
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="font-semibold text-ink-900">Buổi học tại trung tâm</p>
              <p className="text-sm text-ink-500 mt-0.5">
                Giáo viên đã điểm danh {state.attendedSessions} buổi cho bạn.
              </p>
            </div>
            <StatusChip tone="navy">{state.attendedSessions} buổi</StatusChip>
          </div>
          <div className="mt-3">
            <ProgressBar value={state.attendedSessions} max={TOTAL_LESSONS} />
          </div>
        </Card>
      )}

      <div>
        <h2 className="font-bold text-ink-900 mb-1">Nội dung khoá học</h2>
        <p className="text-sm text-ink-500 mb-3">
          Học hết {TOTAL_LESSONS} bài là bạn bấm được các hợp âm căn bản 3 ngăn đầu, hiểu 4 loại
          nhịp 4/4, 2/4, 3/4, 6/8 và đệm hát được với 8 điệu cơ bản.
        </p>
        <LessonList done={state.done} />
      </div>
    </div>
  );
}
