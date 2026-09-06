import { MessagesIndexPage } from "@/components/messages-pages";

export default function Page() {
  return MessagesIndexPage({
    roles: ["student"],
    base: "/student/messages",
    subtitle: "Nhắn với giáo viên của bạn và với trung tâm.",
  });
}
