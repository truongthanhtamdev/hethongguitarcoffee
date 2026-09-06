import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Gói sẵn server tối thiểu vào .next/standalone để image Docker không phải
  // mang theo toàn bộ node_modules.
  output: "standalone",

  // better-sqlite3 là native addon, phải để Node require thẳng thay vì đưa
  // qua bundler.
  serverExternalPackages: ["better-sqlite3"],
};

export default nextConfig;
