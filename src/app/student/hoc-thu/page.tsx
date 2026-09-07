import { requireRole } from "@/lib/guard";
import { db } from "@/lib/db";
import { tenHinhThuc } from "@/components/brand";
import { Card, PageHeader, StatusChip } from "@/components/ui";
import HocThuForm from "@/components/hoc-thu-form";

interface TrialRow {
  id: number;
  hinh_thuc: string;
  branch: string | null;
  thoi_gian: string | null;
  status: string;
  created_at: string;
}

const NHAN: Record<string, { chu: string; tone: "amber" | "navy" | "mint" | "neutral" }> = {
  new: { chu: "Chờ bên mình gọi lại", tone: "amber" },
  contacted: { chu: "Đã liên hệ", tone: "navy" },
  scheduled: { chu: "Đã hẹn lịch", tone: "mint" },
  done: { chu: "Đã học thử", tone: "mint" },
  cancelled: { chu: "Đã huỷ", tone: "neutral" },
};

export default async function StudentHocThuPage() {
  const session = await requireRole(["student"]);

  const me = db
    .prepare("SELECT name, phone, area FROM users WHERE id = ?")
    .get(session.userId) as { name: string; phone: string | null; area: string | null };

  const cua_toi = db
    .prepare("SELECT * FROM trial_requests WHERE user_id = ? ORDER BY id DESC LIMIT 10")
    .all(session.userId) as TrialRow[];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Đăng ký học thử"
        subtitle="Học tại quán cà phê, học online theo nhóm, hay kèm riêng 1 kèm 1 — thử một buổi miễn phí trước khi quyết."
      />

      {cua_toi.length > 0 && (
        <Card>
          <p className="font-semibold text-ink-900">Đăng ký của bạn</p>
          <ul className="mt-3 divide-y divide-navy-100">
            {cua_toi.map((t) => (
              <li key={t.id} className="flex flex-wrap items-start justify-between gap-3 py-3">
                <span className="min-w-0">
                  <span className="block font-medium text-ink-900">
                    {tenHinhThuc(t.hinh_thuc)}
                  </span>
                  {t.branch && <span className="block text-sm text-ink-500">{t.branch}</span>}
                  {t.thoi_gian && (
                    <span className="block text-sm text-ink-500">Rảnh: {t.thoi_gian}</span>
                  )}
                  <span className="block text-xs text-ink-400 tabular mt-0.5">
                    Gửi {t.created_at.slice(0, 16)}
                  </span>
                </span>
                <StatusChip tone={NHAN[t.status]?.tone ?? "neutral"}>
                  {NHAN[t.status]?.chu ?? t.status}
                </StatusChip>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <Card>
        <p className="font-semibold text-ink-900">Đăng ký buổi học thử</p>
        <p className="text-sm text-ink-500 mt-0.5 mb-4">
          Bên mình gọi lại hẹn giờ. Buổi thử không mất phí.
        </p>
        <HocThuForm
          tenSan={me.name}
          sdtSan={me.phone ?? ""}
          khuVucSan={me.area ?? ""}
        />
      </Card>
    </div>
  );
}
