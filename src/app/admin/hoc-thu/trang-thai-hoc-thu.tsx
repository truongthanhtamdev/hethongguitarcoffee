"use client";

import { useTransition } from "react";
import { doiTrangThaiHocThuAction } from "@/actions/trial";
import { field } from "@/components/ui";

export default function TrangThaiHocThu({ id, status }: { id: number; status: string }) {
  const [pending, start] = useTransition();

  return (
    <select
      className={`${field} py-1.5 text-xs`}
      defaultValue={status}
      disabled={pending}
      onChange={(e) => start(() => void doiTrangThaiHocThuAction(id, e.target.value))}
    >
      <option value="new">Mới</option>
      <option value="contacted">Đã gọi</option>
      <option value="scheduled">Đã hẹn lịch</option>
      <option value="done">Đã học thử</option>
      <option value="cancelled">Đã huỷ</option>
    </select>
  );
}
