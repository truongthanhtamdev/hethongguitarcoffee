/**
 * Nội dung học guitar đệm hát cơ bản: 36 buổi chia 6 chặng, thư viện hợp âm,
 * các mẫu đệm và vòng hợp âm dùng cho máy đệm.
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
  title: string;
  desc: string;
  result: string;
  practice: string;
  /** Hợp âm mới học trong buổi, khớp với `name` trong CHORDS */
  chords: string[];
  bpm: number;
}

export const STAGES: Stage[] = [
  {
    id: 1,
    name: "Làm quen đàn và nhịp",
    tag: "Nền tảng",
    from: 1,
    to: 6,
    note: "Cầm đàn đúng, đọc hợp âm và chơi những vòng đầu tiên.",
  },
  {
    id: 2,
    name: "14 hợp âm trưởng/thứ",
    tag: "14 hợp âm",
    from: 7,
    to: 14,
    note: "Mở rộng vốn hợp âm để bắt đầu đệm được nhiều bài phổ biến.",
  },
  {
    id: 3,
    name: "Điệu Slow Rock",
    tag: "Slow Rock",
    from: 15,
    to: 20,
    note: "Vào nhịp đệm hát đầu tiên: chậm, đều và dễ hát theo.",
  },
  {
    id: 4,
    name: "Điệu Ballad",
    tag: "Ballad",
    from: 21,
    to: 26,
    note: "Đệm mềm hơn, giữ cảm xúc và không làm gãy lời hát.",
  },
  {
    id: 5,
    name: "Quạt chả và ứng dụng bài hát",
    tag: "Quạt chả",
    from: 27,
    to: 32,
    note: "Chắc tay phải hơn và áp dụng vào bài phổ thông.",
  },
  {
    id: 6,
    name: "Hoàn thiện đệm hát cơ bản",
    tag: "Tốt nghiệp",
    from: 33,
    to: 36,
    note: "Ôn, sửa lỗi và hoàn thành bài tốt nghiệp.",
  },
];

