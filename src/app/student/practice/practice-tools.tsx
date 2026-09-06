"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  NOTE_NAMES,
  OPEN_MIDI,
  PROGRESSIONS,
  STRING_NAMES,
  STRUM_STYLES,
  CHORD_BY_NAME,
  midiToFreq,
} from "@/lib/curriculum";
import { click, detectPitch, getAudio, playChord, playFreq, stopAllSound } from "@/lib/guitar-audio";
import { logPracticeAction } from "@/actions/learning";
import { Card, btn, field, label } from "@/components/ui";

export type Tool = "metro" | "tuner" | "strum";

export default function PracticeTools({
  initialBpm,
  initialTool = "metro",
  initialStyle,
}: {
  initialBpm: number;
  initialTool?: Tool;
  initialStyle?: string;
}) {
  const [tool, setTool] = useState<Tool>(initialTool);

  // Mỗi phút luyện được cộng dồn ở client rồi mới ghi xuống DB một lần khi rời
  // trang, thay vì gọi server action liên tục trong lúc metronome đang chạy.
  const pendingMinutes = useRef(0);
  const flush = useCallback(() => {
    const mins = Math.round(pendingMinutes.current);
    if (mins <= 0) return;
    pendingMinutes.current -= mins;
    void logPracticeAction(mins);
  }, []);

  useEffect(() => {
    const timer = setInterval(flush, 60_000);
    const onHide = () => {
      if (document.hidden) {
        stopAllSound();
        flush();
      }
    };
    document.addEventListener("visibilitychange", onHide);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onHide);
      stopAllSound();
      flush();
    };
  }, [flush]);

  const countPractice = useCallback((seconds: number) => {
    pendingMinutes.current += seconds / 60;
  }, []);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2">
        {(
          [
            ["metro", "Metronome"],
            ["tuner", "Lên dây"],
            ["strum", "Máy đệm"],
          ] as [Tool, string][]
        ).map(([id, name]) => (
          <button
            key={id}
            onClick={() => {
              stopAllSound();
              setTool(id);
            }}
            className={`rounded-xl border py-2.5 text-sm font-semibold transition ${
              tool === id
                ? "bg-navy-800 text-white border-navy-800"
                : "bg-white text-ink-500 border-navy-200 hover:bg-ivory-100"
            }`}
          >
            {name}
          </button>
        ))}
      </div>

      {tool === "metro" && <Metronome initialBpm={initialBpm} onPractice={countPractice} />}
      {tool === "tuner" && <Tuner />}
      {tool === "strum" && (
        <StrumMachine initialStyle={initialStyle} onPractice={countPractice} />
      )}
    </div>
  );
}

/* ------------------------------- Metronome ------------------------------- */

function bpmLabel(v: number): string {
  if (v < 60) return "Rất chậm — tập thế bấm";
  if (v < 76) return "Chậm — tập chuyển hợp âm";
  if (v < 100) return "Vừa — đệm hát cơ bản";
  if (v < 130) return "Nhanh — quạt chả sôi động";
  return "Rất nhanh — chỉ để thử thách";
}

