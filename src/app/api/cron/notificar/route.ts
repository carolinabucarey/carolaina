import { NextResponse } from "next/server";
import { enviarCorreo } from "@/lib/correo";
import { EMPRESA, VERSION_LEGAL } from "@/lib/empresa";
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
           <p>${a.estado === "vendido_directo" ? "Compraste" : "Tu oferta ganó:"} <strong>${a.titulo}</strong> por <strong>${pesos(a.monto_final)}</strong> (IVA incluido).</p>
           <p>Te escribiremos en las próximas horas con los datos para pagar por transferencia o link de pago. Tienes ${EMPRESA.horasParaPagar} horas para pagar desde este aviso. Si prefieres, respóndenos este correo con tu WhatsApp.</p>
           <p>El envío es por pagar (${EMPRESA.couriers}): lo pagas al courier al recibir. Despachamos dentro de ${EMPRESA.diasHabilesDespacho} días hábiles desde que confirmamos tu pago y emitimos boleta electrónica.</p>
           <p>Tienes <strong>derecho a retracto</strong>: puedes dejar sin efecto la compra dentro de 10 días desde que recibes la prenda, escribiéndonos a ${EMPRESA.correo}.</p>
           <p><a href="${enlace}">Ver la prenda</a> · <a href="${sitio}/terminos">Términos y condiciones (versión ${VERSION_LEGAL.version})</a></p>
           <p>— ${EMPRESA.marca}<br>${EMPRESA.razonSocial} · RUT ${EMPRESA.rut} · ${EMPRESA.domicilio}</p>`,
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
        `<p>«${a.titulo}» recibió su primera oferta: ${pesos(a.oferta_actual)}. Cierra el ${new Date(a.cierre_at!).toLocaleString("es-CL", { timeZone: "America/Santiago" })}.</p><p>Buen momento para subir la historia a Instagram: <a href="${sitio}/articulo/${a.slug}">${sitio}/articulo/${a.slug}</a></p>`,
      );
    }
    await db.from("articulos").update({ aviso_minimo_at: new Date().toISOString() }).eq("id", a.id);
  }

  return NextResponse.json({ cerradas, avisos, minimos: nuevas?.length ?? 0 });
}
