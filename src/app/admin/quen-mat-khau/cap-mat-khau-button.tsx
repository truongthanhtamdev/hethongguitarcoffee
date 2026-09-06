"use client";

import { useState, useTransition } from "react";
import { capMatKhauTamAction, huyYeuCauAction } from "@/actions/password-reset";
import { btn } from "@/components/ui";

export default function CapMatKhauButton({
  id,
  status,
  coTaiKhoan,
}: {
  id: number;
  status: string;
  coTaiKhoan: boolean;
}) {
  const [pending, start] = useTransition();
  const [matKhau, setMatKhau] = useState<string>();
  const [loi, setLoi] = useState<string>();

  // Mật khẩu chỉ hiện đúng một lần ở đây; đóng trang là mất, trong cơ sở dữ
  // liệu chỉ còn bản băm.
  if (matKhau) {
    return (
      <div className="text-left rounded-xl border border-mint-300 bg-mint-50 p-3 inline-block">
        <p className="text-xs text-ink-600">Đọc mật khẩu tạm này cho khách:</p>
        <p className="text-xl font-bold tabular tracking-wider text-mint-700 select-all">
          {matKhau}
        </p>
        <p className="text-xs text-ink-500 mt-1 max-w-[16rem]">
          Chỉ hiện một lần. Nhắc khách vào Tài khoản → Đổi mật khẩu ngay sau khi đăng nhập.
        </p>
      </div>
    );
  }

  // Sau khi cấp xong, revalidate vẽ lại cả hàng. Component phải luôn được
  // render (kể cả khi yêu cầu đã xử lý) thì state mới sống sót để mật khẩu
  // kịp hiện ra — không thì bấm xong là mất luôn, không đọc được cho khách.
  if (status !== "new") return null;

  return (
    <div className="flex flex-col items-end gap-1.5">
      <div className="flex gap-2 justify-end">
        <button
          type="button"
          disabled={pending || !coTaiKhoan}
          className={`${btn.primary} px-3 py-1.5 text-xs disabled:opacity-50`}
          onClick={() =>
            start(async () => {
              const kq = await capMatKhauTamAction(id);
              if (kq.error) setLoi(kq.error);
              else setMatKhau(kq.matKhau);
            })
          }
        >
          {pending ? "Đang cấp..." : "Cấp mật khẩu tạm"}
        </button>
        <button
          type="button"
          disabled={pending}
          className={`${btn.ghost} px-3 py-1.5 text-xs`}
          onClick={() => start(() => void huyYeuCauAction(id))}
        >
          Bỏ qua
        </button>
      </div>
      {loi && <p className="text-xs text-coral-700 max-w-[16rem] text-right">{loi}</p>}
    </div>
  );
}