function Metronome({
  initialBpm,
  onPractice,
}: {
  initialBpm: number;
  onPractice: (seconds: number) => void;
}) {
  const [bpm, setBpm] = useState(initialBpm);
  const [beats, setBeats] = useState(4);
  const [running, setRunning] = useState(false);
  const [flash, setFlash] = useState(-1);

  // Bộ lập lịch đọc tempo/số phách qua ref để đổi được ngay giữa chừng mà
  // không phải dựng lại vòng lặp (dựng lại sẽ làm mất nhịp đang chạy).
  const bpmRef = useRef(bpm);
  const beatsRef = useRef(beats);
  useEffect(() => {
    bpmRef.current = bpm;
  }, [bpm]);
  useEffect(() => {
    beatsRef.current = beats;
  }, [beats]);

  useEffect(() => {
    if (!running) return;
    const ctx = getAudio();
    let beat = 0;
    let nextTime = ctx.currentTime + 0.08;
    const timeouts: number[] = [];

    // Bộ lập lịch nhìn trước: setInterval chỉ đặt lịch, còn thời điểm phát do
    // đồng hồ của Web Audio quyết định, nên nhịp không bị trôi khi tab bận.
    const id = window.setInterval(() => {
      while (nextTime < ctx.currentTime + 0.12) {
        const index = beat % beatsRef.current;
        click(nextTime, index === 0);
        const delay = Math.max(0, (nextTime - ctx.currentTime) * 1000);
        timeouts.push(window.setTimeout(() => setFlash(index), delay));
        nextTime += 60 / bpmRef.current;
        beat += 1;
      }
    }, 25);

    const started = Date.now();
    return () => {
      window.clearInterval(id);
      timeouts.forEach((t) => window.clearTimeout(t));
      onPractice((Date.now() - started) / 1000);
    };
  }, [running, onPractice]);

  const [taps, setTaps] = useState<number[]>([]);
  function tap() {
    const now = performance.now();
    const recent = [...taps.filter((t) => now - t < 2500), now];
    setTaps(recent);
    if (recent.length >= 2) {
      let sum = 0;
      for (let i = 1; i < recent.length; i++) sum += recent[i] - recent[i - 1];
      const avg = sum / (recent.length - 1);
      setBpm(Math.min(200, Math.max(40, Math.round(60000 / avg))));
    }
  }

  return (
    <>
      <Card>
        <div className="text-center py-1">
          <p className="text-6xl font-extrabold text-ink-900 tabular leading-none">{bpm}</p>
          <p className="text-xs text-ink-400 uppercase tracking-wider mt-1.5">{bpmLabel(bpm)}</p>
        </div>

        <input
          type="range"
          min={40}
          max={200}
          value={bpm}
          onChange={(e) => setBpm(Number(e.target.value))}
          className="w-full mt-4 accent-wood-500"
          aria-label="Tốc độ metronome"
        />

        <div className="flex gap-2 mt-3">
          <button
            onClick={() => setBpm((v) => Math.max(40, v - 1))}
            className={`${btn.secondary} w-12`}
            aria-label="Giảm tốc độ"
          >
            −
          </button>
          <button onClick={() => setRunning((v) => !v)} className={`${btn.primary} flex-1 py-3`}>
            {running ? "Dừng" : "Bắt đầu"}
          </button>
          <button
            onClick={() => setBpm((v) => Math.min(200, v + 1))}
            className={`${btn.secondary} w-12`}
            aria-label="Tăng tốc độ"
          >
            +
          </button>
        </div>

        <div className="flex justify-center gap-2 mt-5">
          {Array.from({ length: beats }, (_, i) => (
            <span
              key={i}
              className={`w-3.5 h-3.5 rounded-full border transition-transform ${
                running && flash === i
                  ? i === 0
                    ? "bg-wood-500 border-wood-500 scale-125"
                    : "bg-navy-700 border-navy-700 scale-125"
                  : "bg-ivory-100 border-navy-200"
              }`}
            />
          ))}
        </div>
      </Card>

      <Card>
        <label className={label} htmlFor="metro-beats">
          Số phách mỗi ô nhịp
        </label>
        <select
          id="metro-beats"
          className={field}
          value={beats}
          onChange={(e) => setBeats(Number(e.target.value))}
        >
          <option value={4}>4/4 — Ballad, quạt chả</option>
          <option value={3}>3/4 — Valse</option>
          <option value={6}>6/8 — Slow Rock</option>
          <option value={2}>2/4 — hành khúc</option>
        </select>

        <button onClick={tap} className={`${btn.secondary} w-full mt-3`}>
          Gõ nhịp theo tay (tap tempo)
        </button>
        <p className="text-sm text-ink-500 mt-3">
          Tập chuyển hợp âm ở 60-70 bpm trước, chỉ tăng tốc khi ba vòng liền không vấp.
        </p>
      </Card>
    </>
  );
}

/* --------------------------------- Tuner --------------------------------- */

