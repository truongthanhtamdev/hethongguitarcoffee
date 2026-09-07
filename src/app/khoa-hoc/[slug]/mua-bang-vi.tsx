"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { muaBangViAction } from "@/actions/wallet";
import { btn } from "@/components/ui";

export default function MuaBangVi({
  slug,
  gia,
  soDu,
  giaHienThi,
  soDuHienThi,
}: {
  slug: string;
  gia: number;
  soDu: number;
  giaHienThi: string;
  soDuHienThi: string;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [loi, setLoi] = useState<string>();

  const du = soDu >= gia;

  return (
    <div className="rounded-2xl border border-navy-100 bg-white p-5">
      <p className="font-bold text-ink-900">Mua bằng ví</p>
      <p className="text-sm text-ink-500 mt-1">
        Ví của bạn: <b className="tabular text-ink-900">{soDuHienThi}</b>
      </p>

      {du ? (
        <>
          <button
            type="button"
            disabled={pending}
            className={`${btn.primary} w-full py-3 mt-3`}
            onClick={() =>
              start(async () => {
                const kq = await muaBangViAction(slug);
                if (kq.error) setLoi(kq.error);
                else router.push("/student/khoa-hoc");
              })
            }
          >
            {pending ? "Đang xử lý..." : `Trừ ${giaHienThi} và học ngay`}
          </button>
          <p className="text-xs text-ink-400 mt-2">
            Trừ tiền xong là khoá mở ngay, không phải chờ ai duyệt.
          </p>
        </>
      ) : (
        <>
          <p className="text-sm text-ink-700 mt-2">
            Còn thiếu <b className="tabular">{giaHienThi}</b> − {soDuHienThi}. Nạp thêm rồi mua là
            mở khoá ngay.
          </p>
          <Link
            href="/student/vi"
            className={`${btn.primary} block text-center w-full py-3 mt-3 no-underline`}
          >
            Nạp tiền vào ví
          </Link>
        </>
      )}

      {loi && <p className="text-sm text-coral-700 mt-2">{loi}</p>}
    </div>
  );
}
