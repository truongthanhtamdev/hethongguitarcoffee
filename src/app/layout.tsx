import type { Metadata, Viewport } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "vietnamese"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Piano Guitar Đệm Hát - Quản lý giáo viên",
  description: "Điểm danh, chấm công và giao lớp cho giáo viên guitar online",
  appleWebApp: {
    capable: true,
    title: "Guitar Đệm Hát",
    statusBarStyle: "default",
  },
  icons: {
    icon: "/icon-192.png",
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#17212b",
  // Người học vừa ôm đàn vừa bấm màn hình rất dễ chạm hai ngón cùng lúc; khoá
  // zoom sẽ chặn cả pinch nên chỉ giới hạn mức phóng, không tắt hẳn.
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="vi"
      className={`${inter.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-ivory-50 text-ink-900">{children}</body>
    </html>
  );
}
