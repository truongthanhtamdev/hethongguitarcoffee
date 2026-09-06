import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/guard";
import { listDoneLessons } from "@/lib/learning";
import {
  CHORD_BY_NAME,
  LESSONS,
  STRUM_STYLES,
  TOTAL_LESSONS,
  lessonByNo,
  stageOf,
} from "@/lib/curriculum";
import { Card } from "@/components/ui";
import { IconChevronLeft, IconChevronRight, IconCheckCircle } from "@/components/icons";
import LessonChords from "./lesson-chords";
import MarkDoneButton from "./mark-done-button";

/** Kiểu đệm gắn với từng chặng, để nút "mở máy đệm" vào thẳng điệu đang học. */
const STAGE_STRUM: Record<number, string> = {
  1: "downs",
  3: "slowrock",
  4: "ballad",
  5: "quatcha",
};

export function generateStaticParams() {
  return LESSONS.map((l) => ({ n: String(l.n) }));
}

export default async function LessonDetailPage({
  params,
}: {
  params: Promise<{ n: string }>;
}) {
  const session = await requireRole(["student"]);
  const { n } = await params;

  const lessonNo = Number(n);
  const lesson = Number.isInteger(lessonNo) ? lessonByNo(lessonNo) : undefined;
  if (!lesson) notFound();

  const stage = stageOf(lesson.n);
  const done = listDoneLessons(session.userId);
  const isDone = done.includes(lesson.n);

  const prev = lessonByNo(lesson.n - 1);
  const next = lessonByNo(lesson.n + 1);

  const chords = lesson.chords.map((name) => CHORD_BY_NAME[name]).filter(Boolean);
  const strumId = STAGE_STRUM[stage.id];
  const strum = strumId ? STRUM_STYLES.find((s) => s.id === strumId) : undefined;

  return (
    <div className="space-y-5">
      <Link
        href="/student/learn"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-500 hover:text-ink-900"
      >
        <IconChevronLeft className="w-4 h-4" />
        Lộ trình 36 buổi
      </Link>

      <section className="rounded-2xl bg-navy-950 text-white px-5 py-6 sm:px-7">
        <p className="text-xs uppercase tracking-wider text-navy-300 font-semibold">
          Buổi {String(lesson.n).padStart(2, "0")} / {TOTAL_LESSONS} · Chặng {stage.id} ·{" "}
          {stage.tag}
        </p>
        <h1 className="text-2xl font-bold tracking-tight mt-1.5">{lesson.title}</h1>
        <p className="text-navy-200 text-sm mt-1">{lesson.desc}</p>
        {isDone && (
          <p className="inline-flex items-center gap-1.5 text-sm font-semibold text-mint-300 mt-3">
            <IconCheckCircle className="w-4 h-4" />
            Bạn đã hoàn thành buổi này
          </p>
        )}
      </section>

      <Card>
        <h2 className="font-bold text-ink-900 mb-3">Học xong buổi này bạn sẽ</h2>
        <p className="text-ink-700">{lesson.result}</p>
      </Card>

      <Card>
        <h2 className="font-bold text-ink-900 mb-3">Bài luyện ở nhà</h2>
        <p className="text-ink-700">{lesson.practice}</p>

        <div className="flex flex-wrap gap-2 mt-4">
          <Link
            href={`/student/practice?bpm=${lesson.bpm}`}
            className="inline-flex items-center justify-center gap-2 bg-wood-500 hover:bg-wood-600 text-white font-semibold rounded-xl px-4 py-2.5 text-sm transition"
          >
            Metronome {lesson.bpm} bpm
          </Link>
          {strum && (
            <Link
              href={`/student/practice?tool=strum&style=${strum.id}`}
              className="inline-flex items-center justify-center gap-2 bg-white hover:bg-ivory-100 border border-navy-200 text-ink-700 font-semibold rounded-xl px-4 py-2.5 text-sm transition"
            >
              Máy đệm {strum.name.split(" · ")[0]}
            </Link>
          )}
        </div>
      </Card>

      {chords.length > 0 ? (
        <Card>
          <h2 className="font-bold text-ink-900 mb-1">Hợp âm trong buổi</h2>
          <p className="text-sm text-ink-500 mb-3">Chạm vào sơ đồ để nghe tiếng đàn mẫu.</p>
          <LessonChords chords={chords} />
        </Card>
      ) : (
        <Card>
          <h2 className="font-bold text-ink-900 mb-1">Hợp âm trong buổi</h2>
          <p className="text-sm text-ink-500">
            Buổi này tập trung vào kỹ thuật, chưa thêm hợp âm mới. Tranh thủ ôn lại các hợp âm đã
            học ở{" "}
            <Link href="/student/chords" className="font-semibold text-wood-600 hover:text-wood-700">
              thư viện hợp âm
            </Link>
            .
          </p>
        </Card>
      )}

      <MarkDoneButton lessonNo={lesson.n} done={isDone} nextLessonNo={next?.n ?? null} />

      <nav className="flex gap-3">
        {prev ? (
          <Link
            href={`/student/learn/${prev.n}`}
            className="flex-1 rounded-2xl border border-navy-100 bg-white p-4 hover:shadow-sm transition"
          >
            <span className="flex items-center gap-1 text-xs font-semibold text-ink-400">
              <IconChevronLeft className="w-3.5 h-3.5" />
              Buổi {String(prev.n).padStart(2, "0")}
            </span>
            <span className="block text-sm font-semibold text-ink-900 mt-0.5">{prev.title}</span>
          </Link>
        ) : (
          <span className="flex-1" />
        )}

        {next ? (
          <Link
            href={`/student/learn/${next.n}`}
            className="flex-1 rounded-2xl border border-navy-100 bg-white p-4 text-right hover:shadow-sm transition"
          >
            <span className="flex items-center justify-end gap-1 text-xs font-semibold text-ink-400">
              Buổi {String(next.n).padStart(2, "0")}
              <IconChevronRight className="w-3.5 h-3.5" />
            </span>
            <span className="block text-sm font-semibold text-ink-900 mt-0.5">{next.title}</span>
          </Link>
        ) : (
          <span className="flex-1" />
        )}
      </nav>
    </div>
  );
}
