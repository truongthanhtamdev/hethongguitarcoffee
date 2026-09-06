import { MessagesIndexPage } from "@/components/messages-pages";

export default function Page() {
  return MessagesIndexPage({
    roles: ["admin", "coordinator"],
    base: "/admin/messages",
    subtitle: "Nhắn trực tiếp với học viên và giáo viên. Học viên nhận được ngay khi đăng nhập.",
  });
}
