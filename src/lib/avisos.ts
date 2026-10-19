import "server-only";
import { enviarCorreo } from "@/lib/correo";
import { EMPRESA, SITIO_URL, VERSION_LEGAL } from "@/lib/empresa";
import { pesos } from "@/lib/formato";
import type { crearClienteServicio } from "@/lib/supabase/servicio";

type Db = ReturnType<typeof crearClienteServicio>;

const { cuenta } = EMPRESA;

/** Enlace para mandar el comprobante con asunto y texto ya escritos (lo usan la ficha y el correo de aviso). */
export const mailtoComprobante = (titulo: string, monto: number | null) =>
  `mailto:${cuenta.correo}?subject=${encodeURIComponent(`Comprobante de pago · ${titulo}`)}&body=${encodeURIComponent(
    `Hola, adjunto el comprobante de la transferencia por ${pesos(monto)} de «${titulo}».`,
  )}`;

function datosTransferencia(monto: number | null) {
  const fila = (k: string, v: string) =>
    `<tr><td style="padding:2px 12px 2px 0;color:#7a6a5d">${k}</td><td style="padding:2px 0"><strong>${v}</strong></td></tr>`;
  return `<table style="border-collapse:collapse;margin:8px 0 12px">
    ${fila("Monto", pesos(monto))}
    ${fila("Titular", cuenta.titular)}
    ${fila("RUT", cuenta.rut)}
    ${fila("Banco", cuenta.banco)}
    ${fila("Tipo de cuenta", cuenta.tipo)}
    ${fila("N° de cuenta", cuenta.numero)}
    ${fila("Correo", cuenta.correo)}
  </table>`;
}

/**
 * Avisa del cierre de una prenda: a quien la compró, con los datos para transferir, y a la admin.
 * Marca notificado_at antes de enviar para que la compra directa (que avisa al tiro) y el cron no lo manden dos veces.
 */
export async function avisarCierre(db: Db, articuloId: string, sitio = SITIO_URL) {
  const { data: a } = await db
    .from("articulos")
    .update({ notificado_at: new Date().toISOString() })
    .eq("id", articuloId)
    .in("estado", ["adjudicado", "vendido_directo"])
    .is("notificado_at", null)
    .select("slug, titulo, estado, monto_final, ganador_id")
    .maybeSingle();
  if (!a) return false;

  const admin = process.env.ADMIN_EMAIL;
  const enlace = `${sitio}/articulo/${a.slug}`;

  if (!a.ganador_id) {
    if (admin) await enviarCorreo(admin, `Cerró sin ofertas: ${a.titulo}`, `<p><a href="${enlace}">${a.titulo}</a> cerró sin ganador.</p>`);
    return true;
  }

  const { data: p } = await db.from("perfiles").select("nombre, email, telefono").eq("id", a.ganador_id).single();
  if (p?.email) {
    await enviarCorreo(
      p.email,
      `¡Te llevaste «${a.titulo}»! 🎉`,
      `<p>Hola ${p.nombre ?? ""},</p>
       <p>${a.estado === "vendido_directo" ? "Compraste" : "Tu oferta ganó:"} <strong>${a.titulo}</strong> por <strong>${pesos(a.monto_final)}</strong> (IVA incluido).</p>
       <p>Para pagar, transfiere el monto a esta cuenta dentro de las próximas ${EMPRESA.horasParaPagar} horas:</p>
       ${datosTransferencia(a.monto_final)}
       <p><strong>Envíanos el comprobante</strong>: pon ${cuenta.correo} como correo de destino al transferir, o responde este correo adjuntándolo (<a href="${mailtoComprobante(a.titulo, a.monto_final)}">enviar comprobante</a>). Si prefieres, cuéntanos también tu WhatsApp.</p>
       <p>El envío es por pagar (${EMPRESA.couriers}): lo pagas al courier al recibir. Despachamos dentro de ${EMPRESA.diasHabilesDespacho} días hábiles desde que confirmamos tu pago y emitimos boleta electrónica.</p>
       <p>Tienes <strong>derecho a retracto</strong>: puedes dejar sin efecto la compra dentro de 10 días desde que recibes la prenda, escribiéndonos a ${EMPRESA.correo}.</p>
       <p><a href="${enlace}">Ver la prenda y los datos de pago</a> · <a href="${sitio}/terminos">Términos y condiciones (versión ${VERSION_LEGAL.version})</a></p>
       <p>— ${EMPRESA.marca}<br>${EMPRESA.razonSocial} · RUT ${EMPRESA.rut} · ${EMPRESA.domicilio}</p>`,
    );
  }
  if (admin) {
    await enviarCorreo(
      admin,
      `${a.estado === "vendido_directo" ? "Vendido" : "Adjudicado"}: ${a.titulo} · ${pesos(a.monto_final)}`,
      `<p><strong>${a.titulo}</strong> → ${p?.nombre ?? "?"} (${p?.email ?? "sin correo"}${p?.telefono ? ", " + p.telefono : ""}) por ${pesos(a.monto_final)}.</p>
       <p>Ya le enviamos los datos de la cuenta; el comprobante debería llegar a ${cuenta.correo} dentro de ${EMPRESA.horasParaPagar} horas.</p>
       <p><a href="${sitio}/admin?ver=coordinar">Abrir panel</a></p>`,
    );
  }
  return true;
}
