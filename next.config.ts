import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: { bodySizeLimit: "15mb" }, // subida de fotos desde /admin
  },
};

export default nextConfig;
