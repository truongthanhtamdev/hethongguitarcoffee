"use client";

import { useState, useTransition } from "react";
import {
  ganTaiKhoanChoDonAction,
  huyDonKhoaHocAction,
  xacNhanDaThuTienAction,
} from "@/actions/courses";
import { btn } from "@/components/ui";

export default function DonKhoaHocActions({
  id,
  status,
  coTaiKhoan,
  phone,
}: {
  id: number;
  status: string;
  coTaiKhoan: boolean;
  phone: string;
}) {
  const [pending, start] = useTransition();
  const [loi, setLoi] = useState<string>();

  if (status !== "new") return null;

  return (
    <div className="flex flex-col items-end gap-1.5">
      <div className="flex flex-wrap gap-2 justify-end">
        {!coTaiKhoan && (
          <button
            type="button"
            disabled={pending}
            title={`Tìm tài khoản học viên dùng số ${phone}`}
            className={`${btn.ghost} px-3 py-1.5 text-xs`}
            onClick={() =>
              start(async () => {
                const kq = await ganTaiKhoanChoDonAction(id);
                setLoi(kq.error);
              })
            }
          >
            Gắn tài khoản
          </button>
        )}
        <button
          type="button"
          disabled={pending}
          className={`${btn.primary} px-3 py-1.5 text-xs`}
          onClick={() =>
            start(async () => {
              const kq = await xacNhanDaThuTienAction(id);
              setLoi(kq.error);
            })
          }
        >
          {pending ? "Đang lưu..." : "Đã thu tiền"}
        </button>
        <button
          type="button"
          disabled={pending}
          className={`${btn.ghost} px-3 py-1.5 text-xs`}
          onClick={() => start(() => void huyDonKhoaHocAction(id))}
        >
          Huỷ
        </button>
      </div>
      {loi && <p className="text-xs text-coral-700 max-w-[18rem] text-right">{loi}</p>}
    </div>
  );
}
