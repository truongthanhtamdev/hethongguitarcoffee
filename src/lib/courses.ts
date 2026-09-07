/**
 * Các khoá học quay sẵn bán trên web.
 *
 * Khoá đệm hát cơ bản 28 bài KHÔNG nằm ở đây: nó vẫn tặng miễn phí cho mọi
 * người đăng ký tài khoản, đó là thứ kéo khách vào. Chỗ này chỉ chứa các khoá
 * nâng cao có thu tiền.
 *
 * Hợp tác với giáo viên: mỗi khoá ghi rõ giáo viên đứng khoá và phần trăm họ
 * được chia trên từng lượt bán. Số tiền hoa hồng chốt lại lúc quản trị xác
 * nhận đã thu tiền, rồi nằm yên trong đơn — sau này có đổi tỉ lệ cũng không
 * làm sai các đơn cũ.
 *
 * Thêm khoá mới: chép một khối trong COURSES, đặt slug mới. Không cần đụng
 * cơ sở dữ liệu.
 */

export interface Course {
  /** Mã trong đường dẫn /khoa-hoc/<slug> */
  slug: string;
  name: string;
  tagline: string;
  /** Giá bán, đơn vị đồng */
  price: number;
  /** Giá gốc gạch ngang; 0 nghĩa là không giảm */
  priceOld: number;
  /** Email tài khoản giáo viên đứng khoá — dùng để tìm ra người nhận hoa hồng */
  teacherEmail: string;
  /** Tên giáo viên hiển thị cho khách, kể cả khi chưa có tài khoản trong hệ thống */
  teacherName: string;
  /** Phần trăm giá bán chia cho giáo viên */
  commissionPercent: number;
  soLuong: string;
  /** Học xong làm được gì */
  ketQua: string[];
  /** Nội dung chính của khoá */
  noiDung: string[];
  /** Ai nên học */
  danhCho: string;
  active: boolean;
}

export const COURSES: Course[] = [
  {
    slug: "fingerpicking",
    name: "Fingerpicking — đệm và chơi giai điệu bằng ngón",
    tagline: "Từ đệm hát bằng phím gảy sang chơi bằng ngón: rải, móc, và chơi trọn bài không cần hát.",
    price: 800_000,
    priceOld: 0,
    teacherEmail: "thang@guitarcafe.local",
    teacherName: "Thầy Thắng",
    commissionPercent: 50,
    soLuong: "Video quay sẵn, học không giới hạn thời gian",
    ketQua: [
      "Móc dây bằng ngón cái, trỏ, giữa, áp út đều tiếng và không vấp",
      "Rải hợp âm theo nhiều mẫu ngón khác nhau cho cùng một bài",
      "Vừa giữ bè trầm bằng ngón cái vừa chơi giai điệu ở dây trên",
      "Chơi trọn vẹn một bài fingerstyle không cần hát",
    ],
    noiDung: [
      "Tư thế tay phải, để móng và cách lấy tiếng sạch",
      "Các mẫu rải cơ bản: p-i-m-a và biến thể",
      "Bè trầm luân phiên (alternating bass)",
      "Ghép giai điệu vào nền hợp âm",
      "Kỹ thuật điểm xuyết: hammer-on, pull-off, slide, harmonic",
      "Tập trọn bài theo từng câu, có tốc độ chậm để tập theo",
    ],
    danhCho:
      "Bạn đã đệm hát được vài bài bằng phím gảy, bấm chuyển hợp âm tương đối mượt và muốn chơi đàn một mình mà vẫn ra bài.",
    active: true,
  },
];

export function courseBySlug(slug: string): Course | undefined {
  return COURSES.find((c) => c.slug === slug);
}

export function activeCourses(): Course[] {
  return COURSES.filter((c) => c.active);
}

/** 800000 -> "800.000 ₫" */
export function tienVN(n: number): string {
  return `${n.toLocaleString("vi-VN")} ₫`;
}

/** Hoa hồng giáo viên được hưởng cho một lượt bán khoá này. */
export function hoaHongCuaKhoa(c: Course): number {
  return Math.round((c.price * c.commissionPercent) / 100);
}
