import Link from "next/link";
import { notFound } from "next/navigation";
import { baiCuaKhoa, courseBySlug, tachDong, tienVN } from "@/lib/courses";
import { getSession } from "@/lib/auth";
import { coQuyenXem, donDangChoCuaHocVien } from "@/lib/course-sales";
import { BRAND, PublicFooter, PublicHeader, prettyPhone } from "@/components/brand";
import { IconCheckCircle } from "@/components/icons";
import VideoPlayer from "@/components/video-player";
import { soDu } from "@/lib/wallet";
import CourseOrderForm from "./order-form";
import MuaBangVi from "./mua-bang-vi";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const c = courseBySlug(slug);
  return { title: c ? c.name : "Khoá học" };
}

export default async function CourseDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const c = courseBySlug(slug);
  if (!c || c.status !== "published") notFound();

  const session = await getSession();
  const daMua = session ? coQuyenXem(session.userId, slug) : false;
  const donCho = session && !daMua ? donDangChoCuaHocVien(session.userId, slug) : undefined;
  // Học viên đã đăng nhập thì mua thẳng bằng ví, mở khoá ngay. Khách vãng lai
  // vẫn để lại số điện thoại như cũ — bắt đăng ký mới được mua là mất khách.
  const laHocVien = session?.role === "student";
  const viDu = laHocVien ? soDu(session.userId) : 0;

  const bai = baiCuaKhoa(c.id);
  const xemThu = bai.find((b) => b.free_preview && b.video);
  const ketQua = tachDong(c.ket_qua);
  const noiDung = tachDong(c.noi_dung);

  return (
    <div className="min-h-screen bg-ivory-50 flex flex-col">
      <PublicHeader />

      <main className="flex-1 max-w-5xl mx-auto px-4 py-10 w-full">
        <Link href="/khoa-hoc" className="text-sm text-ink-500 hover:text-ink-900">
          ← Tất cả khoá học
        </Link>

        {/* Điện thoại xếp một cột: tên khoá, giá và nút mua lên trước, phần
            giới thiệu để sau — để giá nằm cuối trang là khách phải lướt qua
            hết mới biết bao nhiêu tiền. */}
        <div className="flex flex-col gap-6 mt-4 lg:grid lg:grid-cols-[1fr_20rem] lg:gap-8 lg:items-start">
          <div className="lg:col-start-1 lg:row-start-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-ink-900 tracking-tight leading-tight">
              {c.name}
            </h1>
            <p className="text-ink-600 mt-3">{c.tagline}</p>
          </div>

          <aside className="space-y-3 lg:col-start-2 lg:row-start-1 lg:row-span-2 lg:sticky lg:top-20">
            <div className="rounded-2xl border border-navy-100 bg-white p-5">
              <p className="text-3xl font-bold text-wood-600 tabular">{tienVN(c.price)}</p>
              {c.price_old > 0 && (
                <p className="text-sm text-ink-400 line-through tabular">{tienVN(c.price_old)}</p>
              )}
              <p className="text-sm text-ink-500 mt-1">
                Đóng một lần, học không giới hạn. {bai.length} bài video.
              </p>
              <p className="text-sm text-ink-500 mt-3">
                Giáo viên đứng khoá: <b className="text-ink-900">{c.teacher_name}</b>
              </p>
            </div>

            {daMua ? (
              <div className="rounded-2xl border border-mint-300 bg-mint-50 p-5">
                <p className="font-bold text-mint-700">Bạn đã có khoá này</p>
                <Link
                  href="/student/khoa-hoc"
                  className="inline-block mt-2 font-semibold text-wood-600"
                >
                  Vào học ngay →
                </Link>
              </div>
            ) : donCho ? (
              <div className="rounded-2xl border border-amber-300 bg-amber-50 p-5">
                <p className="font-bold text-amber-700">Đơn của bạn đang chờ</p>
                <p className="text-sm text-ink-700 mt-1.5">
                  Bên mình sẽ gọi số {donCho.customer_phone} để thu tiền và mở khoá. Cần gấp thì gọi{" "}
                  <a href={`tel:${BRAND.phone}`} className="font-semibold text-wood-600">
                    {prettyPhone()}
                  </a>
                  .
                </p>
              </div>
            ) : laHocVien ? (
              <MuaBangVi
                slug={c.slug}
                gia={c.price}
                soDu={viDu}
                giaHienThi={tienVN(c.price)}
                soDuHienThi={tienVN(viDu)}
              />
            ) : (
              <CourseOrderForm slug={c.slug} name={c.name} price={tienVN(c.price)} />
            )}
          </aside>


          <div className="lg:col-start-1 lg:row-start-2">

            {xemThu && (
              <div className="rounded-2xl border border-navy-100 bg-white p-5">
                <p className="font-bold text-ink-900 mb-3">Xem thử: {xemThu.title}</p>
                <VideoPlayer url={xemThu.video ?? ""} title={xemThu.title} />
              </div>
            )}

            {ketQua.length > 0 && (
              <div className="rounded-2xl border border-navy-100 bg-white p-5 mt-4 first:mt-0">
                <p className="font-bold text-ink-900">Học xong bạn làm được gì</p>
                <ul className="mt-3 space-y-2">
                  {ketQua.map((k) => (
                    <li key={k} className="flex gap-2.5 text-ink-700">
                      <IconCheckCircle className="w-5 h-5 shrink-0 text-mint-600 mt-0.5" />
                      <span>{k}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="rounded-2xl border border-navy-100 bg-white p-5 mt-4">
              <p className="font-bold text-ink-900">Giáo trình — {bai.length} bài</p>
              <ol className="mt-3 divide-y divide-navy-100">
                {bai.map((b, i) => (
                  <li key={b.id} className="flex gap-3 py-2.5 first:pt-0 last:pb-0">
                    <span className="shrink-0 w-7 h-7 rounded-lg bg-ivory-100 text-ink-500 grid place-items-center text-xs font-bold tabular">
                      {i + 1}
                    </span>
                    <span className="min-w-0">
                      <span className="block font-medium text-ink-900">{b.title}</span>
                      {b.description && (
                        <span className="block text-sm text-ink-500 mt-0.5">{b.description}</span>
                      )}
                    </span>
                    {!!b.free_preview && (
                      <span className="ml-auto shrink-0 self-start text-[11px] font-semibold rounded-full bg-mint-50 text-mint-700 px-2 py-0.5">
                        Xem thử
                      </span>
                    )}
                  </li>
                ))}
              </ol>
            </div>

            {noiDung.length > 0 && (
              <div className="rounded-2xl border border-navy-100 bg-white p-5 mt-4">
                <p className="font-bold text-ink-900">Khoá này dạy những gì</p>
                <ul className="mt-3 space-y-2 text-ink-700">
                  {noiDung.map((n) => (
                    <li key={n} className="flex gap-2">
                      <span className="text-ink-400">•</span>
                      {n}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {c.danh_cho && (
              <div className="rounded-2xl border border-navy-100 bg-white p-5 mt-4">
                <p className="font-bold text-ink-900">Khoá này dành cho ai</p>
                <p className="text-ink-700 mt-2 whitespace-pre-line">{c.danh_cho}</p>
                <p className="text-ink-500 text-sm mt-3">
                  Chưa đệm hát được thì học khoá cơ bản{" "}
                  <Link href="/register" className="font-semibold text-wood-600">
                    28 bài miễn phí
                  </Link>{" "}
                  trước đã, xong rồi quay lại khoá này.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
