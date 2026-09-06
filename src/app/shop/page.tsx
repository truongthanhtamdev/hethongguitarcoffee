import Link from "next/link";
import { GUITARS, SHOP_UPDATED } from "@/lib/shop";
import { BRAND, PublicFooter, PublicHeader, prettyPhone } from "@/components/brand";

export const metadata = { title: "Mua đàn guitar" };

export default function ShopPage() {
  return (
    <div className="min-h-screen bg-ivory-50 flex flex-col">
      <PublicHeader />

      <main className="flex-1 max-w-6xl mx-auto px-4 py-10 w-full">
        <h1 className="text-3xl font-bold text-ink-900 tracking-tight">Đàn guitar</h1>
        <p className="text-ink-500 mt-2 max-w-2xl">
          Người mới rất dễ mua nhầm đàn cần cao, bấm đau tay rồi bỏ. Ghé quán thử trước, hoặc đặt
          trên web rồi bên mình gọi lại tư vấn — không thu tiền trước.
        </p>

        <ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-8">
          {GUITARS.map((g) => (
            <li key={g.slug}>
              <Link
                href={`/shop/${g.slug}`}
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

        <p className="text-xs text-ink-400 mt-6">
          Giá cập nhật {SHOP_UPDATED}. Cần tư vấn chọn cây hợp tay, gọi {prettyPhone()} hoặc nhắn
          fanpage {BRAND.short}.
        </p>
      </main>

      <PublicFooter />
    </div>
  );
}
