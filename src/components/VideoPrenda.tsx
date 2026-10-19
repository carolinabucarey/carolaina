"use client";

import { useEffect, useRef } from "react";

/**
 * Video de una prenda dentro del carrusel: se reproduce en silencio y en bucle mientras es el que se ve
 * y se pausa al deslizar a otra foto. Antes de eso solo baja los metadatos y el primer cuadro (`#t=0.1`),
 * que hace de portada también en Safari del iPhone.
 */
export default function VideoPrenda({
  src,
  activo,
  etiqueta,
  className = "",
}: {
  src: string;
  activo: boolean;
  etiqueta: string;
  className?: string;
}) {
  const video = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = video.current;
    if (!v) return;
    if (activo && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
      // Si el navegador no deja reproducir solo, quedan los controles para darle play
      v.play().catch(() => {});
    } else {
      v.pause();
    }
  }, [activo]);

  return (
    <video
      ref={video}
      src={`${src}#t=0.1`}
      muted
      loop
      playsInline
      controls
      preload="metadata"
      aria-label={etiqueta}
      className={`bg-arena object-cover ${className}`}
    />
  );
}
