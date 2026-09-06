import { requireRole } from "@/lib/guard";
import { listStudents } from "@/lib/queries";
import { countDoneLessonsByUser } from "@/lib/learning";
import { TOTAL_LESSONS } from "@/lib/curriculum";
import { IconUser } from "@/components/icons";
import {
  Avatar,
  Card,
  CardHeader,
  EmptyState,
  PageHeader,
  StatusChip,
  TableShell,
  Th,
} from "@/components/ui";
import NewStudentForm from "./new-student-form";
import ToggleStudentActiveButton from "./toggle-active-button";

export default async function StudentsPage() {
  await requireRole(["admin"]);
  const students = listStudents();
  const selfStudy = countDoneLessonsByUser(students.map((s) => s.id));

  // Khu vực nào đông học viên nhất thì đó là chỗ đáng mở quán tiếp theo.
  const theoKhuVuc = [...students.reduce((m, s) => {
    if (s.area) m.set(s.area, (m.get(s.area) ?? 0) + 1);
    return m;
  }, new Map<string, number>())].sort((a, b) => b[1] - a[1]);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Tài khoản học viên"
        subtitle="Học viên có thể tự đăng ký tại /register, hoặc tạo sẵn tài khoản ở đây. Sau khi có tài khoản, vào trang chi tiết lớp để gắn lớp với tài khoản đó."
      />

      {theoKhuVuc.length > 0 && (
        <Card>
          <p className="font-semibold text-ink-900">Học viên đang ở khu vực nào</p>
          <p className="text-sm text-ink-500 mt-0.5 mb-3">
            Khu vực đông học viên nhất là chỗ đáng mở quán tiếp theo.
          </p>
          <div className="flex flex-wrap gap-2">
            {theoKhuVuc.map(([kv, n]) => (
              <span
                key={kv}
                className="rounded-xl bg-ivory-100 border border-navy-100 px-3 py-1.5 text-sm text-ink-700"
              >
                {kv} <b className="text-ink-900 tabular">{n}</b>
              </span>
            ))}
          </div>
        </Card>
      )}

      <Card padded={false}>
        {students.length === 0 ? (
          <EmptyState
            icon={<IconUser className="w-6 h-6" />}
            title="Chưa có tài khoản học viên nào"
            description="Tạo tài khoản đầu tiên ở biểu mẫu bên dưới."
          />
        ) : (
          <TableShell>
            <thead>
              <tr>
                <Th>Học viên</Th>
                <Th>Email / SĐT đăng nhập</Th>
                <Th>SĐT liên hệ</Th>
                <Th>Nơi muốn học</Th>
                <Th>Khu vực</Th>
                <Th>Tự học</Th>
                <Th>Trạng thái</Th>
                <Th />
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-100">
              {students.map((s) => (
                <tr key={s.id} className="hover:bg-ivory-50">
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-2.5 font-medium text-ink-900 whitespace-nowrap">
                      <Avatar name={s.name} className="w-8 h-8 text-[11px]" />
                      {s.name}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-ink-600">{s.email}</td>
                  <td className="px-4 py-3 text-ink-600 tabular">{s.phone || "–"}</td>
                  <td className="px-4 py-3 text-ink-600">{s.branch || "–"}</td>
                  <td className="px-4 py-3 text-ink-600 whitespace-nowrap">{s.area || "–"}</td>
                  <td className="px-4 py-3 text-ink-600 tabular whitespace-nowrap">
                    {selfStudy.get(s.id) ?? 0} / {TOTAL_LESSONS} bài
                  </td>
                  <td className="px-4 py-3">
                    <StatusChip tone={s.active ? "mint" : "neutral"}>
                      {s.active ? "Đang hoạt động" : "Ngừng"}
                    </StatusChip>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <ToggleStudentActiveButton studentId={s.id} active={!!s.active} />
                  </td>
                </tr>
              ))}
            </tbody>
          </TableShell>
        )}
      </Card>

      <Card padded={false} className="max-w-2xl">
        <CardHeader
          title="Thêm tài khoản học viên"
          icon={<IconUser className="w-4.5 h-4.5 text-wood-500" />}
        />
        <div className="p-5">
          <NewStudentForm />
        </div>
      </Card>
    </div>
  );
}
