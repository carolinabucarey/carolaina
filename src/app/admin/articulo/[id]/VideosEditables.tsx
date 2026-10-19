"use client";
import { useState, useTransition } from "react";
import { crearClienteNavegador } from "@/lib/supabase/client";
import { agregarVideos, quitarVideo } from "../../acciones";

// Límite por archivo de Supabase Storage en el plan gratis
const MAX_MB = 50;

/**
 * Videos de la prenda. Se suben directo del navegador al bucket (con la sesión de la admin)
 * porque la server action del formulario no acepta archivos de más de 4,5 MB en Vercel;
 * después `agregarVideos` los anota en la prenda.
 */
export default function VideosEditables({ id, videos }: { id: string; videos: string[] }) {
  const [pendiente, iniciar] = useTransition();
  const [aviso, setAviso] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function subir(archivos: File[]) {
    setError(null);
    const pesados = archivos.filter((f) => f.size > MAX_MB * 1024 * 1024);
    if (pesados.length) {
      setError(`${pesados.map((f) => f.name).join(", ")} pesa más de ${MAX_MB} MB. Recórtalo o grábalo en 1080p.`);
      return;
    }

    const supabase = crearClienteNavegador();
    const rutas: string[] = [];
    try {
      for (const [i, f] of archivos.entries()) {
        setAviso(`Subiendo video ${i + 1} de ${archivos.length}…`);
        const ext = f.name.split(".").pop()?.toLowerCase() || "mp4";
        const ruta = `${id}/${crypto.randomUUID()}.${ext}`;
        const { error } = await supabase.storage
          .from("fotos")
          .upload(ruta, f, { contentType: f.type || "video/mp4", cacheControl: "31536000" });
        if (error) throw new Error(`No se pudo subir ${f.name}: ${error.message}`);
        rutas.push(ruta);
      }
      setAviso("Guardando…");
      await agregarVideos(id, rutas);
    } catch (e) {
      // Que no queden archivos huérfanos en el bucket
      if (rutas.length) await supabase.storage.from("fotos").remove(rutas);
      setError(e instanceof Error ? e.message : "No se pudieron subir los videos");
    } finally {
      setAviso(null);
    }
  }

  const ocupado = pendiente || aviso !== null;

  return (
    <div className="space-y-3">
      {videos.length > 0 && (
        <div className="grid grid-cols-4 gap-3">
          {videos.map((v, i) => (
            <div key={v} className="relative">
              <video
                src={`${v}#t=0.1`}
                preload="metadata"
                muted
                playsInline
                aria-label={`Video ${i + 1}`}
                className="aspect-square w-full rounded-xl bg-arena object-cover"
              />
              <span className="absolute bottom-1 left-1 rounded bg-white/90 px-1.5 text-[10px]">▶ Video</span>
              <button
                type="button"
                disabled={ocupado}
                onClick={() => confirm("¿Quitar este video?") && iniciar(() => quitarVideo(id, v))}
                className="absolute right-1 top-1 rounded-full bg-white/90 px-2 text-xs text-rosa shadow"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      <label className="block space-y-1">
        <span className="text-xs font-medium uppercase tracking-wide text-cafe/90">Agregar videos</span>
        <input
          type="file"
          accept="video/*"
          multiple
          disabled={ocupado}
          onChange={(e) => {
            const archivos = Array.from(e.target.files ?? []);
            e.target.value = "";
            if (archivos.length) subir(archivos);
          }}
          className="text-sm"
        />
        <span className="block text-xs text-cafe/90">
          Se suben al elegirlos, sin apretar Guardar. Máximo {MAX_MB} MB cada uno; en la ficha van después de la portada.
        </span>
      </label>

      {aviso && <p className="text-sm text-cafe">{aviso}</p>}
      {error && <p className="text-sm text-rosa">{error}</p>}
    </div>
  );
}
