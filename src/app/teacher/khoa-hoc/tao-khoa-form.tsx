"use client";

import { useActionState } from "react";
import { taoKhoaAction, type CourseFormState } from "@/actions/teacher-courses";
import { btn, field } from "@/components/ui";

const initialState: CourseFormState = {};

export default function TaoKhoaForm() {
  const [state, formAction, pending] = useActionState(taoKhoaAction, initialState);

  return (
    <form action={formAction} className="flex flex-wrap gap-2">
      <input
        name="name"
        required
        className={`${field} flex-1 min-w-[14rem]`}
        placeholder="Ví dụ: Fingerstyle cho người mới"
      />
      <button type="submit" disabled={pending} className={`${btn.primary} px-4`}>
        {pending ? "Đang tạo..." : "Tạo khoá"}
      </button>
      {state?.error && <p className="w-full text-sm text-coral-700">{state.error}</p>}
    </form>
  );
}
