import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/guard";
import {
  NHAN_TRANG_THAI,
  baiCuaKhoa,
  courseById,
  hoaHongCuaKhoa,
  thieuGiDeGuiDuyet,
  tienVN,
} from "@/lib/courses";
import { soLuotDaBan } from "@/lib/course-sales";
import { Card, PageHeader, StatusChip } from "@/components/ui";
import SuaKhoaForm from "./sua-khoa-form";
import DanhSachBai from "./danh-sach-bai";
import TrangThaiKhoa from "./trang-thai-khoa";

export default async function TeacherCourseEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireRole(["teacher"]);
  const { id } = await params;
  const c = courseById(Number(id));
  if (!c || c.teacher_id !== session.userId) notFound();

  const bai = baiCuaKhoa(c.id);
  const thieu = thieuGiDeGuiDuyet(c);
  const daBan = soLuotDaBan(c.slug);
  const nhan = NHAN_TRANG_THAI[c.status];
  const dangBan = c.status === "published";

  return (
    <div className="space-y-5">
      <div>
        <Link href="/teacher/khoa-hoc" className="text-sm text-ink-500 hover:text-ink-900">
          ← Khoá học của tôi
        </Link>
      </div>

      <PageHeader
        title={c.name}
        subtitle={`Đường dẫn khi lên trang bán: /khoa-hoc/${c.slug}`}
        action={<StatusChip tone={nhan.tone}>{nhan.chu}</StatusChip>}
      />

      {c.reject_note && c.status === "draft" && (
        <div className="rounded-2xl border border-coral-200 bg-coral-50 p-4">
          <p className="font-semibold text-coral-700">Trung tâm trả lại để sửa</p>
          <p className="text-ink-700 mt-1">{c.reject_note}</p>
        </div>
      )}

      <TrangThaiKhoa
        id={c.id}
        status={c.status}
        thieu={thieu}
        daBan={daBan}
        slug={c.slug}
      />

      <div className="grid lg:grid-cols-2 gap-4 items-start">
        <Card>
          <p className="font-semibold text-ink-900">Ăn chia</p>
          <p className="text-sm text-ink-500 mt-0.5 mb-3">
            Tỉ lệ do trung tâm đặt. Muốn đổi thì trao đổi với trung tâm.
          </p>
          <div className="rounded-xl bg-ivory-50 border border-navy-100 p-4 space-y-1.5">
            <p className="flex justify-between text-sm">
              <span className="text-ink-600">Giá bán</span>
              <b className="tabular text-ink-900">{c.price > 0 ? tienVN(c.price) : "chưa đặt"}</b>
            </p>
            <p className="flex justify-between text-sm">
              <span className="text-ink-600">Bạn nhận ({c.commission_percent}%)</span>
              <b className="tabular text-wood-600">{tienVN(hoaHongCuaKhoa(c))}</b>
            </p>
            <p className="flex justify-between text-sm">
              <span className="text-ink-600">Nền tảng ({100 - c.commission_percent}%)</span>
              <b className="tabular text-ink-900">{tienVN(c.price - hoaHongCuaKhoa(c))}</b>
            </p>
          </div>
          <p className="text-sm text-ink-500 mt-3">
            Đã bán <b className="text-ink-900 tabular">{daBan}</b> lượt.{" "}
            <Link href="/teacher/hoa-hong" className="font-semibold text-wood-600">
              Xem sổ hoa hồng →
            </Link>
          </p>
        </Card>

        <Card>
          <p className="font-semibold text-ink-900">Gửi duyệt thế nào</p>
          <ol className="mt-2 space-y-1.5 text-sm text-ink-600 list-decimal list-inside marker:font-semibold marker:text-ink-400">
            <li>Điền thông tin khoá và đặt giá.</li>
            <li>Thêm các bài giảng, dán link video YouTube của bạn vào.</li>
            <li>Đánh dấu một bài làm bài xem thử để khách xem trước khi mua.</li>
            <li>Bấm Gửi duyệt. Trung tâm xem xong sẽ đưa khoá lên trang bán.</li>
          </ol>
          <p className="text-sm text-ink-500 mt-3">
            Bản nháp và bản chờ duyệt không ai ngoài bạn với trung tâm thấy được.
          </p>
        </Card>
      </div>

      <Card>
        <p className="font-semibold text-ink-900 mb-3">Thông tin khoá học</p>
        <SuaKhoaForm khoa={c} khoaDangBan={dangBan} />
      </Card>

      <Card>
        <p className="font-semibold text-ink-900">Giáo trình — {bai.length} bài</p>
        <p className="text-sm text-ink-500 mt-0.5 mb-3">
          Thứ tự các bài chính là thứ tự học viên xem.
        </p>
        <DanhSachBai courseId={c.id} bai={bai} khoaDangBan={dangBan} />
      </Card>
    </div>
  );
}
