import Link from "next/link";
import { requireRole } from "@/lib/guard";
import { listCourseOrders } from "@/lib/course-sales";
import {
  NHAN_TRANG_THAI,
  demBai,
  hoaHongCuaKhoa,
  tatCaKhoa,
  tienVN,
} from "@/lib/courses";
import { Card, EmptyState, PageHeader, StatusChip, TableShell, Th } from "@/components/ui";
import { IconGuitar } from "@/components/icons";
import DonKhoaHocActions from "./don-actions";
import TraHoaHongToggle from "./tra-hoa-hong-toggle";
import DuyetKhoaActions from "./duyet-khoa-actions";

const NHAN_DON: Record<string, { chu: string; tone: "amber" | "mint" | "neutral" }> = {
  new: { chu: "Chờ thu tiền", tone: "amber" },
  paid: { chu: "Đã thu, đã mở khoá", tone: "mint" },
  cancelled: { chu: "Đã huỷ", tone: "neutral" },
};

export default async function AdminKhoaHocPage() {
  const session = await requireRole(["admin", "coordinator"]);
  const laAdmin = session.role === "admin";

  const orders = listCourseOrders();
  const cho = orders.filter((o) => o.status === "new").length;

  const daThu = orders.filter((o) => o.status === "paid");
  const doanhThu = daThu.reduce((s, o) => s + o.price, 0);
  const traGiaoVien = daThu.reduce((s, o) => s + o.commission_amount, 0);
  const hoaHongConNo = daThu
    .filter((o) => !o.commission_paid_at)
    .reduce((s, o) => s + o.commission_amount, 0);

  const khoa = tatCaKhoa();
  const choDuyet = khoa.filter((c) => c.status === "pending");

  return (
    <div className="space-y-5">
      <PageHeader
        title="Khoá học quay sẵn"
        subtitle={
          cho > 0 || choDuyet.length > 0
            ? [
                cho > 0 ? `${cho} đơn chờ thu tiền` : "",
                choDuyet.length > 0 ? `${choDuyet.length} khoá chờ duyệt` : "",
              ]
                .filter(Boolean)
                .join(" · ")
            : "Giáo viên tự soạn khoá và gửi duyệt. Duyệt xong khoá lên trang bán."
        }
      />

      <div className="grid sm:grid-cols-4 gap-4">
        <Card>
          <p className="text-sm text-ink-500">Đã bán</p>
          <p className="text-2xl font-bold text-ink-900 tabular">{daThu.length} lượt</p>
        </Card>
        <Card>
          <p className="text-sm text-ink-500">Tiền đã thu</p>
          <p className="text-2xl font-bold text-ink-900 tabular">{tienVN(doanhThu)}</p>
        </Card>
        <Card>
          <p className="text-sm text-ink-500">Phần nền tảng giữ</p>
          <p className="text-2xl font-bold text-mint-700 tabular">
            {tienVN(doanhThu - traGiaoVien)}
          </p>
        </Card>
        <Card>
          <p className="text-sm text-ink-500">Hoa hồng còn nợ giáo viên</p>
          <p className="text-2xl font-bold text-wood-600 tabular">{tienVN(hoaHongConNo)}</p>
        </Card>
      </div>

      <Card padded={false}>
        <div className="px-5 pt-5">
          <p className="font-semibold text-ink-900">Khoá của giáo viên</p>
          <p className="text-sm text-ink-500 mt-0.5">
            Duyệt là khoá lên trang bán ngay. Xem trước nội dung bằng đường dẫn của khoá.
          </p>
        </div>

        {khoa.length === 0 ? (
          <EmptyState
            icon={<IconGuitar className="w-6 h-6" />}
            title="Chưa có khoá nào"
            description="Khi giáo viên soạn xong và gửi duyệt, khoá sẽ hiện tại đây."
          />
        ) : (
          <TableShell>
            <thead>
              <tr>
                <Th>Khoá</Th>
                <Th>Giáo viên</Th>
                <Th>Giá / ăn chia</Th>
                <Th>Trạng thái</Th>
                <Th />
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-100">
              {khoa.map((c) => {
                const nhan = NHAN_TRANG_THAI[c.status];
                return (
                  <tr key={c.id} className="hover:bg-ivory-50 align-top">
                    <td className="px-4 py-3">
                      <p className="font-medium text-ink-900 max-w-xs">{c.name}</p>
                      <p className="text-sm text-ink-500">{demBai(c.id)} bài</p>
                      {c.status === "published" && (
                        <Link
                          href={`/khoa-hoc/${c.slug}`}
                          className="text-sm text-wood-600 font-semibold"
                        >
                          Xem trang bán →
                        </Link>
                      )}
                    </td>
                    <td className="px-4 py-3 text-ink-600">{c.teacher_name}</td>
                    <td className="px-4 py-3">
                      <p className="tabular font-semibold text-ink-900">
                        {c.price > 0 ? tienVN(c.price) : "chưa đặt"}
                      </p>
                      <p className="text-xs text-ink-500">
                        GV {c.commission_percent}% ={" "}
                        <b className="tabular">{tienVN(hoaHongCuaKhoa(c))}</b>
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <StatusChip tone={nhan.tone}>{nhan.chu}</StatusChip>
                      {c.reject_note && c.status === "draft" && (
                        <p className="text-xs text-ink-400 mt-1 max-w-[12rem]">
                          Đã trả lại: {c.reject_note}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {laAdmin && (
                        <DuyetKhoaActions
                          id={c.id}
                          status={c.status}
                          phanTram={c.commission_percent}
                        />
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </TableShell>
        )}
      </Card>

      <Card padded={false}>
        <div className="px-5 pt-5">
          <p className="font-semibold text-ink-900">Đơn mua khoá</p>
          <p className="text-sm text-ink-500 mt-0.5">
            Gọi khách thu tiền xong bấm &quot;Đã thu tiền&quot; là tài khoản của họ mở khoá ngay.
          </p>
        </div>

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
                    {o.status === "paid" && laAdmin && (
                      <TraHoaHongToggle id={o.id} daTra={!!o.commission_paid_at} />
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <StatusChip tone={NHAN_DON[o.status]?.tone ?? "neutral"}>
                      {NHAN_DON[o.status]?.chu ?? o.status}
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
