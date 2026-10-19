"use client";
import { useState } from "react";

type Cuenta = { titular: string; rut: string; banco: string; tipo: string; numero: string; correo: string };

/** Datos para transferir que ve solo quien se llevó la prenda, con botones para copiar y para mandar el comprobante. */
export default function DatosPago({
  monto,
  cuenta,
  horas,
  mailto,
}: {
  monto: string;
  cuenta: Cuenta;
  horas: number;
  mailto: string;
}) {
  const [copiado, setCopiado] = useState<string | null>(null);
  const [sinPortapapeles, setSinPortapapeles] = useState(false);

  const filas: [string, string][] = [
    ["Titular", cuenta.titular],
    ["RUT", cuenta.rut],
    ["Banco", cuenta.banco],
    ["Tipo de cuenta", cuenta.tipo],
    ["N° de cuenta", cuenta.numero],
    ["Correo", cuenta.correo],
  ];

  // Los navegadores dentro de apps (Instagram) a veces bloquean el portapapeles moderno: se intenta con
  // el método antiguo y, si tampoco se puede, se pide copiar a mano (los valores se seleccionan con un toque).
  async function copiar(clave: string, texto: string) {
    let ok = false;
    try {
      await navigator.clipboard.writeText(texto);
      ok = true;
    } catch {
      const area = document.createElement("textarea");
      area.value = texto;
      area.setAttribute("readonly", "");
      area.style.position = "fixed";
      area.style.opacity = "0";
      document.body.appendChild(area);
      area.select();
      try {
        ok = document.execCommand("copy");
      } catch {}
      area.remove();
    }
    if (!ok) return setSinPortapapeles(true);
    setCopiado(clave);
    setTimeout(() => setCopiado((c) => (c === clave ? null : c)), 2000);
  }

  return (
    <div className="space-y-4 rounded-3xl bg-white p-6 ring-1 ring-salvia/40">
      <div>
        <h2 className="font-serif text-xl">Datos para pagar</h2>
        <p className="mt-1 text-sm text-cafe/90">
          Transfiere <strong className="text-tinta">{monto}</strong> dentro de {horas} horas a esta cuenta:
        </p>
      </div>

      <dl className="divide-y divide-arena rounded-2xl bg-crema text-sm">
        {filas.map(([k, v]) => (
          <div key={k} className="flex items-center justify-between gap-3 px-4 py-2">
            <dt className="text-cafe/90">{k}</dt>
            <dd className="flex items-center gap-2 text-right">
              <span className="select-all font-medium">{v}</span>
              {(k === "RUT" || k === "N° de cuenta") && (
                <button type="button" onClick={() => copiar(k, v)} className="text-xs text-rosa underline">
                  {copiado === k ? "¡Copiado!" : "Copiar"}
                </button>
              )}
            </dd>
          </div>
        ))}
      </dl>

      <button
        type="button"
        onClick={() => copiar("todo", [...filas.map(([k, v]) => `${k}: ${v}`), `Monto: ${monto}`].join("\n"))}
        className="boton-secundario w-full"
      >
        {copiado === "todo" ? "¡Datos copiados!" : "Copiar todos los datos"}
      </button>
      {sinPortapapeles && (
        <p className="text-xs text-rosa">Este navegador no deja copiar: mantén presionado cada dato para copiarlo.</p>
      )}

      <div className="space-y-2 border-t border-arena pt-4 text-sm">
        <p>
          <strong>Envíanos el comprobante</strong> a {cuenta.correo}: ponlo como correo de destino al transferir o
          adjúntalo en un correo.
        </p>
        <a href={mailto} className="boton w-full">
          Enviar comprobante
        </a>
        <p className="text-xs text-cafe/90">
          Con el comprobante confirmamos tu pago y te escribimos para coordinar el envío. Si ya lo mandaste, no tienes
          que hacer nada más.
        </p>
      </div>
    </div>
  );
}
