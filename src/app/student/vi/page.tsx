import { requireRole } from "@/lib/guard";
import { NHAN_GHI_VI, soDu, soGhiVi, yeuCauNapCuaToi } from "@/lib/wallet";
import { tienVN } from "@/lib/courses";
import { BRAND, prettyPhone } from "@/components/brand";
import { Card, PageHeader, StatusChip } from "@/components/ui";
import NapTienForm from "./nap-tien-form";

const NHAN_YC: Record<string, { chu: string; tone: "amber" | "mint" | "neutral" }> = {
  new: { chu: "Chờ xác nhận", tone: "amber" },
  done: { chu: "Đã vào ví", tone: "mint" },
  cancelled: { chu: "Đã huỷ", tone: "neutral" },
};

export default async function StudentViPage() {
  const session = await requireRole(["student"]);
  const du = soDu(session.userId);
  const so = soGhiVi(session.userId);
  const yeuCau = yeuCauNapCuaToi(session.userId);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Ví của tôi"
        subtitle="Nạp tiền vào ví rồi mua khoá học là mở khoá ngay, không phải chờ gọi lại."
      />

      <Card>
        <p className="text-sm text-ink-500">Số dư</p>
        <p className="text-4xl font-bold text-wood-600 tabular mt-1">{tienVN(du)}</p>
      </Card>

      <Card>
        <p className="font-semibold text-ink-900">Nạp tiền</p>
        <p className="text-sm text-ink-500 mt-0.5 mb-3">
          Chuyển khoản hoặc đưa tiền mặt tại quán. Bên mình nhận được là cộng vào ví bạn ngay.
        </p>
        <NapTienForm />
        <p className="text-xs text-ink-400 mt-3">
          Cần thông tin chuyển khoản thì gọi{" "}
          <a href={`tel:${BRAND.phone}`} className="font-semibold text-wood-600">
            {prettyPhone()}
          </a>{" "}
          hoặc{" "}
          <a
            href={`https://m.me/${BRAND.fanpage}`}
            target="_blank"
            rel="noopener"
            className="font-semibold text-wood-600"
          >
            nhắn fanpage
          </a>
          .
        </p>
      </Card>

      {yeuCau.some((y) => y.status === "new") && (
        <Card>
          <p className="font-semibold text-ink-900">Yêu cầu nạp đang chờ</p>
          <ul className="mt-3 space-y-2">
            {yeuCau
              .filter((y) => y.status === "new")
              .map((y) => (
                <li key={y.id} className="flex items-center justify-between gap-3 text-sm">
                  <span className="text-ink-600">
                    {y.created_at.slice(0, 16)} ·{" "}
                    {y.method === "cash" ? "tiền mặt tại quán" : "chuyển khoản"}
                  </span>
                  <span className="flex items-center gap-2">
                    <b className="tabular text-ink-900">{tienVN(y.amount)}</b>
                    <StatusChip tone={NHAN_YC[y.status].tone}>{NHAN_YC[y.status].chu}</StatusChip>
                  </span>
                </li>
              ))}
          </ul>
        </Card>
      )}

      <Card>
        <p className="font-semibold text-ink-900">Lịch sử ví</p>
        {so.length === 0 ? (
          <p className="text-sm text-ink-500 mt-2">Ví chưa có giao dịch nào.</p>
        ) : (
          <ul className="mt-3 divide-y divide-navy-100">
            {so.map((e) => (
              <li key={e.id} className="flex items-start justify-between gap-3 py-2.5 text-sm">
                <span className="min-w-0">
                  <span className="block text-ink-900">{NHAN_GHI_VI[e.kind]}</span>
                  {e.note && <span className="block text-ink-500 text-xs mt-0.5">{e.note}</span>}
                  <span className="block text-ink-400 text-xs tabular mt-0.5">
                    {e.created_at.slice(0, 16)}
                  </span>
                </span>
                <b
                  className={`tabular shrink-0 ${
                    e.amount >= 0 ? "text-mint-700" : "text-ink-900"
                  }`}
                >
                  {e.amount >= 0 ? "+" : "−"}
                  {tienVN(Math.abs(e.amount))}
                </b>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
