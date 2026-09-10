import Link from "next/link";
import { IconMenu } from "./icons";

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
  {
    id: "tainha_1v1",
    ten: "Kèm 1 kèm 1 tại nhà",
    mo: "Giáo viên tới tận nhà bạn dạy, khỏi đi lại.",
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

/** Các mục trên thanh đầu trang, dùng lại cho cả bản gọn trên điện thoại. */
const MUC_MENU = [
  { href: "/lop-hoc", chu: "Lớp học" },
  { href: "/khoa-hoc", chu: "Khoá học" },
  { href: "/shop", chu: "Mua đàn" },
  { href: "/login", chu: "Đăng nhập" },
];

/**
 * Thanh đầu trang cho các trang công khai (khách chưa đăng nhập).
 *
 * Trên điện thoại chỉ để lại logo và nút "Học thử" — bốn mục còn lại nằm trong
 * menu thu gọn. Nhét cả năm mục lên một hàng thì thanh rộng 443px trong khi
 * điện thoại phổ biến chỉ 360px, cả trang bị đẩy lệch và kéo ngang được.
 *
 * Menu dùng thẻ <details> nên mở ra được mà không cần JavaScript — trang công
 * khai nào cũng chạy, kể cả lúc mạng yếu chưa tải xong script.
 */
export function PublicHeader() {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-navy-100">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center gap-3">
        <Link href="/" className="flex items-center gap-2.5 no-underline min-w-0">
          <BrandMark className="h-9 shrink-0" />
          <span className="font-bold text-ink-900 truncate">{BRAND.short}</span>
        </Link>

        {/* Bản đầy đủ, từ màn hình vừa trở lên */}
        <nav className="ml-auto hidden md:flex items-center gap-1">
          {MUC_MENU.map((m) => (
            <Link
              key={m.href}
              href={m.href}
              className="px-3 py-2 rounded-xl text-sm font-semibold text-ink-700 hover:bg-ivory-100 no-underline whitespace-nowrap"
            >
              {m.chu}
            </Link>
          ))}
          <Link
            href="/hoc-thu"
            className="px-3.5 py-2 rounded-xl text-sm font-semibold bg-wood-500 hover:bg-wood-600 text-white no-underline whitespace-nowrap"
          >
            Học thử miễn phí
          </Link>
        </nav>

        {/* Bản gọn cho điện thoại */}
        <div className="ml-auto flex md:hidden items-center gap-1.5">
          <Link
            href="/hoc-thu"
            className="px-3 py-2 rounded-xl text-sm font-semibold bg-wood-500 hover:bg-wood-600 text-white no-underline whitespace-nowrap"
          >
            Học thử
          </Link>

          <details className="relative [&[open]>summary>svg]:rotate-90">
            <summary
              className="list-none cursor-pointer rounded-xl p-2 text-ink-700 hover:bg-ivory-100 marker:hidden"
              aria-label="Mở menu"
            >
              <IconMenu className="w-6 h-6 transition-transform" />
            </summary>
            <nav className="absolute right-0 top-full mt-2 w-52 rounded-2xl border border-navy-100 bg-white shadow-lg p-1.5">
              {MUC_MENU.map((m) => (
                <Link
                  key={m.href}
                  href={m.href}
                  className="block px-3.5 py-2.5 rounded-xl text-sm font-semibold text-ink-700 hover:bg-ivory-100 no-underline"
                >
                  {m.chu}
                </Link>
              ))}
              <Link
                href="/register"
                className="block px-3.5 py-2.5 rounded-xl text-sm font-semibold text-wood-600 hover:bg-ivory-100 no-underline"
              >
                Đăng ký tài khoản
              </Link>
            </nav>
          </details>
        </div>
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
