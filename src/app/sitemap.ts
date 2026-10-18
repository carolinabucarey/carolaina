import type { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";
import { SITIO_URL } from "@/lib/empresa";
import { CATEGORIAS } from "@/lib/tipos";

export const revalidate = 3600;

async function articulosPublicados(): Promise<{ slug: string; updated_at: string }[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const clave = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !clave) return []; // p. ej., en un preview sin variables
  // Cliente anónimo sin cookies: el sitemap solo ve lo que ve el público.
  const supabase = createClient(url, clave, { auth: { persistSession: false } });
  const { data } = await supabase
    .from("articulos")
    .select("slug, updated_at")
    .in("estado", ["activo", "cuenta_regresiva", "adjudicado", "vendido_directo"]);
  return data ?? [];
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const data = await articulosPublicados();

  return [
    { url: SITIO_URL, changeFrequency: "daily", priority: 1 },
    ...CATEGORIAS.filter((c) => c !== "Otros").map((c) => ({
      url: `${SITIO_URL}/?categoria=${encodeURIComponent(c)}`,
      changeFrequency: "daily" as const,
      priority: 0.7,
    })),
    ...data.map((a) => ({
      url: `${SITIO_URL}/articulo/${a.slug}`,
      lastModified: a.updated_at,
      changeFrequency: "hourly" as const,
      priority: 0.8,
    })),
    { url: `${SITIO_URL}/preguntas-frecuentes`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITIO_URL}/terminos`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${SITIO_URL}/privacidad`, changeFrequency: "yearly", priority: 0.2 },
  ];
}
