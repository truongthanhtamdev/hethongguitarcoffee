import Link from "next/link";
import { hienGia, tachBangGia, tachDong, type ClassPackage } from "@/lib/packages";
import { tienVN } from "@/lib/courses";
import { IconCheckCircle } from "@/components/icons";

const ICO: Record<string, string> = {
  quan: "☕",
  online_nhom: "💻",
  online_1v1: "👤",
  tainha_1v1: "🏠",
};

/**
 * Thẻ giới thiệu một gói lớp. Dùng chung cho trang công khai và khu học viên,
 * chỉ khác đường dẫn khi bấm vào.
 */
export default function TheGoiLop({ goi, href }: { goi: ClassPackage; href: string }) {
  const quyenLoi = tachDong(goi.quyen_loi);
  const mucGia = tachBangGia(goi.bang_gia);

  return (
    <Link
      href={href}
      className="flex flex-col h-full rounded-2xl border border-navy-100 bg-white p-5 hover:shadow-md transition no-underline"
    >
      <div className="w-11 h-11 rounded-xl bg-wood-50 grid place-items-center text-2xl">
        {ICO[goi.hinh_thuc] ?? "🎸"}
      </div>

      <h3 className="font-bold text-ink-900 mt-3 leading-snug">{goi.name}</h3>
      <p className="text-sm text-ink-500 mt-1.5">{goi.tagline}</p>

      {goi.lich_hoc ? (
        <p className="text-sm text-ink-500 mt-2">{goi.lich_hoc}</p>
      ) : (
        goi.so_buoi > 0 && (
          <p className="text-sm text-ink-500 mt-2">
            {goi.so_buoi} buổi · mỗi buổi {goi.phut_moi_buoi} phút
          </p>
        )
      )}

      {quyenLoi.length > 0 && (
        <ul className="mt-3 space-y-1.5 flex-1">
          {quyenLoi.slice(0, 3).map((q) => (
            <li key={q} className="flex gap-2 text-sm text-ink-700">
              <IconCheckCircle className="w-4 h-4 shrink-0 text-mint-600 mt-0.5" />
              <span>{q}</span>
            </li>
          ))}
        </ul>
      )}

      {mucGia.length > 0 ? (
        <div className="mt-4 space-y-0.5">
          {mucGia.map((m) => (
            <p key={m.nhan} className="flex items-baseline justify-between gap-2 text-sm">
              <span className="text-ink-600">{m.nhan}</span>
              <b className="text-wood-600 tabular">{tienVN(m.tien)}</b>
            </p>
          ))}
        </div>
      ) : (
        <>
          <p
            className={`font-bold mt-4 tabular ${
              goi.price > 0 ? "text-wood-600 text-xl" : "text-ink-500 text-base"
            }`}
          >
            {hienGia(goi.price)}
          </p>
          {goi.price_old > 0 && goi.price > 0 && (
            <p className="text-xs text-ink-400 line-through tabular">{tienVN(goi.price_old)}</p>
          )}
        </>
      )}
    </Link>
  );
}
