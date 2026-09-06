/**
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
  { id: 1, name: "Các bước chuẩn bị", tag: "Chuẩn bị", from: 1, to: 4,
    note: "Cầm đàn đúng, biết các bộ phận của đàn và lên dây được." },
  { id: 2, name: "Nốt nhạc và cần đàn", tag: "Nốt nhạc", from: 5, to: 6,
    note: "Thuộc 7 nốt cơ bản, đọc được nốt trên cần đàn và hiểu thăng giáng." },
  { id: 3, name: "Nhịp 4/4 và 2/4", tag: "4/4 · 2/4", from: 7, to: 14,
    note: "Hai nhịp thông dụng nhất, kèm 4 điệu: Disco, Cha cha cha, Rumba, Bolero." },
  { id: 4, name: "Nhịp 3/4 và 6/8", tag: "3/4 · 6/8", from: 15, to: 21,
    note: "Nhóm nhịp lẻ và cảm giác liên 3, kèm Waltz, Boston, Slow Rock, Ballad." },
  { id: 5, name: "Strumming — quạt chả", tag: "Quạt chả", from: 22, to: 23,
    note: "Tay phải: mẫu hình nốt đơn, nốt kép và ba bài tập quạt chả." },
  { id: 6, name: "Strumming — các mẫu đệm", tag: "Mẫu đệm", from: 24, to: 28,
    note: "Ghép tay phải vào từng điệu và tư duy chọn điệu cho bài hát." },
];

export const LESSONS: Lesson[] = [
  { n: 1, ch: 1, no: 1, title: "Tư thế cầm guitar",
    desc: "Cách ngồi, ôm đàn và đặt tay sao cho không mỏi.",
    result: "Ngồi và ôm đàn đúng, chơi lâu không đau lưng hay mỏi vai.",
    practice: "Ngồi đúng tư thế 5 phút, soi gương kiểm tra lưng và vai.",
    chords: [], bpm: 60, strum: "",
    url: "https://guitardemhat.com/courses/dem-hat-co-ban/lessons/bai-1/",
    video: "https://youtu.be/jOxBYbsv9PA" },
  { n: 2, ch: 1, no: 2, title: "Các bộ phận chính đàn guitar",
    desc: "Đầu đàn, cần đàn, thùng đàn, ngựa đàn, khoá dây và tên gọi từng phần.",
    result: "Gọi đúng tên từng bộ phận khi nghe hướng dẫn.",
    practice: "Chỉ và đọc tên 8 bộ phận trên cây đàn của bạn.",
    chords: [], bpm: 60, strum: "",
    url: "https://guitardemhat.com/courses/dem-hat-co-ban/lessons/bai-2-cac-bo-phan-chinh-dan-guitar/",
    video: "https://youtu.be/LxDSNqIom6U" },
  { n: 3, ch: 1, no: 3, title: "Hiểu về 2 bàn tay",
    desc: "Vai trò tay trái bấm phím và tay phải gảy hoặc quạt.",
    result: "Biết mỗi tay làm gì và đặt tay đúng vị trí xuất phát.",
    practice: "Đặt tay trái lên cần, tay phải lên dây, giữ yên 2 phút cho quen.",
    chords: [], bpm: 60, strum: "",
    url: "https://guitardemhat.com/courses/dem-hat-co-ban/lessons/hieu-ve-2-ban-tay/",
    video: "https://youtu.be/PmxZjsLB0Ok" },
  { n: 4, ch: 1, no: 4, title: "Cách lên dây đàn (dùng App)",
    desc: "Lên dây chuẩn E-A-D-G-B-E bằng ứng dụng.",
    result: "Tự lên dây đàn trước mỗi buổi tập.",
    practice: "Dùng mục Luyện tập → Lên dây trong app này để chỉnh đủ 6 dây.",
    chords: [], bpm: 60, strum: "",
    url: "https://guitardemhat.com/courses/dem-hat-co-ban/lessons/bai-4-cach-len-day-dan-dung-app/",
    video: "https://youtu.be/rxsIE7UkcZo" },
  { n: 5, ch: 2, no: 1, title: "7 nốt nhạc căn bản",
    desc: "Đô Rê Mi Fa Sol La Si và ký hiệu C D E F G A B.",
    result: "Đọc được tên nốt theo cả hai cách gọi.",
    practice: "Đọc xuôi và đọc ngược 7 nốt, 10 lần.",
    chords: [], bpm: 60, strum: "",
    url: "https://guitardemhat.com/courses/dem-hat-co-ban/lessons/bai-5-7-not-nhac-can-ban/",
    video: "https://youtu.be/cvIhPxOz1FY" },
  { n: 6, ch: 2, no: 2, title: "Nốt nhạc từ ngăn 1 đến ngăn 5",
    desc: "Vị trí nốt trên 5 ngăn đầu, và cách lên dây không cần app.",
    result: "Tìm được nốt trên cần đàn và tự so dây bằng tai.",
    practice: "Dò tên nốt trên dây 6 và dây 5 từ ngăn 1 đến ngăn 5.",
    chords: [], bpm: 60, strum: "",
    url: "https://guitardemhat.com/courses/dem-hat-co-ban/lessons/bai-6-not-nhac-tu-ngan-1-ngan-5-len-day-khong-dung-app/",
    video: "https://youtu.be/ezwZLaeB5yw" },
  { n: 7, ch: 3, no: 1, title: "Nhịp 4/4 — học Em và Am",
    desc: "Cách đếm 4 phách và hai hợp âm thứ dễ nhất.",
    result: "Đếm được 1-2-3-4 đều và bấm sạch Em, Am.",
    practice: "Bật metronome 60 bpm, gảy xuống 4 phách với Em rồi Am.",
    chords: ["Em", "Am"], bpm: 60, strum: "",
    url: "https://guitardemhat.com/courses/dem-hat-co-ban/lessons/bai-9-nhip/",
    video: "https://youtu.be/DeO1M6ROaA4" },
  { n: 8, ch: 3, no: 2, title: "Bấm hợp âm đúng cách",
    desc: "Đặt ngón dựng, bấm sát phím đồng, tránh chạm dây bên cạnh.",
    result: "Hợp âm kêu sạch cả 6 dây, không bị rè.",
    practice: "Bấm Em rồi gảy rời từng dây, nghe dây nào rè thì chỉnh ngón.",
    chords: ["Em", "Am"], bpm: 60, strum: "",
    url: "https://guitardemhat.com/courses/dem-hat-co-ban/lessons/bai-10-bam-hop-am-dung-cach/",
    video: "https://youtu.be/IZw4uuUPjDw" },
  { n: 9, ch: 3, no: 3, title: "Chuyển hợp âm với nhịp 4/4 (Am - Em)",
    desc: "Luyện chuyển tay trái mà tay phải vẫn giữ đều nhịp.",
    result: "Đổi Am - Em đúng đầu ô nhịp, không khựng.",
    practice: "Chuyển Am - Em mỗi 4 phách, 20 vòng ở 60 bpm.",
    chords: ["Am", "Em"], bpm: 60, strum: "",
    url: "https://guitardemhat.com/courses/dem-hat-co-ban/lessons/bai-11-chuyen-hop-am-voi-nhip-4-4-am-em/",
    video: "https://youtu.be/EZ6Z_QZfFg0" },
  { n: 10, ch: 3, no: 4, title: "Nhịp 2/4 — học C, G, F",
    desc: "Nhịp 2 phách và ba hợp âm trưởng quan trọng.",
    result: "Bấm được C, G và phương án F cơ bản.",
    practice: "Chuyển C - G mỗi 2 phách, sau đó thêm F.",
    chords: ["C", "G", "F"], bpm: 62, strum: "",
    url: "https://guitardemhat.com/courses/dem-hat-co-ban/lessons/bai-12-nhip-2-4-hoc-c-g-f/",
    video: "https://youtu.be/0Q9tgUKd434" },
  { n: 11, ch: 3, no: 5, title: "Điệu Disco (2/4)",
    desc: "Mẫu đệm nhanh, khoẻ trên nhịp 2/4.",
    result: "Quạt được Disco đều tay ở tempo chậm.",
    practice: "Mở máy đệm điệu Disco, quạt theo 3 phút không dừng.",
    chords: ["C", "G"], bpm: 76, strum: "disco",
    url: "https://guitardemhat.com/courses/dem-hat-co-ban/lessons/bai-13-dieu-disco-2-4/",
    video: "https://youtu.be/Rv6XVWpIJtg" },
  { n: 12, ch: 3, no: 6, title: "Điệu Cha cha cha (4/4)",
    desc: "Cảm giác đảo phách đặc trưng của cha cha cha.",
    result: "Giữ được nhịp khi tay phải đảo phách.",
    practice: "Đệm C - Am - F - G bằng điệu cha cha cha, 10 vòng.",
    chords: ["C", "Am", "F", "G"], bpm: 80, strum: "chacha",
    url: "https://guitardemhat.com/courses/dem-hat-co-ban/lessons/bai-14-dieu-cha-cha-cha-4-4-updating/",
    video: "https://youtu.be/OcgsiTpt8WI" },
  { n: 13, ch: 3, no: 7, title: "Điệu Rumba (4/4)",
    desc: "Mẫu rải mềm, rất hay dùng cho nhạc trữ tình.",
    result: "Đệm được Rumba chậm và đều.",
    practice: "Đệm Am - Dm - E7 - Am bằng Rumba, 10 vòng.",
    chords: ["Am", "Dm", "E7"], bpm: 72, strum: "rumba",
    url: "https://guitardemhat.com/courses/dem-hat-co-ban/lessons/bai-19-dieu-rumba-4-4/",
    video: "https://youtu.be/1-Vf6nK0y-4" },
  { n: 14, ch: 3, no: 8, title: "Điệu Bolero (4/4)",
    desc: "Điệu quen thuộc nhất của nhạc vàng.",
    result: "Đệm được Bolero cơ bản, vào đúng phách.",
    practice: "Đệm một đoạn bolero với Am - Dm - E7, 10 vòng.",
    chords: ["Am", "Dm", "E7"], bpm: 66, strum: "bolero",
    url: "https://guitardemhat.com/courses/dem-hat-co-ban/lessons/bai-20-dieu-bolero-4-4/",
    video: "https://youtu.be/QvP6aqZ8mq0" },
  { n: 15, ch: 4, no: 1, title: "Nhịp 3/4 — học Dm và G7",
    desc: "Nhịp 3 phách, phách 1 mạnh, và hai hợp âm mới.",
    result: "Đếm được 1-2-3 và bấm Dm, G7.",
    practice: "Chuyển C - G7 - Dm mỗi 3 phách, 15 vòng.",
    chords: ["Dm", "G7"], bpm: 64, strum: "",
    url: "https://guitardemhat.com/courses/dem-hat-co-ban/lessons/bai-14-nhip-3-4-hoc-dm-g7/",
    video: "https://youtu.be/eaRuog2U5T8" },
  { n: 16, ch: 4, no: 2, title: "Điệu Waltz (3/4)",
    desc: "Bass rồi hai lần quạt nhẹ — mẫu 3/4 kinh điển.",
    result: "Đệm được Waltz đều, phách 1 rõ.",
    practice: "Đệm C - G7 - C bằng Waltz, 15 vòng.",
    chords: ["C", "G7"], bpm: 96, strum: "waltz",
    url: "https://guitardemhat.com/courses/dem-hat-co-ban/lessons/bai-15-dieu-waltz-3-4/",
    video: "https://youtu.be/bdJL9Trtb4o" },
  { n: 17, ch: 4, no: 3, title: "Điệu Boston (3/4)",
    desc: "Waltz chậm, rải mềm hơn cho bài trữ tình.",
    result: "Phân biệt được Boston và Waltz khi nghe.",
    practice: "Đệm cùng vòng hợp âm bằng Waltz rồi Boston để so sánh.",
    chords: ["C", "G7", "Am"], bpm: 76, strum: "boston",
    url: "https://guitardemhat.com/courses/dem-hat-co-ban/lessons/bai-16-dieu-boston-3-4/",
    video: "https://youtu.be/Mhm0UFMYE14" },
  { n: 18, ch: 4, no: 4, title: "Nhịp 6/8 — học Dm7, E và E7",
    desc: "Nhịp 6 phách chia hai nhóm ba, cùng ba hợp âm mới.",
    result: "Đếm 1-2-3 / 4-5-6 đều và bấm được E, E7, Dm7.",
    practice: "Chuyển Am - Dm7 - E7 theo nhịp 6/8, 15 vòng.",
    chords: ["Dm7", "E", "E7"], bpm: 60, strum: "",
    url: "https://guitardemhat.com/courses/dem-hat-co-ban/lessons/bai-17-nhip-6-8-hoc-dm7-e-va-e7/",
    video: "https://youtu.be/NlW5Vau_z8M" },
  { n: 19, ch: 4, no: 5, title: "Điệu Slow Rock (6/8)",
    desc: "Mẫu đệm 6/8 dùng cho rất nhiều bài chậm.",
    result: "Đệm được Slow Rock cơ bản, giữ đều 3 phút.",
    practice: "Mở máy đệm Slow Rock, đệm Am - C - G - Em.",
    chords: ["Am", "C", "G", "Em"], bpm: 64, strum: "slowrock",
    url: "https://guitardemhat.com/courses/dem-hat-co-ban/lessons/bai-18-dieu-slowrock-6-8/",
    video: "https://youtu.be/jPhusefKOfo" },
  { n: 20, ch: 4, no: 6, title: "Slow Rock và liên 3 — 6/8 với 2/4",
    desc: "Hiểu liên 3 để thấy vì sao 6/8 nghe khác 2/4.",
    result: "Nghe ra sự khác nhau giữa 6/8 và 2/4.",
    practice: "Đệm cùng một bài bằng 6/8 rồi 2/4, ghi âm so sánh.",
    chords: ["Am", "C"], bpm: 64, strum: "slowrock",
    url: "https://guitardemhat.com/courses/dem-hat-co-ban/lessons/bai-6-slowrock-hieu-ve-lien-3-6-8-vs-2-4/",
    video: "https://youtu.be/JI7iTlfIUo4" },
  { n: 21, ch: 4, no: 7, title: "Điệu Ballad (4/4)",
    desc: "Mẫu đệm phổ biến nhất cho nhạc trẻ.",
    result: "Đệm được Ballad và hát theo không mất nhịp.",
    practice: "Đệm C - G - Am - F bằng Ballad, 20 vòng.",
    chords: ["C", "G", "Am", "F"], bpm: 72, strum: "ballad",
    url: "https://guitardemhat.com/courses/dem-hat-co-ban/lessons/bai-7/",
    video: "https://youtu.be/-IBh9M9M43I" },
  { n: 22, ch: 5, no: 3, title: "Strumming — bài tập 2",
    desc: "Thêm quạt lên, giữ đều tốc độ tay.",
    result: "Xuống lên đều nhau, không bị nhanh dần.",
    practice: "Quạt xuống-lên liên tục 3 phút ở 70 bpm.",
    chords: [], bpm: 70, strum: "",
    url: "https://guitardemhat.com/courses/dem-hat-co-ban/lessons/bai-23-cach-di-chuyen-cua-tay-phai-16-beat/",
    video: "https://youtu.be/ZMIwGt5Uk1E" },
  { n: 23, ch: 5, no: 4, title: "Strumming — bài tập 3",
    desc: "Mẫu quạt có ngắt và nhấn.",
    result: "Tạo được điểm nhấn mà không rớt nhịp.",
    practice: "Luyện nhấn phách 2 và 4 ở tempo chậm.",
    chords: [], bpm: 72, strum: "",
    url: "https://guitardemhat.com/courses/dem-hat-co-ban/lessons/bai-24-strumming-bai-tap-3/",
    video: "https://youtu.be/YUS5PTnl_2M" },
  { n: 24, ch: 6, no: 1, title: "Strumming 4/4 — Ballad cơ bản",
    desc: "Ghép mẫu quạt Ballad vào vòng hợp âm.",
    result: "Đệm trọn một đoạn bài bằng Ballad.",
    practice: "Đệm C - G - Am - F, 20 vòng, ưu tiên đều nhịp.",
    chords: ["C", "G", "Am", "F"], bpm: 72, strum: "ballad",
    url: "https://guitardemhat.com/courses/dem-hat-co-ban/lessons/bai-29-strumming-4-4-ballad-co-ban/",
    video: "https://youtu.be/RF-2Wc7Bmvw" },
  { n: 25, ch: 6, no: 2, title: "Strumming 4/4 đảo phách — Cha cha cha",
    desc: "Quạt đảo phách cho điệu cha cha cha.",
    result: "Giữ groove khi tay phải đảo phách.",
    practice: "Đệm C - Am - F - G bằng cha cha cha, 15 vòng.",
    chords: ["C", "Am", "F", "G"], bpm: 80, strum: "chacha",
    url: "https://guitardemhat.com/courses/dem-hat-co-ban/lessons/bai-30-strumming-4-4-cha-cha-cha-co-ban/",
    video: "https://youtu.be/RSFjxRsAZs8" },
  { n: 26, ch: 6, no: 3, title: "Strumming 4/4 — Bolero cơ bản",
    desc: "Mẫu rải và quạt của Bolero.",
    result: "Đệm được một đoạn bolero hoàn chỉnh.",
    practice: "Đệm Am - Dm - E7 - Am, 15 vòng.",
    chords: ["Am", "Dm", "E7"], bpm: 66, strum: "bolero",
    url: "https://guitardemhat.com/courses/dem-hat-co-ban/lessons/bai-32-strumming-4-4-bolero-co-ban/",
    video: "https://youtu.be/oApBKYTW6Sk" },
  { n: 27, ch: 6, no: 4, title: "Strumming 3/4 — Waltz và Boston",
    desc: "Mẫu quạt cho nhóm nhịp 3/4.",
    result: "Chọn đúng Waltz hay Boston tuỳ tốc độ bài.",
    practice: "Đệm cùng vòng hợp âm bằng cả hai điệu.",
    chords: ["C", "G7", "Am"], bpm: 88, strum: "waltz",
    url: "https://guitardemhat.com/courses/dem-hat-co-ban/lessons/bai-30-strumming-3-4-waltz-boston-co-ban/",
    video: "https://youtu.be/vAQvTOtskx8" },
  { n: 28, ch: 6, no: 5, title: "Strumming 6/8 — Slow Rock cơ bản",
    desc: "Mẫu quạt Slow Rock hoàn chỉnh.",
    result: "Đệm hát được một bài Slow Rock cơ bản.",
    practice: "Đệm Am - C - G - Em, quay video 60 giây.",
    chords: ["Am", "C", "G", "Em"], bpm: 64, strum: "slowrock",
    url: "https://guitardemhat.com/courses/dem-hat-co-ban/lessons/bai-31-struming-6-8-slowrock-co-ban/",
    video: "https://youtu.be/VOzflIFHgxE" },
];

export const TOTAL_LESSONS = LESSONS.length;

export interface Chord {
  name: string;
  group: string;
  /** Ngăn bấm theo thứ tự dây 6 đến 1 (E A D G B e). -1 = không đánh, 0 = buông. */
  frets: number[];
  /** Ngón bấm 1..4, 0 = không có ngón */
  fingers: number[];
  barre?: { fret: number; from: number; to: number };
  tip: string;
}

