import { requireRole } from "@/lib/guard";
import { listCourseOrders, giaoVienCuaKhoa } from "@/lib/course-sales";
import { activeCourses, tienVN, hoaHongCuaKhoa } from "@/lib/courses";
import { Card, EmptyState, PageHeader, StatusChip, TableShell, Th } from "@/components/ui";
import { IconGuitar } from "@/components/icons";
import DonKhoaHocActions from "./don-actions";
import TraHoaHongToggle from "./tra-hoa-hong-toggle";

const NHAN: Record<string, { chu: string; tone: "amber" | "mint" | "neutral" }> = {
  new: { chu: "Chờ thu tiền", tone: "amber" },
  paid: { chu: "Đã thu, đã mở khoá", tone: "mint" },
  cancelled: { chu: "Đã huỷ", tone: "neutral" },
};

export default async function AdminKhoaHocPage() {
  const session = await requireRole(["admin", "coordinator"]);
  const orders = listCourseOrders();
  const cho = orders.filter((o) => o.status === "new").length;

  const daThu = orders.filter((o) => o.status === "paid");
  const doanhThu = daThu.reduce((s, o) => s + o.price, 0);
  const hoaHongConNo = daThu
    .filter((o) => !o.commission_paid_at)
    .reduce((s, o) => s + o.commission_amount, 0);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Khoá học quay sẵn"
        subtitle={
          cho > 0
            ? `${cho} đơn chờ thu tiền. Gọi khách thu tiền xong bấm "Đã thu tiền" là tài khoản của họ mở khoá ngay.`
            : "Đơn khách đăng ký mua khoá học có thu tiền."
        }
      />

      <div className="grid sm:grid-cols-3 gap-4">
        <Card>
          <p className="text-sm text-ink-500">Đã bán</p>
          <p className="text-2xl font-bold text-ink-900 tabular">{daThu.length} khoá</p>
        </Card>
        <Card>
          <p className="text-sm text-ink-500">Tiền đã thu</p>
          <p className="text-2xl font-bold text-ink-900 tabular">{tienVN(doanhThu)}</p>
        </Card>
        <Card>
          <p className="text-sm text-ink-500">Hoa hồng còn nợ giáo viên</p>
          <p className="text-2xl font-bold text-wood-600 tabular">{tienVN(hoaHongConNo)}</p>
        </Card>
      </div>

      <Card>
        <p className="font-semibold text-ink-900">Khoá đang bán</p>
        <ul className="mt-3 space-y-2">
          {activeCourses().map((c) => {
            const gv = giaoVienCuaKhoa(c);
            return (
              <li
                key={c.slug}
                className="flex flex-wrap items-baseline gap-x-3 gap-y-1 text-sm border-b border-navy-100 last:border-0 pb-2 last:pb-0"
              >
                <span className="font-medium text-ink-900">{c.name}</span>
                <span className="tabular font-semibold text-wood-600">{tienVN(c.price)}</span>
                <span className="text-ink-500">
                  {c.teacherName} hưởng {c.commissionPercent}% ={" "}
                  <b className="tabular">{tienVN(hoaHongCuaKhoa(c))}</b> mỗi lượt
                </span>
                {!gv && (
                  <span className="text-coral-700">
                    (chưa có tài khoản giáo viên {c.teacherEmail} — tạo ở mục Giáo viên để họ tự
                    xem được sổ hoa hồng)
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      </Card>

      <Card padded={false}>
        {orders.length === 0 ? (
          <EmptyState
            icon={<IconGuitar className="w-6 h-6" />}
            title="Chưa có đơn nào"
            description="Khi khách đăng ký ở trang /khoa-hoc, đơn sẽ hiện tại đây."
          />
        ) : (
          <TableShell>
            <thead>
              <tr>
                <Th>Ngày</Th>
                <Th>Khách</Th>
                <Th>Khoá</Th>
                <Th>Hoa hồng</Th>
                <Th>Trạng thái</Th>
                <Th />
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-100">
              {orders.map((o) => (
                <tr key={o.id} className="hover:bg-ivory-50 align-top">
                  <td className="px-4 py-3 text-ink-500 tabular whitespace-nowrap">
                    {o.created_at.slice(0, 16)}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-ink-900">{o.customer_name}</p>
                    <a
                      href={`tel:${o.customer_phone}`}
                      className="text-sm text-wood-600 tabular font-semibold"
                    >
                      {o.customer_phone}
                    </a>
                    {!o.user_id && (
                      <p className="text-xs text-amber-700 mt-1">Chưa gắn tài khoản</p>
                    )}
                    {o.note && <p className="text-sm text-ink-500 mt-1">{o.note}</p>}
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-ink-700 max-w-xs">{o.course_name}</p>
                    <p className="text-sm font-semibold text-ink-900 tabular">{tienVN(o.price)}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="tabular font-semibold text-ink-900">
                      {tienVN(o.commission_amount)}
                    </p>
                    <p className="text-xs text-ink-500">{o.commission_percent}%</p>
                    {o.status === "paid" && session.role === "admin" && (
                      <TraHoaHongToggle id={o.id} daTra={!!o.commission_paid_at} />
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <StatusChip tone={NHAN[o.status]?.tone ?? "neutral"}>
                      {NHAN[o.status]?.chu ?? o.status}
                    </StatusChip>
                    {o.paid_at && (
                      <p className="text-xs text-ink-400 mt-1 tabular">{o.paid_at.slice(0, 16)}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <DonKhoaHocActions
                      id={o.id}
                      status={o.status}
                      coTaiKhoan={!!o.user_id}
                      phone={o.customer_phone}
                    />
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
