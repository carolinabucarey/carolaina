import { NextResponse } from "next/server";
import { avisarCierre } from "@/lib/avisos";
import { enviarCorreo } from "@/lib/correo";
import { pesos } from "@/lib/formato";
import { crearClienteServicio } from "@/lib/supabase/servicio";

// Cierra subastas vencidas y envía avisos. Lo llama pg_cron (vía pg_net) o Vercel Cron.
// Protegido con Authorization: Bearer CRON_SECRET.
export async function GET(request: Request) {
  if (request.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "no autorizado" }, { status: 401 });
  }
  const db = crearClienteServicio();
  const sitio = process.env.NEXT_PUBLIC_SITIO_URL ?? new URL(request.url).origin;
  const admin = process.env.ADMIN_EMAIL;

  const { data: cerradas } = await db.rpc("cerrar_subastas_vencidas");

  // 1) Adjudicaciones y ventas directas sin avisar (la compra directa ya avisa al tiro; esto cubre las subastas)
  const { data: pendientes } = await db
    .from("articulos")
    .select("id")
    .in("estado", ["adjudicado", "vendido_directo"])
    .is("notificado_at", null)
    .limit(50);

  let avisos = 0;
  for (const a of pendientes ?? []) {
    if (await avisarCierre(db, a.id, sitio)) avisos++;
  }

  // 2) Mínimos alcanzados: aviso a la admin para publicar la historia de "últimas 24 h"
  const { data: nuevas } = await db
    .from("articulos")
    .select("id, slug, titulo, oferta_actual, cierre_at")
    .eq("estado", "cuenta_regresiva")
    .is("aviso_minimo_at", null);
  for (const a of nuevas ?? []) {
    if (admin) {
      await enviarCorreo(
        admin,
        `⏳ Partieron las 24 h: ${a.titulo}`,
        `<p>«${a.titulo}» recibió su primera oferta: ${pesos(a.oferta_actual)}. Cierra el ${new Date(a.cierre_at!).toLocaleString("es-CL", { timeZone: "America/Santiago" })}.</p><p>Buen momento para subir la historia a Instagram: <a href="${sitio}/articulo/${a.slug}">${sitio}/articulo/${a.slug}</a></p>`,
      );
    }
    await db.from("articulos").update({ aviso_minimo_at: new Date().toISOString() }).eq("id", a.id);
  }

  return NextResponse.json({ cerradas, avisos, minimos: nuevas?.length ?? 0 });
}
