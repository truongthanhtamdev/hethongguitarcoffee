import { videoKind } from "@/lib/curriculum";

/**
 * Khung video 16:9 dùng chung cho bài giảng. Nhận link YouTube hoặc file video
 * trực tiếp; link không nhận ra thì không vẽ gì cả, tránh để khung đen trống.
 */
export default function VideoPlayer({ url, title }: { url: string; title: string }) {
  const video = videoKind(url);
  if (!video) return null;

  return (
    <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black">
      {video.kind === "youtube" ? (
        <iframe
          className="absolute inset-0 w-full h-full"
          src={`https://www.youtube-nocookie.com/embed/${video.id}?rel=0&modestbranding=1&playsinline=1&iv_load_policy=3`}
          title={`Video bài giảng: ${title}`}
          allow="accelerometer; clipboard-write; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
          loading="lazy"
        />
      ) : (
        <video
          className="absolute inset-0 w-full h-full"
          src={url}
          controls
          playsInline
          preload="metadata"
        />
      )}
    </div>
  );
}