export const CHORDS: Chord[] = [
  {name:"Em",    group:"Cơ bản",  frets:[0,2,2,0,0,0],    fingers:[0,2,3,0,0,0], tip:"Ngón 2 và 3 nằm ngăn 2, gảy đủ 6 dây."},
  {name:"Am",    group:"Cơ bản",  frets:[-1,0,2,2,1,0],   fingers:[0,0,2,3,1,0], tip:"Không đánh dây 6. Ngón 1 ở dây 2 ngăn 1."},
  {name:"C",     group:"Cơ bản",  frets:[-1,3,2,0,1,0],   fingers:[0,3,2,0,1,0], tip:"Cong ngón để dây 1 và 3 vẫn kêu buông."},
  {name:"G",     group:"Cơ bản",  frets:[3,2,0,0,3,3],    fingers:[2,1,0,0,3,4], tip:"Dùng ngón 3-4 cho hai dây cao để chuyển sang C nhanh hơn."},
  {name:"D",     group:"Cơ bản",  frets:[-1,-1,0,2,3,2],  fingers:[0,0,0,1,3,2], tip:"Chỉ đánh 4 dây dưới, giữ hình tam giác."},
  {name:"Dm",    group:"Cơ bản",  frets:[-1,-1,0,2,3,1],  fingers:[0,0,0,2,3,1], tip:"Giống D nhưng dây 1 lùi về ngăn 1."},
  {name:"A",     group:"Cơ bản",  frets:[-1,0,2,2,2,0],   fingers:[0,0,1,2,3,0], tip:"Ba ngón thẳng hàng ngăn 2, dây 1 buông."},
  {name:"E",     group:"Cơ bản",  frets:[0,2,2,1,0,0],    fingers:[0,2,3,1,0,0], tip:"Nền của mọi hợp âm chặn dạng E."},
  {name:"Fmaj7", group:"Cơ bản",  frets:[-1,-1,3,2,1,0],  fingers:[0,0,3,2,1,0], tip:"Bản dễ thay F cho người mới, dùng chung vòng với C."},
  {name:"Bm dễ", group:"Cơ bản",  frets:[-1,-1,0,4,3,2],  fingers:[0,0,0,3,2,1], tip:"Bm không cần chặn, hợp cho bài G - D - Em - Bm."},
  {name:"G7",    group:"Dominant",frets:[3,2,0,0,0,1],    fingers:[3,2,0,0,0,1], tip:"Kết câu về C rất mượt."},
  {name:"E7",    group:"Dominant",frets:[0,2,0,1,0,0],    fingers:[0,2,0,1,0,0], tip:"Dẫn về Am, hay dùng trong bolero."},
  {name:"A7",    group:"Dominant",frets:[-1,0,2,0,2,0],   fingers:[0,0,2,0,3,0], tip:"Dẫn về D hoặc Dm."},
  {name:"D7",    group:"Dominant",frets:[-1,-1,0,2,1,2],  fingers:[0,0,0,2,1,3], tip:"Dẫn về G, tay giống D nhưng đổi 2 ngón."},
  {name:"Dm7",   group:"Dominant",frets:[-1,-1,0,2,1,1],  fingers:[0,0,0,2,1,1], tip:"Dm bỏ bớt một ngón, dùng nhiều trong nhịp 6/8."},
  {name:"F",     group:"Chặn",    frets:[1,3,3,2,1,1],    fingers:[1,3,4,2,1,1], barre:{fret:1,from:0,to:5}, tip:"Ngón 1 chặn cả 6 dây ngăn 1, ép sát phím đồng."},
  {name:"Bm",    group:"Chặn",    frets:[-1,2,4,4,3,2],   fingers:[0,1,3,4,2,1], barre:{fret:2,from:1,to:5}, tip:"Dạng Am dời lên ngăn 2."},
  {name:"B",     group:"Chặn",    frets:[-1,2,4,4,4,2],   fingers:[0,1,2,3,4,1], barre:{fret:2,from:1,to:5}, tip:"Dạng A dời lên ngăn 2."},
  {name:"Cm",    group:"Chặn",    frets:[-1,3,5,5,4,3],   fingers:[0,1,3,4,2,1], barre:{fret:3,from:1,to:5}, tip:"Dạng Am dời lên ngăn 3."},
  {name:"Fm",    group:"Chặn",    frets:[1,3,3,1,1,1],    fingers:[1,3,4,1,1,1], barre:{fret:1,from:0,to:5}, tip:"Dạng Em chặn ngăn 1."},
  {name:"Gm",    group:"Chặn",    frets:[3,5,5,3,3,3],    fingers:[1,3,4,1,1,1], barre:{fret:3,from:0,to:5}, tip:"Dạng Em chặn ngăn 3."},
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
  { id: "disco", name: "Disco · 2/4", beats: 2, sub: 4, defBpm: 76,
    hits: ["b", "d", "u", "d"],
    note: "Nhịp 2 phách, quạt khoẻ và đều tay." },
  { id: "chacha", name: "Cha cha cha · 4/4", beats: 4, sub: 8, defBpm: 80,
    hits: ["b", null, "d", null, "d", "u", "d", "u"],
    note: "Đặc trưng là đảo phách ở cuối ô nhịp." },
  { id: "rumba", name: "Rumba · 4/4", beats: 4, sub: 8, defBpm: 72,
    hits: ["b", null, "u", "d", "u", null, "d", "u"],
    note: "Rải mềm, hợp nhạc trữ tình." },
  { id: "bolero", name: "Bolero · 4/4", beats: 4, sub: 8, defBpm: 66,
    hits: ["b", null, "u", "d", null, "u", "d", "u"],
    note: "Chậm, sâu, rải từng dây cho rõ tiếng." },
  { id: "waltz", name: "Waltz · 3/4", beats: 3, sub: 3, defBpm: 96,
    hits: ["b", "d", "d"],
    note: "Bass phách 1, hai lần quạt nhẹ ở phách 2 và 3." },
  { id: "boston", name: "Boston · 3/4", beats: 3, sub: 6, defBpm: 76,
    hits: ["b", null, "u", "d", null, "u"],
    note: "Waltz chậm lại, rải mềm hơn." },
  { id: "slowrock", name: "Slow Rock · 6/8", beats: 6, sub: 6, defBpm: 64,
    hits: ["b", null, "u", "d", null, "u"],
    note: "Đếm 1-2-3 / 4-5-6, phách 1 gảy bass, phách 4 quạt xuống." },
  { id: "ballad", name: "Ballad · 4/4", beats: 4, sub: 8, defBpm: 72,
    hits: ["b", null, "d", "u", null, "u", "d", "u"],
    note: "Mẫu phổ biến nhất cho nhạc trẻ." },
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

/** Dây 6 đến 1 */
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
 * Bài kế tiếp = bài nhỏ nhất chưa hoàn thành. Nếu xong hết thì trả bài cuối,
 * để màn hình vẫn có nội dung hiển thị thay vì trống.
 */
export function nextLesson(doneNumbers: number[]): Lesson {
  const done = new Set(doneNumbers);
  return LESSONS.find((l) => !done.has(l.n)) ?? LESSONS[LESSONS.length - 1];
}

export function midiToFreq(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

/** Tên nốt của từng dây trong một thế bấm, dây 6 đến 1. "x" = dây không đánh. */
export function chordNoteNames(chord: Chord): string[] {
  return chord.frets.map((f, i) => (f < 0 ? "x" : NOTE_NAMES[(OPEN_MIDI[i] + f) % 12]));
}

/**
 * Nhận link YouTube (đầy đủ, rút gọn, embed, shorts, live) và link file video
 * trực tiếp. Trả kiểu nhúng để trang bài học biết vẽ iframe hay thẻ video.
 */
export function videoKind(
  url: string
): { kind: "youtube"; id: string } | { kind: "file" } | null {
  if (!url) return null;
  const yt = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/))([\w-]{11})/
  );
  if (yt) return { kind: "youtube", id: yt[1] };
  if (/\.(mp4|m4v|webm|ogg|ogv|mov)(\?|#|$)/i.test(url)) return { kind: "file" };
  return null;
}
