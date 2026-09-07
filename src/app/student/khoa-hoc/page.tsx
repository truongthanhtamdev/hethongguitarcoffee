import Link from "next/link";
import { requireRole } from "@/lib/guard";
import { khoaDaMua } from "@/lib/course-sales";
import { baiCuaKhoa, khoaDangBan, tienVN } from "@/lib/courses";
import { Card, PageHeader, btn } from "@/components/ui";
import { TOTAL_LESSONS } from "@/lib/curriculum";
import VideoPlayer from "@/components/video-player";

export default async function StudentKhoaHocPage() {
  const session = await requireRole(["student"]);
  const daMua = khoaDaMua(session.userId);
  const daMuaSlugs = new Set(daMua.map((c) => c.slug));
  const chuaMua = khoaDangBan().filter((c) => !daMuaSlugs.has(c.slug));

  return (
    <div className="space-y-5">
      <PageHeader
        title="Khoá học của tôi"
        subtitle="Các khoá nâng cao bạn đã mua. Khoá đệm hát cơ bản 28 bài nằm ở mục Học guitar."
      />

      {daMua.length === 0 ? (
        // Trang trống nhìn hụt hẫng, nên chỉ luôn lối đi tiếp: khoá miễn phí
        // đang có và các khoá nâng cao đang bán.
        <Card>
          <p className="font-semibold text-ink-900">Bạn chưa mua khoá nâng cao nào</p>
          <p className="text-sm text-ink-600 mt-1">
            Khoá đệm hát cơ bản {TOTAL_LESSONS} bài của bạn vẫn miễn phí và nằm ở mục Học guitar.
          </p>
          <div className="flex flex-wrap gap-2 mt-4">
            <Link
              href="/student/learn"
              className={`${btn.primary} px-4 py-2.5 text-sm no-underline`}
            >
              Học tiếp khoá miễn phí
            </Link>
            {chuaMua.length > 0 && (
              <Link
                href="/khoa-hoc"
                className={`${btn.ghost} px-4 py-2.5 text-sm no-underline`}
              >
                Xem {chuaMua.length} khoá nâng cao
              </Link>
            )}
          </div>
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
        <Card>
          <p className="font-semibold text-ink-900">Khoá nâng cao khác</p>
          <ul className="mt-3 space-y-3">
            {chuaMua.map((c) => (
              <li key={c.slug} className="border-b border-navy-100 last:border-0 pb-3 last:pb-0">
                <Link href={`/khoa-hoc/${c.slug}`} className="font-medium text-ink-900">
                  {c.name}
                </Link>
                <p className="text-sm text-ink-500 mt-0.5">{c.tagline}</p>
                <p className="text-wood-600 font-bold tabular mt-1">{tienVN(c.price)}</p>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
