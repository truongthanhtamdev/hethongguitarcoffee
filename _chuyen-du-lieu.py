"""Chuyen giao trinh 28 bai + video + danh sach dan tu app tinh sang he thong.

Doc thang tu dayguitartaiquancafe/index.html de khong chep tay sai sot.
"""
import io
import json
import re

NGUON = r"C:\Users\tam\Downloads\claude code\dayguitartaiquancafe\index.html"
DICH_CURRICULUM = r"C:\Users\tam\Downloads\claude code\guitarcafe-he-thong\src\lib\curriculum.ts"
DICH_SHOP = r"C:\Users\tam\Downloads\claude code\guitarcafe-he-thong\src\lib\shop.ts"

src = io.open(NGUON, encoding="utf-8").read()


def khoi(ten):
    m = re.search(r"const %s = \[(.*?)\n\];" % ten, src, re.S)
    assert m, "khong thay " + ten
    return m.group(1)


# ------------------------------------------------------------------ bai ----
lessons = []
for d in khoi("LESSONS").split("\n"):
    d = d.strip()
    if not d.startswith("{n:"):
        continue
    g = lambda k, p=r'"([^"]*)"': re.search(k + r":" + p, d)
    n = int(re.search(r"\{n:(\d+)", d).group(1))
    ch = int(re.search(r"ch:(\d+)", d).group(1))
    no = int(re.search(r"no:(\d+)", d).group(1))
    bpm = int(re.search(r"bpm:(\d+)", d).group(1))
    chords = re.search(r"c:\[([^\]]*)\]", d).group(1)
    chords = [x.strip().strip('"') for x in chords.split(",") if x.strip()]
    lessons.append({
        "n": n, "ch": ch, "no": no,
        "title": g("t").group(1),
        "desc": g("d").group(1),
        "result": g("r").group(1),
        "practice": g("p").group(1),
        "chords": chords,
        "bpm": bpm,
        "url": g("url").group(1),
        "strum": g("strum").group(1),
        "video": g("video").group(1),
    })
print("bai:", len(lessons), "| co video:", sum(1 for l in lessons if l["video"]))

# ---------------------------------------------------------------- chuong ---
stages = []
for d in khoi("STAGES").split("\n"):
    d = d.strip()
    if not d.startswith("{ id:"):
        continue
    r = re.search(r"range:\[(\d+),\s*(\d+)\]", d)
    stages.append({
        "id": int(re.search(r"id:(\d+)", d).group(1)),
        "name": re.search(r'name:"([^"]*)"', d).group(1),
        "tag": re.search(r'tag:"([^"]*)"', d).group(1),
        "from": int(r.group(1)), "to": int(r.group(2)),
        "note": re.search(r'note:"([^"]*)"', d).group(1),
    })
print("chuong:", len(stages))

# ----------------------------------------------------------------- dieu ----
styles = []
for m in re.finditer(
    r'\{\s*id:"([^"]+)",\s*name:"([^"]+)",\s*beats:(\d+),\s*sub:(\d+),\s*defBpm:(\d+),\s*hits:\[([^\]]*)\],\s*note:"([^"]*)"',
    khoi("STRUM_STYLES"), re.S):
    hits = [x.strip() for x in m.group(6).split(",")]
    styles.append({
        "id": m.group(1), "name": m.group(2),
        "beats": int(m.group(3)), "sub": int(m.group(4)), "defBpm": int(m.group(5)),
        "hits": [None if h == "null" else h.strip('"') for h in hits],
        "note": m.group(7),
    })
print("dieu:", len(styles), [s["id"] for s in styles])

# ---------------------------------------------------------------- hop am ---
chords_ts = []
for d in khoi("CHORDS").split("\n"):
    d = d.strip()
    if not d.startswith("{name:"):
        continue
    chords_ts.append(d.rstrip(","))
print("hop am:", len(chords_ts))

# ------------------------------------------------------------------ dan ----
guitars = []
for d in khoi("GUITARS").split("\n"):
    d = d.strip()
    if not d.startswith("{ name:"):
        continue
    guitars.append({
        "name": re.search(r'name:"([^"]*)"', d).group(1),
        "price": re.search(r'price:"([^"]*)"', d).group(1),
        "priceOld": re.search(r'priceOld:"([^"]*)"', d).group(1),
        "soldOut": "soldOut:true" in d,
        "url": re.search(r'url:"([^"]*)"', d).group(1),
        "img": re.search(r'img:"([^"]*)"', d).group(1),
    })
