import Link from "next/link";
import EtiquetaEstado from "@/components/EtiquetaEstado";
import Foto from "@/components/Foto";
import { estadoEfectivo, pesos } from "@/lib/formato";
import type { Articulo, EstadoArticulo } from "@/lib/tipos";
import { exigirAdmin } from "./guardia";

export const dynamic = "force-dynamic";

const PESTANAS: { clave: string; etiqueta: string; estados: EstadoArticulo[] }[] = [
  { clave: "vivas", etiqueta: "En subasta", estados: ["activo", "cuenta_regresiva"] },
  { clave: "coordinar", etiqueta: "Por coordinar", estados: ["adjudicado", "vendido_directo"] },
  { clave: "borradores", etiqueta: "Borradores", estados: ["borrador"] },
  { clave: "retirados", etiqueta: "Retirados", estados: ["retirado"] },
];

export default async function Admin({ searchParams }: { searchParams: Promise<{ ver?: string }> }) {
  const { ver = "vivas" } = await searchParams;
  const { supabase } = await exigirAdmin();
  const pestana = PESTANAS.find((p) => p.clave === ver) ?? PESTANAS[0];

  const { data: articulos } = await supabase
    .from("articulos")
    .select("*, articulos_minimo(precio_minimo)")
    .in("estado", pestana.estados)
    .order("updated_at", { ascending: false });

  const filas = (articulos ?? []) as (Articulo & { articulos_minimo: { precio_minimo: number } | null })[];

  const ganadores = new Map<string, { nombre: string | null; email: string | null; telefono: string | null; instagram: string | null }>();
  const ids = filas.map((a) => a.ganador_id).filter(Boolean) as string[];
  if (ids.length) {
    const { data } = await supabase.from("perfiles").select("id, nombre, email, telefono, instagram").in("id", ids);
    for (const p of data ?? []) ganadores.set(p.id, p);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-serif text-3xl italic text-cafe">Panel</h1>
        <Link href="/admin/articulo/nuevo" className="boton">+ Nuevo artículo</Link>
      </div>

      <div className="flex flex-wrap gap-2">
        {PESTANAS.map((p) => (
          <Link key={p.clave} href={`/admin?ver=${p.clave}`} className={`rounded-full px-4 py-1.5 text-sm ring-1 ring-lino ${p.clave === pestana.clave ? "bg-cafe text-crema" : "bg-white"}`}>
            {p.etiqueta}
          </Link>
        ))}
      </div>

      {filas.length === 0 ? (
        <p className="text-sm text-cafe/90">No hay artículos aquí.</p>
      ) : (
        <ul className="divide-y divide-arena overflow-hidden rounded-2xl bg-white ring-1 ring-arena">
          {filas.map((a) => {
            const g = a.ganador_id ? ganadores.get(a.ganador_id) : null;
            return (
              <li key={a.id}>
                <Link href={`/admin/articulo/${a.id}`} className="flex items-center gap-4 px-4 py-3 hover:bg-crema">
                  <Foto src={a.fotos[0]} alt={a.titulo} className="h-14 w-12 shrink-0 rounded-lg" sizes="48px" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{a.titulo}</p>
                    <p className="text-xs text-cafe/90">
                      Mínimo {pesos(a.articulos_minimo?.precio_minimo)} · Actual {pesos(a.oferta_actual)} · {a.total_ofertas} ofertas
                      {a.cierre_at && ` · cierra ${new Date(a.cierre_at).toLocaleString("es-CL", { dateStyle: "short", timeStyle: "short" })}`}
                    </p>
                    {g && (
                      <p className="text-xs text-salvia">
                        Ganadora: {g.nombre} · {g.email}
                        {g.telefono && ` · ${g.telefono}`}
                        {g.instagram && ` · @${g.instagram}`} · {pesos(a.monto_final)}
                      </p>
                    )}
                  </div>
                  <EtiquetaEstado estado={estadoEfectivo(a)} />
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
