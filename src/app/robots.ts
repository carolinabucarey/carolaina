import type { MetadataRoute } from "next";
import { SITIO_URL } from "@/lib/empresa";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/mis-ofertas", "/ingresar", "/auth", "/api"] },
    sitemap: `${SITIO_URL}/sitemap.xml`,
  };
}
