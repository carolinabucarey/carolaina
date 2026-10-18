import { notFound } from "next/navigation";
import type { Metadata } from "next";
import EtiquetaEstado from "@/components/EtiquetaEstado";
import Foto from "@/components/Foto";
import { estadoEfectivo, pesos } from "@/lib/formato";
import { crearClienteServidor } from "@/lib/supabase/server";
import type { Articulo } from "@/lib/tipos";
import PanelOferta from "./PanelOferta";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await crearClienteServidor();
  const { data } = await supabase.from("articulos").select("titulo, fotos").eq("slug", slug).maybeSingle();
  return data ? { title: `${data.titulo} · El Ropero de Carolaina`, openGraph: { images: data.fotos?.slice(0, 1) } } : {};
}

export default async function PaginaArticulo({ params }: Props) {
  const { slug } = await params;
  const supabase = await crearClienteServidor();
  const { data } = await supabase.from("articulos").select("*").eq("slug", slug).maybeSingle();
  if (!data) notFound();
  const a = data as Articulo;

  const [{ data: historial }, { data: auth }] = await Promise.all([
    supabase.rpc("historial_ofertas", { p_articulo: a.id }),
    supabase.auth.getUser(),
  ]);
  const usuario = auth.user;
  const estado = estadoEfectivo(a);

  return (
    <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr]">
      <div className="space-y-3">
        <Foto src={a.fotos[0]} alt={a.titulo} className="aspect-[4/5] w-full rounded-3xl" />
        {a.fotos.length > 1 && (
          <div className="grid grid-cols-4 gap-3">
            {a.fotos.slice(1).map((f, i) => (
              <Foto key={f} src={f} alt={`${a.titulo} foto ${i + 2}`} className="aspect-square w-full rounded-xl" />
            ))}
          </div>
        )}
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <EtiquetaEstado estado={estado} />
          <h1 className="font-serif text-3xl leading-tight">{a.titulo}</h1>
          <p className="text-sm text-cafe/70">
            {[a.marca, a.talla && `Talla ${a.talla}`, a.categoria].filter(Boolean).join(" · ")}
          </p>
        </div>

        <PanelOferta inicial={a} usuarioId={usuario?.id ?? null} />

        {a.descripcion && <p className="whitespace-pre-line text-sm leading-relaxed text-tinta/90">{a.descripcion}</p>}

        {a.instagram_url && (
          <a href={a.instagram_url} target="_blank" className="inline-block text-sm text-rosa underline">
            Ver la publicación en Instagram
          </a>
        )}

        <div>
          <h2 className="mb-2 font-serif text-lg">Ofertas</h2>
          {historial && historial.length > 0 ? (
            <ul className="divide-y divide-arena rounded-2xl bg-white ring-1 ring-arena">
              {(historial as { monto: number; alias: string; created_at: string }[]).map((o, i) => (
                <li key={i} className="flex justify-between px-4 py-2.5 text-sm">
                  <span>{o.alias}</span>
                  <span className="font-medium">{pesos(o.monto)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-cafe/70">Aún no hay ofertas. ¡Sé la primera!</p>
          )}
        </div>
      </div>
    </div>
  );
}
