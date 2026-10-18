import { ETIQUETA_ESTADO } from "@/lib/formato";
import type { EstadoArticulo } from "@/lib/tipos";

const ESTILO: Record<EstadoArticulo, string> = {
  borrador: "bg-arena text-cafe",
  activo: "bg-white text-cafe border border-lino",
  cuenta_regresiva: "bg-rosa text-white",
  adjudicado: "bg-tinta text-crema",
  vendido_directo: "bg-tinta text-crema",
  retirado: "bg-arena text-cafe/70",
};

export default function EtiquetaEstado({ estado }: { estado: EstadoArticulo }) {
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${ESTILO[estado]}`}>
      {ETIQUETA_ESTADO[estado]}
    </span>
  );
}
