"use client";

import { ChordDiagram } from "@/components/chord-diagram";
import { chordNoteNames, type Chord } from "@/lib/curriculum";
import { playChord } from "@/lib/guitar-audio";

export default function LessonChords({ chords }: { chords: Chord[] }) {
  return (
    <ul className="space-y-3">
      {chords.map((chord) => (
        <li
          key={chord.name}
          className="flex gap-4 items-start rounded-2xl border border-navy-100 bg-ivory-50 p-3"
        >
          <button
            onClick={() => playChord(chord, { gain: 0.32 })}
            className="shrink-0 w-24 rounded-xl bg-white border border-navy-100 p-2 hover:shadow-sm transition"
            aria-label={`Nghe hợp âm ${chord.name}`}
          >
            <ChordDiagram chord={chord} size={110} showFingers />
          </button>

          <div className="min-w-0 flex-1">
            <p className="font-bold text-ink-900">{chord.name}</p>
            <p className="text-xs text-ink-400 tabular mt-0.5">
              Dây 6 → 1: {chordNoteNames(chord).join(" · ")}
            </p>
            <p className="text-sm text-ink-700 mt-1.5">{chord.tip}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
