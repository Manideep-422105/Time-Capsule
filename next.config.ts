import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb', // Increase this to 50mb if you plan on longer videos
    },
  },
};

export default nextConfig;
