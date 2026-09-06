import { requireRole } from "@/lib/guard";
import { db } from "@/lib/db";
import { Card, EmptyState, PageHeader, StatusChip, TableShell, Th } from "@/components/ui";
import { IconKey } from "@/components/icons";
import CapMatKhauButton from "./cap-mat-khau-button";

interface ResetRow {
  id: number;
  user_id: number | null;
  contact: string;
  status: string;
  created_at: string;
  handled_at: string | null;
  user_name: string | null;
  user_email: string | null;
  user_phone: string | null;
}

const NHAN: Record<string, { chu: string; tone: "amber" | "mint" | "neutral" }> = {
  new: { chu: "Chờ xử lý", tone: "amber" },
  done: { chu: "Đã cấp mật khẩu tạm", tone: "mint" },
  cancelled: { chu: "Đã bỏ qua", tone: "neutral" },
};

export default async function QuenMatKhauAdminPage() {
  await requireRole(["admin", "coordinator"]);

  const rows = db
    .prepare(
      `SELECT r.*, u.name AS user_name, u.email AS user_email, u.phone AS user_phone
         FROM password_resets r
         LEFT JOIN users u ON u.id = r.user_id
        ORDER BY r.id DESC`
    )
    .all() as ResetRow[];
  const cho = rows.filter((r) => r.status === "new").length;

  return (
    <div className="space-y-5">
      <PageHeader
        title="Quên mật khẩu"
        subtitle={
          cho > 0
            ? `${cho} khách đang chờ. Gọi lại xác nhận đúng người rồi bấm cấp mật khẩu tạm và đọc cho khách.`
            : "Yêu cầu khách gửi từ trang Quên mật khẩu."
        }
      />

      <Card padded={false}>
        {rows.length === 0 ? (
          <EmptyState
            icon={<IconKey className="w-6 h-6" />}
            title="Chưa có yêu cầu nào"
            description="Khi khách bấm Quên mật khẩu ở trang đăng nhập, yêu cầu sẽ hiện tại đây."
          />
        ) : (
          <TableShell>
            <thead>
              <tr>
                <Th>Ngày gửi</Th>
                <Th>Khách nhập</Th>
                <Th>Tài khoản khớp</Th>
                <Th>Trạng thái</Th>
                <Th />
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-100">
              {rows.map((r) => (
                <tr key={r.id} className="hover:bg-ivory-50 align-top">
                  <td className="px-4 py-3 text-ink-500 tabular whitespace-nowrap">
                    {r.created_at.slice(0, 16)}
                  </td>
                  <td className="px-4 py-3 text-ink-700">{r.contact}</td>
                  <td className="px-4 py-3">
                    {r.user_id ? (
                      <>
                        <p className="font-medium text-ink-900">{r.user_name}</p>
                        <p className="text-sm text-ink-500">{r.user_email}</p>
                        {r.user_phone && (
                          <a
                            href={`tel:${r.user_phone}`}
                            className="text-sm text-wood-600 tabular font-semibold"
                          >
                            {r.user_phone}
                          </a>
                        )}
                      </>
                    ) : (
                      <span className="text-ink-400">Không khớp tài khoản nào</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <StatusChip tone={NHAN[r.status]?.tone ?? "neutral"}>
                      {NHAN[r.status]?.chu ?? r.status}
                    </StatusChip>
                    {r.handled_at && (
                      <p className="text-xs text-ink-400 mt-1 tabular">{r.handled_at.slice(0, 16)}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <CapMatKhauButton id={r.id} status={r.status} coTaiKhoan={!!r.user_id} />
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