function Tuner() {
  const [on, setOn] = useState(false);
  const [note, setNote] = useState<{ name: string; octave: number; cents: number; freq: number } | null>(null);
  const [hint, setHint] = useState("Bấm bật mic rồi gảy từng dây một.");
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (!on) return;
    let raf = 0;
    let cancelled = false;

    (async () => {
      try {
        const ctx = getAudio();
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;

        const src = ctx.createMediaStreamSource(stream);
        const hp = ctx.createBiquadFilter();
        hp.type = "highpass";
        hp.frequency.value = 60;
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 4096;
        src.connect(hp).connect(analyser);

        const buf = new Float32Array(analyser.fftSize);
        setHint("Đang nghe… để đàn cách mic khoảng 20cm và gảy một dây.");

        const loop = () => {
          analyser.getFloatTimeDomainData(buf);
          const freq = detectPitch(buf, ctx.sampleRate);
          if (freq > 0) {
            const midi = 69 + 12 * Math.log2(freq / 440);
            const near = Math.round(midi);
            setNote({
              name: NOTE_NAMES[((near % 12) + 12) % 12],
              octave: Math.floor(near / 12) - 1,
              cents: Math.round((midi - near) * 100),
              freq,
            });
          }
          raf = requestAnimationFrame(loop);
        };
        loop();
      } catch {
        setOn(false);
        setHint(
          "Không truy cập được micro. Cho phép quyền mic, và nhớ mở trang bằng https hoặc localhost."
        );
      }
    })();

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      setNote(null);
    };
  }, [on]);

  const inTune = note !== null && Math.abs(note.cents) <= 5;
  const needleLeft = note ? 50 + Math.max(-50, Math.min(50, note.cents)) * 0.9 : 50;

  return (
    <>
      <Card>
        <div className="relative h-32">
          <div className="absolute inset-x-0 top-1 text-center">
            <p
              className={`text-5xl font-extrabold leading-none ${
                inTune ? "text-mint-600" : "text-ink-900"
              }`}
            >
              {note ? note.name : "—"}
            </p>
            <p className="text-xs text-ink-400 tabular mt-1.5">
              {note
                ? `${note.octave} · ${note.cents > 0 ? "+" : ""}${note.cents} cent · ${note.freq.toFixed(1)} Hz`
                : hint}
            </p>
          </div>
          <div className="absolute inset-x-0 bottom-8 h-0.5 bg-navy-100" />
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-0.5 h-5 bg-navy-700" />
          <div
            className="absolute bottom-5 w-1 h-11 rounded -translate-x-1/2 transition-[left,background-color] duration-100"
            style={{
              left: `${needleLeft}%`,
              backgroundColor: !note
                ? "#c7d0dc"
                : inTune
                  ? "#3f9e78"
                  : Math.abs(note.cents) < 20
                    ? "#b8893f"
                    : "#c96a56",
            }}
          />
        </div>

        <button onClick={() => setOn((v) => !v)} className={`${btn.primary} w-full py-3`}>
          {on ? "Tắt mic" : "Bật mic để lên dây"}
        </button>
        {on && <p className="text-sm text-ink-500 mt-3 text-center">{hint}</p>}
      </Card>

      <Card>
        <p className="font-semibold text-ink-900 mb-3">Nghe nốt mẫu</p>
        <div className="grid grid-cols-6 gap-2">
          {OPEN_MIDI.map((m, i) => (
            <button
              key={i}
              onClick={() => playFreq(midiToFreq(m), 0, 0.4)}
              className={`rounded-xl border py-2.5 font-bold transition ${
                note && inTune && Math.round(69 + 12 * Math.log2(note.freq / 440)) === m
                  ? "border-mint-300 bg-mint-50 text-mint-700"
                  : "border-navy-200 bg-white text-ink-900 hover:bg-ivory-100"
              }`}
            >
              {STRING_NAMES[i]}
              <span className="block text-[10px] font-semibold text-ink-400">dây {6 - i}</span>
            </button>
          ))}
        </div>
        <p className="text-sm text-ink-500 mt-3">
          Thứ tự dây 6 → 1: E A D G B E. Dây 6 to nhất nằm trên cùng khi ôm đàn.
        </p>
      </Card>
    </>
  );
}

/* ------------------------------ Strum machine ----------------------------- */

