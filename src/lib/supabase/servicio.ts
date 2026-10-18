import "server-only";
import { createClient } from "@supabase/supabase-js";

// Cliente con service role: solo para rutas de servidor (cron, notificaciones).
export function crearClienteServicio() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  );
}
