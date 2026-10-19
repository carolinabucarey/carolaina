import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Fotos de las prendas en Supabase Storage
    remotePatterns: [{ protocol: "https", hostname: "*.supabase.co", pathname: "/storage/v1/object/public/**" }],
  },
};

export default nextConfig;
