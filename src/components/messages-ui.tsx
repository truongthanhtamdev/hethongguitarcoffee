import Link from "next/link";
import type { MessageRow, ThreadRow } from "@/lib/messages";
import type { Role, UserRow } from "@/lib/types";
import { Avatar, Card, EmptyState, StatusChip } from "@/components/ui";
import { IconChevronLeft, IconChevronRight, IconBell } from "@/components/icons";
import SendMessageForm from "./send-message-form";

const NHAN_VAI_TRO: Record<Role, string> = {
  admin: "Quản trị",
  coordinator: "Giáo vụ",
  teacher: "Giáo viên",
  student: "Học viên",
};

/** "2026-09-06 14:03" -> "14:03" nếu hôm nay, còn lại "06/09 14:03". */
function nhan(at: string): string {
  const ngay = at.slice(0, 10);
  const gio = at.slice(11, 16);
  const homNay = new Date().toISOString().slice(0, 10);
  if (ngay === homNay) return gio;
  return `${ngay.slice(8, 10)}/${ngay.slice(5, 7)} ${gio}`;
}

export function ThreadList({
  threads,
  contacts,
  base,
}: {
  threads: ThreadRow[];
  contacts: UserRow[];
  base: string;
}) {
  const daCoThread = new Set(threads.map((t) => t.userId));
  const chuaNhan = contacts.filter((c) => !daCoThread.has(c.id));

  return (
    <div className="space-y-5">
      <Card padded={false}>
        {threads.length === 0 ? (
          <EmptyState
            icon={<IconBell className="w-6 h-6" />}
            title="Chưa có cuộc trò chuyện nào"
            description="Chọn một người ở danh sách bên dưới để nhắn tin."
          />
        ) : (
          <ul className="divide-y divide-navy-100">
            {threads.map((t) => (
              <li key={t.userId}>
                <Link
                  href={`${base}/${t.userId}`}
                  className="flex items-center gap-3 px-4 py-3.5 hover:bg-ivory-50 transition"
                >
                  <Avatar name={t.name} className="w-9 h-9 text-xs shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-2 font-semibold text-ink-900">
                      <span className="truncate">{t.name}</span>
                      <span className="text-[11px] font-medium text-ink-400 shrink-0">
                        {NHAN_VAI_TRO[t.role]}
                      </span>
                    </p>
                    <p className="text-sm text-ink-500 truncate mt-0.5">
                      {t.lastFromMe ? "Bạn: " : ""}
                      {t.lastBody}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-xs text-ink-400 tabular">{nhan(t.lastAt)}</p>
                    {t.unread > 0 && (
                      <span className="inline-block mt-1 rounded-full bg-coral-600 text-white text-[11px] font-bold px-1.5 py-0.5 min-w-[18px]">
                        {t.unread}
                      </span>
                    )}
                  </div>
                  <IconChevronRight className="w-4 h-4 text-ink-400 shrink-0" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {chuaNhan.length > 0 && (
        <Card padded={false}>
          <div className="px-4 pt-4 pb-2">
            <h2 className="font-semibold text-ink-900">Nhắn cho người khác</h2>
          </div>
          <ul className="divide-y divide-navy-100">
            {chuaNhan.map((c) => (
              <li key={c.id}>
                <Link
                  href={`${base}/${c.id}`}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-ivory-50 transition"
                >
                  <Avatar name={c.name} className="w-8 h-8 text-[11px] shrink-0" />
                  <span className="min-w-0 flex-1 font-medium text-ink-700 truncate">
                    {c.name}
                  </span>
                  <StatusChip tone="neutral">{NHAN_VAI_TRO[c.role]}</StatusChip>
                  <IconChevronRight className="w-4 h-4 text-ink-400 shrink-0" />
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}

export function Conversation({
  me,
  other,
  messages,
  base,
}: {
  me: number;
  other: UserRow;
  messages: MessageRow[];
  base: string;
}) {
  return (
    <div className="space-y-4">
      <Link
        href={base}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-500 hover:text-ink-900"
      >
        <IconChevronLeft className="w-4 h-4" />
        Tất cả tin nhắn
      </Link>

      <div className="flex items-center gap-3">
        <Avatar name={other.name} className="w-10 h-10 text-sm" />
        <div>
          <h1 className="text-xl font-bold text-ink-900 tracking-tight">{other.name}</h1>
          <p className="text-sm text-ink-500">
            {NHAN_VAI_TRO[other.role]}
            {other.phone ? ` · ${other.phone}` : ""}
          </p>
        </div>
      </div>

      <Card>
        {messages.length === 0 ? (
          <p className="text-sm text-ink-400 text-center py-6">
            Chưa có tin nhắn nào. Gửi lời đầu tiên bên dưới.
          </p>
        ) : (
          <ul className="space-y-2.5 max-h-[55vh] overflow-y-auto scroll-thin pr-1">
            {messages.map((m) => {
              const cuaToi = m.from_user_id === me;
              return (
                <li key={m.id} className={cuaToi ? "flex justify-end" : "flex justify-start"}>
                  <div
                    className={`max-w-[78%] rounded-2xl px-3.5 py-2.5 ${
                      cuaToi
                        ? "bg-navy-800 text-white rounded-br-md"
                        : "bg-ivory-100 text-ink-900 rounded-bl-md"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap break-words">{m.body}</p>
                    <p
                      className={`text-[11px] mt-1 tabular ${
                        cuaToi ? "text-navy-200" : "text-ink-400"
                      }`}
                    >
                      {nhan(m.created_at)}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      <SendMessageForm toId={other.id} toName={other.name} />
    </div>
  );
}
