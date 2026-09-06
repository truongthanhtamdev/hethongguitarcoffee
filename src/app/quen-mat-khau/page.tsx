import Link from "next/link";
import type { Metadata } from "next";
import { BRAND, BrandMark, prettyPhone } from "@/components/brand";
import QuenMatKhauForm from "./form";

export const metadata: Metadata = {
  title: "Quên mật khẩu",
};

export default function QuenMatKhauPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10 bg-ivory-50">
      <div className="w-full max-w-md">
        <div className="text-center mb-7">
          <Link href="/" className="no-underline">
            <BrandMark className="h-14 mx-auto mb-2" />
            <h1 className="text-2xl font-bold text-ink-900">{BRAND.name}</h1>
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-[0_2px_16px_rgba(16,36,62,0.06)] border border-navy-100 p-6">
          <h2 className="text-2xl font-bold text-ink-900 tracking-tight">Quên mật khẩu</h2>
          <p className="text-sm text-ink-500 mt-1 mb-5">
            Nhập email hoặc số điện thoại bạn đã đăng ký. Bên mình gọi lại xác nhận rồi đọc cho bạn
            mật khẩu tạm để đăng nhập.
          </p>
          <QuenMatKhauForm />
        </div>

        <p className="text-sm text-ink-500 text-center mt-5">
          Cần gấp thì gọi{" "}
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

        <p className="text-sm text-ink-500 text-center mt-2">
          <Link href="/login" className="font-semibold text-wood-600 hover:text-wood-700">
            Quay lại đăng nhập
          </Link>
        </p>
      </div>
    </div>
  );
}
