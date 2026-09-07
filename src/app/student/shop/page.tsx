import Link from "next/link";
import { requireRole } from "@/lib/guard";
import { GUITARS, SHOP_UPDATED } from "@/lib/shop";
import { BRAND, prettyPhone } from "@/components/brand";
import { PageHeader } from "@/components/ui";

export default async function StudentShopPage() {
  await requireRole(["student"]);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Mua đàn"
        subtitle="Người mới rất dễ mua nhầm đàn cần cao, bấm đau tay rồi bỏ. Ghé quán thử trước, hoặc đặt ở đây rồi bên mình gọi lại tư vấn — không thu tiền trước."
      />

      <ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {GUITARS.map((g) => (
          <li key={g.slug}>
            <Link
              href={`/student/shop/${g.slug}`}
              className="block h-full rounded-2xl border border-navy-100 bg-white p-3 hover:shadow-md transition no-underline"
            >
              {g.img ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={g.img}
                  alt={g.name}
                  loading="lazy"
                  className="w-full aspect-square object-cover rounded-xl bg-ivory-100"
                />
              ) : (
                <div className="w-full aspect-square rounded-xl bg-ivory-100 grid place-items-center text-4xl">
                  🎸
                </div>
              )}

              <p className="text-sm font-semibold text-ink-900 mt-2.5 line-clamp-2 leading-snug">
                {g.name}
              </p>

              <p className="text-wood-600 font-bold mt-1 tabular">{g.price}</p>
              {g.priceOld && (
                <p className="text-xs text-ink-400 line-through tabular">{g.priceOld}</p>
              )}
              {g.soldOut && (
                <span className="inline-block mt-1.5 text-[11px] font-semibold rounded-full bg-ivory-100 text-ink-500 px-2 py-0.5">
                  Hết hàng
                </span>
              )}
            </Link>
          </li>
        ))}
      </ul>

      <p className="text-xs text-ink-400">
        Giá cập nhật {SHOP_UPDATED}. Cần tư vấn chọn cây hợp tay, gọi{" "}
        <a href={`tel:${BRAND.phone}`} className="font-semibold text-wood-600">
          {prettyPhone()}
        </a>
        .
      </p>
    </div>
  );
}
