import { notFound } from "next/navigation";
import { getUserById } from "@/lib/auth";
import { requireRole } from "@/lib/guard";
import { canMessage, listContacts, listMessages, listThreads, markThreadRead } from "@/lib/messages";
import { PageHeader } from "@/components/ui";
import { Conversation, ThreadList } from "@/components/messages-ui";
import type { Role } from "@/lib/types";

/**
 * Ba vai trò có khung giao diện riêng nên phải có ba route, nhưng nội dung y
 * hệt nhau — gom vào đây để sửa một chỗ là cả ba đổi theo.
 */

export async function MessagesIndexPage({
  roles,
  base,
  subtitle,
}: {
  roles: Role[];
  base: string;
  subtitle: string;
}) {
  const session = await requireRole(roles);
  const me = getUserById(session.userId);
  if (!me) notFound();

  return (
    <div className="space-y-5">
      <PageHeader title="Tin nhắn" subtitle={subtitle} />
      <ThreadList threads={listThreads(me.id)} contacts={listContacts(me)} base={base} />
    </div>
  );
}

export async function MessagesThreadPage({
  roles,
  base,
  params,
}: {
  roles: Role[];
  base: string;
  params: Promise<{ id: string }>;
}) {
  const session = await requireRole(roles);
  const { id } = await params;

  const me = getUserById(session.userId);
  const otherId = Number(id);
  const other = Number.isInteger(otherId) ? getUserById(otherId) : undefined;
  if (!me || !other || !canMessage(me, other)) notFound();

  // Mở cuộc trò chuyện là coi như đã đọc.
  markThreadRead(me.id, other.id);

  return (
    <Conversation me={me.id} other={other} messages={listMessages(me.id, other.id)} base={base} />
  );
}
