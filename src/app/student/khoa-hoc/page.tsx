import Link from "next/link";
import { requireRole } from "@/lib/guard";
import { khoaDaMua } from "@/lib/course-sales";
import { activeCourses, tienVN } from "@/lib/courses";
import { Card, EmptyState, PageHeader } from "@/components/ui";
import { IconGuitar } from "@/components/icons";

export default async function StudentKhoaHocPage() {
  const session = await requireRole(["student"]);
  const daMua = khoaDaMua(session.userId);
  const daMuaSlugs = new Set(daMua.map((c) => c.slug));
  const chuaMua = activeCourses().filter((c) => !daMuaSlugs.has(c.slug));

  return (
    <div className="space-y-5">
      <PageHeader
        title="Khoá học của tôi"
        subtitle="Các khoá nâng cao bạn đã mua. Khoá đệm hát cơ bản 28 bài nằm ở mục Học guitar."
      />

      {daMua.length === 0 ? (
        <Card padded={false}>
          <EmptyState
            icon={<IconGuitar className="w-6 h-6" />}
            title="Bạn chưa mua khoá nâng cao nào"
            description="Khoá đệm hát cơ bản 28 bài của bạn vẫn miễn phí và nằm ở mục Học guitar."
          />
        </Card>
      ) : (
        <div className="space-y-4">
          {daMua.map((c) => (
            <Card key={c.slug}>
              <p className="text-lg font-bold text-ink-900">{c.name}</p>
              <p className="text-sm text-ink-500 mt-1">Giáo viên: {c.teacherName}</p>

              {/* Video của khoá đang được dựng. Trong lúc chờ, học viên vẫn thấy
                  rõ mình đã có quyền học và nhắn được cho giáo viên. */}
              <div className="mt-4 rounded-xl border border-navy-100 bg-ivory-50 p-4">
                <p className="font-semibold text-ink-900">Bài giảng đang được đưa lên</p>
                <p className="text-sm text-ink-600 mt-1">
                  Khoá đã mở trong tài khoản của bạn. Bên mình đang đưa dần video lên, có bài mới
                  là bạn xem được ngay tại đây.
                </p>
                <Link
                  href="/student/messages"
                  className="inline-block mt-3 font-semibold text-wood-600"
                >
                  Nhắn cho giáo viên →
                </Link>
              </div>

              <ul className="mt-4 space-y-1.5 text-sm text-ink-700">
                {c.noiDung.map((n) => (
                  <li key={n} className="flex gap-2">
                    <span className="text-ink-400">•</span>
                    {n}
                  </li>
                ))}
              </ul>
            </Card>
          ))}
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
