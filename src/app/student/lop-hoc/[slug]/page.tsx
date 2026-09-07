import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/guard";
import { db } from "@/lib/db";
import { goiBySlug, hienGia, tachBangGia, tachDong, donGoiDangChoCuaToi } from "@/lib/packages";
import { tienVN } from "@/lib/courses";
import { BRAND, prettyPhone, tenHinhThuc } from "@/components/brand";
import { Card, PageHeader } from "@/components/ui";
import { IconCheckCircle } from "@/components/icons";
import PackageOrderForm from "@/app/lop-hoc/[slug]/order-form";

export default async function StudentPackagePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const session = await requireRole(["student"]);
  const { slug } = await params;
  const g = goiBySlug(slug);
  if (!g || !g.active) notFound();

  const donCho = donGoiDangChoCuaToi(session.userId, slug);
  const me = db.prepare("SELECT name, phone FROM users WHERE id = ?").get(session.userId) as {
    name: string;
    phone: string | null;
  };
  const quyenLoi = tachDong(g.quyen_loi);
  const mucGia = tachBangGia(g.bang_gia);

  return (
    <div className="space-y-5">
      <div>
        <Link href="/student/khoa-hoc" className="text-sm text-ink-500 hover:text-ink-900">
          ← Khoá học của tôi
        </Link>
      </div>

      <PageHeader title={g.name} subtitle={tenHinhThuc(g.hinh_thuc)} />

      <Card>
        <p className="text-ink-700">{g.tagline}</p>

        {mucGia.length > 0 ? (
          <div className="mt-3 max-w-xs divide-y divide-navy-100">
            {mucGia.map((m) => (
              <p
                key={m.nhan}
                className="flex items-baseline justify-between gap-3 py-2 first:pt-0 last:pb-0"
              >
                <span className="text-ink-600">{m.nhan}</span>
                <b className="text-xl text-wood-600 tabular">{tienVN(m.tien)}</b>
              </p>
            ))}
          </div>
        ) : (
          <>
            <p
              className={`font-bold mt-3 tabular ${
                g.price > 0 ? "text-3xl text-wood-600" : "text-xl text-ink-700"
              }`}
            >
              {hienGia(g.price)}
            </p>
            {g.price_old > 0 && g.price > 0 && (
              <p className="text-sm text-ink-400 line-through tabular">{tienVN(g.price_old)}</p>
            )}
          </>
        )}

        {g.lich_hoc && <p className="text-sm text-ink-600 mt-3">Lịch học: {g.lich_hoc}</p>}
        {g.so_buoi > 0 && (
          <p className="text-sm text-ink-500 mt-1">
            {g.so_buoi} buổi · mỗi buổi {g.phut_moi_buoi} phút
          </p>
        )}
      </Card>

      {g.ghi_chu && (
        <div className="rounded-2xl border border-wood-200 bg-wood-50 p-5">
          <p className="text-ink-700">{g.ghi_chu}</p>
        </div>
      )}

      {quyenLoi.length > 0 && (
        <Card>
          <p className="font-bold text-ink-900">Bạn được gì</p>
          <ul className="mt-3 space-y-2">
            {quyenLoi.map((q) => (
              <li key={q} className="flex gap-2.5 text-ink-700">
                <IconCheckCircle className="w-5 h-5 shrink-0 text-mint-600 mt-0.5" />
                <span>{q}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {g.danh_cho && (
        <Card>
          <p className="font-bold text-ink-900">Gói này hợp với ai</p>
          <p className="text-ink-700 mt-2 whitespace-pre-line">{g.danh_cho}</p>
        </Card>
      )}

      {g.hinh_thuc === "quan" && BRAND.branches.length > 0 && (
        <Card>
          <p className="font-bold text-ink-900">Học ở đâu</p>
          {BRAND.branches.map((b) => (
            <p key={b.name} className="text-ink-600 mt-1.5">
              <b className="text-ink-900">{b.name}</b>
              <br />
              {b.address}
            </p>
          ))}
        </Card>
      )}

      {donCho ? (
        <div className="rounded-2xl border border-amber-300 bg-amber-50 p-5">
          <p className="font-bold text-amber-700">Đăng ký của bạn đang chờ</p>
          <p className="text-sm text-ink-700 mt-1.5">
            Bên mình sẽ gọi số {donCho.customer_phone} để xếp lịch. Cần gấp thì gọi{" "}
            <a href={`tel:${BRAND.phone}`} className="font-semibold text-wood-600">
              {prettyPhone()}
            </a>
            .
          </p>
        </div>
      ) : (
        <div className="max-w-md">
          <PackageOrderForm
            slug={g.slug}
            name={g.name}
            coGia={g.price > 0}
            tenSan={me.name}
            sdtSan={me.phone ?? ""}
          />
        </div>
      )}
    </div>
  );
}