print("dan:", len(guitars))

# ------------------------------------------------------------- xuat file ---
j = lambda o: json.dumps(o, ensure_ascii=False)


def dong_bai(l):
    return ("  { n: %d, ch: %d, no: %d, title: %s, desc: %s,\n"
            "    result: %s, practice: %s,\n"
            "    chords: %s, bpm: %d, strum: %s,\n"
            "    url: %s,\n"
            "    video: %s },") % (
        l["n"], l["ch"], l["no"], j(l["title"]), j(l["desc"]),
        j(l["result"]), j(l["practice"]),
        j(l["chords"]), l["bpm"], j(l["strum"]),
        j(l["url"]), j(l["video"]))


ts = '''/**
 * Giáo trình đệm hát cơ bản, lấy theo khoá trên guitardemhat.com:
 * 6 chương, 28 bài, 8 điệu. Mỗi bài kèm link video bài giảng và link tới
 * trang bài học gốc trên web.
 *
 * File này chỉ chứa dữ liệu thuần (không đụng DOM, không đụng DB) nên dùng
 * được ở cả server component lẫn client component.
 */

export interface Stage {
  id: number;
  name: string;
  tag: string;
  from: number;
  to: number;
  note: string;
}

export interface Lesson {
  n: number;
  /** Chương thứ mấy */
  ch: number;
  /** Bài thứ mấy trong chương — theo đúng cách đánh số trên web */
  no: number;
  title: string;
  desc: string;
  result: string;
  practice: string;
  /** Hợp âm mới học trong bài, khớp với `name` trong CHORDS */
  chords: string[];
  bpm: number;
  /** Điệu bài này dạy, khớp `id` trong STRUM_STYLES. Rỗng nếu bài không dạy điệu. */
  strum: string;
  /** Trang bài học gốc trên guitardemhat.com */
  url: string;
  /** Link video bài giảng. Rỗng nghĩa là chưa quay. */
  video: string;
}

export const STAGES: Stage[] = [
%s
];

export const LESSONS: Lesson[] = [
%s
];

export const TOTAL_LESSONS = LESSONS.length;

export interface Chord {
  name: string;
  group: string;
  /** Ngăn bấm theo thứ tự dây 6 → 1 (E A D G B e). -1 = không đánh, 0 = buông. */
  frets: number[];
  /** Ngón bấm 1..4, 0 = không có ngón */
  fingers: number[];
  barre?: { fret: number; from: number; to: number };
  tip: string;
}

export const CHORDS: Chord[] = [
%s
];

export const CHORD_BY_NAME: Record<string, Chord> = Object.fromEntries(
  CHORDS.map((c) => [c.name, c])
);

export const CHORD_GROUPS = Array.from(new Set(CHORDS.map((c) => c.group)));

/** Mẫu đệm: mỗi phần tử là một phách nhỏ. d = quạt xuống, u = quạt lên, b = bass, null = nghỉ */
export type StrumHit = "d" | "u" | "b" | null;

export interface StrumStyle {
  id: string;
  name: string;
  /** Số phách chính mỗi ô nhịp — cần cho cả 2/4, 3/4, 4/4 lẫn 6/8 */
  beats: number;
  /** Số phách nhỏ mỗi ô nhịp */
  sub: number;
  defBpm: number;
  hits: StrumHit[];
  note: string;
}

export const STRUM_STYLES: StrumStyle[] = [
%s
];

export const PROGRESSIONS: { name: string; chords: string[] }[] = [
  { name: "Am - C - G - Em", chords: ["Am", "C", "G", "Em"] },
  { name: "C - G - Am - F", chords: ["C", "G", "Am", "Fmaj7"] },
  { name: "C - G - D - Em", chords: ["C", "G", "D", "Em"] },
  { name: "G - D - Em - C", chords: ["G", "D", "Em", "C"] },
  { name: "Am - Dm - G - C", chords: ["Am", "Dm", "G", "C"] },
  { name: "C - Am - Dm - G7", chords: ["C", "Am", "Dm", "G7"] },
  { name: "G - D - Em - Bm", chords: ["G", "D", "Em", "Bm dễ"] },
  { name: "A - E - D - A", chords: ["A", "E", "D", "A"] },
];

/** Dây 6 → 1 */
export const STRING_NAMES = ["E", "A", "D", "G", "B", "e"];
export const OPEN_MIDI = [40, 45, 50, 55, 59, 64];
export const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

export function stageOf(lessonNo: number): Stage {
  return STAGES.find((s) => lessonNo >= s.from && lessonNo <= s.to) ?? STAGES[0];
}

export function lessonByNo(n: number): Lesson | undefined {
  return LESSONS.find((l) => l.n === n);
}

/**
 * Buổi kế tiếp = bài nhỏ nhất chưa hoàn thành. Nếu xong hết thì trả bài cuối,
 * để màn hình vẫn có nội dung hiển thị thay vì trống.
 */
export function nextLesson(doneNumbers: number[]): Lesson {
  const done = new Set(doneNumbers);
  return LESSONS.find((l) => !done.has(l.n)) ?? LESSONS[LESSONS.length - 1];
}

export function midiToFreq(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

/** Tên nốt của từng dây trong một thế bấm, dây 6 → 1. "x" = dây không đánh. */
export function chordNoteNames(chord: Chord): string[] {
  return chord.frets.map((f, i) => (f < 0 ? "x" : NOTE_NAMES[(OPEN_MIDI[i] + f) % 12]));
}

/**
 * Nhận link YouTube (đầy đủ, rút gọn, embed, shorts, live) và link file video
 * trực tiếp. Trả về kiểu nhúng để trang bài học biết vẽ iframe hay thẻ video.
 */
export function videoKind(url: string): { kind: "youtube"; id: string } | { kind: "file" } | null {
  if (!url) return null;
  const yt = url.match(
    /(?:youtu\\.be\\/|youtube\\.com\\/(?:watch\\?v=|embed\\/|shorts\\/|live\\/))([\\w-]{11})/
  );
  if (yt) return { kind: "youtube", id: yt[1] };
  if (/\\.(mp4|m4v|webm|ogg|ogv|mov)(\\?|#|$)/i.test(url)) return { kind: "file" };
  return null;
}
''' % (
    "\n".join(
        '  { id: %d, name: %s, tag: %s, from: %d, to: %d,\n    note: %s },'
        % (s["id"], j(s["name"]), j(s["tag"]), s["from"], s["to"], j(s["note"]))
        for s in stages),
    "\n".join(dong_bai(l) for l in lessons),
    "\n".join("  " + c + "," for c in chords_ts),
    "\n".join(
        '  { id: %s, name: %s, beats: %d, sub: %d, defBpm: %d,\n'
        '    hits: %s,\n    note: %s },'
        % (j(s["id"]), j(s["name"]), s["beats"], s["sub"], s["defBpm"],
           j(s["hits"]), j(s["note"]))
        for s in styles),
)

