import type { Metadata } from "next";
import Link from "next/link";
import { EMPRESA, VERSION_LEGAL } from "@/lib/empresa";

export const metadata: Metadata = {
  title: "Política de privacidad",
  description: `Qué datos personales trata ${EMPRESA.marca}, para qué, con quién los compartimos y cómo ejercer tus derechos.`,
  alternates: { canonical: "/privacidad" },
};

const correo = <a href={`mailto:${EMPRESA.correo}`}>{EMPRESA.correo}</a>;

export default function Privacidad() {
  return (
    <article className="texto-legal">
      <h1>Política de privacidad</h1>
      <p className="text-sm text-cafe/70">
        Versión {VERSION_LEGAL.version} · Vigente desde el {VERSION_LEGAL.vigencia}
      </p>
      <p>
        Esta política explica cómo tratamos tus datos personales cuando usas {EMPRESA.marca}. Se ajusta a la Ley N°
        19.628 sobre Protección de la Vida Privada, según su texto modificado por la Ley N° 21.719.
      </p>

      <h2>1. Responsable de tus datos</h2>
      <p>
        <strong>{EMPRESA.razonSocial}</strong>, RUT {EMPRESA.rut}
        {EMPRESA.representanteLegal && <>, representada legalmente por {EMPRESA.representanteLegal}</>}, con domicilio
        en {EMPRESA.domicilio}. Para cualquier asunto sobre tus datos, escríbenos a {correo}. No hemos designado un
        delegado de protección de datos; ese correo es el canal de contacto.
      </p>

      <h2>2. Qué datos tratamos y de dónde vienen</h2>
      <table>
        <thead>
          <tr>
            <th>Datos</th>
            <th>Cuándo los obtenemos</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Correo electrónico y un nombre de usuaria (por defecto, la parte de tu correo antes de la @)</td>
            <td>Al ingresar al sitio</td>
          </tr>
          <tr>
            <td>Ofertas que haces, montos, fecha y hora; compras y prendas adjudicadas</td>
            <td>Al ofertar o comprar</td>
          </tr>
          <tr>
            <td>Nombre, dirección de despacho y teléfono</td>
            <td>Cuando nos los entregas para coordinar el pago y el envío</td>
          </tr>
          <tr>
            <td>Confirmación del pago (monto, fecha y medio de pago, sin datos de tarjeta)</td>
            <td>De tu banco o del proveedor del link de pago</td>
          </tr>
          <tr>
            <td>Datos técnicos: dirección IP, navegador y registros de acceso</td>
            <td>Automáticamente, al navegar por el sitio</td>
          </tr>
        </tbody>
      </table>
      <p>No tratamos datos sensibles ni datos bancarios o de tarjetas.</p>

      <h2>3. Para qué los usamos y con qué base legal</h2>
      <table>
        <thead>
          <tr>
            <th>Finalidad</th>
            <th>Base de licitud</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Darte acceso al sitio, registrar tus ofertas y adjudicarte las prendas que ganes</td>
            <td>Ejecución del contrato que aceptas en los <Link href="/terminos">Términos y condiciones</Link></td>
          </tr>
          <tr>
            <td>Contactarte para coordinar el pago y el envío, y atender retractos, garantías y reclamos</td>
            <td>Ejecución del contrato y cumplimiento de la Ley N° 19.496</td>
          </tr>
          <tr>
            <td>Emitir boletas y llevar la contabilidad</td>
            <td>Obligación legal (normas tributarias)</td>
          </tr>
          <tr>
            <td>Prevenir fraudes y ofertas falsas, y mantener la seguridad del sitio</td>
            <td>Interés legítimo en proteger a las compradoras y a la tienda</td>
          </tr>
          <tr>
            <td>Enviarte novedades o promociones</td>
            <td>Solo con tu consentimiento, que puedes retirar en cualquier momento</td>
          </tr>
        </tbody>
      </table>
      <p>
        No vendemos tus datos, no los usamos para publicidad de terceros ni elaboramos perfiles. No tomamos decisiones
        basadas únicamente en el tratamiento automatizado de tus datos: la adjudicación aplica una regla objetiva que
        conoces de antemano (gana la oferta más alta).
      </p>

      <h2>4. Qué se muestra públicamente</h2>
      <p>
        En la ficha de cada prenda se muestra el historial de ofertas con el monto y un alias abreviado de tu nombre de
        usuaria (solo la primera y la última letra, por ejemplo «C•••a»). Tu correo nunca se publica.
      </p>

      <h2>5. Con quién compartimos tus datos</h2>
      <p>
        Usamos proveedores que tratan datos por encargo nuestro (encargados), solo para prestarnos su servicio:
      </p>
      <ul>
        <li>
          <strong>Supabase Inc.</strong>: base de datos, autenticación y almacenamiento. Servidores en São Paulo,
          Brasil.
        </li>
        <li>
          <strong>Vercel Inc.</strong>: alojamiento del sitio. Servidores en Estados Unidos.
        </li>
        <li>
          <strong>Resend</strong>: envío de correos transaccionales (confirmaciones y avisos). Servidores en Estados
          Unidos.
        </li>
      </ul>
      <p>Además, comunicamos datos a terceros solo cuando es necesario para tu compra o lo exige la ley:</p>
      <ul>
        <li>Al courier que elijas ({EMPRESA.couriers}): tu nombre, dirección y teléfono, para entregar el envío.</li>
        <li>Al proveedor del link de pago, si pagas por ese medio, que trata tus datos según su propia política.</li>
        <li>Al Servicio de Impuestos Internos y a otras autoridades, cuando la ley lo exija.</li>
      </ul>

      <h2>6. Transferencias internacionales</h2>
      <p>
        Como Supabase, Vercel y Resend tienen sus servidores en Brasil y Estados Unidos, tus datos se almacenan o
        procesan fuera de Chile. Lo hacemos con proveedores que se obligan por contrato a tratarlos solo según nuestras
        instrucciones y con medidas de seguridad adecuadas (acuerdos de tratamiento de datos). Puedes pedirnos más
        información sobre estas garantías escribiendo a {correo}.
      </p>

      <h2>7. Cuánto tiempo los guardamos</h2>
      <ul>
        <li>Tu cuenta y tu historial de ofertas: mientras mantengas tu cuenta.</li>
        <li>
          Datos de compras, boletas y despachos: 6 años desde la compra, por obligaciones tributarias y para atender
          garantías y reclamos.
        </li>
        <li>Registros técnicos: el tiempo que los conservan nuestros proveedores de alojamiento, por lo general semanas.</li>
        <li>Consentimiento para promociones: hasta que lo retires.</li>
      </ul>
      <p>Cumplidos esos plazos, eliminamos los datos o los anonimizamos.</p>

      <h2>8. Tus derechos</h2>
      <p>Respecto de tus datos personales, puedes ejercer en cualquier momento y sin costo los derechos de:</p>
      <ul>
        <li>
          <strong>Acceso</strong>: saber qué datos tenemos de ti y cómo los usamos.
        </li>
        <li>
          <strong>Rectificación</strong>: corregir datos inexactos o incompletos.
        </li>
        <li>
          <strong>Supresión</strong>: pedir que eliminemos tus datos, salvo los que debamos conservar por ley.
        </li>
        <li>
          <strong>Oposición</strong>: oponerte a un tratamiento, por ejemplo al envío de promociones.
        </li>
        <li>
          <strong>Portabilidad</strong>: recibir tus datos en un formato estructurado y de uso común.
        </li>
        <li>
          <strong>Bloqueo</strong>: pedir la suspensión temporal del tratamiento mientras resolvemos otra solicitud
          tuya.
        </li>
      </ul>
      <p>
        Para ejercerlos, escríbenos a {correo} desde el correo con el que ingresas al sitio, indicando qué derecho
        quieres ejercer. Responderemos dentro de 30 días corridos, plazo que podemos extender una vez por otros 30 días
        avisándote el motivo. Las solicitudes de bloqueo las respondemos dentro de 2 días hábiles. Si retiras tu
        consentimiento, eso no afecta el tratamiento hecho antes.
      </p>
      <p>
        Si no respondemos o no estás de acuerdo con nuestra respuesta, puedes reclamar ante la Agencia de Protección
        de Datos Personales dentro de los 30 días hábiles siguientes, o ante los tribunales competentes según la ley
        vigente.
      </p>

      <h2>9. Seguridad</h2>
      <p>
        El sitio funciona solo con conexión cifrada (HTTPS) y el ingreso es por enlace enviado a tu correo, sin
        contraseñas que puedan filtrarse. La base de datos restringe a nivel de cada registro quién puede ver qué: cada
        usuaria ve solo sus propias ofertas, y únicamente el equipo de la tienda accede a los datos de las compras.
        Pedimos solo los datos necesarios para venderte y despacharte.
      </p>

      <h2>10. Cookies</h2>
      <p>
        Usamos solo cookies técnicas necesarias para mantener tu sesión iniciada. No usamos cookies de analítica ni de
        publicidad.
      </p>

      <h2>11. Menores de edad</h2>
      <p>
        El sitio está dirigido a personas mayores de 18 años, que son quienes pueden ofertar y comprar. No tratamos a
        sabiendas datos de menores de 14 años; si detectamos que lo hicimos, los eliminaremos.
      </p>

      <h2>12. Cambios a esta política</h2>
      <p>
        Si modificamos esta política, publicaremos la nueva versión en esta página con su fecha. Si el cambio es
        relevante, te avisaremos por correo.
      </p>
    </article>
  );
}
