"use client";

import Foto from "@/components/Foto";
import VideoPrenda from "@/components/VideoPrenda";
import { PISTA, PuntosCarrusel, useCarrusel } from "@/components/carrusel";

type Medio = { tipo: "foto" | "video"; src: string };

/**
 * Fotos y videos de la prenda en carrusel: en el celular se desliza con el dedo,
 * en el computador se avanza con las flechas o tocando una miniatura.
 * Los videos van justo después de la portada, que siempre es una foto.
 */
export default function CarruselFotos({ fotos, videos = [], titulo }: { fotos: string[]; videos?: string[]; titulo: string }) {
  const { pista, actual, irA } = useCarrusel();

  if (fotos.length <= 1 && videos.length === 0) {
    return (
      <Foto src={fotos[0]} alt={titulo} className="aspect-[4/5] w-full rounded-3xl" sizes="(min-width: 1024px) 600px, 100vw" priority />
    );
  }

  const medios: Medio[] = [
    ...fotos.slice(0, 1).map((src) => ({ tipo: "foto" as const, src })),
    ...videos.map((src) => ({ tipo: "video" as const, src })),
    ...fotos.slice(1).map((src) => ({ tipo: "foto" as const, src })),
  ];
  let nFoto = 0;
  let nVideo = 0;
  const nombres = medios.map((m) => (m.tipo === "foto" ? `foto ${++nFoto}` : `video ${++nVideo}`));

  const flecha =
    "absolute top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-crema/90 text-xl text-cafe shadow-sm transition hover:bg-white lg:flex";

  return (
    <div className="min-w-0 space-y-3" role="region" aria-roledescription="carrusel" aria-label={`Fotos de ${titulo}`}>
      <div className="relative">
        <div
          ref={pista}
          tabIndex={0}
          className={`${PISTA} rounded-3xl outline-none focus-visible:ring-2 focus-visible:ring-cafe`}
        >
          {medios.map((m, i) => (
            <div key={m.src} className="w-full shrink-0 snap-center bg-arena" aria-label={`${i + 1} de ${medios.length}`}>
              {m.tipo === "video" ? (
                <VideoPrenda src={m.src} activo={i === actual} etiqueta={`${titulo} ${nombres[i]}`} className="aspect-[4/5] w-full" />
              ) : (
                <Foto
                  src={m.src}
                  alt={i === 0 ? titulo : `${titulo} ${nombres[i]}`}
                  className="aspect-[4/5] w-full"
                  sizes="(min-width: 1024px) 600px, 100vw"
                  priority={i === 0}
                  // Las vecinas se cargan antes de llegar a ellas, para que no aparezcan en blanco al deslizar
                  loading={i > 0 && Math.abs(i - actual) <= 1 ? "eager" : undefined}
                />
              )}
            </div>
          ))}
        </div>

        {actual > 0 && (
          <button type="button" onClick={() => irA(actual - 1)} aria-label="Anterior" className={`${flecha} left-3`}>
            ‹
          </button>
        )}
        {actual < medios.length - 1 && (
          <button type="button" onClick={() => irA(actual + 1)} aria-label="Siguiente" className={`${flecha} right-3`}>
            ›
          </button>
        )}

        {medios.length > 1 && <PuntosCarrusel total={medios.length} actual={actual} className="lg:hidden" />}
      </div>

      {medios.length > 1 && (
        <div className="hidden grid-cols-5 gap-3 lg:grid">
          {medios.map((m, i) => (
            <button
              key={m.src}
              type="button"
              onClick={() => irA(i)}
              aria-label={`Ver ${nombres[i]}`}
              aria-current={i === actual}
              className={`relative overflow-hidden rounded-xl ring-2 transition ${i === actual ? "ring-cafe" : "ring-transparent opacity-70 hover:opacity-100"}`}
            >
              {m.tipo === "video" ? (
                <>
                  <video src={`${m.src}#t=0.1`} preload="metadata" muted playsInline className="aspect-square w-full bg-arena object-cover" />
                  <span className="absolute inset-0 flex items-center justify-center text-2xl text-white drop-shadow">▶</span>
                </>
              ) : (
                <Foto src={m.src} alt="" className="aspect-square w-full" sizes="120px" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
