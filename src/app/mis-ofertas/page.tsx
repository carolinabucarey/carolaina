import Link from "next/link";
import { redirect } from "next/navigation";
import EtiquetaEstado from "@/components/EtiquetaEstado";
import { estadoEfectivo, pesos } from "@/lib/formato";
import { crearClienteServidor } from "@/lib/supabase/server";
import type { Articulo } from "@/lib/tipos";

export const dynamic = "force-dynamic";

export default async function MisOfertas() {
  const supabase = await crearClienteServidor();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/ingresar?volver=/mis-ofertas");

  const { data } = await supabase
    .from("ofertas")
    .select("monto, created_at, articulos(*)")
    .eq("usuario_id", user.id)
    .order("created_at", { ascending: false });

  // Una fila por artículo con mi mejor oferta
  const porArticulo = new Map<string, { a: Articulo; miMejor: number }>();
  for (const o of (data ?? []) as unknown as { monto: number; articulos: Articulo }[]) {
    const prev = porArticulo.get(o.articulos.id);
    if (!prev || o.monto > prev.miMejor) porArticulo.set(o.articulos.id, { a: o.articulos, miMejor: o.monto });
  }
  const { data: directas } = await supabase.from("articulos").select("*").eq("ganador_id", user.id).eq("estado", "vendido_directo");
  for (const a of (directas ?? []) as Articulo[]) porArticulo.set(a.id, { a, miMejor: a.monto_final ?? 0 });

  const filas = [...porArticulo.values()];

  return (
    <div className="space-y-6">
      <h1 className="font-serif text-3xl italic text-cafe">Mis ofertas</h1>
      {filas.length === 0 ? (
        <p className="text-sm text-cafe/70">
          Todavía no ofertas por nada. <Link href="/" className="text-rosa underline">Mira las prendas</Link>.
        </p>
      ) : (
        <ul className="divide-y divide-arena rounded-2xl bg-white ring-1 ring-arena">
          {filas.map(({ a, miMejor }) => {
            const estado = estadoEfectivo(a);
            const gane = a.ganador_id === user.id;
            const voyGanando = !gane && (estado === "activo" || estado === "cuenta_regresiva") && a.oferta_actual === miMejor;
            return (
              <li key={a.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                <div>
                  <Link href={`/articulo/${a.slug}`} className="font-medium hover:text-rosa">{a.titulo}</Link>
                  <p className="text-xs text-cafe/60">
                    Mi oferta {pesos(miMejor)} · Actual {pesos(a.oferta_actual)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {gane && <span className="rounded-full bg-salvia px-2.5 py-1 text-xs font-medium text-white">¡Ganaste!</span>}
                  {voyGanando && <span className="rounded-full bg-salvia/15 px-2.5 py-1 text-xs font-medium text-salvia">Vas ganando</span>}
                  <EtiquetaEstado estado={estado} />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
