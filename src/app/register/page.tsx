import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { roleHomePath } from "@/lib/types";
import { Logo } from "@/components/logo";
import { IconGuitar, IconMusic, IconCheckCircle } from "@/components/icons";
import RegisterForm from "./register-form";

const HIGHLIGHTS = [
  {
    icon: <IconGuitar className="w-5 h-5" />,
    title: "Lộ trình 36 buổi",
    text: "Từ cách cầm đàn tới đệm hát trọn bài, chia 6 chặng rõ ràng.",
  },
  {
    icon: <IconMusic className="w-5 h-5" />,
    title: "Hợp âm, metronome, lên dây",
    text: "Thư viện hợp âm có tiếng mẫu, máy đập nhịp và tuner ngay trong trình duyệt.",
  },
  {
    icon: <IconCheckCircle className="w-5 h-5" />,
    title: "Tiến độ lưu theo tài khoản",
    text: "Đổi máy vẫn còn nguyên bài đã học và hợp âm đã thuộc.",
  },
];

export default async function RegisterPage() {
  const session = await getSession();
  if (session) {
    redirect(roleHomePath(session.role));
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="hidden lg:flex flex-col justify-between bg-navy-950 text-white px-12 py-10">
        <div className="flex items-center gap-3">
          <Logo className="h-10" />
          <span className="font-bold text-lg">Piano Guitar Đệm Hát</span>
        </div>

        <div className="max-w-md">
          <h2 className="text-3xl font-bold leading-tight tracking-tight">
            Tự học guitar đệm hát, có lộ trình như học ở trung tâm
          </h2>
          <p className="text-navy-200 mt-3">
            Tạo tài khoản miễn phí để bắt đầu buổi 1 ngay hôm nay. Khi ghi danh lớp tại trung tâm,
            lịch học sẽ hiện luôn trong cùng tài khoản này.
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
          © {new Date().getFullYear()} Piano Guitar Đệm Hát
        </p>
      </div>

      <div className="flex items-center justify-center px-4 py-10 bg-ivory-50">
        <div className="w-full max-w-md">
          <div className="lg:hidden text-center mb-7">
            <Logo className="h-14 mx-auto mb-2" />
            <h1 className="text-2xl font-bold text-ink-900">Piano Guitar Đệm Hát</h1>
            <p className="text-ink-500 text-sm mt-1">Học guitar đệm hát từ buổi đầu tiên</p>
          </div>

          <div className="bg-white rounded-2xl shadow-[0_2px_16px_rgba(16,36,62,0.06)] border border-navy-100 p-6">
            <h2 className="text-2xl font-bold text-ink-900 tracking-tight">Tạo tài khoản</h2>
            <p className="text-sm text-ink-500 mt-1 mb-5">
              Miễn phí, chỉ mất khoảng một phút.
            </p>
            <RegisterForm />
          </div>

          <p className="text-sm text-ink-500 text-center mt-5">
            Đã có tài khoản?{" "}
            <Link href="/login" className="font-semibold text-wood-600 hover:text-wood-700">
              Đăng nhập
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
