import Link from "next/link";
import { notFound } from "next/navigation";
import { GUITARS, guitarBySlug } from "@/lib/shop";
import { BRAND, PublicFooter, PublicHeader, prettyPhone } from "@/components/brand";
import OrderForm from "./order-form";

export function generateStaticParams() {
  return GUITARS.map((g) => ({ slug: g.slug }));
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const g = guitarBySlug(slug);
  if (!g) notFound();

  return (
    <div className="min-h-screen bg-ivory-50 flex flex-col">
      <PublicHeader />

      <main className="flex-1 max-w-5xl mx-auto px-4 py-8 w-full">
        <Link href="/shop" className="text-sm font-semibold text-ink-500 hover:text-ink-900">
          ← Tất cả đàn
        </Link>

        <div className="grid md:grid-cols-2 gap-8 mt-4">
          <div>
            {g.img ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={g.img}
                alt={g.name}
                className="w-full aspect-square object-cover rounded-2xl border border-navy-100 bg-white"
              />
            ) : (
              <div className="w-full aspect-square rounded-2xl border border-navy-100 bg-white grid place-items-center text-7xl">
                🎸
              </div>
            )}
          </div>

          <div>
            <h1 className="text-2xl font-bold text-ink-900 tracking-tight leading-snug">
              {g.name}
            </h1>

            <div className="flex items-baseline gap-3 mt-3">
              <span className="text-3xl font-bold text-wood-600 tabular">{g.price}</span>
              {g.priceOld && (
                <span className="text-ink-400 line-through tabular">{g.priceOld}</span>
              )}
            </div>

            {g.soldOut ? (
              <p className="mt-4 rounded-xl bg-ivory-100 border border-navy-100 px-4 py-3 text-ink-600">
                Cây này đang hết hàng. Gọi {prettyPhone()} để bên mình báo khi có lại, hoặc xem
                mẫu khác.
              </p>
            ) : (
              <div className="mt-6">
                <OrderForm slug={g.slug} name={g.name} price={g.price} />
              </div>
            )}

            <div className="mt-6 rounded-2xl border border-navy-100 bg-white p-4 text-sm text-ink-600 space-y-1.5">
              <p>✓ Thử đàn trực tiếp tại {BRAND.branches[0].name} trước khi mua</p>
              <p>✓ Tư vấn chọn cây hợp tay người mới</p>
              <p>✓ Đặt trên web không phải trả trước — bên mình gọi lại xác nhận</p>
            </div>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
