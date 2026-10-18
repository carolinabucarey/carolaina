"use client";
import Link from "next/link";
import { useState, useTransition } from "react";
import type { EstadoArticulo } from "@/lib/tipos";
import { cambiarEstado } from "../../acciones";

export default function AccionesEstado({ id, estado, slug }: { id: string; estado: EstadoArticulo; slug: string }) {
  const [pendiente, iniciar] = useTransition();
  const [error, setError] = useState("");

  const cambiar = (nuevo: EstadoArticulo, confirmar?: string) => {
    if (confirmar && !confirm(confirmar)) return;
    setError("");
    iniciar(async () => {
      try {
        await cambiarEstado(id, nuevo);
      } catch (e) {
        setError(e instanceof Error ? e.message : "No se pudo cambiar el estado");
      }
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {(estado === "borrador" || estado === "retirado") && (
        <button className="boton" disabled={pendiente} onClick={() => cambiar("activo")}>Publicar</button>
      )}
      {estado === "activo" && (
        <button className="boton-secundario" disabled={pendiente} onClick={() => cambiar("borrador")}>Volver a borrador</button>
      )}
      {estado !== "retirado" && estado !== "borrador" && (
        <button className="boton-secundario" disabled={pendiente} onClick={() => cambiar("retirado", "¿Retirar este artículo del sitio?")}>
          Retirar
        </button>
      )}
      {estado !== "borrador" && estado !== "retirado" && (
        <Link href={`/articulo/${slug}`} className="text-sm text-rosa underline" target="_blank">Ver en el sitio</Link>
      )}
      {error && <p className="w-full text-sm text-rosa">{error}</p>}
    </div>
  );
}
