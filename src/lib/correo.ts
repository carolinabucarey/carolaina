import "server-only";

/** Envía un correo con Resend. Sin RESEND_API_KEY no envía nada (útil en desarrollo). */
export async function enviarCorreo(para: string, asunto: string, html: string) {
  const clave = process.env.RESEND_API_KEY;
  if (!clave) {
    console.info(`[correo omitido] ${para} · ${asunto}`);
    return false;
  }
  const r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${clave}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.CORREO_REMITENTE ?? "El Ropero de Carolaina <onboarding@resend.dev>",
      to: [para],
      subject: asunto,
      html,
    }),
  });
  if (!r.ok) console.error("Resend", r.status, await r.text());
  return r.ok;
}
