"use server";

import { revalidatePath } from "next/cache";
import { getUserById } from "@/lib/auth";
import { assertSession } from "@/lib/guard";
import { canMessage, markThreadRead, sendMessage } from "@/lib/messages";
import { roleHomePath } from "@/lib/types";

export interface SendState {
  error?: string;
}

const TOI_DA = 2000;

export async function sendMessageAction(
  _prev: SendState,
  formData: FormData
): Promise<SendState> {
  const session = await assertSession();

  const toId = Number(formData.get("to"));
  const body = String(formData.get("body") || "").trim();

  if (!Number.isInteger(toId)) return { error: "Không rõ người nhận" };
  if (!body) return { error: "Bạn chưa nhập nội dung" };
  if (body.length > TOI_DA) return { error: `Tin nhắn tối đa ${TOI_DA} ký tự` };

  const me = getUserById(session.userId);
  const other = getUserById(toId);
  if (!me || !other) return { error: "Không tìm thấy người nhận" };

  // Kiểm quyền ở tầng máy chủ, không dựa vào việc giao diện có hiện nút hay
  // không. Trả lỗi thay vì ném ra: ngoài trường hợp cố tình, còn có tình huống
  // thật là lớp bị gỡ trong lúc trang đang mở.
  if (!canMessage(me, other)) {
    return { error: "Bạn không nhắn tin được với người này" };
  }

  sendMessage(me.id, other.id, body);

  const goc = roleHomePath(me.role);
  revalidatePath(`${goc}/messages`);
  revalidatePath(`${goc}/messages/${other.id}`);
  return {};
}

export async function markThreadReadAction(otherId: number) {
  const session = await assertSession();
  markThreadRead(session.userId, otherId);
  revalidatePath(`${roleHomePath(session.role)}/messages`);
}
