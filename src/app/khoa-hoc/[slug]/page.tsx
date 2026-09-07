import Link from "next/link";
import { notFound } from "next/navigation";
import { COURSES, courseBySlug, tienVN } from "@/lib/courses";
import { getSession } from "@/lib/auth";
import { coQuyenXem, donDangChoCuaHocVien } from "@/lib/course-sales";
import { BRAND, PublicFooter, PublicHeader, prettyPhone } from "@/components/brand";
import { IconCheckCircle } from "@/components/icons";
import CourseOrderForm from "./order-form";

export function generateStaticParams() {
  return COURSES.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const c = courseBySlug(slug);
  return { title: c ? c.name : "Khoá học" };
}

export default async function CourseDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const c = courseBySlug(slug);
  if (!c || !c.active) notFound();

  const session = await getSession();
  const daMua = session ? coQuyenXem(session.userId, slug) : false;
  const donCho = session && !daMua ? donDangChoCuaHocVien(session.userId, slug) : undefined;

  return (
    <div className="min-h-screen bg-ivory-50 flex flex-col">
      <PublicHeader />

      <main className="flex-1 max-w-5xl mx-auto px-4 py-10 w-full">
        <Link href="/khoa-hoc" className="text-sm text-ink-500 hover:text-ink-900">
          ← Tất cả khoá học
        </Link>

        <div className="grid lg:grid-cols-[1fr_20rem] gap-8 mt-4 items-start">
          <div>
            <h1 className="text-3xl font-bold text-ink-900 tracking-tight leading-tight">
              {c.name}
            </h1>
            <p className="text-ink-600 mt-3">{c.tagline}</p>

            <div className="rounded-2xl border border-navy-100 bg-white p-5 mt-6">
              <p className="font-bold text-ink-900">Học xong bạn làm được gì</p>
              <ul className="mt-3 space-y-2">
                {c.ketQua.map((k) => (
                  <li key={k} className="flex gap-2.5 text-ink-700">
                    <IconCheckCircle className="w-5 h-5 shrink-0 text-mint-600 mt-0.5" />
                    <span>{k}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-navy-100 bg-white p-5 mt-4">
              <p className="font-bold text-ink-900">Nội dung khoá học</p>
              <ol className="mt-3 space-y-2 list-decimal list-inside text-ink-700 marker:text-ink-400 marker:font-semibold">
                {c.noiDung.map((n) => (
                  <li key={n}>{n}</li>
                ))}
              </ol>
              <p className="text-sm text-ink-500 mt-4">{c.soLuong}</p>
            </div>

            <div className="rounded-2xl border border-navy-100 bg-white p-5 mt-4">
              <p className="font-bold text-ink-900">Khoá này dành cho ai</p>
              <p className="text-ink-700 mt-2">{c.danhCho}</p>
              <p className="text-ink-500 text-sm mt-3">
                Chưa đệm hát được thì học khoá cơ bản{" "}
                <Link href="/register" className="font-semibold text-wood-600">
                  28 bài miễn phí
                </Link>{" "}
                trước đã, xong rồi quay lại khoá này.
              </p>
            </div>
          </div>

          <aside className="lg:sticky lg:top-20 space-y-3">
            <div className="rounded-2xl border border-navy-100 bg-white p-5">
              <p className="text-3xl font-bold text-wood-600 tabular">{tienVN(c.price)}</p>
              {c.priceOld > 0 && (
                <p className="text-sm text-ink-400 line-through tabular">{tienVN(c.priceOld)}</p>
              )}
              <p className="text-sm text-ink-500 mt-1">Đóng một lần, học không giới hạn.</p>
              <p className="text-sm text-ink-500 mt-3">
                Giáo viên đứng khoá: <b className="text-ink-900">{c.teacherName}</b>
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
            ) : (
              <CourseOrderForm slug={c.slug} name={c.name} price={tienVN(c.price)} />
            )}
          </aside>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
