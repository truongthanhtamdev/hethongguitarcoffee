"use client";

import { useTransition } from "react";
import { doiTrangThaiDonGoiAction } from "@/actions/packages";
import { field } from "@/components/ui";

export default function TrangThaiDonGoi({ id, status }: { id: number; status: string }) {
  const [pending, start] = useTransition();

  return (
    <select
      className={`${field} py-1.5 text-xs`}
      defaultValue={status}
      disabled={pending}
      onChange={(e) => start(() => void doiTrangThaiDonGoiAction(id, e.target.value))}
    >
      <option value="new">Mới</option>
      <option value="contacted">Đã gọi</option>
      <option value="done">Đã vào lớp</option>
      <option value="cancelled">Đã huỷ</option>
    </select>
  );
}
