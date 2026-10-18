import type { Metadata } from "next";
import Link from "next/link";
import TarjetaArticulo from "@/components/TarjetaArticulo";
import { EMPRESA, SITIO_URL } from "@/lib/empresa";
import { crearClienteServidor } from "@/lib/supabase/server";
import { CATEGORIAS, type Articulo } from "@/lib/tipos";

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ categoria?: string }> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { categoria } = await searchParams;
  if (!categoria || !(CATEGORIAS as readonly string[]).includes(categoria)) {
    return { alternates: { canonical: "/" } };
  }
  return {
    title: `${categoria} de segunda mano`,
    description: `${categoria} de segunda mano seleccionados en El Ropero de Carolaina. Sin precio: deja tu oferta y llévatelos. Envíos a todo Chile.`,
    alternates: { canonical: `/?categoria=${encodeURIComponent(categoria)}` },
  };
}

const datosTienda = {
  "@context": "https://schema.org",
  "@type": "OnlineStore",
  name: EMPRESA.marca,
  legalName: EMPRESA.razonSocial,
  url: SITIO_URL,
  logo: `${SITIO_URL}/icon.svg`,
  email: EMPRESA.correo,
  sameAs: [EMPRESA.instagram],
  areaServed: "CL",
  address: {
    "@type": "PostalAddress",
    streetAddress: EMPRESA.direccion.calle,
    addressLocality: EMPRESA.direccion.comuna,
    addressRegion: EMPRESA.direccion.region,
    addressCountry: "CL",
  },
};

const ORDEN: Record<string, number> = { cuenta_regresiva: 0, activo: 1, adjudicado: 2, vendido_directo: 3 };

export default async function Inicio({ searchParams }: Props) {
  const { categoria } = await searchParams;
  const supabase = await crearClienteServidor();
  let consulta = supabase
    .from("articulos")
    .select("*")
    .in("estado", ["activo", "cuenta_regresiva", "adjudicado", "vendido_directo"])
    .order("created_at", { ascending: false });
  if (categoria) consulta = consulta.eq("categoria", categoria);
  const { data } = await consulta;
  const articulos = ((data ?? []) as Articulo[]).sort((a, b) => (ORDEN[a.estado] ?? 9) - (ORDEN[b.estado] ?? 9));

  return (
    <div className="space-y-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(datosTienda) }} />
      <section className="rounded-3xl bg-arena/60 px-6 py-10 text-center sm:px-12">
        <p className="text-xs uppercase tracking-[0.25em] text-cafe/70">Ropa de segunda mano seleccionada · sin precio</p>
        <h1 className="mt-3 font-serif text-3xl italic text-cafe sm:text-5xl">Deja tu oferta, llévate la prenda</h1>
        <p className="mx-auto mt-4 max-w-xl text-sm text-cafe/80 sm:text-base">
          Cada prenda tiene un mínimo interno. Cuando una oferta lo alcanza, se abren 24 horas finales para más
          ofertas y la mejor se la lleva.
        </p>
      </section>

      <section id="como-funciona" className="grid gap-4 sm:grid-cols-4">
        {[
          ["1", "Elige", "Las prendas se publican sin precio."],
          ["2", "Oferta", "Ingresa con tu correo y deja tu monto."],
          ["3", "24 h finales", "Al alcanzar el mínimo interno corre la cuenta regresiva."],
          ["4", "Adjudicación", "Gana la oferta más alta y te contactamos para el pago y envío."],
        ].map(([n, t, d]) => (
          <div key={n} className="rounded-2xl bg-white p-5 ring-1 ring-arena">
            <p className="font-serif text-2xl italic text-rosa">{n}</p>
            <p className="mt-1 font-medium">{t}</p>
            <p className="mt-1 text-sm text-cafe/70">{d}</p>
          </div>
        ))}
      </section>

      <section className="space-y-5">
        <div className="flex flex-wrap gap-2">
          <Link href="/" className={`rounded-full px-4 py-1.5 text-sm ring-1 ring-lino ${!categoria ? "bg-cafe text-crema" : "bg-white"}`}>
            Todo
          </Link>
          {CATEGORIAS.filter((c) => c !== "Otros").map((c) => (
            <Link
              key={c}
              href={`/?categoria=${encodeURIComponent(c)}`}
              className={`rounded-full px-4 py-1.5 text-sm ring-1 ring-lino ${categoria === c ? "bg-cafe text-crema" : "bg-white"}`}
            >
              {c}
            </Link>
          ))}
        </div>

        {articulos.length === 0 ? (
          <p className="rounded-2xl bg-white p-10 text-center text-cafe/70 ring-1 ring-arena">
            Pronto publicamos nuevas prendas. Síguenos en Instagram para enterarte primero.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {articulos.map((a) => (
              <TarjetaArticulo key={a.id} a={a} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
