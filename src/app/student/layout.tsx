import { requireRole } from "@/lib/guard";
import { AppShell, type NavItem } from "@/components/app-shell";
import { BRAND } from "@/components/brand";
import {
  IconCalendarCheck,
  IconGuitar,
  IconMusic,
  IconMic,
  IconBell,
  IconPackage,
  IconViolin,
} from "@/components/icons";
import { countUnread } from "@/lib/messages";

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const session = await requireRole(["student"]);

  const links: NavItem[] = [
    { href: "/student", label: "Lịch học của tôi", icon: <IconCalendarCheck className="w-5 h-5" /> },
    { href: "/student/learn", label: "Học guitar", icon: <IconGuitar className="w-5 h-5" /> },
    { href: "/student/khoa-hoc", label: "Khoá của tôi", icon: <IconViolin className="w-5 h-5" /> },
    { href: "/student/chords", label: "Hợp âm", icon: <IconMusic className="w-5 h-5" /> },
    { href: "/student/practice", label: "Luyện tập", icon: <IconMic className="w-5 h-5" /> },
    { href: "/student/messages", label: "Tin nhắn", icon: <IconBell className="w-5 h-5" /> },
    { href: "/shop", label: "Mua đàn", icon: <IconPackage className="w-5 h-5" /> },
  ];

  return (
    <AppShell
      brandTitle={BRAND.short}
      userName={session.name}
      roleLabel="Học viên"
      links={links}
      alertCount={countUnread(session.userId)}
      maxWidth="max-w-4xl"
    >
      {children}
    </AppShell>
  );
}
