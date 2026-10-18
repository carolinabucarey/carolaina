import "server-only";
import { notFound, redirect } from "next/navigation";
import { crearClienteServidor } from "@/lib/supabase/server";

export async function exigirAdmin() {
  const supabase = await crearClienteServidor();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/ingresar?volver=/admin");
  const { data: esAdmin } = await supabase.rpc("es_admin");
  if (!esAdmin) notFound();
  return { supabase, user };
}
