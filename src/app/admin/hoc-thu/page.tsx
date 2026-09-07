import { requireRole } from "@/lib/guard";
import { db } from "@/lib/db";
import { tenHinhThuc } from "@/components/brand";
import { Card, EmptyState, PageHeader, StatusChip, TableShell, Th } from "@/components/ui";
import { IconCalendarCheck } from "@/components/icons";
import TrangThaiHocThu from "./trang-thai-hoc-thu";

interface TrialRow {
  id: number;
  user_id: number | null;
  name: string;
  phone: string;
  hinh_thuc: string;
  branch: string | null;
  area: string | null;
  thoi_gian: string | null;
  note: string | null;
  status: string;
  created_at: string;
}

const NHAN: Record<string, { chu: string; tone: "amber" | "navy" | "mint" | "neutral" }> = {
  new: { chu: "Mới", tone: "amber" },
  contacted: { chu: "Đã gọi", tone: "navy" },
  scheduled: { chu: "Đã hẹn lịch", tone: "mint" },
  done: { chu: "Đã học thử", tone: "mint" },
  cancelled: { chu: "Đã huỷ", tone: "neutral" },
};

export default async function AdminHocThuPage() {
  await requireRole(["admin", "coordinator"]);

  const rows = db
    .prepare("SELECT * FROM trial_requests ORDER BY id DESC")
    .all() as TrialRow[];
  const moi = rows.filter((r) => r.status === "new").length;

  // Hình thức nào được đăng ký nhiều nhất — biết để dồn giáo viên vào đó.
  const theoHinhThuc = [...rows.reduce((m, r) => {
    m.set(r.hinh_thuc, (m.get(r.hinh_thuc) ?? 0) + 1);
    return m;
  }, new Map<string, number>())].sort((a, b) => b[1] - a[1]);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Đăng ký học thử"
        subtitle={
          moi > 0
            ? `${moi} đăng ký mới chưa gọi. Gọi hẹn giờ xong đổi trạng thái để khỏi gọi trùng.`
            : "Khách đăng ký học thử từ trang chủ hoặc trong tài khoản học viên."
        }
      />

      {theoHinhThuc.length > 0 && (
        <Card>
          <p className="font-semibold text-ink-900">Khách muốn học kiểu nào</p>
          <div className="flex flex-wrap gap-2 mt-3">
            {theoHinhThuc.map(([ht, n]) => (
              <span
                key={ht}
                className="rounded-xl bg-ivory-100 border border-navy-100 px-3 py-1.5 text-sm text-ink-700"
              >
                {tenHinhThuc(ht)} <b className="text-ink-900 tabular">{n}</b>
              </span>
            ))}
          </div>
        </Card>
      )}

      <Card padded={false}>
        {rows.length === 0 ? (
          <EmptyState
            icon={<IconCalendarCheck className="w-6 h-6" />}
            title="Chưa có đăng ký nào"
            description="Khi khách đăng ký ở trang /hoc-thu, yêu cầu sẽ hiện tại đây."
          />
        ) : (
          <TableShell>
            <thead>
              <tr>
                <Th>Ngày</Th>
                <Th>Khách</Th>
                <Th>Muốn học</Th>
                <Th>Rảnh giờ nào</Th>
                <Th>Trạng thái</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-100">
              {rows.map((r) => (
                <tr key={r.id} className="hover:bg-ivory-50 align-top">
                  <td className="px-4 py-3 text-ink-500 tabular whitespace-nowrap">
                    {r.created_at.slice(0, 16)}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-ink-900">{r.name}</p>
                    <a
                      href={`tel:${r.phone}`}
                      className="text-sm text-wood-600 tabular font-semibold"
                    >
                      {r.phone}
                    </a>
                    {r.area && <p className="text-sm text-ink-500">Ở {r.area}</p>}
                    {!r.user_id && (
                      <p className="text-xs text-ink-400 mt-0.5">Chưa có tài khoản</p>
                    )}
                    {r.note && <p className="text-sm text-ink-500 mt-1">{r.note}</p>}
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-ink-700">{tenHinhThuc(r.hinh_thuc)}</p>
                    {r.branch && <p className="text-sm text-ink-500">{r.branch}</p>}
                  </td>
                  <td className="px-4 py-3 text-ink-600 max-w-[12rem]">{r.thoi_gian || "–"}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1.5">
                      <StatusChip tone={NHAN[r.status]?.tone ?? "neutral"}>
                        {NHAN[r.status]?.chu ?? r.status}
                      </StatusChip>
                      <TrangThaiHocThu id={r.id} status={r.status} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </TableShell>
        )}
      </Card>
    </div>
  );
}
