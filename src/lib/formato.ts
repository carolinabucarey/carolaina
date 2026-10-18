import type { Articulo, EstadoArticulo } from "./tipos";

export const pesos = (n: number | null | undefined) =>
  n == null ? "—" : "$" + n.toLocaleString("es-CL");

export const ETIQUETA_ESTADO: Record<EstadoArticulo, string> = {
  borrador: "Borrador",
  activo: "Recibiendo ofertas",
  cuenta_regresiva: "¡Últimas 24 h!",
  adjudicado: "Adjudicado",
  vendido_directo: "Vendido",
  retirado: "Retirado",
};

/** El cierre es la fuente de verdad: si ya pasó, se muestra como cerrado aunque el cron no haya corrido. */
export function estadoEfectivo(a: Pick<Articulo, "estado" | "cierre_at">): EstadoArticulo {
  if (a.estado === "cuenta_regresiva" && a.cierre_at && new Date(a.cierre_at) <= new Date()) {
    return "adjudicado";
  }
  return a.estado;
}

export const aceptaOfertas = (a: Pick<Articulo, "estado" | "cierre_at">) => {
  const e = estadoEfectivo(a);
  return e === "activo" || e === "cuenta_regresiva";
};

/** Igual que en ofertar(): la oferta actual más el incremento, y nunca menos que la oferta mínima. */
export const pisoOferta = (a: Pick<Articulo, "oferta_actual" | "incremento_minimo" | "precio_minimo">) =>
  Math.max(
    a.oferta_actual == null ? a.incremento_minimo : a.oferta_actual + a.incremento_minimo,
    a.precio_minimo ?? 0,
  );
