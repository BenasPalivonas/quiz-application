import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  transpilePackages: ["@repo/api", "@repo/auth", "@repo/quiz", "@repo/ui"],
};

export default nextConfig;
