import { requireRole } from "@/lib/guard";
import { db } from "@/lib/db";
import { Card, EmptyState, PageHeader, StatusChip, TableShell, Th } from "@/components/ui";
import { IconPackage } from "@/components/icons";
import OrderStatusSelect from "./status-select";

interface OrderRow {
  id: number;
  product_name: string;
  product_price: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string | null;
  note: string | null;
  status: string;
  created_at: string;
}

const NHAN: Record<string, { chu: string; tone: "amber" | "navy" | "mint" | "neutral" }> = {
  new: { chu: "Mới", tone: "amber" },
  contacted: { chu: "Đã gọi", tone: "navy" },
  done: { chu: "Hoàn tất", tone: "mint" },
  cancelled: { chu: "Đã huỷ", tone: "neutral" },
};

export default async function OrdersPage() {
  await requireRole(["admin", "coordinator"]);
  const orders = db
    .prepare("SELECT * FROM orders ORDER BY id DESC")
    .all() as OrderRow[];
  const moi = orders.filter((o) => o.status === "new").length;

  return (
    <div className="space-y-5">
      <PageHeader
        title="Đơn đặt đàn"
        subtitle={
          moi > 0
            ? `${moi} đơn mới chưa gọi. Gọi xác nhận rồi đổi trạng thái để khỏi gọi trùng.`
            : "Đơn khách đặt từ trang bán đàn."
        }
      />

      <Card padded={false}>
        {orders.length === 0 ? (
          <EmptyState
            icon={<IconPackage className="w-6 h-6" />}
            title="Chưa có đơn nào"
            description="Khi khách đặt đàn ở trang /shop, đơn sẽ hiện tại đây."
          />
        ) : (
          <TableShell>
            <thead>
              <tr>
                <Th>Ngày</Th>
                <Th>Khách</Th>
                <Th>Đàn</Th>
                <Th>Giao tới</Th>
                <Th>Trạng thái</Th>
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
                    {o.note && <p className="text-sm text-ink-500 mt-1">{o.note}</p>}
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-ink-700 max-w-xs">{o.product_name}</p>
                    <p className="text-sm font-semibold text-ink-900 tabular">{o.product_price}</p>
                  </td>
                  <td className="px-4 py-3 text-ink-600 max-w-xs">
                    {o.customer_address || <span className="text-ink-400">Ghé quán lấy</span>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1.5">
                      <StatusChip tone={NHAN[o.status]?.tone ?? "neutral"}>
                        {NHAN[o.status]?.chu ?? o.status}
                      </StatusChip>
                      <OrderStatusSelect id={o.id} status={o.status} />
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
