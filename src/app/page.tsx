import Link from "next/link";
import { getSession } from "@/lib/auth";
import { roleHomePath } from "@/lib/types";
import { TOTAL_LESSONS, STAGES } from "@/lib/curriculum";
import { GUITARS } from "@/lib/shop";
import { BRAND, BrandMark, PublicFooter, PublicHeader, prettyPhone } from "@/components/brand";

/** Bốn dịch vụ của trung tâm. */
const DICH_VU = [
  {
    ico: "☕",
    ten: "Học tại quán cà phê",
    mo: "Không gian ấm cúng, giao lưu kết bạn, thực hành ngay tại chỗ và trình diễn định kỳ.",
    chi: ["Lớp nhóm vui vẻ", "Giao lưu kết nối", "Đêm nhạc acoustic"],
  },
  {
    ico: "💻",
    ten: "Học online theo nhóm",
    mo: "Học mọi lúc mọi nơi, linh hoạt thời gian, không phải đi lại mà vẫn có bạn học cùng.",
    chi: ["Linh hoạt giờ giấc", "Tiết kiệm thời gian", "Học cùng nhóm"],
  },
  {
    ico: "👤",
    ten: "Kèm 1 kèm 1 online",
    mo: "Giáo viên kèm riêng, sửa lỗi chi tiết từng ngón tay, lộ trình theo đúng mục tiêu của bạn.",
    chi: ["Kèm riêng một người", "Sửa lỗi chi tiết", "Tiến bộ nhanh"],
  },
  {
    ico: "🎸",
    ten: "Bán đàn",
    mo: "Đàn hợp tay người mới, thử trực tiếp tại quán trước khi mua. Đặt luôn trên web.",
    chi: ["Đàn chính hãng", "Thử trước khi mua", "Tư vấn theo tầm giá"],
  },
];

