import { requireRole } from "@/lib/guard";
import { GUITARS, SHOP_NAME, SHOP_UPDATED, SHOP_URL } from "@/lib/shop";
import { Card, PageHeader, StatusChip, btn } from "@/components/ui";
import { IconGuitar } from "@/components/icons";

export default async function StudentShopPage() {
  await requireRole(["student"]);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Mua đàn"
        subtitle="Người mới rất dễ mua nhầm đàn cần cao, bấm đau tay rồi bỏ. Ghé quán thử trước, chọn cây hợp tay bạn."
      />

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-semibold text-ink-900">Xem toàn bộ tại {SHOP_NAME}</h2>
            <p className="text-sm text-ink-500 mt-0.5">
              Cần tư vấn chọn cây nào thì nhắn cho trung tâm ở mục Tin nhắn.
            </p>
          </div>
          <a
            href={SHOP_URL}
            target="_blank"
            rel="noopener"
            className={`${btn.primary} shrink-0 no-underline`}
          >
            Mở cửa hàng ↗
          </a>
        </div>
      </Card>

      <div>
        <div className="flex items-baseline justify-between mb-3">
          <h2 className="font-bold text-ink-900">Đàn đang bán</h2>
          <span className="text-sm text-ink-400 tabular">{GUITARS.length} cây</span>
        </div>

        <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {GUITARS.map((g) => (
            <li key={g.url}>
              <a
                href={g.url}
                target="_blank"
                rel="noopener"
                className="block h-full rounded-2xl border border-navy-100 bg-white p-2.5 hover:shadow-sm transition no-underline"
              >
                {g.img ? (
                  // Ảnh nằm trên máy chủ của shop nên dùng thẻ img thường, không
                  // qua bộ tối ưu ảnh của Next.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={g.img}
                    alt={g.name}
                    loading="lazy"
                    className="w-full aspect-square object-cover rounded-xl bg-ivory-100"
                  />
                ) : (
                  <div className="w-full aspect-square rounded-xl bg-ivory-100 grid place-items-center text-wood-400">
                    <IconGuitar className="w-10 h-10" />
                  </div>
                )}

                <p className="text-[13px] font-semibold text-ink-900 mt-2 leading-snug line-clamp-3">
                  {g.name}
                </p>

                <p className="text-sm font-bold text-wood-600 mt-1 tabular">{g.price}</p>
                {g.priceOld && (
                  <p className="text-xs text-ink-400 line-through tabular">{g.priceOld}</p>
                )}
                {g.soldOut && (
                  <div className="mt-1.5">
                    <StatusChip tone="neutral">Hết hàng</StatusChip>
                  </div>
                )}
              </a>
            </li>
          ))}
        </ul>

        <p className="text-xs text-ink-400 mt-3">
          Giá tham khảo, cập nhật {SHOP_UPDATED}. Bấm vào từng cây để xem giá và tồn kho mới nhất.
        </p>
      </div>
    </div>
  );
}
