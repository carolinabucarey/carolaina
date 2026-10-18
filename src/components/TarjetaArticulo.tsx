import Link from "next/link";
import type { Articulo } from "@/lib/tipos";
import { estadoEfectivo, pesos } from "@/lib/formato";
import CuentaRegresiva from "./CuentaRegresiva";
import EtiquetaEstado from "./EtiquetaEstado";
import Foto from "./Foto";

export default function TarjetaArticulo({ a }: { a: Articulo }) {
  const estado = estadoEfectivo(a);
  const cerrado = estado === "adjudicado" || estado === "vendido_directo";
  return (
    <Link
      href={`/articulo/${a.slug}`}
      className={`group block overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-arena transition hover:shadow-md ${cerrado ? "opacity-70" : ""}`}
    >
      <div className="relative">
        <Foto
          src={a.fotos[0]}
          alt={a.titulo}
          className="aspect-[4/5] w-full transition group-hover:scale-[1.02]"
          sizes="(min-width: 1024px) 280px, (min-width: 768px) 33vw, 50vw"
        />
        <div className="absolute left-3 top-3">
          <EtiquetaEstado estado={estado} />
        </div>
      </div>
      <div className="space-y-1 p-4">
        <h3 className="line-clamp-2 font-serif text-base leading-snug">{a.titulo}</h3>
        <p className="text-xs text-cafe/90">
          {[a.marca, a.talla && `Talla ${a.talla}`].filter(Boolean).join(" · ") || a.categoria}
        </p>
        <div className="flex items-end justify-between pt-2 text-sm">
          <div>
            <p className="text-xs text-cafe/90">
              {cerrado ? "Precio final" : a.oferta_actual == null ? "Oferta mínima" : "Oferta actual"}
            </p>
            <p className="font-semibold">
              {pesos(cerrado ? a.monto_final : (a.oferta_actual ?? a.precio_minimo))}
            </p>
          </div>
          {estado === "cuenta_regresiva" && a.cierre_at ? (
            <CuentaRegresiva cierre={a.cierre_at} className="font-mono text-sm text-rosa" />
          ) : (
            <p className="text-xs text-cafe/90">{a.total_ofertas} ofertas</p>
          )}
        </div>
      </div>
    </Link>
  );
}