function StrumMachine({
  initialStyle,
  onPractice,
}: {
  initialStyle?: string;
  onPractice: (seconds: number) => void;
}) {
  const startStyle = STRUM_STYLES.find((s) => s.id === initialStyle) ?? STRUM_STYLES[0];
  const [styleId, setStyleId] = useState(startStyle.id);
  const [progIdx, setProgIdx] = useState(0);
  const [bpm, setBpm] = useState(startStyle.defBpm);
  const [running, setRunning] = useState(false);
  const [slot, setSlot] = useState(-1);
  const [chordName, setChordName] = useState(PROGRESSIONS[0].chords[0]);

  const style = STRUM_STYLES.find((s) => s.id === styleId) ?? STRUM_STYLES[0];
  const prog = PROGRESSIONS[progIdx];

  // Cùng lý do như metronome: đổi tempo / vòng hợp âm giữa chừng không được
  // làm dựng lại vòng lặp đang phát.
  const bpmRef = useRef(bpm);
  const styleRef = useRef(style);
  const progRef = useRef(prog);
  useEffect(() => {
    bpmRef.current = bpm;
  }, [bpm]);
  useEffect(() => {
    styleRef.current = style;
  }, [style]);
  useEffect(() => {
    progRef.current = prog;
  }, [prog]);

  useEffect(() => {
    if (!running) return;
    const ctx = getAudio();
    let step = 0;
    let nextTime = ctx.currentTime + 0.1;
    const timeouts: number[] = [];

    const id = window.setInterval(() => {
      const st = styleRef.current;
      // Số phách nhỏ trên một phách chính lấy từ chính điệu đó, vì giáo trình
      // có cả 2/4, 3/4, 4/4 lẫn 6/8 chứ không chỉ 4/4 và 6/8.
      const dt = 60 / bpmRef.current / (st.sub / st.beats);

      while (nextTime < ctx.currentTime + 0.14) {
        const s = step % st.sub;
        const bar = Math.floor(step / st.sub);
        const names = progRef.current.chords;
        const name = names[bar % names.length];
        const chord = CHORD_BY_NAME[name];
        const hit = st.hits[s];

        if (chord && hit === "b") {
          playChord(chord, { when: nextTime, bassOnly: true, gain: 0.34, spread: 0.05 });
        } else if (chord && hit === "d") {
          playChord(chord, { when: nextTime, gain: 0.28, spread: 0.022 });
        } else if (chord && hit === "u") {
          playChord(chord, { when: nextTime, up: true, trebleOnly: true, gain: 0.22, spread: 0.018 });
        }

        const delay = Math.max(0, (nextTime - ctx.currentTime) * 1000);
        timeouts.push(
          window.setTimeout(() => {
            setSlot(s);
            setChordName(name);
          }, delay)
        );

        nextTime += dt;
        step += 1;
      }
    }, 25);

    const started = Date.now();
    return () => {
      window.clearInterval(id);
      timeouts.forEach((t) => window.clearTimeout(t));
      stopAllSound();
      onPractice((Date.now() - started) / 1000);
    };
  }, [running, onPractice]);

  return (
    <>
      <Card>
        <div className="text-center">
          <p className="text-5xl font-extrabold text-ink-900 leading-none">{chordName}</p>
          <p className="text-xs text-ink-400 mt-1.5">{style.name}</p>
        </div>

        <div className="flex justify-center gap-1.5 mt-4 flex-wrap">
          {style.hits.map((h, i) => (
            <span
              key={i}
              className={`w-8 h-11 rounded-lg border grid place-items-center text-base font-bold transition ${
                running && slot === i
                  ? "bg-navy-800 text-white border-navy-800"
                  : h
                    ? "bg-white text-ink-700 border-navy-200"
                    : "bg-white text-ink-400/50 border-navy-100"
              }`}
            >
              {h === "d" ? "↓" : h === "u" ? "↑" : h === "b" ? "●" : "·"}
            </span>
          ))}
        </div>

        <div className="flex justify-center gap-1.5 mt-3 flex-wrap">
          {prog.chords.map((c, i) => (
            <span
              key={`${c}-${i}`}
              className={`rounded-lg border px-3 py-1.5 text-sm font-semibold ${
                c === chordName
                  ? "bg-wood-500 text-white border-wood-500"
                  : "bg-white text-ink-700 border-navy-200"
              }`}
            >
              {c}
            </span>
          ))}
        </div>

        <button
          onClick={() => setRunning((v) => !v)}
          className={`${btn.primary} w-full py-3 mt-5`}
        >
          {running ? "Dừng đệm" : "Bắt đầu đệm"}
        </button>
      </Card>

      <Card>
        <label className={label} htmlFor="strum-style">
          Kiểu đệm
        </label>
        <select
          id="strum-style"
          className={field}
          value={styleId}
          onChange={(e) => {
            const next = STRUM_STYLES.find((s) => s.id === e.target.value) ?? STRUM_STYLES[0];
            setRunning(false);
            setStyleId(next.id);
            setBpm(next.defBpm);
          }}
        >
          {STRUM_STYLES.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>

        <label className={`${label} mt-4`} htmlFor="strum-prog">
          Vòng hợp âm
        </label>
        <select
          id="strum-prog"
          className={field}
          value={progIdx}
          onChange={(e) => setProgIdx(Number(e.target.value))}
        >
          {PROGRESSIONS.map((p, i) => (
            <option key={p.name} value={i}>
              {p.name}
            </option>
          ))}
        </select>

        <label className={`${label} mt-4`} htmlFor="strum-bpm">
          Tốc độ: <span className="tabular">{bpm} bpm</span>
        </label>
        <input
          id="strum-bpm"
          type="range"
          min={50}
          max={140}
          value={bpm}
          onChange={(e) => setBpm(Number(e.target.value))}
          className="w-full accent-wood-500"
        />

        <p className="text-sm text-ink-500 mt-3">{style.note}</p>
      </Card>
    </>
  );
}
