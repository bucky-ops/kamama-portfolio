import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // standalone output is for the local/sandbox production server only;
  // on Vercel the platform's own Next.js output handling is used.
  ...(process.env.VERCEL ? {} : { output: "standalone" as const }),
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
};

export default nextConfig;
