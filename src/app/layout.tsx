import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import "./globals.css";
import { EMPRESA, SITIO_URL } from "@/lib/empresa";
import { crearClienteServidor } from "@/lib/supabase/server";

const descripcion =
  "Ropa, zapatos y carteras de segunda mano seleccionadas. Las prendas se publican sin precio: deja tu oferta y, al alcanzar el mínimo, corren 24 horas finales. Envíos a todo Chile.";

export const metadata: Metadata = {
  metadataBase: new URL(SITIO_URL),
  title: {
    default: "El Ropero de Carolaina · Ropa de segunda mano por ofertas",
    template: "%s · El Ropero de Carolaina",
  },
  description: descripcion,
  applicationName: EMPRESA.marca,
  openGraph: { type: "website", locale: "es_CL", siteName: EMPRESA.marca, description: descripcion },
  twitter: { card: "summary_large_image" },
  formatDetection: { telephone: false, email: false, address: false },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const supabase = await crearClienteServidor();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  let esAdmin = false;
  if (user) {
    const { data } = await supabase.rpc("es_admin");
    esAdmin = Boolean(data);
  }

  return (
    <html lang="es-CL">
      <body className="min-h-screen antialiased">
        <header className="sticky top-0 z-20 border-b border-arena bg-crema/90 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
            <Link href="/" className="flex items-center gap-3 font-serif text-xl italic text-cafe">
              <Image src="/logo.png" alt="" width={44} height={44} priority className="h-11 w-11" />
              <span className="sr-only sm:not-sr-only">El Ropero de Carolaina</span>
            </Link>
            <nav className="flex items-center gap-4 text-sm">
              <Link href="/#como-funciona" className="hidden hover:text-rosa sm:inline">
                Cómo funciona
              </Link>
              {user ? (
                <>
                  <Link href="/mis-ofertas" className="hover:text-rosa">
                    Mis ofertas
                  </Link>
                  {esAdmin && (
                    <Link href="/admin" className="hover:text-rosa">
                      Admin
                    </Link>
                  )}
                  <form action="/auth/salir" method="post">
                    <button className="text-cafe/70 hover:text-rosa">Salir</button>
                  </form>
                </>
              ) : (
                <Link href="/ingresar" className="boton !py-1.5">
                  Ingresar
                </Link>
              )}
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
        <footer className="space-y-3 border-t border-arena px-4 py-8 text-center text-xs text-cafe/70">
          <nav className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm text-cafe">
            <Link href="/preguntas-frecuentes" className="hover:text-rosa">
              Preguntas frecuentes
            </Link>
            <Link href="/terminos" className="hover:text-rosa">
              Términos y condiciones
            </Link>
            <Link href="/privacidad" className="hover:text-rosa">
              Política de privacidad
            </Link>
            <a href={EMPRESA.instagram} className="hover:text-rosa" target="_blank" rel="noopener">
              @elroperodecarolaina
            </a>
          </nav>
          <p>Ropa de segunda mano · Envíos a todo Chile</p>
          <p>
            {EMPRESA.razonSocial} · RUT {EMPRESA.rut} · {EMPRESA.domicilio} ·{" "}
            <a href={`mailto:${EMPRESA.correo}`} className="underline">
              {EMPRESA.correo}
            </a>
          </p>
        </footer>
      </body>
    </html>
  );
}
