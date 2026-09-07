import { requireRole } from "@/lib/guard";
import { listCourseOrdersForTeacher, tongKetHoaHong } from "@/lib/course-sales";
import { hoaHongCuaKhoa, khoaCuaGiaoVien, tienVN } from "@/lib/courses";
import { Card, EmptyState, PageHeader, StatusChip, TableShell, Th } from "@/components/ui";
import { IconWallet } from "@/components/icons";

export default async function TeacherHoaHongPage() {
  const session = await requireRole(["teacher"]);
  const khoa = khoaCuaGiaoVien(session.userId).filter((c) => c.status === "published");
  const orders = listCourseOrdersForTeacher(session.userId).filter((o) => o.status === "paid");
  const tk = tongKetHoaHong(session.userId);

  if (khoa.length === 0 && orders.length === 0) {
    return (
      <div className="space-y-5">
        <PageHeader title="Doanh thu khoá học" subtitle="Tiền bạn nhận được từ các khoá quay sẵn bạn tự soạn." />
        <Card padded={false}>
          <EmptyState
            icon={<IconWallet className="w-6 h-6" />}
            title="Bạn chưa có khoá nào đang bán"
            description="Soạn khoá ở mục Khoá học của tôi rồi gửi duyệt. Khoá lên trang bán là doanh số hiện ở đây."
          />
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Doanh thu khoá học"
        subtitle="Mỗi lượt khách mua khoá bạn soạn, bạn được hưởng phần trăm đã thoả thuận."
      />

      <div className="grid sm:grid-cols-3 gap-4">
        <Card>
          <p className="text-sm text-ink-500">Đã bán</p>
          <p className="text-2xl font-bold text-ink-900 tabular">{tk.daBan} lượt</p>
        </Card>
        <Card>
          <p className="text-sm text-ink-500">Hoa hồng đã nhận</p>
          <p className="text-2xl font-bold text-ink-900 tabular">{tienVN(tk.hoaHongDaTra)}</p>
        </Card>
        <Card>
          <p className="text-sm text-ink-500">Chờ nhận</p>
          <p className="text-2xl font-bold text-wood-600 tabular">{tienVN(tk.hoaHongConNo)}</p>
        </Card>
      </div>

      {khoa.length > 0 && (
        <Card>
          <p className="font-semibold text-ink-900">Khoá bạn đang bán</p>
          <ul className="mt-3 space-y-2">
            {khoa.map((c) => (
              <li key={c.slug} className="text-sm border-b border-navy-100 last:border-0 pb-2 last:pb-0">
                <p className="font-medium text-ink-900">{c.name}</p>
                <p className="text-ink-500 mt-0.5">
                  Giá bán <b className="tabular text-ink-900">{tienVN(c.price)}</b> · bạn hưởng{" "}
                  {c.commission_percent}% ={" "}
                  <b className="tabular text-wood-600">{tienVN(hoaHongCuaKhoa(c))}</b> mỗi lượt
                </p>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <Card padded={false}>
        {orders.length === 0 ? (
          <EmptyState
            icon={<IconWallet className="w-6 h-6" />}
            title="Chưa bán được lượt nào"
            description="Khi có khách mua khoá của bạn và trung tâm thu được tiền, lượt bán sẽ hiện tại đây."
          />
        ) : (
          <TableShell>
            <thead>
              <tr>
                <Th>Ngày thu tiền</Th>
                <Th>Khoá</Th>
                <Th>Giá bán</Th>
                <Th>Hoa hồng</Th>
                <Th>Tình trạng</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-100">
              {orders.map((o) => (
                <tr key={o.id} className="hover:bg-ivory-50">
                  <td className="px-4 py-3 text-ink-500 tabular whitespace-nowrap">
                    {(o.paid_at ?? o.created_at).slice(0, 16)}
                  </td>
                  <td className="px-4 py-3 text-ink-700 max-w-xs">{o.course_name}</td>
                  <td className="px-4 py-3 text-ink-600 tabular">{tienVN(o.price)}</td>
                  <td className="px-4 py-3 font-semibold text-ink-900 tabular">
                    {tienVN(o.commission_amount)}
                  </td>
                  <td className="px-4 py-3">
                    <StatusChip tone={o.commission_paid_at ? "mint" : "amber"}>
                      {o.commission_paid_at ? "Đã nhận" : "Chờ nhận"}
                    </StatusChip>
                  </td>
                </tr>
              ))}
            </tbody>
          </TableShell>
        )}
      </Card>

      <p className="text-sm text-ink-500">
        Bảng này không hiện tên và số điện thoại người mua — thông tin khách do trung tâm giữ.
      </p>
    </div>
  );
}
