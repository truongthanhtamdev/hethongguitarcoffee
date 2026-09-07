import Link from "next/link";

export const BRAND = {
  name: "Dạy Guitar Tại Quán Cà Phê",
  short: "Guitar Cà Phê",
  slogan: "Học guitar dễ dàng & hiệu quả",
  tagline: "Đam mê không khoảng cách",
  phone: "0965817021",
  fanpage: "dayguitartaiquancafe",
  branches: [
    { name: "Chi nhánh Tân Phú", address: "Số 10 Đô Đốc Thủ, Tân Phú, TP.HCM" },
  ],
};

/** Nơi học khách chọn lúc đăng ký. Ngoài các quán đã mở còn có hai lựa chọn
 *  học online — và "chưa có quán gần mình", để biết nên mở quán tiếp ở đâu. */
export const NOI_HOC = [
  ...BRAND.branches.map((b) => `${b.name} — ${b.address}`),
  "Học online theo nhóm",
  "Học online 1 kèm 1",
  "Chưa có quán gần mình — mong mở thêm chi nhánh",
];

/** Ba hình thức học, dùng chung cho form đăng ký học thử. */
export const HINH_THUC_HOC = [
  {
    id: "quan",
    ten: "Học tại quán cà phê",
    mo: "Tới quán, có giáo viên kèm trực tiếp và bạn học cùng nhóm.",
    canChiNhanh: true,
  },
  {
    id: "online_nhom",
    ten: "Học online theo nhóm",
    mo: "Học qua video call cùng vài bạn nữa, không phải đi lại.",
    canChiNhanh: false,
  },
  {
    id: "online_1v1",
    ten: "Kèm 1 kèm 1 online",
    mo: "Giáo viên kèm riêng mình bạn, sửa lỗi tới từng ngón tay.",
    canChiNhanh: false,
  },
] as const;

export function tenHinhThuc(id: string): string {
  return HINH_THUC_HOC.find((h) => h.id === id)?.ten ?? id;
}

/** Khu vực khách đang ở. Đây là dữ liệu để quyết định mở chi nhánh mới. */
export const KHU_VUC = [
  "Tân Phú", "Tân Bình", "Bình Tân", "Gò Vấp", "Phú Nhuận", "Bình Thạnh",
  "Quận 1", "Quận 3", "Quận 4", "Quận 5", "Quận 6", "Quận 7", "Quận 8",
  "Quận 10", "Quận 11", "Quận 12", "Thủ Đức", "Bình Chánh", "Hóc Môn",
  "Nhà Bè", "Củ Chi", "Tỉnh khác",
];

/** Số đẹp để hiển thị: 0965817021 -> 0965 817 021 */
export function prettyPhone(p = BRAND.phone) {
  return p.replace(/^(\d{4})(\d{3})(\d{3})$/, "$1 $2 $3");
}

export function BrandMark({ className = "h-9" }: { className?: string }) {
  // eslint-disable-next-line @next/next/no-img-element -- ảnh tĩnh cố định, dùng ở kích thước nhỏ
  return <img src="/logo-quancafe.png" alt="" className={`${className} rounded-xl`} />;
}

/** Thanh đầu trang cho các trang công khai (khách chưa đăng nhập). */
export function PublicHeader() {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-navy-100">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center gap-3">
        <Link href="/" className="flex items-center gap-2.5 no-underline min-w-0">
          <BrandMark className="h-9 shrink-0" />
          {/* Trên điện thoại chỉ còn logo: có 4 mục bên phải, để cả tên nữa
              là chữ bị cắt cụt thành "Gu..." và nút kêu gọi vỡ làm ba dòng. */}
          <span className="font-bold text-ink-900 truncate hidden sm:block">{BRAND.short}</span>
        </Link>

        <nav className="ml-auto flex items-center gap-0.5 sm:gap-2">
          <Link
            href="/khoa-hoc"
            className="px-2.5 sm:px-3 py-2 rounded-xl text-sm font-semibold text-ink-700 hover:bg-ivory-100 no-underline whitespace-nowrap"
          >
            Khoá học
          </Link>
          <Link
            href="/shop"
            className="px-2.5 sm:px-3 py-2 rounded-xl text-sm font-semibold text-ink-700 hover:bg-ivory-100 no-underline whitespace-nowrap"
          >
            Mua đàn
          </Link>
          <Link
            href="/login"
            className="px-2.5 sm:px-3 py-2 rounded-xl text-sm font-semibold text-ink-700 hover:bg-ivory-100 no-underline whitespace-nowrap"
          >
            Đăng nhập
          </Link>
          <Link
            href="/hoc-thu"
            className="px-3 sm:px-3.5 py-2 rounded-xl text-sm font-semibold bg-wood-500 hover:bg-wood-600 text-white no-underline whitespace-nowrap"
          >
            <span className="sm:hidden">Học thử</span>
            <span className="hidden sm:inline">Học thử miễn phí</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}

export function PublicFooter() {
  return (
    <footer className="border-t border-navy-100 bg-white mt-12">
      <div className="max-w-6xl mx-auto px-4 py-8 grid gap-6 sm:grid-cols-3 text-sm">
        <div>
          <div className="flex items-center gap-2.5 mb-2">
            <BrandMark className="h-9" />
            <span className="font-bold text-ink-900">{BRAND.short}</span>
          </div>
          <p className="text-ink-500">{BRAND.slogan}</p>
        </div>

        <div>
          <p className="font-semibold text-ink-900 mb-2">Chi nhánh</p>
          {BRAND.branches.map((b) => (
            <p key={b.name} className="text-ink-500">
              {b.name}
              <br />
              {b.address}
            </p>
          ))}
        </div>

        <div>
          <p className="font-semibold text-ink-900 mb-2">Liên hệ</p>
          <p className="text-ink-500">
            <a href={`tel:${BRAND.phone}`} className="hover:text-ink-900">
              {prettyPhone()}
            </a>
            <br />
            <a
              href={`https://m.me/${BRAND.fanpage}`}
              target="_blank"
              rel="noopener"
              className="hover:text-ink-900"
            >
              Nhắn fanpage
            </a>
          </p>
        </div>
      </div>

      <p className="text-center text-xs text-ink-400 pb-6">
        © {new Date().getFullYear()} {BRAND.name}
      </p>
    </footer>
  );
}
