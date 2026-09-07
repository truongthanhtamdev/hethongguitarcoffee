import Link from "next/link";
import { requireRole } from "@/lib/guard";
import {
  NHAN_TRANG_THAI,
  demBai,
  hoaHongCuaKhoa,
  khoaCuaGiaoVien,
  tienVN,
} from "@/lib/courses";
import { soLuotDaBan } from "@/lib/course-sales";
import { Card, EmptyState, PageHeader, StatusChip } from "@/components/ui";
import { IconGuitar } from "@/components/icons";
import TaoKhoaForm from "./tao-khoa-form";

export default async function TeacherKhoaHocPage() {
  const session = await requireRole(["teacher"]);
  const khoa = khoaCuaGiaoVien(session.userId);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Khoá học của tôi"
        subtitle="Bạn tự soạn giáo trình, tự đặt giá. Trung tâm duyệt xong khoá lên trang bán, mỗi lượt bán bạn hưởng phần trăm đã thoả thuận."
      />

      {khoa.length === 0 ? (
        <Card padded={false}>
          <EmptyState
            icon={<IconGuitar className="w-6 h-6" />}
            title="Bạn chưa có khoá nào"
            description="Đặt tên khoá ở dưới là bắt đầu soạn được ngay. Soạn xong mới gửi duyệt, không ai thấy bản nháp của bạn."
          />
        </Card>
      ) : (
        <ul className="space-y-3">
          {khoa.map((c) => {
            const nhan = NHAN_TRANG_THAI[c.status];
            const soBai = demBai(c.id);
            const daBan = soLuotDaBan(c.slug);
            return (
              <li key={c.id}>
                <Link
                  href={`/teacher/khoa-hoc/${c.id}`}
                  className="block rounded-2xl border border-navy-100 bg-white p-5 hover:shadow-md transition no-underline"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-bold text-ink-900">{c.name}</p>
                      <p className="text-sm text-ink-500 mt-0.5">
                        {soBai} bài · {c.price > 0 ? tienVN(c.price) : "chưa đặt giá"}
                        {c.price > 0 && (
                          <>
                            {" "}
                            · bạn hưởng {c.commission_percent}% ={" "}
                            <b className="text-wood-600 tabular">{tienVN(hoaHongCuaKhoa(c))}</b>
                          </>
                        )}
                      </p>
                      {daBan > 0 && (
                        <p className="text-sm text-mint-700 font-semibold mt-0.5">
                          Đã bán {daBan} lượt
                        </p>
                      )}
                      {c.status === "draft" && c.reject_note && (
                        <p className="text-sm text-coral-700 mt-1.5">
                          Trung tâm trả lại: {c.reject_note}
                        </p>
                      )}
                    </div>
                    <StatusChip tone={nhan.tone}>{nhan.chu}</StatusChip>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}

      <Card className="max-w-xl">
        <p className="font-semibold text-ink-900">Tạo khoá mới</p>
        <p className="text-sm text-ink-500 mt-0.5 mb-3">
          Đặt tên trước đã, nội dung và giá điền ở bước sau.
        </p>
        <TaoKhoaForm />
      </Card>
    </div>
  );
}
