import Link from "next/link";
import { notFound } from "next/navigation";
import EtiquetaEstado from "@/components/EtiquetaEstado";
import { estadoEfectivo, pesos } from "@/lib/formato";
import { CATEGORIAS, type Articulo } from "@/lib/tipos";
import { guardarArticulo } from "../../acciones";
import { exigirAdmin } from "../../guardia";
import AccionesEstado from "./AccionesEstado";
import FotosEditables from "./FotosEditables";

export const dynamic = "force-dynamic";

export default async function EditarArticulo({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ guardado?: string }>;
}) {
  const { id } = await params;
  const { guardado } = await searchParams;
  const { supabase } = await exigirAdmin();

  let a: (Articulo & { articulos_minimo: { precio_minimo: number } | null }) | null = null;
  if (id !== "nuevo") {
    const { data } = await supabase.from("articulos").select("*, articulos_minimo(precio_minimo)").eq("id", id).maybeSingle();
    if (!data) notFound();
    a = data;
  }
  const estado = a ? estadoEfectivo(a) : null;
  const enJuego = estado === "cuenta_regresiva" || estado === "adjudicado" || estado === "vendido_directo";

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link href="/admin" className="text-sm text-cafe/90 hover:text-rosa">← Volver al panel</Link>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-serif text-3xl italic text-cafe">{a ? "Editar artículo" : "Nuevo artículo"}</h1>
        {a && estado && <EtiquetaEstado estado={estado} />}
      </div>

      {guardado && <p className="rounded-xl bg-salvia/15 px-3 py-2 text-sm text-salvia">Cambios guardados.</p>}

      {a && (
        <div className="rounded-2xl bg-white p-4 text-sm ring-1 ring-arena">
          <p>
            Oferta actual <strong>{pesos(a.oferta_actual)}</strong> · {a.total_ofertas} ofertas
            {a.cierre_at && <> · cierre {new Date(a.cierre_at).toLocaleString("es-CL")}</>}
            {a.monto_final && <> · precio final <strong>{pesos(a.monto_final)}</strong></>}
          </p>
          <div className="mt-3">
            <AccionesEstado id={a.id} estado={a.estado} slug={a.slug} />
          </div>
        </div>
      )}

      <form action={guardarArticulo} className="space-y-4 rounded-3xl bg-white p-6 ring-1 ring-arena">
        {a && <input type="hidden" name="id" value={a.id} />}
        <Campo etiqueta="Título">
          <input name="titulo" required defaultValue={a?.titulo} className="campo" />
        </Campo>
        <div className="grid gap-4 sm:grid-cols-3">
          <Campo etiqueta="Marca">
            <input name="marca" defaultValue={a?.marca ?? ""} className="campo" />
          </Campo>
          <Campo etiqueta="Talla">
            <input name="talla" defaultValue={a?.talla ?? ""} className="campo" />
          </Campo>
          <Campo etiqueta="Categoría">
            <select name="categoria" defaultValue={a?.categoria ?? "Vestidos"} className="campo">
              {CATEGORIAS.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </Campo>
        </div>
        <Campo etiqueta="Descripción">
          <textarea name="descripcion" rows={5} defaultValue={a?.descripcion ?? ""} className="campo" />
        </Campo>
        <div className="grid gap-4 sm:grid-cols-3">
          <Campo etiqueta="Oferta mínima (visible)" ayuda={enJuego ? "Ya hay ofertas: cambiarla no afecta esta venta." : "La primera oferta debe alcanzarla y abre las 24 h."}>
            <input name="precio_minimo" inputMode="numeric" defaultValue={a?.articulos_minimo?.precio_minimo ?? ""} className="campo" placeholder="15000" />
          </Campo>
          <Campo etiqueta="Venta directa (opcional)" ayuda="Disponible hasta la primera oferta.">
            <input name="precio_venta_directa" inputMode="numeric" defaultValue={a?.precio_venta_directa ?? ""} className="campo" placeholder="30000" />
          </Campo>
          <Campo etiqueta="Incremento mínimo">
            <input name="incremento_minimo" inputMode="numeric" defaultValue={a?.incremento_minimo ?? 1000} className="campo" />
          </Campo>
        </div>
        <Campo etiqueta="Publicación de Instagram">
          <input name="instagram_url" type="url" defaultValue={a?.instagram_url ?? ""} className="campo" placeholder="https://www.instagram.com/p/…" />
        </Campo>
        {a && a.fotos.length > 0 && <FotosEditables id={a.id} fotos={a.fotos} />}
        <Campo etiqueta="Agregar fotos">
          <input name="fotos" type="file" accept="image/*" multiple className="text-sm" />
        </Campo>
        <button className="boton">Guardar</button>
      </form>
    </div>
  );
}

function Campo({ etiqueta, ayuda, children }: { etiqueta: string; ayuda?: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1">
      <span className="text-xs font-medium uppercase tracking-wide text-cafe/90">{etiqueta}</span>
      {children}
      {ayuda && <span className="block text-xs text-cafe/90">{ayuda}</span>}
    </label>
  );
}
