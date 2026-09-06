import { requireRole } from "@/lib/guard";
import { listLearnedChords } from "@/lib/learning";
import { CHORDS } from "@/lib/curriculum";
import { PageHeader } from "@/components/ui";
import ChordLibrary from "./chord-library";

export default async function StudentChordsPage() {
  const session = await requireRole(["student"]);
  const learned = listLearnedChords(session.userId);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Thư viện hợp âm"
        subtitle={`Chạm vào hợp âm để nghe tiếng đàn mẫu và xem thế bấm. Bạn đã thuộc ${learned.length}/${CHORDS.length} hợp âm.`}
      />
      <ChordLibrary learned={learned} />
    </div>
  );
}
