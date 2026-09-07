import { requireRole } from "@/lib/guard";
import { hienGia, listPackageOrders, tatCaGoi } from "@/lib/packages";
import { tienVN } from "@/lib/courses";
import { tenHinhThuc } from "@/components/brand";
import { Card, EmptyState, PageHeader, StatusChip, TableShell, Th } from "@/components/ui";
import { IconClasses } from "@/components/icons";
import SuaGoiForm from "./sua-goi-form";
import TrangThaiDonGoi from "./trang-thai-don-goi";

const NHAN: Record<string, { chu: string; tone: "amber" | "navy" | "mint" | "neutral" }> = {
  new: { chu: "Mới", tone: "amber" },
  contacted: { chu: "Đã gọi", tone: "navy" },
  done: { chu: "Đã vào lớp", tone: "mint" },
  cancelled: { chu: "Đã huỷ", tone: "neutral" },
};

export default async function AdminLopHocPage() {
  const session = await requireRole(["admin", "coordinator"]);
  const laAdmin = session.role === "admin";

  const goi = tatCaGoi();
  const don = listPackageOrders();
  const moi = don.filter((d) => d.status === "new").length;
  const chuaCoGia = goi.filter((g) => g.active && g.price <= 0).length;

  return (
    <div className="space-y-5">
      <PageHeader
        title="Gói lớp học"
        subtitle={
          moi > 0
            ? `${moi} đăng ký mới chưa gọi. Gọi báo giá và xếp lịch xong thì đổi trạng thái.`
            : "Các gói lớp có giáo viên dạy trực tiếp và đơn khách đăng ký."
        }
      />

      {chuaCoGia > 0 && laAdmin && (
        <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4">
          <p className="font-semibold text-amber-700">
            {chuaCoGia} gói chưa có giá — trang bán đang hiện &quot;Liên hệ báo giá&quot;
          </p>
          <p className="text-sm text-ink-700 mt-1">
            Khách vẫn đăng ký được và bên mình gọi lại báo giá. Điền giá ở dưới là trang hiện số
            luôn.
          </p>
        </div>
      )}

      <Card padded={false}>
        <div className="px-5 pt-5">
          <p className="font-semibold text-ink-900">Đơn đăng ký</p>
        </div>

        {don.length === 0 ? (
          <EmptyState
            icon={<IconClasses className="w-6 h-6" />}
            title="Chưa có đăng ký nào"
            description="Khi khách đăng ký ở trang /lop-hoc, đơn sẽ hiện tại đây."
          />
        ) : (
          <TableShell>
            <thead>
              <tr>
                <Th>Ngày</Th>
                <Th>Khách</Th>
                <Th>Gói</Th>
                <Th>Trạng thái</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-100">
              {don.map((d) => (
                <tr key={d.id} className="hover:bg-ivory-50 align-top">
                  <td className="px-4 py-3 text-ink-500 tabular whitespace-nowrap">
                    {d.created_at.slice(0, 16)}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-ink-900">{d.customer_name}</p>
                    <a
                      href={`tel:${d.customer_phone}`}
                      className="text-sm text-wood-600 tabular font-semibold"
                    >
                      {d.customer_phone}
                    </a>
                    {!d.user_id && <p className="text-xs text-ink-400 mt-0.5">Chưa có tài khoản</p>}
                    {d.note && <p className="text-sm text-ink-500 mt-1">Rảnh: {d.note}</p>}
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-ink-700 max-w-xs">{d.package_name}</p>
                    <p className="text-sm font-semibold text-ink-900 tabular">
                      {d.price > 0 ? tienVN(d.price) : "chưa báo giá"}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1.5">
                      <StatusChip tone={NHAN[d.status]?.tone ?? "neutral"}>
                        {NHAN[d.status]?.chu ?? d.status}
                      </StatusChip>
                      <TrangThaiDonGoi id={d.id} status={d.status} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </TableShell>
        )}
      </Card>

      <div>
        <h2 className="font-bold text-ink-900 text-lg mb-1">Bảng gói lớp</h2>
        <p className="text-sm text-ink-500 mb-3">
          {laAdmin
            ? "Sửa tên, giá, số buổi và quyền lợi ở đây. Bỏ tick Đang bán là gói biến khỏi trang."
            : "Chỉ quản trị viên mới sửa được bảng gói."}
        </p>

        <div className="grid lg:grid-cols-2 gap-4 items-start">
          {goi.map((g) => (
            <Card key={g.id}>
              <div className="flex flex-wrap items-baseline justify-between gap-2 mb-3">
                <p className="font-semibold text-ink-900">{g.name}</p>
                <span className="text-sm text-ink-500">{tenHinhThuc(g.hinh_thuc)}</span>
              </div>
              {laAdmin ? (
                <SuaGoiForm goi={g} />
              ) : (
                <div className="text-sm text-ink-600 space-y-1">
                  <p className="tabular font-semibold text-ink-900">{hienGia(g.price)}</p>
                  <p>
                    {g.so_buoi} buổi · {g.phut_moi_buoi} phút/buổi ·{" "}
                    {g.active ? "đang bán" : "đã ẩn"}
                  </p>
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
