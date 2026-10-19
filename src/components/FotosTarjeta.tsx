"use client";

import Link from "next/link";
import { useState } from "react";
import Foto from "./Foto";
import { PISTA, PuntosCarrusel, useCarrusel } from "./carrusel";

const SIZES = "(min-width: 1024px) 280px, (min-width: 768px) 33vw, 50vw";

/**
 * Fotos de una tarjeta del catálogo en carrusel: se deslizan con el dedo (o con flechas al pasar el mouse)
 * y un toque abre la prenda. Las flechas van fuera del enlace porque un botón no puede ir dentro de un <a>.
 */
export default function FotosTarjeta({ fotos, titulo, href }: { fotos: string[]; titulo: string; href: string }) {
  const { pista, actual, irA } = useCarrusel();
  // Hasta que se toca o se apunta la tarjeta solo se baja la primera foto, para no cargar todo el catálogo de una vez
  const [tocada, setTocada] = useState(false);

  if (fotos.length <= 1) {
    return (
      <Link href={href} tabIndex={-1} className="block">
        <Foto src={fotos[0]} alt={titulo} className="aspect-[4/5] w-full transition group-hover:scale-[1.02]" sizes={SIZES} />
      </Link>
    );
  }

  const flecha =
    "absolute top-1/2 hidden h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-crema/90 text-lg text-cafe opacity-0 shadow-sm transition hover:bg-white group-hover:opacity-100 focus-visible:opacity-100 pointer-fine:flex";

  return (
    <div className="relative" onPointerEnter={() => setTocada(true)} onFocus={() => setTocada(true)}>
      <Link href={href} tabIndex={-1} className="block transition group-hover:scale-[1.02]">
        <div ref={pista} className={PISTA}>
          {fotos.map((f, i) => (
            <div key={f} className="w-full shrink-0 snap-center bg-arena">
              {i === 0 || tocada ? (
                <Foto
                  src={f}
                  alt={i === 0 ? titulo : `${titulo} foto ${i + 1}`}
                  className="aspect-[4/5] w-full"
                  sizes={SIZES}
                  loading={i > 0 && Math.abs(i - actual) <= 1 ? "eager" : undefined}
                />
              ) : (
                <div className="aspect-[4/5] w-full" />
              )}
            </div>
          ))}
        </div>
      </Link>

      {actual > 0 && (
        <button type="button" onClick={() => irA(actual - 1)} aria-label="Foto anterior" className={`${flecha} left-2`}>
          ‹
        </button>
      )}
      {actual < fotos.length - 1 && (
        <button type="button" onClick={() => irA(actual + 1)} aria-label="Foto siguiente" className={`${flecha} right-2`}>
          ›
        </button>
      )}

      <PuntosCarrusel total={fotos.length} actual={actual} />
    </div>
  );
}
