"use server";
import { after } from "next/server";
import { avisarCierre } from "@/lib/avisos";
import { crearClienteServidor } from "@/lib/supabase/server";
import { crearClienteServicio } from "@/lib/supabase/servicio";

/** Compra directa con la sesión de quien compra; el correo con los datos para transferir sale al tiro, sin esperar al cron. */
export async function comprarDirecto(articuloId: string): Promise<{ error: string | null }> {
  const supabase = await crearClienteServidor();
  const { error } = await supabase.rpc("comprar_directo", { p_articulo: articuloId });
  if (error) return { error: error.message };
  after(() => avisarCierre(crearClienteServicio(), articuloId));
  return { error: null };
}
