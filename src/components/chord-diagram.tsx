import type { Chord } from "@/lib/curriculum";

/**
 * Sơ đồ thế bấm. Vẽ 6 dây × 5 ngăn; nếu hợp âm bấm cao hơn ngăn 4 thì cửa sổ
 * trượt xuống và ghi số ngăn đầu bên trái thay cho vạch đầu cần đàn.
 */
export function ChordDiagram({
  chord,
  size = 96,
  showFingers = false,
}: {
  chord: Chord;
  size?: number;
  showFingers?: boolean;
}) {
  const W = size;
  const rows = 5;
  const cols = 6;
  const padX = W * 0.14;
  const padTop = W * 0.2;
  const padBot = W * 0.06;
  const gw = W - padX * 2;
  const gh = gw * 1.15;
  const H = gh + padTop + padBot;
  const dx = gw / (cols - 1);
  const dy = gh / rows;
  const r = dx * 0.3;

  const pressed = chord.frets.filter((f) => f > 0);
  const minFret = pressed.length ? Math.min(...pressed) : 1;
  const base = minFret > 4 ? minFret : 1;

  const ink = "#1d2a3a";
  const line = "#c7d0dc";
  const muted = "#93a1b3";

  return (
    <svg
      viewBox={`0 0 ${W} ${H.toFixed(1)}`}
      className="w-full h-auto"
      role="img"
      aria-label={`Thế bấm hợp âm ${chord.name}`}
    >
      {base === 1 ? (
        <rect x={padX} y={padTop - 3.5} width={gw} height={3.5} fill={ink} />
      ) : (
        <text
          x={padX - 5}
          y={padTop + dy * 0.7}
          fontSize={W * 0.11}
          textAnchor="end"
          fill={muted}
        >
          {base}
        </text>
      )}

      {Array.from({ length: rows + 1 }, (_, i) => (
        <line
          key={`h${i}`}
          x1={padX}
          y1={padTop + i * dy}
          x2={padX + gw}
          y2={padTop + i * dy}
          stroke={line}
          strokeWidth={1}
        />
      ))}
      {Array.from({ length: cols }, (_, i) => (
        <line
          key={`v${i}`}
          x1={padX + i * dx}
          y1={padTop}
          x2={padX + i * dx}
          y2={padTop + gh}
          stroke={line}
          strokeWidth={1}
        />
      ))}

      {chord.frets.map((f, i) => {
        if (f > 0) return null;
        const x = padX + i * dx;
        const y = padTop - (base === 1 ? 8 : 6);
        const a = r * 0.55;
        return f === -1 ? (
          <path
            key={`m${i}`}
            d={`M${x - a} ${y - a}L${x + a} ${y + a}M${x + a} ${y - a}L${x - a} ${y + a}`}
            stroke={muted}
            strokeWidth={1.6}
            strokeLinecap="round"
          />
        ) : (
          <circle key={`m${i}`} cx={x} cy={y} r={a} fill="none" stroke={muted} strokeWidth={1.5} />
        );
      })}

      {chord.barre && chord.barre.fret >= base && (
        <line
          x1={padX + chord.barre.from * dx}
          y1={padTop + (chord.barre.fret - base + 0.5) * dy}
          x2={padX + chord.barre.to * dx}
          y2={padTop + (chord.barre.fret - base + 0.5) * dy}
          stroke={ink}
          strokeWidth={r * 1.9}
          strokeLinecap="round"
        />
      )}

      {chord.frets.map((f, i) => {
        if (f <= 0) return null;
        const onBarre =
          chord.barre &&
          f === chord.barre.fret &&
          i >= chord.barre.from &&
          i <= chord.barre.to;
        const x = padX + i * dx;
        const y = padTop + (f - base + 0.5) * dy;
        const finger = chord.fingers[i];
        return (
          <g key={`d${i}`}>
            {!onBarre && <circle cx={x} cy={y} r={r} fill={ink} />}
            {showFingers && finger > 0 && (
              <text
                x={x}
                y={y + r * 0.42}
                fontSize={r * 1.25}
                textAnchor="middle"
                fill="#ffffff"
                fontWeight={700}
              >
                {finger}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}
