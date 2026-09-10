import Link from "next/link";
import { BRAND, PublicFooter, PublicHeader } from "@/components/brand";
import { TOTAL_LESSONS } from "@/lib/curriculum";
import { IconCheckCircle } from "@/components/icons";
import HocThuForm from "@/components/hoc-thu-form";

export const metadata = { title: "Đăng ký học thử" };

const AN_TAM = [
  "Buổi thử miễn phí, không bắt buộc đăng ký khoá sau đó",
  "Chưa có đàn cũng học được — bên mình cho mượn tại quán",
  "Chưa biết gì vẫn theo được, buổi đầu chỉ tập cầm đàn và bấm hợp âm",
];

export default function HocThuPage() {
  return (
    <div className="min-h-screen bg-ivory-50 flex flex-col">
      <PublicHeader />

      <main className="flex-1 max-w-5xl mx-auto px-4 py-10 w-full">
        {/* Trên điện thoại xếp một cột: tiêu đề, rồi tới ngay form, phần trấn
            an để sau. Form là thứ khách vào đây để làm — để nó nằm cuối trang
            là bắt lướt qua ba khối chữ mới thấy nút bấm.
            Từ màn hình lớn thì đặt lại thành hai cột như cũ. */}
        <div className="flex flex-col gap-6 lg:grid lg:grid-cols-[1fr_26rem] lg:gap-8 lg:items-start">
          <div className="lg:col-start-1 lg:row-start-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-ink-900 tracking-tight">
              Học thử một buổi, xem có hợp không rồi hãy quyết
            </h1>
            <p className="text-ink-600 mt-3">
              Chọn hình thức bạn muốn thử — tới quán cà phê, học online theo nhóm, hay kèm riêng 1
              kèm 1. Bên mình gọi lại hẹn giờ.
            </p>
          </div>

          <div className="rounded-2xl border border-navy-100 bg-white p-5 lg:col-start-2 lg:row-start-1 lg:row-span-2 lg:sticky lg:top-20">
            <p className="font-bold text-ink-900 text-lg">Đăng ký học thử</p>
            <p className="text-sm text-ink-500 mt-0.5 mb-4">
              Điền chưa tới một phút, bên mình gọi lại hẹn giờ.
            </p>
            <HocThuForm />
          </div>

          <div className="lg:col-start-1 lg:row-start-2">
            <ul className="space-y-2.5">
              {AN_TAM.map((t) => (
                <li key={t} className="flex gap-2.5 text-ink-700">
                  <IconCheckCircle className="w-5 h-5 shrink-0 text-mint-600 mt-0.5" />
                  <span>{t}</span>
                </li>
              ))}
            </ul>

            <div className="rounded-2xl border border-navy-100 bg-white p-5 mt-6">
              <p className="font-bold text-ink-900">Chi nhánh</p>
              {BRAND.branches.map((b) => (
                <p key={b.name} className="text-ink-600 mt-1.5">
                  <b className="text-ink-900">{b.name}</b>
                  <br />
                  {b.address}
                </p>
              ))}
              <p className="text-sm text-ink-500 mt-3">
                Chưa có quán gần nhà? Chọn học online, hoặc{" "}
                <Link href="/register" className="font-semibold text-wood-600">
                  đăng ký tài khoản
                </Link>{" "}
                để nhận miễn phí khoá {TOTAL_LESSONS} bài video quay sẵn.
              </p>
            </div>
          </div>
        </div>

      </main>

      <PublicFooter />
    </div>
  );
}
