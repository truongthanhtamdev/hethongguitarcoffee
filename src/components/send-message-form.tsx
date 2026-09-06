"use client";

import { useActionState, useEffect, useRef } from "react";
import { sendMessageAction, type SendState } from "@/actions/messages";
import { IconAlert } from "@/components/icons";
import { btn, field } from "@/components/ui";

const initialState: SendState = {};

export default function SendMessageForm({
  toId,
  toName,
}: {
  toId: number;
  toName: string;
}) {
  const [state, formAction, pending] = useActionState(sendMessageAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  // Gửi xong thì dọn ô nhập; gửi lỗi thì giữ nguyên chữ để khỏi phải gõ lại.
  useEffect(() => {
    if (!pending && !state.error) formRef.current?.reset();
  }, [pending, state]);

  return (
    <form ref={formRef} action={formAction} className="space-y-2">
      <input type="hidden" name="to" value={toId} />
      <label className="sr-only" htmlFor="msg-body">
        Nội dung nhắn cho {toName}
      </label>
      <textarea
        id="msg-body"
        name="body"
        rows={3}
        maxLength={2000}
        required
        className={`${field} resize-y`}
        placeholder={`Nhắn cho ${toName}...`}
      />

      {state.error && (
        <p className="text-sm text-coral-700 bg-coral-50 border border-coral-100 rounded-xl px-3 py-2 flex items-center gap-2">
          <IconAlert className="w-4 h-4 shrink-0" />
          {state.error}
        </p>
      )}

      <button type="submit" disabled={pending} className={`${btn.primary} w-full py-2.5`}>
        {pending ? "Đang gửi..." : "Gửi tin nhắn"}
      </button>
    </form>
  );
}
