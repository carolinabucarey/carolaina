import { NextResponse } from "next/server";
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

  // 1) Adjudicaciones y ventas directas sin avisar
  const { data: pendientes } = await db
    .from("articulos")
    .select("id, slug, titulo, estado, monto_final, ganador_id")
    .in("estado", ["adjudicado", "vendido_directo"])
    .is("notificado_at", null)
    .limit(50);

  let avisos = 0;
  for (const a of pendientes ?? []) {
    const enlace = `${sitio}/articulo/${a.slug}`;
    if (a.ganador_id) {
      const { data: p } = await db.from("perfiles").select("nombre, email, telefono").eq("id", a.ganador_id).single();
      if (p?.email) {
        await enviarCorreo(
          p.email,
          `¡Te llevaste «${a.titulo}»! 🎉`,
          `<p>Hola ${p.nombre ?? ""},</p>
           <p>${a.estado === "vendido_directo" ? "Compraste" : "Ganaste la subasta de"} <strong>${a.titulo}</strong> por <strong>${pesos(a.monto_final)}</strong>.</p>
           <p>Te escribiremos en las próximas horas para coordinar el pago y el envío. Si prefieres, respóndenos este correo con tu WhatsApp.</p>
           <p><a href="${enlace}">Ver el artículo</a></p>
           <p>— El Ropero de Carolaina</p>`,
        );
      }
      if (admin) {
        await enviarCorreo(
          admin,
          `Adjudicado: ${a.titulo} · ${pesos(a.monto_final)}`,
          `<p><strong>${a.titulo}</strong> → ${p?.nombre ?? "?"} (${p?.email ?? "sin correo"}${p?.telefono ? ", " + p.telefono : ""}) por ${pesos(a.monto_final)}.</p><p><a href="${sitio}/admin?ver=coordinar">Abrir panel</a></p>`,
        );
      }
    } else if (admin) {
      await enviarCorreo(admin, `Cerró sin ofertas: ${a.titulo}`, `<p><a href="${enlace}">${a.titulo}</a> cerró sin ganador.</p>`);
    }
    await db.from("articulos").update({ notificado_at: new Date().toISOString() }).eq("id", a.id);
    avisos++;
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
        `<p>«${a.titulo}» alcanzó el mínimo con ${pesos(a.oferta_actual)}. Cierra el ${new Date(a.cierre_at!).toLocaleString("es-CL", { timeZone: "America/Santiago" })}.</p><p>Buen momento para subir la historia a Instagram: <a href="${sitio}/articulo/${a.slug}">${sitio}/articulo/${a.slug}</a></p>`,
      );
    }
    await db.from("articulos").update({ aviso_minimo_at: new Date().toISOString() }).eq("id", a.id);
  }

  return NextResponse.json({ cerradas, avisos, minimos: nuevas?.length ?? 0 });
}
