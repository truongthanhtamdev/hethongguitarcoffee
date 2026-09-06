"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { ChordDiagram } from "@/components/chord-diagram";
import {
  CHORD_BY_NAME,
  LESSONS,
  STAGES,
  nextLesson,
  type Lesson,
} from "@/lib/curriculum";
import { playChord } from "@/lib/guitar-audio";
import { toggleLessonAction } from "@/actions/learning";
import { btn } from "@/components/ui";
import { IconCheck, IconCheckCircle, IconX } from "@/components/icons";

export default function LessonList({ done }: { done: number[] }) {
  const [marks, setMarks] = useState<number[]>(done);
  const [stage, setStage] = useState<number>(0);
  const [open, setOpen] = useState<Lesson | null>(null);
  const [, startTransition] = useTransition();

  const current = nextLesson(marks).n;
  const shown = stage === 0 ? STAGES : STAGES.filter((s) => s.id === stage);

  function toggle(lesson: Lesson) {
    const isDone = marks.includes(lesson.n);
    setMarks((prev) => (isDone ? prev.filter((n) => n !== lesson.n) : [...prev, lesson.n]));
    startTransition(() => {
      void toggleLessonAction(lesson.n, !isDone);
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2 overflow-x-auto scroll-thin pb-1">
        {[{ id: 0, tag: "Tất cả" }, ...STAGES].map((s) => (
          <button
            key={s.id}
            onClick={() => setStage(s.id)}
            className={`shrink-0 rounded-full px-3.5 py-1.5 text-sm font-semibold border transition ${
              stage === s.id
                ? "bg-navy-800 text-white border-navy-800"
                : "bg-white text-ink-500 border-navy-200 hover:bg-ivory-100"
            }`}
          >
            {s.id === 0 ? "Tất cả" : `Chặng ${s.id} · ${s.tag}`}
          </button>
        ))}
      </div>

      {shown.map((s) => (
        <section key={s.id}>
          <div className="flex items-baseline gap-2 mb-1 mt-5 first:mt-0">
            <h3 className="font-bold text-ink-900">
              Chặng {s.id}: {s.name}
            </h3>
            <span className="text-xs text-ink-400">
              Buổi {s.from}-{s.to}
            </span>
          </div>
          <p className="text-sm text-ink-500 mb-3">{s.note}</p>

          <ul className="space-y-2">
            {LESSONS.filter((l) => l.n >= s.from && l.n <= s.to).map((l) => {
              const isDone = marks.includes(l.n);
              const isCurrent = l.n === current;
              return (
                <li key={l.n}>
                  <button
                    onClick={() => setOpen(l)}
                    className={`w-full flex items-center gap-3 rounded-2xl border bg-white px-3.5 py-3 text-left transition hover:shadow-sm ${
                      isCurrent ? "border-wood-400 ring-2 ring-wood-500/15" : "border-navy-100"
                    }`}
                  >
                    <span
                      className={`shrink-0 w-9 h-9 rounded-xl grid place-items-center font-bold text-sm ${
                        isDone
                          ? "bg-mint-500 text-white"
                          : isCurrent
                            ? "bg-wood-500 text-white"
                            : "bg-ivory-100 text-ink-400"
                      }`}
                    >
                      {isDone ? <IconCheck className="w-4 h-4" /> : l.n}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-semibold text-ink-900 text-sm">{l.title}</span>
                      <span className="block text-xs text-ink-500 truncate">{l.desc}</span>
                    </span>
                    <span
                      className={`shrink-0 text-[11px] font-semibold rounded-full px-2.5 py-1 ${
                        isDone
                          ? "bg-mint-50 text-mint-700"
                          : isCurrent
                            ? "bg-wood-50 text-wood-600"
                            : "bg-ivory-100 text-ink-400"
                      }`}
                    >
                      {isDone ? "Xong" : isCurrent ? "Đang học" : "Chưa học"}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      ))}

      {open && (
        <LessonSheet
          lesson={open}
          done={marks.includes(open.n)}
          onClose={() => setOpen(null)}
          onToggle={toggle}
        />
      )}
    </div>
  );
}

function LessonSheet({
  lesson,
  done,
  onClose,
  onToggle,
}: {
  lesson: Lesson;
  done: boolean;
  onClose: () => void;
  onToggle: (l: Lesson) => void;
}) {
  const chords = lesson.chords.map((n) => CHORD_BY_NAME[n]).filter(Boolean);

  return (
    <div
      className="fixed inset-0 z-50 bg-navy-950/40 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl p-6 max-h-[88vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wider text-ink-400 font-semibold">
              Buổi {String(lesson.n).padStart(2, "0")}
            </p>
            <h2 className="text-xl font-bold text-ink-900">{lesson.title}</h2>
          </div>
          <button onClick={onClose} className={btn.ghost} aria-label="Đóng">
            <IconX className="w-5 h-5" />
          </button>
        </div>

        <p className="text-sm text-ink-500 mt-1">{lesson.desc}</p>

        <dl className="mt-4 divide-y divide-navy-100 border-y border-navy-100">
          <div className="flex gap-3 py-2.5">
            <dt className="w-24 shrink-0 text-xs font-semibold text-ink-400 pt-0.5">Kết quả</dt>
            <dd className="text-sm text-ink-700">{lesson.result}</dd>
          </div>
          <div className="flex gap-3 py-2.5">
            <dt className="w-24 shrink-0 text-xs font-semibold text-ink-400 pt-0.5">Bài luyện</dt>
            <dd className="text-sm text-ink-700">{lesson.practice}</dd>
          </div>
          <div className="flex gap-3 py-2.5">
            <dt className="w-24 shrink-0 text-xs font-semibold text-ink-400 pt-0.5">Tempo</dt>
            <dd className="text-sm text-ink-700 tabular">
              {lesson.bpm} bpm ·{" "}
              <Link
                href={`/student/practice?bpm=${lesson.bpm}`}
                className="font-semibold text-wood-600 hover:text-wood-700"
              >
                mở metronome
              </Link>
            </dd>
          </div>
        </dl>

        {chords.length > 0 && (
          <div className="mt-4">
            <p className="text-xs uppercase tracking-wider text-ink-400 font-semibold mb-2">
              Hợp âm trong bài
            </p>
            <div className="grid grid-cols-4 gap-2">
              {chords.map((c) => (
                <button
                  key={c.name}
                  onClick={() => playChord(c, { gain: 0.32 })}
                  className="rounded-xl border border-navy-100 bg-white p-2 text-center hover:shadow-sm transition"
                >
                  <ChordDiagram chord={c} />
                  <p className="text-xs font-bold text-ink-900 mt-0.5">{c.name}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={() => {
            onToggle(lesson);
            onClose();
          }}
          className={`${done ? btn.danger : btn.primary} w-full mt-5 py-3`}
        >
          {done ? (
            "Bỏ đánh dấu hoàn thành"
          ) : (
            <>
              <IconCheckCircle className="w-4 h-4" />
              Đánh dấu đã học xong
            </>
          )}
        </button>
      </div>
    </div>
  );
}
