"use client";

import { OPEN_MIDI, midiToFreq, type Chord } from "./curriculum";

/**
 * Bộ máy âm thanh chạy hoàn toàn trong trình duyệt: tổng hợp tiếng dây gảy bằng
 * Karplus-Strong nên không cần tải file mp3 nào, và dò cao độ bằng tự tương quan
 * cho phần lên dây đàn.
 *
 * Chỉ import từ client component — mọi hàm ở đây đụng Web Audio API.
 */

let ctx: AudioContext | null = null;
let master: GainNode | null = null;

export function getAudio(): AudioContext {
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.9;
    master.connect(ctx.destination);
  }
  // Trình duyệt treo AudioContext cho tới khi có tương tác của người dùng.
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

const pluckCache = new Map<number, AudioBuffer>();

function pluckBuffer(freq: number): AudioBuffer {
  const key = Math.round(freq * 10);
  const cached = pluckCache.get(key);
  if (cached) return cached;

  const c = getAudio();
  const sr = c.sampleRate;
  const len = Math.floor(sr * 2.6);
  const buf = c.createBuffer(1, len, sr);
  const out = buf.getChannelData(0);

  const N = Math.max(2, Math.round(sr / freq));
  const ring = new Float32Array(N);
  for (let i = 0; i < N; i++) ring[i] = Math.random() * 2 - 1;
  // Làm mềm nhiễu ban đầu, không thì tiếng gảy nghe chói như tiếng nổ.
  for (let k = 0; k < 3; k++) {
    for (let i = 0; i < N; i++) ring[i] = (ring[i] + ring[(i + 1) % N]) * 0.5;
  }

  const damp = 0.995 - Math.min(0.004, freq / 200000);
  let idx = 0;
  for (let i = 0; i < len; i++) {
    const cur = ring[idx];
    out[i] = cur;
    ring[idx] = (cur + ring[(idx + 1) % N]) * 0.5 * damp;
    idx = (idx + 1) % N;
  }
  const fade = Math.floor(sr * 0.12);
  for (let i = 0; i < fade; i++) out[len - 1 - i] *= i / fade;

  pluckCache.set(key, buf);
  return buf;
}

const live = new Set<AudioBufferSourceNode>();

export function playFreq(freq: number, when = 0, gain = 0.32) {
  const c = getAudio();
  const src = c.createBufferSource();
  src.buffer = pluckBuffer(freq);
  const g = c.createGain();
  g.gain.value = gain;
  src.connect(g).connect(master!);
  src.start(when || c.currentTime);
  live.add(src);
  src.onended = () => live.delete(src);
}

export interface StrumOptions {
  when?: number;
  /** Quạt lên: rải ngược từ dây nhỏ lên dây to */
  up?: boolean;
  /** Chỉ gảy 2 dây trầm (tiếng bass đầu ô nhịp) */
  bassOnly?: boolean;
  /** Chỉ 4 dây cao (dùng cho nhịp quạt lên cho nhẹ tiếng) */
  trebleOnly?: boolean;
  gain?: number;
  /** Độ trễ giữa hai dây liên tiếp, giây. Càng nhỏ càng giống quạt mạnh. */
  spread?: number;
}

export function playChord(chord: Chord, opts: StrumOptions = {}) {
  const c = getAudio();
  const t0 = opts.when || c.currentTime;
  const spread = opts.spread ?? 0.028;
  const gain = opts.gain ?? 0.3;

  let strings: number[] = [];
  chord.frets.forEach((f, i) => {
    if (f >= 0) strings.push(i);
  });
  if (opts.bassOnly) strings = strings.slice(0, 2);
  if (opts.trebleOnly) strings = strings.slice(-4);

  const order = opts.up ? [...strings].reverse() : strings;
  order.forEach((si, k) => {
    playFreq(midiToFreq(OPEN_MIDI[si] + chord.frets[si]), t0 + k * spread, gain * (opts.up ? 0.8 : 1));
  });
}

export function click(when: number, accent: boolean) {
  const c = getAudio();
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = "square";
  osc.frequency.value = accent ? 1600 : 1000;
  g.gain.setValueAtTime(0.0001, when);
  g.gain.exponentialRampToValueAtTime(accent ? 0.5 : 0.26, when + 0.002);
  g.gain.exponentialRampToValueAtTime(0.0001, when + 0.055);
  osc.connect(g).connect(master!);
  osc.start(when);
  osc.stop(when + 0.08);
}

export function stopAllSound() {
  live.forEach((n) => {
    try {
      n.stop();
    } catch {
      /* nút đã dừng rồi thì bỏ qua */
    }
  });
  live.clear();
}

/**
 * Dò cao độ bằng tự tương quan chuẩn hoá (ACF2+), có nội suy đỉnh parabol để
 * đủ mịn cho việc hiện sai số theo cent. Trả -1 khi tín hiệu quá nhỏ hoặc
 * không tìm được chu kỳ đáng tin.
 */
export function detectPitch(buf: Float32Array, sampleRate: number): number {
  const n = buf.length;
  let rms = 0;
  for (let i = 0; i < n; i++) rms += buf[i] * buf[i];
  rms = Math.sqrt(rms / n);
  if (rms < 0.008) return -1;

  const thr = 0.2;
  let r1 = 0;
  let r2 = n - 1;
  for (let i = 0; i < n / 2; i++) {
    if (Math.abs(buf[i]) < thr) {
      r1 = i;
      break;
    }
  }
  for (let i = 1; i < n / 2; i++) {
    if (Math.abs(buf[n - i]) < thr) {
      r2 = n - i;
      break;
    }
  }

  const b = buf.slice(r1, r2);
  const m = b.length;
  if (m < 512) return -1;

  const c = new Float32Array(m);
  for (let lag = 0; lag < m; lag++) {
    let sum = 0;
    for (let i = 0; i < m - lag; i++) sum += b[i] * b[i + lag];
    c[lag] = sum;
  }

  let d = 0;
  while (d < m - 1 && c[d] > c[d + 1]) d++;
  let max = -1;
  let pos = -1;
  for (let i = d; i < m; i++) {
    if (c[i] > max) {
      max = c[i];
      pos = i;
    }
  }
  if (pos <= 0) return -1;

  const x1 = c[pos - 1];
  const x2 = c[pos];
  const x3 = c[pos + 1] ?? 0;
  const a = (x1 + x3 - 2 * x2) / 2;
  const bq = (x3 - x1) / 2;
  const shift = a ? -bq / (2 * a) : 0;

  const freq = sampleRate / (pos + shift);
  return freq > 55 && freq < 1400 ? freq : -1;
}
