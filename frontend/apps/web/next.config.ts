import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  transpilePackages: ["@repo/api", "@repo/auth", "@repo/quiz", "@repo/ui"],
  outputFileTracingRoot: path.join(__dirname, "../.."),
};

export default nextConfig;
