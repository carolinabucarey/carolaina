import type { Metadata } from "next";
import Link from "next/link";
import { EMPRESA, VERSION_LEGAL } from "@/lib/empresa";

export const metadata: Metadata = {
  title: "Términos y condiciones",
  description: `Condiciones de compra en ${EMPRESA.marca}: cómo funcionan las ofertas, el pago, el envío, el derecho a retracto y la garantía legal.`,
  alternates: { canonical: "/terminos" },
};

export default function Terminos() {
  return (
    <article className="texto-legal">
      <h1>Términos y condiciones</h1>
      <p className="text-sm text-cafe/70">
        Versión {VERSION_LEGAL.version} · Vigente desde el {VERSION_LEGAL.vigencia}
      </p>

      <h2>1. Quiénes somos</h2>
      <p>
        {EMPRESA.marca} es una tienda en línea de ropa, calzado y accesorios de segunda mano operada por{" "}
        <strong>{EMPRESA.razonSocial}</strong>, RUT {EMPRESA.rut}
        {EMPRESA.representanteLegal && <>, representada legalmente por {EMPRESA.representanteLegal}</>}, con domicilio
        en {EMPRESA.domicilio} (en adelante, «la tienda» o «nosotras»).
      </p>
      <p>
        Contacto: <a href={`mailto:${EMPRESA.correo}`}>{EMPRESA.correo}</a>.
      </p>

      <h2>2. Aceptación de estos términos</h2>
      <p>
        Estos términos regulan el uso del sitio y toda compra que hagas en él. Al ingresar con tu correo, hacer una
        oferta o comprar, declaras haberlos leído y aceptado. Se rigen por la Ley N° 19.496 sobre Protección de los
        Derechos de los Consumidores, su Reglamento de Comercio Electrónico y las demás normas chilenas aplicables.
        Puedes descargarlos o imprimirlos desde esta página en cualquier momento.
      </p>
      <p>
        Para ofertar o comprar debes ser mayor de 18 años. Si cambiamos estos términos, publicaremos la nueva versión
        con su fecha; los cambios no afectan las compras ya adjudicadas.
      </p>

      <h2>3. Tu cuenta</h2>
      <p>
        Ingresas sin contraseña: te enviamos un enlace de acceso a tu correo. Eres responsable de mantener el control
        de ese correo, porque las ofertas hechas desde tu cuenta se consideran tuyas. Podemos suspender cuentas que
        hagan ofertas falsas, no paguen compras adjudicadas de forma reiterada o usen el sitio de manera fraudulenta.
      </p>

      <h2>4. Las prendas</h2>
      <ul>
        <li>
          Vendemos prendas <strong>usadas o seminuevas</strong>; cuando una prenda es nueva (por ejemplo, con
          etiqueta), lo indicamos en su ficha.
        </li>
        <li>
          Cada ficha informa la marca, la talla, la categoría y el estado de la prenda, e incluye fotos reales. Los
          detalles, el desgaste o los defectos que tenga se informan de forma expresa en la descripción y en las
          fotos, conforme al artículo 14 de la Ley N° 19.496.
        </li>
        <li>Los colores pueden verse levemente distintos según la pantalla.</li>
        <li>Cada prenda es única: hay una sola unidad disponible.</li>
      </ul>

      <h2>5. Cómo se compra: venta por ofertas</h2>
      <p>Las prendas se publican sin precio y se venden a la mejor oferta, con estas reglas:</p>
      <ol>
        <li>
          Cada prenda tiene un <strong>precio mínimo de venta</strong> que no se muestra. Mientras ninguna oferta lo
          alcance, la prenda no se vende.
        </li>
        <li>
          Cada oferta debe superar a la anterior al menos en el incremento mínimo que indica la ficha. Las ofertas se
          expresan en pesos chilenos e incluyen IVA.
        </li>
        <li>
          Cuando una oferta alcanza el precio mínimo, se abre un <strong>período final de 24 horas</strong> en el que
          se pueden seguir haciendo ofertas. La cuenta regresiva se muestra en la ficha.
        </li>
        <li>
          Al terminar las 24 horas, la prenda se adjudica a la <strong>oferta más alta</strong>. Si dos ofertas son
          iguales, gana la que se hizo primero.
        </li>
        <li>
          Una oferta es un compromiso de compra: no se puede retirar mientras la venta está abierta. Esto no afecta tu
          derecho a retracto (punto 9).
        </li>
        <li>
          En el historial público de ofertas solo se muestra el monto y un alias abreviado (por ejemplo, «C•••a»),
          nunca tu correo.
        </li>
      </ol>
      <h3>Venta directa</h3>
      <p>
        Algunas prendas tienen además un precio de <strong>venta directa</strong>. Mientras ninguna oferta haya
        alcanzado el precio mínimo, puedes comprarla de inmediato a ese precio; la venta por ofertas termina en ese
        momento.
      </p>

      <h2>6. Confirmación y precio final</h2>
      <p>
        Si tu oferta gana o compras con venta directa, te enviaremos a tu correo una confirmación con la prenda, el
        precio final con IVA incluido, las instrucciones de pago y las condiciones de envío. El precio final no
        incluye el costo del envío, que se paga aparte al courier (punto 8). Por cada venta emitimos boleta
        electrónica.
      </p>

      <h2>7. Pago</h2>
      <ul>
        <li>Puedes pagar por transferencia bancaria o mediante un link de pago que te enviaremos.</li>
        <li>
          Tienes <strong>{EMPRESA.horasParaPagar} horas</strong> desde que recibes la confirmación para pagar.
        </li>
        <li>
          Si no pagas dentro de ese plazo, la venta queda sin efecto y podemos ofrecer la prenda a la siguiente mejor
          oferta o volver a publicarla. Si esto se repite, podemos suspender tu cuenta.
        </li>
        <li>Nunca te pediremos claves bancarias ni datos de tarjetas por correo, WhatsApp ni Instagram.</li>
      </ul>

      <h2>8. Envío</h2>
      <ul>
        <li>
          Enviamos a todo Chile mediante {EMPRESA.couriers}, en modalidad <strong>por pagar</strong>: el costo del
          envío lo pagas tú al courier al recibir o retirar el paquete, según su tarifa.
        </li>
        <li>
          Entregamos la prenda al courier dentro de {EMPRESA.diasHabilesDespacho} días hábiles desde que confirmamos tu
          pago, y te enviamos el número de seguimiento. El plazo de entrega posterior depende del courier y del
          destino.
        </li>
        <li>
          Eres responsable de que la dirección y los datos de contacto que nos entregues sean correctos.
        </li>
      </ul>

      <h2>9. Derecho a retracto</h2>
      <p>
        Como compras a distancia, tienes <strong>derecho a retracto</strong> según el artículo 3 bis de la Ley N°
        19.496: puedes dejar sin efecto la compra, sin expresar motivo, dentro de los{" "}
        <strong>10 días corridos</strong> siguientes a la recepción de la prenda.
      </p>
      <ul>
        <li>
          Para ejercerlo, escríbenos a <a href={`mailto:${EMPRESA.correo}`}>{EMPRESA.correo}</a> dentro de ese plazo
          indicando la prenda. Te responderemos con las instrucciones de devolución.
        </li>
        <li>
          Debes devolver la prenda en el mismo estado en que la recibiste, sin uso más allá de probártela, y con sus
          etiquetas si las tenía.
        </li>
        <li>
          Te reembolsaremos lo que pagaste por el mismo medio de pago, o el que acordemos contigo, a más tardar dentro
          de los 45 días siguientes a la comunicación del retracto.
        </li>
        <li>Si no te enviamos la confirmación escrita de la compra, el plazo para retractarte se extiende a 90 días.</li>
      </ul>

      <h2>10. Garantía legal</h2>
      <p>
        Las prendas usadas se venden en el estado que se informa en su ficha. Conforme al artículo 14 de la Ley N°
        19.496, los detalles o defectos informados expresamente antes de la compra no dan derecho a cambio, reparación
        ni devolución por garantía.
      </p>
      <p>
        Si la prenda tiene un defecto que <strong>no</strong> fue informado, no corresponde a lo descrito o es
        distinta a la de la ficha, tienes derecho a la garantía legal: dentro de los 6 meses siguientes a la recepción
        puedes elegir entre el cambio (si es posible), la reparación o la devolución de lo pagado. Escríbenos a{" "}
        <a href={`mailto:${EMPRESA.correo}`}>{EMPRESA.correo}</a> con fotos del problema. En estos casos, el costo del
        envío lo asumimos nosotras.
      </p>

      <h2>11. Comunicaciones</h2>
      <p>
        Te escribiremos por correo para todo lo relacionado con tus ofertas y compras. Solo te enviaremos novedades o
        promociones si nos das tu consentimiento, y cada una incluirá una forma simple de dejar de recibirlas.
      </p>

      <h2>12. Responsabilidad y uso del sitio</h2>
      <ul>
        <li>
          Hacemos lo posible para que el sitio funcione sin interrupciones. Si por una falla técnica una venta se
          cierra con un error evidente, te lo informaremos y lo corregiremos de buena fe.
        </li>
        <li>
          Las fotos, textos y la marca {EMPRESA.marca} son de nuestra propiedad o los usamos con autorización; no
          puedes copiarlos con fines comerciales.
        </li>
        <li>
          Nada en estos términos limita los derechos que te otorga la Ley N° 19.496, que son irrenunciables.
        </li>
      </ul>

      <h2>13. Reclamos y ley aplicable</h2>
      <p>
        Si tienes un problema, escríbenos primero a <a href={`mailto:${EMPRESA.correo}`}>{EMPRESA.correo}</a>. También
        puedes presentar un reclamo ante el{" "}
        <a href="https://www.sernac.cl" target="_blank" rel="noopener">
          SERNAC
        </a>{" "}
        o acudir al Juzgado de Policía Local de tu domicilio o del nuestro, a tu elección. Estos términos se rigen por
        las leyes de la República de Chile.
      </p>
      <p>
        El tratamiento de tus datos personales se explica en la <Link href="/privacidad">Política de privacidad</Link>.
      </p>
    </article>
  );
}
