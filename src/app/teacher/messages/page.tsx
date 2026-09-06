import { MessagesIndexPage } from "@/components/messages-pages";

export default function Page() {
  return MessagesIndexPage({
    roles: ["teacher"],
    base: "/teacher/messages",
    subtitle: "Nhắn với học viên các lớp bạn đang dạy, và với trung tâm.",
  });
}
