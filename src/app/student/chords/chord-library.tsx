"use client";

import { useState, useTransition } from "react";
import { ChordDiagram } from "@/components/chord-diagram";
import { CHORDS, CHORD_GROUPS, chordNoteNames, type Chord } from "@/lib/curriculum";
import { playChord } from "@/lib/guitar-audio";
import { toggleChordAction } from "@/actions/learning";
import { btn } from "@/components/ui";
import { IconCheckCircle, IconX } from "@/components/icons";

export default function ChordLibrary({ learned }: { learned: string[] }) {
  const [group, setGroup] = useState<string>("Tất cả");
  const [open, setOpen] = useState<Chord | null>(null);
  const [marks, setMarks] = useState<string[]>(learned);
  const [, startTransition] = useTransition();

  const groups = ["Tất cả", ...CHORD_GROUPS];
  const list = group === "Tất cả" ? CHORDS : CHORDS.filter((c) => c.group === group);

  function toggleLearned(chord: Chord) {
    const isLearned = marks.includes(chord.name);
    // Cập nhật ngay trên màn hình rồi mới ghi xuống DB: bấm xong thấy đổi liền,
    // không phải chờ round-trip.
    setMarks((prev) =>
      isLearned ? prev.filter((c) => c !== chord.name) : [...prev, chord.name]
    );
    startTransition(() => {
      void toggleChordAction(chord.name, !isLearned);
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2 overflow-x-auto scroll-thin pb-1">
        {groups.map((g) => (
          <button
            key={g}
            onClick={() => setGroup(g)}
            className={`shrink-0 rounded-full px-3.5 py-1.5 text-sm font-semibold border transition ${
              group === g
                ? "bg-navy-800 text-white border-navy-800"
                : "bg-white text-ink-500 border-navy-200 hover:bg-ivory-100"
            }`}
          >
            {g}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
        {list.map((chord) => {
          const isLearned = marks.includes(chord.name);
          return (
            <button
              key={chord.name}
              onClick={() => {
                playChord(chord, { gain: 0.32 });
                setOpen(chord);
              }}
              className={`rounded-2xl border p-2.5 text-center transition hover:shadow-sm ${
                isLearned ? "border-mint-300 bg-mint-50" : "border-navy-100 bg-white"
              }`}
            >
              <ChordDiagram chord={chord} />
              <p className="font-bold text-ink-900 text-sm mt-1">{chord.name}</p>
              <p className="text-[11px] text-ink-400">{chord.group}</p>
            </button>
          );
        })}
      </div>

      {open && <ChordSheet chord={open} learned={marks.includes(open.name)} onClose={() => setOpen(null)} onToggle={toggleLearned} />}
    </div>
  );
}

function ChordSheet({
  chord,
  learned,
  onClose,
  onToggle,
}: {
  chord: Chord;
  learned: boolean;
  onClose: () => void;
  onToggle: (c: Chord) => void;
}) {
  const notes = chordNoteNames(chord);

  return (
    <div
      className="fixed inset-0 z-50 bg-navy-950/40 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-white w-full sm:max-w-sm rounded-t-3xl sm:rounded-2xl p-6 max-h-[88vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 mb-1">
          <div>
            <p className="text-xs uppercase tracking-wider text-ink-400 font-semibold">
              Hợp âm {chord.group.toLowerCase()}
            </p>
            <h2 className="text-2xl font-bold text-ink-900">{chord.name}</h2>
          </div>
          <button onClick={onClose} className={btn.ghost} aria-label="Đóng">
            <IconX className="w-5 h-5" />
          </button>
        </div>

        <div className="max-w-[200px] mx-auto my-3">
          <ChordDiagram chord={chord} size={190} showFingers />
        </div>

        <p className="text-center text-sm text-ink-500 tabular">
          Dây 6 → 1: {notes.join(" · ")}
        </p>

        <p className="text-sm text-ink-700 bg-ivory-100 rounded-xl px-3.5 py-3 mt-4">
          {chord.tip}
        </p>

        <div className="flex gap-2 mt-5">
          <button
            onClick={() => playChord(chord, { gain: 0.32 })}
            className={`${btn.secondary} flex-1`}
          >
            Nghe lại
          </button>
          <button
            onClick={() => onToggle(chord)}
            className={`${learned ? btn.danger : btn.primary} flex-1`}
          >
            {learned ? (
              "Bỏ đánh dấu"
            ) : (
              <>
                <IconCheckCircle className="w-4 h-4" />
                Đã thuộc
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