export const LESSONS: Lesson[] = [
  { n: 1, title: "Làm quen guitar", desc: "Tư thế ngồi, cách cầm đàn, tên dây.", result: "Biết cầm đàn đúng và gảy từng dây rõ tiếng.", practice: "Gảy dây 1-6 chậm, đều 5 phút/ngày.", chords: [], bpm: 60 },
  { n: 2, title: "Tay trái và tay phải", desc: "Bấm phím, móng/tay gảy, tránh rè tiếng.", result: "Bấm được nốt đơn và nghe ra tiếng sạch/rè.", practice: "Bấm từng ngăn trên dây 1 và dây 2.", chords: [], bpm: 60 },
  { n: 3, title: "Đọc sơ đồ hợp âm", desc: "Ký hiệu dây, phím, ngón tay, dây không đánh.", result: "Tự nhìn chart và đặt tay theo sơ đồ.", practice: "Đọc 5 sơ đồ hợp âm mẫu trong app.", chords: ["Em", "Am", "C", "G", "D"], bpm: 60 },
  { n: 4, title: "Nhịp và phách", desc: "Đếm 1-2-3-4, vỗ nhịp, giữ tempo chậm.", result: "Giữ nhịp đều khi gảy xuống.", practice: "Bật metronome 60 bpm và gảy xuống 4 phách.", chords: [], bpm: 60 },
  { n: 5, title: "Hợp âm Em và Am", desc: "Hai hợp âm thứ dễ nhất cho người mới.", result: "Bấm và chuyển Em - Am chậm, sạch tiếng.", practice: "Chuyển Em - Am 30 vòng/ngày.", chords: ["Em", "Am"], bpm: 60 },
  { n: 6, title: "Hợp âm C và G", desc: "Thêm hai hợp âm trưởng thường gặp.", result: "Chơi vòng C - G - Am - Em chậm.", practice: "Quay video 45 giây vòng C - G - Am - Em.", chords: ["C", "G"], bpm: 62 },
  { n: 7, title: "Hợp âm D và Dm", desc: "Tập cụm dây dưới và kiểm soát dây không đánh.", result: "Bấm được D, Dm và chuyển từ Am sang Dm.", practice: "Am - Dm - G - C, 20 vòng.", chords: ["D", "Dm"], bpm: 64 },
  { n: 8, title: "Hợp âm A và E", desc: "Nhóm hợp âm mở dùng nhiều trong giọng A/E.", result: "Chuyển A - E - D đúng nhịp chậm.", practice: "A - E - D - A với metronome 65 bpm.", chords: ["A", "E"], bpm: 65 },
  { n: 9, title: "Hợp âm F và Fmaj7", desc: "Làm quen thế bấm khó hơn trước khi chặn.", result: "Biết phương án F dễ để ghép bài hát cơ bản.", practice: "C - Fmaj7 - G - C, giữ tiếng sạch.", chords: ["Fmaj7", "F"], bpm: 64 },
  { n: 10, title: "Hợp âm Bm đơn giản", desc: "Làm quen hợp âm cần lực tay và chuyển chậm.", result: "Chơi được Bm phiên bản dễ trong vòng cơ bản.", practice: "G - D - Em - Bm chậm, 15 vòng.", chords: ["Bm dễ", "Bm"], bpm: 62 },
  { n: 11, title: "Hợp âm G7 và E7", desc: "Thêm màu dominant để kết câu bài hát.", result: "Biết dùng G7/E7 trong vòng đệm đơn giản.", practice: "C - Am - Dm - G7, 20 vòng.", chords: ["G7", "E7"], bpm: 66 },
  { n: 12, title: "Chuyển Am - C - G - Em", desc: "Luyện chuyển mượt giữa các hợp âm đã học.", result: "Không dừng quá lâu khi đổi hợp âm.", practice: "Luyện 10 phút/ngày, ghi âm kiểm tra nhịp.", chords: ["Am", "C", "G", "Em"], bpm: 68 },
  { n: 13, title: "Chuyển C - G - D - Em", desc: "Vòng hợp âm phổ biến trong nhiều bài hát.", result: "Chơi vòng 4 hợp âm liên tục trong 1 phút.", practice: "Quay video vòng C - G - D - Em.", chords: ["C", "G", "D", "Em"], bpm: 70 },
  { n: 14, title: "Ôn 14 hợp âm", desc: "Kiểm tra tất cả hợp âm trưởng/thứ đã học.", result: "Nhớ mặt hợp âm và chuyển được theo vòng ngắn.", practice: "Checklist 14 hợp âm trong app.", chords: [], bpm: 70 },
  { n: 15, title: "Nhịp Slow Rock", desc: "Đếm nhịp, cảm giác phách mạnh và nhẹ.", result: "Gảy được mẫu Slow Rock cơ bản ở tempo chậm.", practice: "Metronome 60 bpm, lặp 3 phút không dừng.", chords: ["Am", "C"], bpm: 60 },
  { n: 16, title: "Slow Rock: Am - C - G - Em", desc: "Ghép mẫu đệm vào vòng hợp âm quen.", result: "Vừa đổi hợp âm vừa giữ mẫu đệm đều.", practice: "Quay 60 giây vòng Am - C - G - Em.", chords: ["Am", "C", "G", "Em"], bpm: 64 },
  { n: 17, title: "Slow Rock: C - G - Am - F", desc: "Luyện vòng pop/ballad phổ biến.", result: "Đệm được đoạn verse đơn giản của bài hát.", practice: "Chơi 2 vòng không vấp nhịp.", chords: ["C", "G", "Am", "F"], bpm: 66 },
  { n: 18, title: "Ghép lời hát đơn giản", desc: "Vừa đệm vừa hát hoặc ngân giai điệu.", result: "Biết đặt hợp âm đúng vị trí lời bài hát.", practice: "Chọn 1 bài dễ và đánh dấu điểm đổi hợp âm.", chords: [], bpm: 66 },
  { n: 19, title: "Sửa lỗi nhịp Slow Rock", desc: "Chậm nhịp, nhanh nhịp, đổi hợp âm bị khựng.", result: "Tự nghe lỗi và quay lại tempo chậm.", practice: "Ghi âm 2 bản: chậm và tốc độ mục tiêu.", chords: [], bpm: 62 },
  { n: 20, title: "Kiểm tra Slow Rock", desc: "Đệm một bài ngắn với vòng hợp âm đã học.", result: "Đệm được bài đầu tiên ở mức cơ bản.", practice: "Nộp video Slow Rock 1 đoạn verse/điệp khúc.", chords: [], bpm: 68 },
  { n: 21, title: "Nhịp Ballad cơ bản", desc: "Mẫu rải/quạt nhẹ cho bài chậm.", result: "Chơi được mẫu Ballad chậm và đều.", practice: "Lặp mẫu Ballad 5 phút với C.", chords: ["C"], bpm: 66 },
  { n: 22, title: "Ballad: C - G - Am - F", desc: "Ghép hợp âm vào mẫu đệm mềm.", result: "Đệm được vòng Ballad phổ biến.", practice: "C - G - Am - F, 20 vòng chậm.", chords: ["C", "G", "Am", "F"], bpm: 70 },
  { n: 23, title: "Ballad: G - D - Em - C", desc: "Vòng hợp âm dễ ứng dụng cho nhiều bài.", result: "Chuyển hợp âm mượt khi tay phải vẫn giữ nhịp.", practice: "Quay 60 giây vòng G - D - Em - C.", chords: ["G", "D", "Em", "C"], bpm: 72 },
  { n: 24, title: "Đệm hát Ballad", desc: "Đặt hợp âm theo câu hát, vào đúng ô nhịp.", result: "Đệm và hát được một đoạn ngắn không mất nhịp.", practice: "Tập 1 bài Ballad yêu thích ở tempo chậm.", chords: [], bpm: 72 },
  { n: 25, title: "Tăng giảm lực tay phải", desc: "Nhấn nhẹ verse, mạnh hơn điệp khúc.", result: "Biết làm bài hát có sắc thái hơn.", practice: "Đánh cùng vòng hợp âm với 2 mức lực khác nhau.", chords: [], bpm: 72 },
  { n: 26, title: "Kiểm tra Ballad", desc: "Đệm một bài chậm có verse và điệp khúc.", result: "Đệm hát Ballad cơ bản, đều và dễ nghe.", practice: "Nộp video Ballad 90 giây.", chords: [], bpm: 74 },
  { n: 27, title: "Kỹ thuật quạt chả", desc: "Hướng xuống/lên, cổ tay thả lỏng.", result: "Quạt được mẫu cơ bản không bị cứng tay.", practice: "Quạt dây chết 5 phút để ổn tay phải.", chords: [], bpm: 76 },
  { n: 28, title: "Quạt chả: C - G - Am - F", desc: "Ghép tay phải vào vòng hợp âm quen.", result: "Đổi hợp âm không làm rơi nhịp quạt.", practice: "Chơi 20 vòng, ưu tiên đều nhịp.", chords: ["C", "G", "Am", "F"], bpm: 80 },
  { n: 29, title: "Nhấn và ngắt", desc: "Tạo điểm nhấn cho điệp khúc.", result: "Biết làm mẫu quạt có groove rõ hơn.", practice: "Luyện nhấn phách 2 và 4 ở tempo chậm.", chords: [], bpm: 78 },
  { n: 30, title: "Ứng dụng bài vui/nhanh", desc: "Chọn bài có tiết tấu rõ để tập quạt.", result: "Đệm được đoạn điệp khúc năng lượng hơn.", practice: "Nộp video 60 giây điệp khúc.", chords: [], bpm: 88 },
  { n: 31, title: "Đổi Ballad ↔ quạt chả", desc: "Verse nhẹ, điệp khúc mạnh.", result: "Biết đổi kiểu đệm theo cấu trúc bài hát.", practice: "Tập 1 verse Ballad và 1 chorus quạt chả.", chords: [], bpm: 82 },
  { n: 32, title: "Kiểm tra quạt chả", desc: "Đệm một bài ngắn với kỹ thuật nhấn/ngắt.", result: "Chơi được quạt chả cơ bản trong bài hát.", practice: "Nộp video bài quạt chả 90 giây.", chords: [], bpm: 84 },
  { n: 33, title: "Ôn 14 hợp âm", desc: "Kiểm tra trí nhớ hợp âm và tốc độ chuyển.", result: "Tự chọn hợp âm đúng khi nhìn sheet bài đơn giản.", practice: "Checklist hợp âm: đạt / chưa đạt / cần luyện thêm.", chords: [], bpm: 80 },
  { n: 34, title: "Ôn 3 kiểu đệm", desc: "Slow Rock, Ballad, quạt chả.", result: "Biết chọn kiểu đệm phù hợp bài chậm hoặc vui.", practice: "Đệm cùng một vòng hợp âm bằng 3 kiểu khác nhau.", chords: [], bpm: 78 },
  { n: 35, title: "Chuẩn bị bài tốt nghiệp", desc: "Chọn bài, chia đoạn, đánh dấu hợp âm.", result: "Có bản dựng hoàn chỉnh để biểu diễn / ghi hình.", practice: "Tập full bài và ghi lại lỗi cần sửa.", chords: [], bpm: 76 },
  { n: 36, title: "Bài tốt nghiệp", desc: "Đệm hát một bài hoàn chỉnh ở mức cơ bản.", result: "Hoàn thành trình độ cơ bản, biết tự luyện bài mới.", practice: "Giáo viên nhận xét và gợi ý lộ trình tiếp theo.", chords: [], bpm: 76 },
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
  { name: "Em", group: "Cơ bản", frets: [0, 2, 2, 0, 0, 0], fingers: [0, 2, 3, 0, 0, 0], tip: "Ngón 2 và 3 nằm ngăn 2, gảy đủ 6 dây." },
  { name: "Am", group: "Cơ bản", frets: [-1, 0, 2, 2, 1, 0], fingers: [0, 0, 2, 3, 1, 0], tip: "Không đánh dây 6. Ngón 1 ở dây 2 ngăn 1." },
  { name: "C", group: "Cơ bản", frets: [-1, 3, 2, 0, 1, 0], fingers: [0, 3, 2, 0, 1, 0], tip: "Cong ngón để dây 1 và 3 vẫn kêu buông." },
  { name: "G", group: "Cơ bản", frets: [3, 2, 0, 0, 3, 3], fingers: [2, 1, 0, 0, 3, 4], tip: "Dùng ngón 3-4 cho hai dây cao để chuyển sang C nhanh hơn." },
  { name: "D", group: "Cơ bản", frets: [-1, -1, 0, 2, 3, 2], fingers: [0, 0, 0, 1, 3, 2], tip: "Chỉ đánh 4 dây dưới, giữ hình tam giác." },
  { name: "Dm", group: "Cơ bản", frets: [-1, -1, 0, 2, 3, 1], fingers: [0, 0, 0, 2, 3, 1], tip: "Giống D nhưng dây 1 lùi về ngăn 1." },
  { name: "A", group: "Cơ bản", frets: [-1, 0, 2, 2, 2, 0], fingers: [0, 0, 1, 2, 3, 0], tip: "Ba ngón thẳng hàng ngăn 2, dây 1 buông." },
  { name: "E", group: "Cơ bản", frets: [0, 2, 2, 1, 0, 0], fingers: [0, 2, 3, 1, 0, 0], tip: "Nền của mọi hợp âm chặn dạng E." },
  { name: "Fmaj7", group: "Cơ bản", frets: [-1, -1, 3, 2, 1, 0], fingers: [0, 0, 3, 2, 1, 0], tip: "Bản dễ thay F cho người mới, dùng chung vòng với C." },
  { name: "Bm dễ", group: "Cơ bản", frets: [-1, -1, 0, 4, 3, 2], fingers: [0, 0, 0, 3, 2, 1], tip: "Bm không cần chặn, hợp cho bài G - D - Em - Bm." },
  { name: "G7", group: "Dominant", frets: [3, 2, 0, 0, 0, 1], fingers: [3, 2, 0, 0, 0, 1], tip: "Kết câu về C rất mượt." },
  { name: "E7", group: "Dominant", frets: [0, 2, 0, 1, 0, 0], fingers: [0, 2, 0, 1, 0, 0], tip: "Dẫn về Am, hay dùng trong bolero." },
  { name: "A7", group: "Dominant", frets: [-1, 0, 2, 0, 2, 0], fingers: [0, 0, 2, 0, 3, 0], tip: "Dẫn về D hoặc Dm." },
  { name: "D7", group: "Dominant", frets: [-1, -1, 0, 2, 1, 2], fingers: [0, 0, 0, 2, 1, 3], tip: "Dẫn về G, tay giống D nhưng đổi 2 ngón." },
  { name: "F", group: "Chặn", frets: [1, 3, 3, 2, 1, 1], fingers: [1, 3, 4, 2, 1, 1], barre: { fret: 1, from: 0, to: 5 }, tip: "Ngón 1 chặn cả 6 dây ngăn 1, ép sát phím đồng." },
  { name: "Bm", group: "Chặn", frets: [-1, 2, 4, 4, 3, 2], fingers: [0, 1, 3, 4, 2, 1], barre: { fret: 2, from: 1, to: 5 }, tip: "Dạng Am dời lên ngăn 2." },
  { name: "B", group: "Chặn", frets: [-1, 2, 4, 4, 4, 2], fingers: [0, 1, 2, 3, 4, 1], barre: { fret: 2, from: 1, to: 5 }, tip: "Dạng A dời lên ngăn 2." },
  { name: "Cm", group: "Chặn", frets: [-1, 3, 5, 5, 4, 3], fingers: [0, 1, 3, 4, 2, 1], barre: { fret: 3, from: 1, to: 5 }, tip: "Dạng Am dời lên ngăn 3." },
  { name: "Fm", group: "Chặn", frets: [1, 3, 3, 1, 1, 1], fingers: [1, 3, 4, 1, 1, 1], barre: { fret: 1, from: 0, to: 5 }, tip: "Dạng Em chặn ngăn 1." },
  { name: "Gm", group: "Chặn", frets: [3, 5, 5, 3, 3, 3], fingers: [1, 3, 4, 1, 1, 1], barre: { fret: 3, from: 0, to: 5 }, tip: "Dạng Em chặn ngăn 3." },
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
  /** số phách nhỏ trong một ô nhịp */
  sub: number;
  defBpm: number;
  hits: StrumHit[];
  note: string;
}

