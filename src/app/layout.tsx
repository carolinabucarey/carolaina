import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { crearClienteServidor } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "El Ropero de Carolaina · Subastas de ropa",
  description:
    "Prendas seleccionadas sin precio: deja tu oferta y, al alcanzar el mínimo, se abren 24 h finales. Gana la mejor oferta.",
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
    <html lang="es">
      <body className="min-h-screen antialiased">
        <header className="sticky top-0 z-20 border-b border-arena bg-crema/90 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
            <Link href="/" className="font-serif text-xl italic text-cafe">
              El Ropero de Carolaina
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
        <footer className="border-t border-arena py-8 text-center text-xs text-cafe/70">
          <a href="https://www.instagram.com/elroperodecarolaina/" className="underline" target="_blank">
            @elroperodecarolaina
          </a>{" "}
          · Envíos a todo Chile
        </footer>
      </body>
    </html>
  );
}
