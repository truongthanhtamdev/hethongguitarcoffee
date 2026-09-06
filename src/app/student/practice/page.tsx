import { requireRole } from "@/lib/guard";
import { STRUM_STYLES } from "@/lib/curriculum";
import { PageHeader } from "@/components/ui";
import PracticeTools, { type Tool } from "./practice-tools";

const TOOLS: Tool[] = ["metro", "tuner", "strum"];

export default async function StudentPracticePage({
  searchParams,
}: {
  searchParams: Promise<{ bpm?: string; tool?: string; style?: string }>;
}) {
  await requireRole(["student"]);
  const { bpm, tool, style } = await searchParams;

  const parsedBpm = Number(bpm);
  const initialBpm =
    Number.isFinite(parsedBpm) && parsedBpm >= 40 && parsedBpm <= 200
      ? Math.round(parsedBpm)
      : 70;

  const initialTool = TOOLS.includes(tool as Tool) ? (tool as Tool) : "metro";
  const initialStyle = STRUM_STYLES.some((s) => s.id === style)
    ? (style as string)
    : STRUM_STYLES[0].id;

  return (
    <div className="space-y-5">
      <PageHeader
        title="Luyện tập"
        subtitle="Metronome, lên dây đàn bằng mic và máy đệm hát — chạy thẳng trong trình duyệt, không cần cài gì."
      />
      <PracticeTools
        initialBpm={initialBpm}
        initialTool={initialTool}
        initialStyle={initialStyle}
      />
    </div>
  );
}
