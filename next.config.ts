import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Fotos de las prendas en Supabase Storage
    remotePatterns: [{ protocol: "https", hostname: "*.supabase.co", pathname: "/storage/v1/object/public/**" }],
  },
  experimental: {
    serverActions: { bodySizeLimit: "15mb" }, // subida de fotos desde /admin
  },
};

export default nextConfig;
