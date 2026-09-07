import Link from "next/link";
import { khoaDangBan, demBai, tienVN } from "@/lib/courses";
import { TOTAL_LESSONS } from "@/lib/curriculum";
import { PublicFooter, PublicHeader } from "@/components/brand";

export const metadata = { title: "Khoá học quay sẵn" };

export default function KhoaHocPage() {
  const courses = khoaDangBan();

  return (
    <div className="min-h-screen bg-ivory-50 flex flex-col">
      <PublicHeader />

      <main className="flex-1 max-w-5xl mx-auto px-4 py-10 w-full">
        <h1 className="text-3xl font-bold text-ink-900 tracking-tight">Khoá học quay sẵn</h1>
        <p className="text-ink-500 mt-2 max-w-2xl">
          Học lúc nào cũng được, xem lại bao nhiêu lần cũng được. Bí chỗ nào thì nhắn thẳng cho
          giáo viên trong tài khoản.
        </p>

        <div className="mt-8 rounded-2xl border border-mint-300 bg-mint-50 p-5">
          <p className="font-bold text-mint-700">
            Khoá đệm hát cơ bản — {TOTAL_LESSONS} bài — miễn phí
          </p>
          <p className="text-ink-700 mt-1.5 text-sm">
            Chỉ cần đăng ký tài khoản là xem được trọn bộ: từ cách cầm đàn tới đệm hát trọn bài,
            kèm thư viện hợp âm, máy đập nhịp và máy lên dây.
          </p>
          <Link
            href="/register"
            className="inline-block mt-3 rounded-xl bg-mint-600 hover:bg-mint-700 text-white font-semibold px-4 py-2 text-sm no-underline"
          >
            Đăng ký nhận miễn phí
          </Link>
        </div>

        <h2 className="text-xl font-bold text-ink-900 mt-10">Khoá nâng cao</h2>

        {courses.length === 0 ? (
          <p className="text-ink-500 mt-3">
            Các thầy cô đang soạn khoá mới. Bạn quay lại sau ít hôm nhé.
          </p>
        ) : (
          <ul className="grid sm:grid-cols-2 gap-4 mt-4">
            {courses.map((c) => (
              <li key={c.slug}>
                <Link
                  href={`/khoa-hoc/${c.slug}`}
                  className="flex flex-col h-full rounded-2xl border border-navy-100 bg-white p-5 hover:shadow-md transition no-underline"
                >
                  <p className="text-lg font-bold text-ink-900 leading-snug">{c.name}</p>
                  <p className="text-sm text-ink-500 mt-1.5 flex-1">{c.tagline}</p>
                  <p className="text-sm text-ink-500 mt-3">
                    {c.teacher_name} · {demBai(c.id)} bài
                  </p>
                  <p className="text-wood-600 font-bold text-xl mt-1 tabular">{tienVN(c.price)}</p>
                  {c.price_old > 0 && (
                    <p className="text-xs text-ink-400 line-through tabular">
                      {tienVN(c.price_old)}
                    </p>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>

      <PublicFooter />
    </div>
  );
}