export default async function TrangChu() {
  // Đã đăng nhập thì vào thẳng khu của mình, khỏi xem lại trang giới thiệu.
  const session = await getSession();
  if (session) {
    const { redirect } = await import("next/navigation");
    redirect(roleHomePath(session.role));
  }

  const dan = GUITARS.filter((g) => !g.soldOut).slice(0, 4);

  return (
    <div className="min-h-screen bg-ivory-50 flex flex-col">
      <PublicHeader />

      <main className="flex-1">
        {/* Mở đầu */}
        <section className="bg-navy-950 text-white">
          <div className="max-w-6xl mx-auto px-4 py-14 sm:py-20 grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <p className="text-wood-300 font-semibold tracking-wide">{BRAND.tagline}</p>
              <h1 className="text-3xl sm:text-5xl font-bold tracking-tight mt-2 leading-tight">
                {BRAND.slogan}
              </h1>
              <p className="text-navy-200 mt-4 text-lg">
                Học đệm hát từ con số 0 theo lộ trình {TOTAL_LESSONS} bài, có video quay sẵn xem
                lại bao nhiêu lần cũng được. Học tại quán, học online nhóm, hoặc kèm riêng 1-1.
              </p>

              <div className="flex flex-wrap gap-3 mt-7">
                <Link
                  href="/register"
                  className="px-5 py-3 rounded-xl font-semibold bg-wood-500 hover:bg-wood-600 text-white no-underline"
                >
                  Nhận khoá học miễn phí
                </Link>
                <a
                  href={`https://m.me/${BRAND.fanpage}`}
                  target="_blank"
                  rel="noopener"
                  className="px-5 py-3 rounded-xl font-semibold bg-white/10 hover:bg-white/20 text-white no-underline"
                >
                  Nhắn fanpage tư vấn
                </a>
              </div>

              <p className="text-navy-300 text-sm mt-5">
                Hoặc gọi{" "}
                <a href={`tel:${BRAND.phone}`} className="text-wood-300 font-semibold">
                  {prettyPhone()}
                </a>
              </p>
            </div>

            <div className="hidden lg:flex justify-center">
              <BrandMark className="w-64 h-64" />
            </div>
          </div>
        </section>

        {/* Dịch vụ */}
        <section className="max-w-6xl mx-auto px-4 py-14">
          <h2 className="text-2xl sm:text-3xl font-bold text-ink-900 tracking-tight text-center">
            Bốn cách để bắt đầu
          </h2>
          <p className="text-ink-500 text-center mt-2">
            Phù hợp mọi nhu cầu, mọi lứa tuổi — chọn cách hợp với bạn nhất.
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
            {DICH_VU.map((d) => (
              <div
                key={d.ten}
                className="rounded-2xl border border-navy-100 bg-white p-5 flex flex-col"
              >
                <div className="w-11 h-11 rounded-xl bg-wood-50 grid place-items-center text-2xl">
                  {d.ico}
                </div>
                <h3 className="font-bold text-ink-900 mt-3">{d.ten}</h3>
                <p className="text-sm text-ink-500 mt-1.5 flex-1">{d.mo}</p>
                <ul className="mt-3 space-y-1">
                  {d.chi.map((c) => (
                    <li key={c} className="text-sm text-ink-700 flex gap-2">
                      <span className="text-wood-500">✓</span>
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Khoá học */}
        <section className="bg-white border-y border-navy-100">
          <div className="max-w-6xl mx-auto px-4 py-14">
            <div className="grid lg:grid-cols-2 gap-10 items-center">
              <div>
                <p className="text-wood-600 font-semibold">Tặng khi đăng ký</p>
                <h2 className="text-2xl sm:text-3xl font-bold text-ink-900 tracking-tight mt-1">
                  Khoá đệm hát cơ bản — {TOTAL_LESSONS} bài video
                </h2>
                <p className="text-ink-500 mt-3">
                  Quay sẵn theo đúng giáo trình lớp offline. Học hết là bấm được các hợp âm căn bản
                  3 ngăn đầu, hiểu 4 loại nhịp 4/4, 2/4, 3/4, 6/8 và đệm hát được với 8 điệu.
                </p>

                <p className="text-ink-500 mt-4">
                  Trong app còn có thư viện hợp âm bấm nghe được tiếng đàn, máy đập nhịp, máy đệm 8
                  điệu và cả bộ lên dây đàn bằng micro điện thoại.
                </p>

                <Link
                  href="/register"
                  className="inline-block mt-6 px-5 py-3 rounded-xl font-semibold bg-wood-500 hover:bg-wood-600 text-white no-underline"
                >
                  Đăng ký để xem trọn bộ
                </Link>
              </div>

              <ol className="space-y-2.5">
                {STAGES.map((s) => (
                  <li
                    key={s.id}
                    className="flex gap-3 rounded-xl border border-navy-100 bg-ivory-50 p-3.5"
                  >
                    <span className="shrink-0 w-8 h-8 rounded-lg bg-navy-800 text-white grid place-items-center font-bold text-sm">
                      {s.id}
                    </span>
                    <span className="min-w-0">
                      <span className="block font-semibold text-ink-900 text-sm">{s.name}</span>
                      <span className="block text-xs text-ink-500 mt-0.5">{s.note}</span>
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        {/* Bán đàn */}
        <section className="max-w-6xl mx-auto px-4 py-14">
          <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-ink-900 tracking-tight">
                Đàn cho người mới
              </h2>
              <p className="text-ink-500 mt-1.5">
                Người mới rất dễ mua nhầm đàn cần cao, bấm đau tay rồi bỏ. Ghé quán thử trước.
              </p>
            </div>
            <Link
              href="/shop"
              className="px-4 py-2.5 rounded-xl font-semibold border border-navy-200 text-ink-700 hover:bg-white no-underline"
            >
              Xem tất cả {GUITARS.length} cây →
            </Link>
          </div>

          <ul className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {dan.map((g) => (
              <li key={g.url}>
                <Link
                  href={`/shop/${encodeURIComponent(g.url.split("/").pop() ?? "")}`}
                  className="block h-full rounded-2xl border border-navy-100 bg-white p-3 hover:shadow-sm transition no-underline"
                >
                  {g.img ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={g.img}
                      alt={g.name}
                      loading="lazy"
                      className="w-full aspect-square object-cover rounded-xl bg-ivory-100"
                    />
                  ) : (
                    <div className="w-full aspect-square rounded-xl bg-ivory-100 grid place-items-center text-4xl">
                      🎸
                    </div>
                  )}
                  <p className="text-sm font-semibold text-ink-900 mt-2.5 line-clamp-2">{g.name}</p>
                  <p className="text-wood-600 font-bold mt-1 tabular">{g.price}</p>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* Chi nhánh */}
        <section className="bg-navy-950 text-white">
          <div className="max-w-6xl mx-auto px-4 py-12 text-center">
            <h2 className="text-2xl font-bold tracking-tight">Ghé quán chơi thử</h2>
            {BRAND.branches.map((b) => (
              <p key={b.name} className="text-navy-200 mt-3">
                <span className="font-semibold text-white">{b.name}</span> — {b.address}
              </p>
            ))}
            <p className="text-navy-300 text-sm mt-4">
              Bạn ở khu vực khác? Đăng ký để trung tâm gọi tư vấn và mở điểm gần bạn.
            </p>
            <Link
              href="/register"
              className="inline-block mt-6 px-5 py-3 rounded-xl font-semibold bg-wood-500 hover:bg-wood-600 text-white no-underline"
            >
              Đăng ký miễn phí
            </Link>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
