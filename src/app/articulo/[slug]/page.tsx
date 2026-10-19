import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import EtiquetaEstado from "@/components/EtiquetaEstado";
import { estadoEfectivo, pesos } from "@/lib/formato";
import { crearClienteServidor } from "@/lib/supabase/server";
import { EMPRESA, SITIO_URL } from "@/lib/empresa";
import type { Articulo, EstadoArticulo } from "@/lib/tipos";
import CarruselFotos from "./CarruselFotos";
import PanelOferta from "./PanelOferta";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

const detalle = (a: Pick<Articulo, "marca" | "talla" | "categoria">) =>
  [a.marca, a.talla && `talla ${a.talla}`, a.categoria.toLowerCase()].filter(Boolean).join(", ");

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await crearClienteServidor();
  const { data } = await supabase
    .from("articulos")
    .select("titulo, fotos, marca, talla, categoria")
    .eq("slug", slug)
    .maybeSingle();
  if (!data) return {};
  const descripcion = `${data.titulo} de segunda mano (${detalle(data)}). Deja tu oferta en El Ropero de Carolaina. Envíos a todo Chile.`;
  return {
    title: data.titulo,
    description: descripcion,
    alternates: { canonical: `/articulo/${slug}` },
    openGraph: {
      type: "website",
      locale: "es_CL",
      siteName: EMPRESA.marca,
      title: data.titulo,
      description: descripcion,
      ...(data.fotos?.length ? { images: data.fotos.slice(0, 1) } : {}),
    },
  };
}

function datosProducto(a: Articulo, estado: EstadoArticulo) {
  const precio = a.monto_final ?? a.oferta_actual ?? a.precio_minimo ?? a.precio_venta_directa;
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: a.titulo,
    description: a.descripcion ?? `${a.titulo} de segunda mano (${detalle(a)}).`,
    image: a.fotos,
    category: a.categoria,
    ...(a.marca ? { brand: { "@type": "Brand", name: a.marca } } : {}),
    ...(a.talla ? { size: a.talla } : {}),
    ...(precio
      ? {
          offers: {
            "@type": "Offer",
            url: `${SITIO_URL}/articulo/${a.slug}`,
            priceCurrency: "CLP",
            price: precio,
            itemCondition: "https://schema.org/UsedCondition",
            availability:
              estado === "activo" || estado === "cuenta_regresiva"
                ? "https://schema.org/InStock"
                : "https://schema.org/SoldOut",
            seller: { "@type": "Organization", name: EMPRESA.marca },
          },
        }
      : {}),
  };
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(datosProducto(a, estado)) }} />
      <CarruselFotos fotos={a.fotos} titulo={a.titulo} />

      <div className="space-y-6">
        <div className="space-y-2">
          <EtiquetaEstado estado={estado} />
          <h1 className="font-serif text-3xl leading-tight">{a.titulo}</h1>
          <p className="text-sm text-cafe/90">
            {[a.marca, a.talla && `Talla ${a.talla}`, a.categoria].filter(Boolean).join(" · ")}
          </p>
        </div>

        <PanelOferta inicial={a} usuarioId={usuario?.id ?? null} />

        {a.descripcion && <p className="whitespace-pre-line text-sm leading-relaxed text-tinta/90">{a.descripcion}</p>}

        <p className="rounded-xl bg-crema px-3 py-2 text-xs text-cafe/90">
          Prenda de segunda mano: su estado y cualquier detalle o defecto se informan en la descripción y en las
          fotos. Tienes derecho a retracto dentro de 10 días desde que la recibes.{" "}
          <Link href="/terminos" className="underline">
            Ver condiciones
          </Link>
        </p>

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
            <p className="text-sm text-cafe/90">Aún no hay ofertas. ¡Sé la primera!</p>
          )}
        </div>
      </div>
    </div>
  );
}
