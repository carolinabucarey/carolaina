"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState, useTransition } from "react";
import CuentaRegresiva from "@/components/CuentaRegresiva";
import { aceptaOfertas, estadoEfectivo, pesos, pisoOferta } from "@/lib/formato";
import { crearClienteNavegador } from "@/lib/supabase/client";
import type { Articulo } from "@/lib/tipos";
import { comprarDirecto } from "./acciones";

export default function PanelOferta({ inicial, usuarioId }: { inicial: Articulo; usuarioId: string | null }) {
  const router = useRouter();
  const [a, setA] = useState(inicial);
  const [monto, setMonto] = useState("");
  const [mensaje, setMensaje] = useState<{ tipo: "ok" | "error"; texto: string } | null>(null);
  const [pendiente, iniciar] = useTransition();
  const [confirmando, setConfirmando] = useState(false);
  const [, forzar] = useState(0);

  useEffect(() => setA(inicial), [inicial]);

  // Actualización en vivo de la oferta actual y del estado.
  useEffect(() => {
    const supabase = crearClienteNavegador();
    const canal = supabase
      .channel(`articulo-${inicial.id}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "articulos", filter: `id=eq.${inicial.id}` },
        (p) => {
          setA((prev) => ({ ...prev, ...(p.new as Articulo) }));
          router.refresh();
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(canal);
    };
  }, [inicial.id, router]);

  const alTerminar = useCallback(() => {
    forzar((n) => n + 1);
    setTimeout(() => router.refresh(), 1500);
  }, [router]);

  const estado = estadoEfectivo(a);
  const abierta = aceptaOfertas(a);
  const piso = pisoOferta(a);
  const gane = usuarioId && a.ganador_id === usuarioId;
  const sinOfertas = abierta && a.oferta_actual == null;

  function ofertar(e: React.FormEvent) {
    e.preventDefault();
    const valor = Number(monto.replace(/\D/g, ""));
    if (!valor || valor < piso) {
      setMensaje({ tipo: "error", texto: `La oferta mínima es ${pesos(piso)}` });
      return;
    }
    iniciar(async () => {
      const supabase = crearClienteNavegador();
      const { data, error } = await supabase.rpc("ofertar", { p_articulo: a.id, p_monto: valor });
      if (error) {
        setMensaje({ tipo: "error", texto: error.message });
        return;
      }
      setMonto("");
      setMensaje({
        tipo: "ok",
        texto: data?.minimo_alcanzado
          ? "¡Tu oferta abrió las 24 h finales! Si nadie la mejora, la prenda es tuya."
          : "¡Oferta registrada! Puedes seguirla en Mis ofertas.",
      });
      router.refresh();
    });
  }

  // La confirmación va en la página y no con confirm(): el navegador dentro de Instagram
  // no muestra esos diálogos y el botón quedaba sin hacer nada.
  function comprar() {
    iniciar(async () => {
      const { error } = await comprarDirecto(a.id);
      setConfirmando(false);
      setMensaje(error ? { tipo: "error", texto: error } : null);
      router.refresh();
    });
  }

  return (
    <div className="space-y-4 rounded-3xl bg-white p-6 ring-1 ring-arena">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs text-cafe/90">{sinOfertas ? "Oferta mínima" : abierta ? "Oferta actual" : "Precio final"}</p>
          <p className="text-3xl font-semibold">
            {pesos(sinOfertas ? a.precio_minimo : abierta ? a.oferta_actual : a.monto_final)}
          </p>
          <p className="text-xs text-cafe/90">{sinOfertas ? "Aún sin ofertas" : `${a.total_ofertas} ofertas`}</p>
        </div>
        {estado === "cuenta_regresiva" && a.cierre_at && (
          <div className="text-right">
            <p className="text-xs text-cafe/90">Cierra en</p>
            <CuentaRegresiva cierre={a.cierre_at} alTerminar={alTerminar} className="font-mono text-2xl text-rosa" />
          </div>
        )}
      </div>

      {estado === "activo" && (
        <p className="rounded-xl bg-crema px-3 py-2 text-xs text-cafe/90">
          La primera oferta desde {pesos(piso)} abre 24 horas finales para que otras puedan mejorarla.
        </p>
      )}

      {gane && (
        <p className="rounded-xl bg-salvia/15 px-3 py-2 text-sm text-salvia">
          ¡Es tuya! Abajo tienes los datos para transferir; también te los enviamos por correo.
        </p>
      )}

      {abierta &&
        (usuarioId ? (
          <form onSubmit={ofertar} className="flex gap-2">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-cafe/90">$</span>
              <input
                inputMode="numeric"
                className="campo pl-6"
                placeholder={piso.toLocaleString("es-CL") + " o más"}
                value={monto}
                onChange={(e) => setMonto(e.target.value.replace(/\D/g, "") ? Number(e.target.value.replace(/\D/g, "")).toLocaleString("es-CL") : "")}
              />
            </div>
            <button className="boton" disabled={pendiente}>
              {pendiente ? "Enviando…" : "Ofertar"}
            </button>
          </form>
        ) : (
          <Link href={`/ingresar?volver=/articulo/${a.slug}`} className="boton w-full">
            Ingresa para ofertar
          </Link>
        ))}

      {estado === "activo" && a.precio_venta_directa && (
        <div className="border-t border-arena pt-4 text-sm">
          {confirmando ? (
            <div className="space-y-3">
              <p>
                ¿Confirmas la compra por <strong>{pesos(a.precio_venta_directa)}</strong>? Te mostraremos los datos para
                pagar por transferencia.
              </p>
              <div className="flex gap-2">
                <button onClick={comprar} className="boton flex-1" disabled={pendiente}>
                  {pendiente ? "Comprando…" : "Confirmar compra"}
                </button>
                <button onClick={() => setConfirmando(false)} className="boton-secundario" disabled={pendiente}>
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <span>
                Venta directa: <strong>{pesos(a.precio_venta_directa)}</strong>
              </span>
              {usuarioId ? (
                <button onClick={() => setConfirmando(true)} className="boton-secundario" disabled={pendiente}>
                  Comprar ahora
                </button>
              ) : (
                <Link href={`/ingresar?volver=/articulo/${a.slug}`} className="boton-secundario">
                  Ingresa para comprar
                </Link>
              )}
            </div>
          )}
        </div>
      )}

      {mensaje && (
        <p className={`text-sm ${mensaje.tipo === "ok" ? "text-salvia" : "text-rosa"}`}>{mensaje.texto}</p>
      )}

      {abierta && usuarioId && (
        <p className="text-xs text-cafe/90">
          Tu oferta es un compromiso de compra. Al ofertar o comprar aceptas los{" "}
          <Link href="/terminos" className="underline">
            Términos y condiciones
          </Link>
          , que incluyen tu derecho a retracto.
        </p>
      )}
    </div>
  );
}
