import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/guard";
import {
  getClassForStudent,
  getPackageProgress,
  listAttendance,
  sessionNumberMap,
} from "@/lib/queries";
import { toISODate, nextOccurrence } from "@/lib/format";
import {
  ATTENDANCE_STATUS_LABELS,
  DAY_LABELS,
  formatClassSchedule,
  type AttendanceStatus,
} from "@/lib/types";
import { Card, ProgressBar, StatusChip, EmptyState, packageTone } from "@/components/ui";
import { IconChevronLeft, IconCalendarCheck, SubjectIcon } from "@/components/icons";

const STATUS_TONE: Record<AttendanceStatus, "mint" | "coral" | "amber" | "neutral"> = {
  completed: "mint",
  teacher_absent: "coral",
  student_absent: "amber",
  rescheduled: "neutral",
};

export default async function StudentClassDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireRole(["student"]);
  const { id } = await params;

  const classId = Number(id);
  const cls = Number.isInteger(classId)
    ? getClassForStudent(classId, session.userId)
    : undefined;
  if (!cls) notFound();

  const progress = getPackageProgress(cls);
  const history = listAttendance({ classId: cls.id });
  const sessionNumbers = sessionNumberMap([cls.id]);
  const nextDate =
    cls.status === "active" && cls.schedule_type === "fixed"
      ? toISODate(nextOccurrence(cls.day_of_week))
      : null;

  return (
    <div className="space-y-5">
      <Link
        href="/student"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-500 hover:text-ink-900"
      >
        <IconChevronLeft className="w-4 h-4" />
        Lớp học của tôi
      </Link>

      <section className="rounded-2xl bg-navy-950 text-white px-5 py-6 sm:px-7">
        <p className="flex items-center gap-2 text-xs uppercase tracking-wider text-navy-300 font-semibold">
          <SubjectIcon subject={cls.subject} className="w-4 h-4" />
          {cls.subject}
          {cls.level ? ` · ${cls.level}` : ""}
        </p>
        <h1 className="text-2xl font-bold tracking-tight mt-1.5">{formatClassSchedule(cls)}</h1>
        <p className="text-navy-200 text-sm mt-1">
          Giáo viên: {cls.teacher_name || "Chưa xếp"}
        </p>

        {cls.status !== "active" && (
          <p className="text-sm font-semibold text-amber-200 mt-3">
            Lớp đang ở trạng thái {cls.status === "paused" ? "tạm dừng" : "đã kết thúc"}.
          </p>
        )}
        {nextDate && (
          <p className="inline-flex items-center gap-1.5 text-sm font-semibold text-wood-300 mt-3">
            <IconCalendarCheck className="w-4 h-4" />
            Buổi tới: {DAY_LABELS[cls.day_of_week]} ngày {nextDate}
          </p>
        )}
      </section>

      {progress ? (
        <Card>
          <div className="flex items-baseline justify-between mb-2">
            <h2 className="font-bold text-ink-900">Gói học</h2>
            <StatusChip tone={packageTone(progress.remaining)}>
              Còn {progress.remaining} tiết
            </StatusChip>
          </div>

          <ProgressBar value={progress.used} max={progress.total} tone={packageTone(progress.remaining)} />

          <p className="text-sm text-ink-500 mt-2 tabular">
            Đã học <span className="font-semibold text-ink-900">{progress.used}</span> /{" "}
            {progress.total} tiết · mở gói ngày {progress.startedAt}
          </p>

          {progress.sharedWith.length > 0 && (
            <p className="text-sm text-ink-500 mt-2">
              Gói này dùng chung với{" "}
              {progress.sharedWith
                .map((s) => `${DAY_LABELS[s.day_of_week]} ${s.start_time}`)
                .join(", ")}
              .
            </p>
          )}

          {progress.remaining <= 3 && (
            <p className="text-sm text-coral-600 mt-2">
              Gói học sắp hết — liên hệ trung tâm để gia hạn.
            </p>
          )}
        </Card>
      ) : (
        <Card>
          <h2 className="font-bold text-ink-900 mb-1">Gói học</h2>
          <p className="text-sm text-ink-500">
            Lớp này chưa gắn gói buổi nào. Liên hệ trung tâm nếu bạn cần biết còn bao nhiêu tiết.
          </p>
        </Card>
      )}

      <Card padded={false}>
        <div className="p-5 pb-3">
          <h2 className="font-bold text-ink-900">Lịch sử buổi học</h2>
          <p className="text-sm text-ink-500 mt-0.5">
            {history.length > 0
              ? `${history.length} buổi đã ghi nhận, mới nhất ở trên.`
              : "Chưa có buổi nào được điểm danh."}
          </p>
        </div>

        {history.length === 0 ? (
          <EmptyState
            icon={<IconCalendarCheck className="w-6 h-6" />}
            title="Chưa có buổi học nào"
            description="Sau mỗi buổi, giáo viên điểm danh và ghi nội dung bài học — nội dung sẽ hiện ở đây."
          />
        ) : (
          <ul className="divide-y divide-navy-100">
            {history.map((a) => {
              const no = sessionNumbers.get(a.id);
              return (
                <li key={a.id} className="px-5 py-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold text-ink-900 tabular">
                      {a.session_date}
                    </span>
                    {a.is_trial ? (
                      <StatusChip tone="amber">Buổi học thử</StatusChip>
                    ) : no ? (
                      <StatusChip tone="navy">Buổi {no}</StatusChip>
                    ) : null}
                    <StatusChip tone={STATUS_TONE[a.status]}>
                      {ATTENDANCE_STATUS_LABELS[a.status]}
                    </StatusChip>
                  </div>

                  {a.lesson_content && (
                    <p className="text-sm text-ink-700 mt-2 border-l-2 border-wood-200 pl-3">
                      {a.lesson_content}
                    </p>
                  )}

                  {a.rescheduled_to_date && (
                    <p className="text-xs text-ink-500 mt-2 tabular">
                      Học bù: {a.rescheduled_to_date}
                      {a.rescheduled_to_time ? ` lúc ${a.rescheduled_to_time}` : ""}
                    </p>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </div>
  );
}
