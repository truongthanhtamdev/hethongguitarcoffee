"use client";

import { useTransition } from "react";
import { danhDauTraHoaHongAction } from "@/actions/courses";

export default function TraHoaHongToggle({ id, daTra }: { id: number; daTra: boolean }) {
  const [pending, start] = useTransition();

  return (
    <label className="flex items-center gap-1.5 text-xs text-ink-600 mt-1.5 cursor-pointer">
      <input
        type="checkbox"
        checked={daTra}
        disabled={pending}
        className="rounded border-navy-300"
        onChange={(e) => start(() => void danhDauTraHoaHongAction(id, e.target.checked))}
      />
      Đã trả
    </label>
  );
}
