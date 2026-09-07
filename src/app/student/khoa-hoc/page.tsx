import Link from "next/link";
import { requireRole } from "@/lib/guard";
import { khoaDaMua } from "@/lib/course-sales";
import { baiCuaKhoa, demBai, khoaDangBan, tienVN } from "@/lib/courses";
import { goiDangBan } from "@/lib/packages";
import { Card, PageHeader, btn } from "@/components/ui";
import { TOTAL_LESSONS } from "@/lib/curriculum";
import VideoPlayer from "@/components/video-player";
import TheGoiLop from "@/components/the-goi-lop";

export default async function StudentKhoaHocPage() {
  const session = await requireRole(["student"]);
  const daMua = khoaDaMua(session.userId);
  const daMuaSlugs = new Set(daMua.map((c) => c.slug));
  const chuaMua = khoaDangBan().filter((c) => !daMuaSlugs.has(c.slug));
  const goi = goiDangBan();

  return (
    <div className="space-y-5">
      <PageHeader
        title="Khoá học của tôi"
        subtitle={`Khoá nâng cao bạn đã mua, cùng các khoá và lớp đang mở. Khoá đệm hát cơ bản ${TOTAL_LESSONS} bài nằm ở mục Học guitar.`}
      />

      {daMua.length === 0 ? (
        <Card>
          <p className="font-semibold text-ink-900">Bạn chưa mua khoá nâng cao nào</p>
          <p className="text-sm text-ink-600 mt-1">
            Khoá đệm hát cơ bản {TOTAL_LESSONS} bài của bạn vẫn miễn phí và nằm ở mục Học guitar.
          </p>
          <Link
            href="/student/learn"
            className={`${btn.primary} inline-block px-4 py-2.5 text-sm no-underline mt-4`}
          >
            Học tiếp khoá miễn phí
          </Link>
        </Card>
      ) : (
        <div className="space-y-4">
          {daMua.map((c) => {
            const bai = baiCuaKhoa(c.id);
            return (
              <Card key={c.slug}>
                <p className="text-lg font-bold text-ink-900">{c.name}</p>
                <p className="text-sm text-ink-500 mt-1">
                  Giáo viên: {c.teacher_name} · {bai.length} bài
                </p>

                {bai.length === 0 ? (
                  <div className="mt-4 rounded-xl border border-navy-100 bg-ivory-50 p-4">
                    <p className="font-semibold text-ink-900">Bài giảng đang được đưa lên</p>
                    <p className="text-sm text-ink-600 mt-1">
                      Khoá đã mở trong tài khoản của bạn. Có bài mới là bạn xem được ngay tại đây.
                    </p>
                  </div>
                ) : (
                  <ol className="mt-4 space-y-5">
                    {bai.map((b, i) => (
                      <li key={b.id}>
                        <p className="font-semibold text-ink-900">
                          <span className="text-ink-400 tabular">Bài {i + 1}.</span> {b.title}
                        </p>
                        {b.description && (
                          <p className="text-sm text-ink-600 mt-0.5">{b.description}</p>
                        )}
                        <div className="mt-2">
                          {b.video ? (
                            <VideoPlayer url={b.video} title={b.title} />
                          ) : (
                            <p className="text-sm text-ink-400 rounded-xl border border-navy-100 bg-ivory-50 px-3 py-2.5">
                              Video bài này đang được quay.
                            </p>
                          )}
                        </div>
                      </li>
                    ))}
                  </ol>
                )}

                <Link
                  href="/student/messages"
                  className="inline-block mt-4 font-semibold text-wood-600"
                >
                  Bí chỗ nào thì nhắn cho giáo viên →
                </Link>
              </Card>
            );
          })}
        </div>
      )}

      {chuaMua.length > 0 && (
        <section>
          <h2 className="font-bold text-ink-900 text-lg">Khoá nâng cao quay sẵn</h2>
          <p className="text-sm text-ink-500 mt-0.5 mb-3">
            Học lúc nào cũng được, xem lại bao nhiêu lần cũng được.
          </p>
          <ul className="grid sm:grid-cols-2 gap-4">
            {chuaMua.map((c) => (
              <li key={c.slug}>
                <Link
                  href={`/khoa-hoc/${c.slug}`}
                  className="flex flex-col h-full rounded-2xl border border-navy-100 bg-white p-5 hover:shadow-md transition no-underline"
                >
                  <h3 className="font-bold text-ink-900 leading-snug">{c.name}</h3>
                  <p className="text-sm text-ink-500 mt-1.5 flex-1">{c.tagline}</p>
                  <p className="text-sm text-ink-500 mt-2">
                    {c.teacher_name} · {demBai(c.id)} bài
                  </p>
                  <p
                    className={`font-bold mt-1 tabular ${
                      c.price > 0 ? "text-wood-600 text-xl" : "text-ink-500 text-base"
                    }`}
                  >
                    {c.price > 0 ? tienVN(c.price) : "Liên hệ báo giá"}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {goi.length > 0 && (
        <section>
          <h2 className="font-bold text-ink-900 text-lg">Lớp có giáo viên kèm</h2>
          <p className="text-sm text-ink-500 mt-0.5 mb-3">
            Video quay sẵn thì tiện, nhưng không ai sửa tay cho bạn. Muốn chắc thì học với giáo
            viên.
          </p>
          <ul className="grid sm:grid-cols-2 gap-4">
            {goi.map((g) => (
              <li key={g.slug}>
                <TheGoiLop goi={g} href={`/student/lop-hoc/${g.slug}`} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
