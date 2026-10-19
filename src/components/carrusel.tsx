"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Carrusel de fotos con scroll-snap nativo (se desliza con el dedo, sin librerías):
 * `pista` va en el contenedor que se desplaza, `actual` es la foto que se ve e `irA` salta a otra.
 */
export function useCarrusel() {
  const pista = useRef<HTMLDivElement>(null);
  const [actual, setActual] = useState(0);

  useEffect(() => {
    const el = pista.current;
    if (!el) return;
    const alDesplazar = () => setActual(Math.round(el.scrollLeft / el.clientWidth));
    el.addEventListener("scroll", alDesplazar, { passive: true });
    return () => el.removeEventListener("scroll", alDesplazar);
  }, []);

  const irA = (i: number) => {
    const el = pista.current;
    if (el) el.scrollTo({ left: i * el.clientWidth, behavior: "smooth" });
  };

  return { pista, actual, irA };
}

/** Clases de la pista: una foto a la vez, encajada, sin barra de desplazamiento visible. Cada foto lleva `w-full shrink-0 snap-center`. */
export const PISTA =
  "flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden";

/** Puntos sobre el borde inferior de la foto que indican cuál se está viendo. */
export function PuntosCarrusel({ total, actual, className = "" }: { total: number; actual: number; className?: string }) {
  return (
    <div className={`pointer-events-none absolute inset-x-0 bottom-3 flex justify-center gap-1 overflow-hidden px-3 ${className}`}>
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          className={`h-1.5 shrink-0 rounded-full bg-white shadow transition-all ${i === actual ? "w-4" : "w-1.5 opacity-60"}`}
        />
      ))}
    </div>
  );
}
