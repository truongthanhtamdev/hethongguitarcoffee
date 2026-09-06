import Link from "next/link";
import { getSession } from "@/lib/auth";
import { listClassesForStudent, getPackageProgressForClasses } from "@/lib/queries";
import { toISODate, nextOccurrence } from "@/lib/format";
import { formatClassSchedule } from "@/lib/types";
import { IconChevronRight, IconGuitar, IconMusic, SubjectIcon } from "@/components/icons";
import { getLearningState } from "@/lib/learning";
import { TOTAL_LESSONS } from "@/lib/curriculum";
import { Card, EmptyState, ProgressBar, StatusChip, packageTone } from "@/components/ui";

export default async function StudentHomePage() {
  const session = await getSession();
  const classes = listClassesForStudent(session!.userId);
  const learning = getLearningState(session!.userId);
  const progressByClass = getPackageProgressForClasses(classes);

  return (
    <div className="space-y-5">
      <section className="rounded-2xl bg-navy-950 text-white px-5 py-6 sm:px-7">
        <h1 className="text-2xl font-bold tracking-tight">Chào {session!.name}</h1>
        <p className="text-navy-200 text-sm mt-1">
          Lịch học, tiến độ gói và nội dung bài học của bạn.
        </p>
      </section>

      <Link
        href={`/student/learn/${learning.next.n}`}
        className="block rounded-2xl border border-navy-100 bg-white p-5 hover:shadow-sm transition"
      >
        <div className="flex items-center gap-4">
          <span className="shrink-0 rounded-xl bg-wood-50 text-wood-600 p-3">
            <IconGuitar className="w-6 h-6" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-ink-900">
              {learning.completedCount > 0
                ? `Học tiếp: ${learning.next.title}`
                : "Bắt đầu khoá đệm hát cơ bản"}
            </p>
            <p className="text-sm text-ink-500 mt-0.5 truncate">{learning.next.desc}</p>
            <div className="mt-2">
              <ProgressBar value={learning.completedCount} max={TOTAL_LESSONS} showPercent />
            </div>
          </div>
          <IconChevronRight className="w-5 h-5 text-ink-400 shrink-0" />
        </div>
      </Link>

      {classes.length === 0 ? (
        <Card padded={false}>
          <EmptyState
            icon={<IconMusic className="w-7 h-7" />}
            title="Chưa có lớp học nào gắn với tài khoản của bạn"
            description="Bạn vẫn tự học được toàn bộ lộ trình ở trên. Muốn xem lịch học tại trung tâm, báo email đã đăng ký cho trung tâm để được gắn vào lớp."
          />
        </Card>
      ) : (
        <div className="space-y-4">
          <h2 className="font-bold text-ink-900">Lớp học tại trung tâm</h2>

          {classes.map((c) => {
            const progress = c.package_id ? progressByClass.get(c.package_id) : undefined;
            const nextDate =
              c.status === "active" && c.schedule_type === "fixed"
                ? toISODate(nextOccurrence(c.day_of_week))
                : null;

            return (
              <Link
                key={c.id}
                href={`/student/classes/${c.id}`}
                className="block rounded-2xl border border-navy-100 bg-white p-5 hover:shadow-sm transition"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-ink-900 flex items-center gap-2">
                      <SubjectIcon subject={c.subject} className="w-5 h-5 text-wood-500" />
                      {c.subject}
                      {c.level ? ` · ${c.level}` : ""}
                    </p>
                    <p className="text-sm text-ink-500 mt-1 tabular">
                      {formatClassSchedule(c)} · Giáo viên: {c.teacher_name || "Chưa xếp"}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {nextDate ? (
                      <StatusChip tone="navy">Buổi tới: {nextDate}</StatusChip>
                    ) : (
                      <StatusChip tone="neutral">
                        {c.status === "active" ? "Lịch linh động" : "Đã kết thúc"}
                      </StatusChip>
                    )}
                    <IconChevronRight className="w-5 h-5 text-ink-400" />
                  </div>
                </div>

                {progress && (
                  <div className="mt-4">
                    <div className="flex items-baseline justify-between mb-1.5">
                      <span className="text-sm text-ink-500 tabular">
                        Đã học <span className="font-semibold text-ink-900">{progress.used}</span> /{" "}
                        {progress.total} tiết
                      </span>
                      <span
                        className={`text-sm font-semibold tabular ${
                          progress.remaining <= 3
                            ? "text-coral-600"
                            : progress.remaining <= 5
                              ? "text-amber-700"
                              : "text-ink-500"
                        }`}
                      >
                        Còn {progress.remaining} tiết
                      </span>
                    </div>
                    <ProgressBar
                      value={progress.used}
                      max={progress.total}
                      tone={packageTone(progress.remaining)}
                    />
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
