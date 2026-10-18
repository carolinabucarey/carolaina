"use client";
import Link from "next/link";
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { crearClienteNavegador } from "@/lib/supabase/client";

function Formulario() {
  const volver = useSearchParams().get("volver") || "/";
  const [correo, setCorreo] = useState("");
  const [estado, setEstado] = useState<"inicio" | "enviando" | "enviado" | "error">("inicio");
  const [error, setError] = useState("");

  const redireccion = () => `${window.location.origin}/auth/callback?volver=${encodeURIComponent(volver)}`;

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setEstado("enviando");
    const { error } = await crearClienteNavegador().auth.signInWithOtp({
      email: correo,
      options: { emailRedirectTo: redireccion() },
    });
    if (error) {
      setError(error.message);
      setEstado("error");
    } else setEstado("enviado");
  }

  if (estado === "enviado") {
    return (
      <p className="text-center text-sm">
        Te enviamos un enlace a <strong>{correo}</strong>. Ábrelo desde este mismo dispositivo para ingresar.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <form onSubmit={enviar} className="space-y-3">
        <input type="email" required className="campo" placeholder="tu@correo.com" value={correo} onChange={(e) => setCorreo(e.target.value)} />
        <button className="boton w-full" disabled={estado === "enviando"}>
          {estado === "enviando" ? "Enviando…" : "Enviarme un enlace"}
        </button>
      </form>
      {estado === "error" && <p className="text-sm text-rosa">{error}</p>}
      <p className="text-center text-xs text-cafe/90">
        Al ingresar declaras ser mayor de 18 años y aceptas los{" "}
        <Link href="/terminos" className="underline">
          Términos y condiciones
        </Link>{" "}
        y la{" "}
        <Link href="/privacidad" className="underline">
          Política de privacidad
        </Link>
        .
      </p>
    </div>
  );
}

export default function Ingresar() {
  return (
    <div className="mx-auto max-w-sm space-y-6 rounded-3xl bg-white p-8 ring-1 ring-arena">
      <div className="text-center">
        <h1 className="font-serif text-2xl italic text-cafe">Ingresa para ofertar</h1>
        <p className="mt-1 text-sm text-cafe/90">Sin contraseñas: te enviamos un enlace de acceso.</p>
      </div>
      <Suspense>
        <Formulario />
      </Suspense>
    </div>
  );
}
