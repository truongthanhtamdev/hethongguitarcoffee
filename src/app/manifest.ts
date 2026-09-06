import type { MetadataRoute } from "next";

/**
 * Manifest để học viên "Thêm vào màn hình chính" là dùng như một app: mở
 * toàn màn hình, có icon riêng, không còn thanh địa chỉ của trình duyệt.
 *
 * Mở thẳng vào /student/learn thay vì trang chủ, vì người cài app lên máy
 * gần như luôn là học viên muốn học tiếp buổi kế tiếp.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Piano Guitar Đệm Hát",
    short_name: "Guitar Đệm Hát",
    description:
      "Học guitar đệm hát theo lộ trình 36 buổi: hợp âm, metronome, lên dây đàn và máy đệm hát.",
    lang: "vi",
    start_url: "/student/learn",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#faf9f6",
    theme_color: "#17212b",
    categories: ["education", "music"],
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "Lộ trình 36 buổi", url: "/student/learn" },
      { name: "Thư viện hợp âm", url: "/student/chords" },
      { name: "Luyện tập", url: "/student/practice" },
    ],
  };
}
