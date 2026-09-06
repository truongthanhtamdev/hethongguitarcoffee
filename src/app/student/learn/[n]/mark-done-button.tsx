"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toggleLessonAction } from "@/actions/learning";
import { btn } from "@/components/ui";
import { IconCheckCircle } from "@/components/icons";

export default function MarkDoneButton({
  lessonNo,
  done,
  nextLessonNo,
}: {
  lessonNo: number;
  done: boolean;
  nextLessonNo: number | null;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function toggle() {
    startTransition(async () => {
      await toggleLessonAction(lessonNo, !done);
      // Vừa đánh dấu xong thì đi tiếp buổi sau luôn cho liền mạch; còn khi bỏ
      // đánh dấu thì ở lại để người học thấy trạng thái vừa đổi.
      if (!done && nextLessonNo) router.push(`/student/learn/${nextLessonNo}`);
      else router.refresh();
    });
  }

  return (
    <button
      onClick={toggle}
      disabled={pending}
      className={`${done ? btn.danger : btn.primary} w-full py-3.5 text-base`}
    >
      {pending ? (
        "Đang lưu..."
      ) : done ? (
        "Bỏ đánh dấu hoàn thành"
      ) : (
        <>
          <IconCheckCircle className="w-5 h-5" />
          Đánh dấu đã học xong
        </>
      )}
    </button>
  );
}
