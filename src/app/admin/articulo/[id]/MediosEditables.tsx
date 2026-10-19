"use client";
import { useState, useTransition } from "react";
import Foto from "@/components/Foto";
import { crearClienteNavegador } from "@/lib/supabase/client";
import { agregarFotos, agregarVideos, quitarFoto, quitarVideo } from "../../acciones";

// Límite por archivo de Supabase Storage en el plan gratis
const MAX_MB = 50;

const TIPOS = {
  fotos: {
    singular: "foto",
    accept: "image/*",
    tipoPorDefecto: "image/jpeg",
    ayuda: "Se suben al elegirlas, sin apretar Guardar. La primera es la portada.",
    agregar: agregarFotos,
    quitar: quitarFoto,
  },
  videos: {
    singular: "video",
    accept: "video/*",
    tipoPorDefecto: "video/mp4",
    ayuda: `Se suben al elegirlos, sin apretar Guardar. Máximo ${MAX_MB} MB cada uno; en la ficha van después de la portada.`,
    agregar: agregarVideos,
    quitar: quitarVideo,
  },
};

/**
 * Fotos o videos de la prenda. Se suben directo del navegador al bucket (con la sesión de la admin),
 * en el orden en que se eligen, porque una server action en Vercel no acepta cuerpos de más de 4,5 MB;
 * después `agregarFotos`/`agregarVideos` los anota en la prenda.
 */
export default function MediosEditables({ id, tipo, urls }: { id: string; tipo: "fotos" | "videos"; urls: string[] }) {
  const t = TIPOS[tipo];
  const [pendiente, iniciar] = useTransition();
  const [aviso, setAviso] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function subir(archivos: File[]) {
    setError(null);
    const pesados = archivos.filter((f) => f.size > MAX_MB * 1024 * 1024);
    if (pesados.length) {
      setError(`${pesados.map((f) => f.name).join(", ")} pesa más de ${MAX_MB} MB.`);
      return;
    }

    const supabase = crearClienteNavegador();
    const rutas: string[] = [];
    try {
      for (const [i, f] of archivos.entries()) {
        setAviso(`Subiendo ${t.singular} ${i + 1} de ${archivos.length}…`);
        const ext = f.name.split(".").pop()?.toLowerCase() || t.tipoPorDefecto.split("/")[1];
        const ruta = `${id}/${crypto.randomUUID()}.${ext}`;
        const { error } = await supabase.storage
          .from("fotos")
          .upload(ruta, f, { contentType: f.type || t.tipoPorDefecto, cacheControl: "31536000" });
        if (error) throw new Error(`No se pudo subir ${f.name}: ${error.message}`);
        rutas.push(ruta);
      }
      setAviso("Guardando…");
      await t.agregar(id, rutas);
    } catch (e) {
      // Que no queden archivos huérfanos en el bucket
      if (rutas.length) await supabase.storage.from("fotos").remove(rutas);
      setError(e instanceof Error ? e.message : "No se pudo subir");
    } finally {
      setAviso(null);
    }
  }

  const ocupado = pendiente || aviso !== null;

  return (
    <div className="space-y-3">
      {urls.length > 0 && (
        <div className="grid grid-cols-4 gap-3">
          {urls.map((u, i) => (
            <div key={u} className="relative">
              {tipo === "fotos" ? (
                <Foto src={u} alt={`Foto ${i + 1}`} className="aspect-square w-full rounded-xl" sizes="200px" />
              ) : (
                <video
                  src={`${u}#t=0.1`}
                  preload="metadata"
                  muted
                  playsInline
                  aria-label={`Video ${i + 1}`}
                  className="aspect-square w-full rounded-xl bg-arena object-cover"
                />
              )}
              <button
                type="button"
                disabled={ocupado}
                onClick={() => confirm(`¿Quitar este ${t.singular}?`) && iniciar(() => t.quitar(id, u))}
                className="absolute right-1 top-1 rounded-full bg-white/90 px-2 text-xs text-rosa shadow"
              >
                ✕
              </button>
              {tipo === "fotos" && i === 0 && (
                <span className="absolute bottom-1 left-1 rounded bg-white/90 px-1.5 text-[10px]">Portada</span>
              )}
              {tipo === "videos" && <span className="absolute bottom-1 left-1 rounded bg-white/90 px-1.5 text-[10px]">▶ Video</span>}
            </div>
          ))}
        </div>
      )}

      <label className="block space-y-1">
        <span className="text-xs font-medium uppercase tracking-wide text-cafe/90">Agregar {tipo}</span>
        <input
          type="file"
          accept={t.accept}
          multiple
          disabled={ocupado}
          onChange={(e) => {
            const archivos = Array.from(e.target.files ?? []);
            e.target.value = "";
            if (archivos.length) subir(archivos);
          }}
          className="block w-full text-sm"
        />
        <span className="block text-xs text-cafe/90">{t.ayuda}</span>
      </label>

      {aviso && <p className="text-sm text-cafe">{aviso}</p>}
      {error && <p className="text-sm text-rosa">{error}</p>}
    </div>
  );
}
