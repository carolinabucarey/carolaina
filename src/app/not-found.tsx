import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Página no encontrada",
  robots: { index: false },
};

export default function NoEncontrada() {
  return (
    <div className="mx-auto max-w-md space-y-4 py-16 text-center">
      <p className="font-serif text-5xl italic text-rosa">404</p>
      <h1 className="font-serif text-2xl text-cafe">No encontramos esta página</h1>
      <p className="text-sm text-cafe/90">
        Puede que la prenda ya no esté disponible o que el enlace tenga un error.
      </p>
      <div className="flex flex-wrap justify-center gap-3 pt-2">
        <Link href="/" className="boton">
          Ver las prendas
        </Link>
        <Link href="/preguntas-frecuentes" className="boton-secundario">
          Preguntas frecuentes
        </Link>
      </div>
    </div>
  );
}
