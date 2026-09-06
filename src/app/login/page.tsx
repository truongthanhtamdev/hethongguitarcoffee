import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { roleHomePath } from "@/lib/types";
import { BRAND, BrandMark, prettyPhone } from "@/components/brand";
import { IconGuitar, IconMusic, IconCheckCircle } from "@/components/icons";
import LoginForm from "./login-form";

const HIGHLIGHTS = [
  {
    icon: <IconGuitar className="w-5 h-5" />,
    title: "28 bài video quay sẵn",
    text: "Học lại bao nhiêu lần cũng được, bài nào chưa vững thì xem lại bài đó.",
  },
  {
    icon: <IconMusic className="w-5 h-5" />,
    title: "Hợp âm, máy đập nhịp, lên dây",
    text: "Mở là dùng được ngay trong trình duyệt, không cần cài thêm gì.",
  },
  {
    icon: <IconCheckCircle className="w-5 h-5" />,
    title: "Lịch học và tiến độ một chỗ",
    text: "Bài đã học, hợp âm đã thuộc và lịch buổi học tại quán đều nằm ở đây.",
  },
];

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const session = await getSession();
  if (session) {
    redirect(roleHomePath(session.role));
  }
  const { next } = await searchParams;

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Cột thương hiệu */}
      <div className="hidden lg:flex flex-col justify-between bg-navy-950 text-white px-12 py-10">
        <Link href="/" className="flex items-center gap-3 no-underline text-white">
          <BrandMark className="h-10" />
          <span className="font-bold text-lg">{BRAND.name}</span>
        </Link>

        <div className="max-w-md">
          <h2 className="text-3xl font-bold leading-tight tracking-tight">
            Mở lại đúng chỗ bạn đang học dở
          </h2>
          <p className="text-navy-200 mt-3">
            Đăng nhập để xem tiếp 28 bài video, tiến độ đã học và lịch buổi học tại quán của
            bạn.
          </p>
          <ul className="mt-8 space-y-5">
            {HIGHLIGHTS.map((h) => (
              <li key={h.title} className="flex gap-3.5">
                <span className="shrink-0 rounded-xl bg-white/10 text-wood-300 p-2.5 h-fit">
                  {h.icon}
                </span>
                <div>
                  <p className="font-semibold">{h.title}</p>
                  <p className="text-sm text-navy-200 mt-0.5">{h.text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <p className="text-xs text-navy-300">
          © {new Date().getFullYear()} {BRAND.name} · {prettyPhone()}
        </p>
      </div>

      {/* Cột form */}
      <div className="flex items-center justify-center px-4 py-10 bg-ivory-50">
        <div className="w-full max-w-sm">
          <div className="lg:hidden text-center mb-7">
            <Link href="/" className="no-underline">
              <BrandMark className="h-14 mx-auto mb-2" />
              <h1 className="text-2xl font-bold text-ink-900">{BRAND.name}</h1>
            </Link>
            <p className="text-ink-500 text-sm mt-1">{BRAND.slogan}</p>
          </div>

          <div className="bg-white rounded-2xl shadow-[0_2px_16px_rgba(16,36,62,0.06)] border border-navy-100 p-6">
            <h2 className="text-2xl font-bold text-ink-900 tracking-tight">Đăng nhập</h2>
            <p className="text-sm text-ink-500 mt-1 mb-5">
              Dùng email hoặc số điện thoại bạn đã đăng ký.
            </p>
            <LoginForm next={next || ""} />
          </div>

          <p className="text-sm text-ink-500 text-center mt-5">
            Chưa có tài khoản?{" "}
            <Link href="/register" className="font-semibold text-wood-600 hover:text-wood-700">
              Đăng ký học guitar miễn phí
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
