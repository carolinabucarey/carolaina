export type EstadoArticulo =
  | "borrador"
  | "activo"
  | "cuenta_regresiva"
  | "adjudicado"
  | "vendido_directo"
  | "retirado";

export type Articulo = {
  id: string;
  slug: string;
  titulo: string;
  descripcion: string | null;
  marca: string | null;
  talla: string | null;
  categoria: string;
  fotos: string[];
  instagram_url: string | null;
  estado: EstadoArticulo;
  precio_venta_directa: number | null;
  incremento_minimo: number;
  oferta_actual: number | null;
  total_ofertas: number;
  minimo_alcanzado_at: string | null;
  cierre_at: string | null;
  ganador_id: string | null;
  monto_final: number | null;
  adjudicado_at: string | null;
  created_at: string;
};

export const CATEGORIAS = [
  "Vestidos",
  "Faldas",
  "Blusas",
  "Pantalones",
  "Chaquetas",
  "Zapatos",
  "Carteras",
  "Otros",
] as const;
