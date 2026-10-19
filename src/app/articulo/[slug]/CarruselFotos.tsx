"use client";

import Foto from "@/components/Foto";
import { PISTA, PuntosCarrusel, useCarrusel } from "@/components/carrusel";

/**
 * Fotos de la prenda en carrusel: en el celular se desliza con el dedo,
 * en el computador se avanza con las flechas o tocando una miniatura.
 */
export default function CarruselFotos({ fotos, titulo }: { fotos: string[]; titulo: string }) {
  const { pista, actual, irA } = useCarrusel();

  if (fotos.length <= 1) {
    return (
      <Foto src={fotos[0]} alt={titulo} className="aspect-[4/5] w-full rounded-3xl" sizes="(min-width: 1024px) 600px, 100vw" priority />
    );
  }

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
          {fotos.map((f, i) => (
            <div key={f} className="w-full shrink-0 snap-center bg-arena" aria-label={`Foto ${i + 1} de ${fotos.length}`}>
              <Foto
                src={f}
                alt={i === 0 ? titulo : `${titulo} foto ${i + 1}`}
                className="aspect-[4/5] w-full"
                sizes="(min-width: 1024px) 600px, 100vw"
                priority={i === 0}
                // Las vecinas se cargan antes de llegar a ellas, para que no aparezcan en blanco al deslizar
                loading={i > 0 && Math.abs(i - actual) <= 1 ? "eager" : undefined}
              />
            </div>
          ))}
        </div>

        {actual > 0 && (
          <button type="button" onClick={() => irA(actual - 1)} aria-label="Foto anterior" className={`${flecha} left-3`}>
            ‹
          </button>
        )}
        {actual < fotos.length - 1 && (
          <button type="button" onClick={() => irA(actual + 1)} aria-label="Foto siguiente" className={`${flecha} right-3`}>
            ›
          </button>
        )}

        <PuntosCarrusel total={fotos.length} actual={actual} className="lg:hidden" />
      </div>

      <div className="hidden grid-cols-5 gap-3 lg:grid">
        {fotos.map((f, i) => (
          <button
            key={f}
            type="button"
            onClick={() => irA(i)}
            aria-label={`Ver foto ${i + 1}`}
            aria-current={i === actual}
            className={`overflow-hidden rounded-xl ring-2 transition ${i === actual ? "ring-cafe" : "ring-transparent opacity-70 hover:opacity-100"}`}
          >
            <Foto src={f} alt="" className="aspect-square w-full" sizes="120px" />
          </button>
        ))}
      </div>
    </div>
  );
}
