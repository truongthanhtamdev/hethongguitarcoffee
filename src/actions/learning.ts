"use server";

import { revalidatePath } from "next/cache";
import { assertRole } from "@/lib/guard";
import { lessonByNo, CHORD_BY_NAME } from "@/lib/curriculum";
import { addPracticeMinutes, setChordLearned, setLessonDone } from "@/lib/learning";

function revalidateLearning() {
  revalidatePath("/student");
  revalidatePath("/student/learn");
  revalidatePath("/student/chords");
  revalidatePath("/student/practice");
}

/**
 * Đánh dấu xong / bỏ đánh dấu một buổi. Khi đánh dấu xong, các hợp âm mới của
 * buổi đó được ghi luôn vào danh sách "đã thuộc" và cộng 30 phút luyện tập —
 * đúng thời lượng một buổi học ở trung tâm.
 */
export async function toggleLessonAction(lessonNo: number, done: boolean) {
  const session = await assertRole(["student"]);
  const lesson = lessonByNo(lessonNo);
  if (!lesson) return;

  setLessonDone(session.userId, lessonNo, done);
  if (done) {
    for (const chord of lesson.chords) {
      if (CHORD_BY_NAME[chord]) setChordLearned(session.userId, chord, true);
    }
    addPracticeMinutes(session.userId, 30);
  }
  revalidateLearning();
}

export async function toggleChordAction(chord: string, learned: boolean) {
  const session = await assertRole(["student"]);
  if (!CHORD_BY_NAME[chord]) return;
  setChordLearned(session.userId, chord, learned);
  revalidateLearning();
}

/** Ghi nhận thời gian luyện tập. Giới hạn 180 phút một lần gọi để tránh số rác. */
export async function logPracticeAction(minutes: number) {
  const session = await assertRole(["student"]);
  const safe = Number.isFinite(minutes) ? Math.min(180, Math.max(0, Math.round(minutes))) : 0;
  addPracticeMinutes(session.userId, safe);
  revalidateLearning();
}
