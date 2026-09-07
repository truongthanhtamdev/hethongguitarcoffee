"use client";

import { useState, useTransition } from "react";
import { duyetNapTienAction, tuChoiNapTienAction } from "@/actions/wallet";
import { btn } from "@/components/ui";

export default function DuyetNapActions({ id, status }: { id: number; status: string }) {
  const [pending, start] = useTransition();
  const [loi, setLoi] = useState<string>();

  if (status !== "new") return null;

  return (
    <div className="flex flex-col items-end gap-1.5">
      <div className="flex gap-2 justify-end">
        <button
          type="button"
          disabled={pending}
          className={`${btn.primary} px-3 py-1.5 text-xs`}
          onClick={() =>
            start(async () => {
              const kq = await duyetNapTienAction(id);
              setLoi(kq.error);
            })
          }
        >
          {pending ? "Đang lưu..." : "Đã nhận tiền"}
        </button>
        <button
          type="button"
          disabled={pending}
          className={`${btn.ghost} px-3 py-1.5 text-xs`}
          onClick={() => start(() => void tuChoiNapTienAction(id))}
        >
          Huỷ
        </button>
      </div>
      {loi && <p className="text-xs text-coral-700 max-w-[16rem] text-right">{loi}</p>}
    </div>
  );
}
