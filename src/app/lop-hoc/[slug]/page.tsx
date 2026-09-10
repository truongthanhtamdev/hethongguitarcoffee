import Link from "next/link";
import { notFound } from "next/navigation";
import { goiBySlug, hienGia, tachBangGia, tachDong, donGoiDangChoCuaToi } from "@/lib/packages";
import { tienVN } from "@/lib/courses";
import { getSession } from "@/lib/auth";
import { BRAND, PublicFooter, PublicHeader, prettyPhone, tenHinhThuc } from "@/components/brand";
import { IconCheckCircle } from "@/components/icons";
import PackageOrderForm from "./order-form";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const g = goiBySlug(slug);
  return { title: g ? g.name : "Gói lớp" };
}

export default async function PackageDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const g = goiBySlug(slug);
  if (!g || !g.active) notFound();

  const session = await getSession();
  const donCho = session ? donGoiDangChoCuaToi(session.userId, slug) : undefined;

  const quyenLoi = tachDong(g.quyen_loi);
  const mucGia = tachBangGia(g.bang_gia);

  return (
    <div className="min-h-screen bg-ivory-50 flex flex-col">
      <PublicHeader />

      <main className="flex-1 max-w-5xl mx-auto px-4 py-10 w-full">
        <Link href="/lop-hoc" className="text-sm text-ink-500 hover:text-ink-900">
          ← Tất cả lớp học
        </Link>

        {/* Điện thoại xếp một cột: tên gói, học phí và nút đăng ký lên trước,
            phần mô tả để sau. Để bảng giá nằm cuối trang là khách phải lướt
            qua hết mới biết bao nhiêu tiền. */}
        <div className="flex flex-col gap-6 mt-4 lg:grid lg:grid-cols-[1fr_20rem] lg:gap-8 lg:items-start">
          <div className="lg:col-start-1 lg:row-start-1">
            <p className="text-sm font-semibold text-wood-600">{tenHinhThuc(g.hinh_thuc)}</p>
            <h1 className="text-2xl sm:text-3xl font-bold text-ink-900 tracking-tight leading-tight mt-1">
              {g.name}
            </h1>
            <p className="text-ink-600 mt-3">{g.tagline}</p>
          </div>

          <aside className="space-y-3 lg:col-start-2 lg:row-start-1 lg:row-span-2 lg:sticky lg:top-20">
            <div className="rounded-2xl border border-navy-100 bg-white p-5">
              {mucGia.length > 0 ? (
                <>
                  <p className="font-bold text-ink-900">Học phí</p>
                  <div className="mt-2 divide-y divide-navy-100">
                    {mucGia.map((m) => (
                      <p
                        key={m.nhan}
                        className="flex items-baseline justify-between gap-3 py-2 first:pt-0 last:pb-0"
                      >
                        <span className="text-ink-600">{m.nhan}</span>
                        <b className="text-xl text-wood-600 tabular">{tienVN(m.tien)}</b>
                      </p>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <p
                    className={`font-bold tabular ${
                      g.price > 0 ? "text-3xl text-wood-600" : "text-xl text-ink-700"
                    }`}
                  >
                    {hienGia(g.price)}
                  </p>
                  {g.price_old > 0 && g.price > 0 && (
                    <p className="text-sm text-ink-400 line-through tabular">
                      {tienVN(g.price_old)}
                    </p>
                  )}
                </>
              )}

              {g.lich_hoc && <p className="text-sm text-ink-600 mt-3">Lịch học: {g.lich_hoc}</p>}
              {g.so_buoi > 0 && (
                <p className="text-sm text-ink-500 mt-1">
                  {g.so_buoi} buổi · mỗi buổi {g.phut_moi_buoi} phút
                </p>
              )}
            </div>

            {donCho ? (
              <div className="rounded-2xl border border-amber-300 bg-amber-50 p-5">
                <p className="font-bold text-amber-700">Đăng ký của bạn đang chờ</p>
                <p className="text-sm text-ink-700 mt-1.5">
                  Bên mình sẽ gọi số {donCho.customer_phone} để xếp lịch. Cần gấp thì gọi{" "}
                  <a href={`tel:${BRAND.phone}`} className="font-semibold text-wood-600">
                    {prettyPhone()}
                  </a>
                  .
                </p>
              </div>
            ) : (
              <PackageOrderForm slug={g.slug} name={g.name} coGia={g.price > 0} />
            )}
          </aside>

          <div className="lg:col-start-1 lg:row-start-2">
            {quyenLoi.length > 0 && (
              <div className="rounded-2xl border border-navy-100 bg-white p-5">
                <p className="font-bold text-ink-900">Bạn được gì</p>
                <ul className="mt-3 space-y-2">
                  {quyenLoi.map((q) => (
                    <li key={q} className="flex gap-2.5 text-ink-700">
                      <IconCheckCircle className="w-5 h-5 shrink-0 text-mint-600 mt-0.5" />
                      <span>{q}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {g.danh_cho && (
              <div className="rounded-2xl border border-navy-100 bg-white p-5 mt-4">
                <p className="font-bold text-ink-900">Gói này hợp với ai</p>
                <p className="text-ink-700 mt-2 whitespace-pre-line">{g.danh_cho}</p>
              </div>
            )}

            {g.hinh_thuc === "quan" && BRAND.branches.length > 0 && (
              <div className="rounded-2xl border border-navy-100 bg-white p-5 mt-4">
                <p className="font-bold text-ink-900">Học ở đâu</p>
                {BRAND.branches.map((b) => (
                  <p key={b.name} className="text-ink-600 mt-1.5">
                    <b className="text-ink-900">{b.name}</b>
                    <br />
                    {b.address}
                  </p>
                ))}
              </div>
            )}

            {g.ghi_chu && (
              <div className="rounded-2xl border border-wood-200 bg-wood-50 p-5 mt-4">
                <p className="text-ink-700">{g.ghi_chu}</p>
              </div>
            )}

            <p className="text-sm text-ink-500 mt-4">
              Chưa chắc hợp?{" "}
              <Link href="/hoc-thu" className="font-semibold text-wood-600">
                Học thử một buổi miễn phí
              </Link>{" "}
              rồi quyết cũng được.
            </p>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
