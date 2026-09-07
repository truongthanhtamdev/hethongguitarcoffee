import Link from "next/link";
import { goiDangBan } from "@/lib/packages";
import { khoaDangBan, tienVN, demBai } from "@/lib/courses";
import { TOTAL_LESSONS } from "@/lib/curriculum";
import { PublicFooter, PublicHeader } from "@/components/brand";
import TheGoiLop from "@/components/the-goi-lop";

export const metadata = { title: "Lớp học có giáo viên" };

export default function LopHocPage() {
  const goi = goiDangBan();
  const khoa = khoaDangBan();

  return (
    <div className="min-h-screen bg-ivory-50 flex flex-col">
      <PublicHeader />

      <main className="flex-1 max-w-6xl mx-auto px-4 py-10 w-full">
        <h1 className="text-3xl font-bold text-ink-900 tracking-tight">Lớp có giáo viên kèm</h1>
        <p className="text-ink-500 mt-2 max-w-2xl">
          Học video quay sẵn tiện nhưng không ai sửa tay cho bạn. Muốn nhanh và chắc thì học với
          giáo viên — chọn hình thức hợp với bạn nhất.
        </p>

        <ul className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
          {goi.map((g) => (
            <li key={g.slug}>
              <TheGoiLop goi={g} href={`/lop-hoc/${g.slug}`} />
            </li>
          ))}
        </ul>

        <section className="mt-14">
          <h2 className="text-2xl font-bold text-ink-900 tracking-tight">Hoặc học một mình</h2>
          <p className="text-ink-500 mt-1.5">
            Khoá đệm hát cơ bản {TOTAL_LESSONS} bài miễn phí khi đăng ký tài khoản. Học xong muốn
            đi sâu thì có các khoá nâng cao quay sẵn.
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
            <Link
              href="/register"
              className="flex flex-col rounded-2xl border border-mint-300 bg-mint-50 p-5 no-underline hover:shadow-md transition"
            >
              <h3 className="font-bold text-mint-700">
                Khoá đệm hát cơ bản — {TOTAL_LESSONS} bài
              </h3>
              <p className="text-sm text-ink-600 mt-1.5 flex-1">
                Từ cách cầm đàn tới đệm hát trọn bài, kèm thư viện hợp âm, máy đập nhịp và máy lên
                dây.
              </p>
              <p className="font-bold text-mint-700 mt-3">Miễn phí</p>
            </Link>

            {khoa.map((c) => (
              <Link
                key={c.slug}
                href={`/khoa-hoc/${c.slug}`}
                className="flex flex-col rounded-2xl border border-navy-100 bg-white p-5 no-underline hover:shadow-md transition"
              >
                <h3 className="font-bold text-ink-900 leading-snug">{c.name}</h3>
                <p className="text-sm text-ink-500 mt-1.5 flex-1">{c.tagline}</p>
                <p className="text-sm text-ink-500 mt-2">
                  {c.teacher_name} · {demBai(c.id)} bài
                </p>
                <p className="text-wood-600 font-bold text-xl mt-1 tabular">
                  {c.price > 0 ? tienVN(c.price) : "Liên hệ báo giá"}
                </p>
              </Link>
            ))}
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
