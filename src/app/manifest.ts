import type { MetadataRoute } from "next";
import { EMPRESA } from "@/lib/empresa";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: EMPRESA.marca,
    short_name: "El Ropero",
    description: "Ropa de segunda mano por ofertas. Envíos a todo Chile.",
    start_url: "/",
    display: "standalone",
    background_color: "#f8f3ec",
    theme_color: "#6b4f3a",
    lang: "es-CL",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