export const STRUM_STYLES: StrumStyle[] = [
  { id: "slowrock", name: "Slow Rock · 6/8", sub: 6, defBpm: 64, hits: ["b", null, "u", "d", null, "u"], note: "Đếm 1-2-3 / 4-5-6. Phách 1 gảy bass, phách 4 quạt xuống." },
  { id: "ballad", name: "Ballad · 4/4", sub: 8, defBpm: 72, hits: ["b", null, "d", "u", null, "u", "d", "u"], note: "Mẫu kinh điển cho bài chậm: bass - xuống lên - lên xuống lên." },
  { id: "quatcha", name: "Quạt chả · 4/4", sub: 8, defBpm: 88, hits: ["d", null, "d", "u", null, "u", "d", "u"], note: "Cổ tay thả lỏng, nhấn mạnh phách 2 và 4." },
  { id: "bolero", name: "Bolero rải · 4/4", sub: 8, defBpm: 66, hits: ["b", null, "u", "d", "u", null, "d", "u"], note: "Rải nhẹ từng dây, hợp bài trữ tình." },
  { id: "downs", name: "Gảy xuống · 4/4", sub: 4, defBpm: 60, hits: ["d", "d", "d", "d"], note: "Bài tập buổi 4: chỉ gảy xuống, giữ nhịp thật đều." },
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
 * Buổi kế tiếp = buổi nhỏ nhất chưa hoàn thành. Nếu xong hết thì trả buổi cuối,
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