io.open(DICH_CURRICULUM, "w", encoding="utf-8", newline="").write(ts)
print("da ghi", DICH_CURRICULUM)

shop = '''/**
 * Đàn bán tại shop Sài Thành Guitar. Giá ở đây là bản chụp lúc cập nhật —
 * mỗi cây bấm được sang trang sản phẩm để xem giá và tồn kho mới nhất.
 */

export const SHOP_NAME = "Sài Thành Guitar";
export const SHOP_URL = "https://saithanhguitar.com/danh-muc/guitar";
export const SHOP_UPDATED = "06/09/2026";

export interface Guitar {
  name: string;
  price: string;
  /** Giá gốc trước giảm; rỗng nếu không giảm */
  priceOld: string;
  soldOut: boolean;
  url: string;
  /** Rỗng khi shop chặn dẫn ảnh từ ngoài — lúc đó hiện icon thay thế */
  img: string;
}

export const GUITARS: Guitar[] = [
%s
];
''' % "\n".join(
    '  { name: %s,\n    price: %s, priceOld: %s, soldOut: %s,\n'
    '    url: %s,\n    img: %s },'
    % (j(g["name"]), j(g["price"]), j(g["priceOld"]),
       "true" if g["soldOut"] else "false", j(g["url"]), j(g["img"]))
    for g in guitars)

io.open(DICH_SHOP, "w", encoding="utf-8", newline="").write(shop)
print("da ghi", DICH_SHOP)
