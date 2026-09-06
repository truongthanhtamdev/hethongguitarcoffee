import { MessagesThreadPage } from "@/components/messages-pages";

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  return MessagesThreadPage({ roles: ["admin", "coordinator"], base: "/admin/messages", params });
}
