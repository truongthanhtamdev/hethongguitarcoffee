import { requireRole } from "@/lib/guard";
import { listStudents } from "@/lib/queries";
import { soDuNhieuNguoi, tatCaYeuCauNap } from "@/lib/wallet";
import { khoaDangBan, tienVN } from "@/lib/courses";
import { db } from "@/lib/db";
import { Card, EmptyState, PageHeader, StatusChip, TableShell, Th } from "@/components/ui";
import { IconWallet } from "@/components/icons";
import DuyetNapActions from "./duyet-nap-actions";
import CongTienForm from "./cong-tien-form";
import KichKhoaForm from "./kich-khoa-form";

const NHAN: Record<string, { chu: string; tone: "amber" | "mint" | "neutral" }> = {
  new: { chu: "Chờ xác nhận", tone: "amber" },
  done: { chu: "Đã vào ví", tone: "mint" },
  cancelled: { chu: "Đã huỷ", tone: "neutral" },
};

export default async function AdminViPage() {
  const session = await requireRole(["admin", "coordinator"]);
  const laAdmin = session.role === "admin";

  const yeuCau = tatCaYeuCauNap();
  const cho = yeuCau.filter((y) => y.status === "new").length;

  const hocVien = listStudents().filter((s) => s.active);
  const soDu = soDuNhieuNguoi(hocVien.map((s) => s.id));
  const tongTrongVi = [...soDu.values()].reduce((a, b) => a + b, 0);

  // Ai đang giữ khoá nào — để khỏi kích trùng một khoá hai lần.
  const daCo = db
    .prepare("SELECT user_id, course_slug FROM course_access")
    .all() as { user_id: number; course_slug: string }[];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Ví học viên"
        subtitle={
          cho > 0
            ? `${cho} yêu cầu nạp đang chờ. Nhận được tiền thì bấm xác nhận là vào ví học viên ngay.`
            : "Nạp tiền vào ví học viên, hoặc mở thẳng một khoá học cho họ."
        }
      />

      <div className="grid sm:grid-cols-2 gap-4">
        <Card>
          <p className="text-sm text-ink-500">Tổng tiền đang nằm trong ví học viên</p>
          <p className="text-2xl font-bold text-wood-600 tabular">{tienVN(tongTrongVi)}</p>
        </Card>
        <Card>
          <p className="text-sm text-ink-500">Yêu cầu nạp đang chờ</p>
          <p className="text-2xl font-bold text-ink-900 tabular">{cho}</p>
        </Card>
      </div>

      <Card padded={false}>
        <div className="px-5 pt-5">
          <p className="font-semibold text-ink-900">Yêu cầu nạp tiền</p>
          <p className="text-sm text-ink-500 mt-0.5">
            Kiểm tra đã nhận được tiền rồi mới xác nhận — xác nhận là tiền vào ví ngay.
          </p>
        </div>

        {yeuCau.length === 0 ? (
          <EmptyState
            icon={<IconWallet className="w-6 h-6" />}
            title="Chưa có yêu cầu nào"
            description="Khi học viên bấm nạp tiền trong mục Ví của tôi, yêu cầu sẽ hiện tại đây."
          />
        ) : (
          <TableShell>
            <thead>
              <tr>
                <Th>Ngày</Th>
                <Th>Học viên</Th>
                <Th>Số tiền</Th>
                <Th>Cách nạp</Th>
                <Th>Trạng thái</Th>
                <Th />
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-100">
              {yeuCau.map((y) => (
                <tr key={y.id} className="hover:bg-ivory-50 align-top">
                  <td className="px-4 py-3 text-ink-500 tabular whitespace-nowrap">
                    {y.created_at.slice(0, 16)}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-ink-900">{y.user_name}</p>
                    {y.user_phone && (
                      <a
                        href={`tel:${y.user_phone}`}
                        className="text-sm text-wood-600 tabular font-semibold"
                      >
                        {y.user_phone}
                      </a>
                    )}
                    {y.note && <p className="text-sm text-ink-500 mt-1">{y.note}</p>}
                  </td>
                  <td className="px-4 py-3 font-bold text-ink-900 tabular">{tienVN(y.amount)}</td>
                  <td className="px-4 py-3 text-ink-600">
                    {y.method === "cash" ? "Tiền mặt tại quán" : "Chuyển khoản"}
                  </td>
                  <td className="px-4 py-3">
                    <StatusChip tone={NHAN[y.status]?.tone ?? "neutral"}>
                      {NHAN[y.status]?.chu ?? y.status}
                    </StatusChip>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <DuyetNapActions id={y.id} status={y.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </TableShell>
        )}
      </Card>

      {laAdmin && (
        <div className="grid lg:grid-cols-2 gap-4 items-start">
          <Card>
            <p className="font-semibold text-ink-900">Cộng / trừ tiền thẳng vào ví</p>
            <p className="text-sm text-ink-500 mt-0.5 mb-3">
              Dùng khi nhận tiền mặt tại quán, tặng tiền khuyến mãi, hay sửa lại một lần ghi nhầm.
            </p>
            <CongTienForm hocVien={hocVien.map((s) => ({ id: s.id, name: s.name, phone: s.phone }))} />
          </Card>

          <Card>
            <p className="font-semibold text-ink-900">Mở thẳng một khoá cho học viên</p>
            <p className="text-sm text-ink-500 mt-0.5 mb-3">
              Không trừ tiền, không tính hoa hồng — dùng để tặng khoá cho học viên đang học tại
              quán.
            </p>
            <KichKhoaForm
              hocVien={hocVien.map((s) => ({ id: s.id, name: s.name, phone: s.phone }))}
              khoa={khoaDangBan().map((c) => ({ slug: c.slug, name: c.name }))}
              daCo={daCo}
            />
          </Card>
        </div>
      )}

      <Card padded={false}>
        <div className="px-5 pt-5">
          <p className="font-semibold text-ink-900">Số dư từng học viên</p>
        </div>
        {hocVien.length === 0 ? (
          <EmptyState
            icon={<IconWallet className="w-6 h-6" />}
            title="Chưa có học viên nào"
            description="Học viên đăng ký tài khoản xong sẽ hiện tại đây."
          />
        ) : (
          <TableShell>
            <thead>
              <tr>
                <Th>Học viên</Th>
                <Th>SĐT</Th>
                <Th>Số dư ví</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-100">
              {hocVien.map((s) => (
                <tr key={s.id} className="hover:bg-ivory-50">
                  <td className="px-4 py-3 font-medium text-ink-900">{s.name}</td>
                  <td className="px-4 py-3 text-ink-600 tabular">{s.phone || "–"}</td>
                  <td className="px-4 py-3 font-semibold text-ink-900 tabular">
                    {tienVN(soDu.get(s.id) ?? 0)}
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
