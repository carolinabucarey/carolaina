import type { Metadata } from "next";
import Link from "next/link";
import { EMPRESA } from "@/lib/empresa";

export const metadata: Metadata = {
  title: "Preguntas frecuentes",
  description:
    "Cómo funcionan las ofertas, el precio mínimo y las 24 horas finales, cómo pagar, el envío por pagar, el derecho a retracto y la garantía de las prendas.",
  alternates: { canonical: "/preguntas-frecuentes" },
};

type Pregunta = { p: string; r: string; enlace?: { href: string; texto: string } };

const SECCIONES: { titulo: string; preguntas: Pregunta[] }[] = [
  {
    titulo: "Cómo funciona",
    preguntas: [
      {
        p: "¿Cómo funciona la venta por ofertas?",
        r: "Las prendas se publican sin precio. Ingresas con tu correo y ofreces lo que quieras pagar. Cada prenda tiene un precio mínimo; cuando una oferta lo alcanza, se abren 24 horas finales para más ofertas y, al terminar, la prenda es para la oferta más alta.",
      },
      {
        p: "¿Por qué las prendas no muestran precio?",
        r: "Porque el precio lo definen las ofertas. Así cada prenda llega a quien más la quiere, a un valor justo. En la ficha siempre ves la oferta actual y cuántas ofertas lleva.",
      },
      {
        p: "¿Qué es el precio mínimo y por qué no lo veo?",
        r: "Es el valor bajo el cual no vendemos la prenda. Se mantiene reservado para que las ofertas reflejen lo que cada persona está dispuesta a pagar. Mientras ninguna oferta lo alcance, la ficha dice «Aún no se alcanza el mínimo».",
      },
      {
        p: "¿Qué pasa cuando una oferta alcanza el mínimo?",
        r: "Empieza una cuenta regresiva de 24 horas que se ve en la ficha. Durante ese tiempo cualquiera puede seguir ofertando. Al llegar a cero, gana la oferta más alta.",
      },
      {
        p: "¿Cuánto tengo que subir sobre la oferta anterior?",
        r: "Cada ficha indica la oferta mínima que puedes hacer: la oferta actual más un incremento mínimo (normalmente $1.000).",
      },
      {
        p: "¿Qué pasa si dos personas ofrecen lo mismo?",
        r: "Gana la oferta que se hizo primero.",
      },
      {
        p: "¿Puedo retirar una oferta?",
        r: "No. Una oferta es un compromiso de compra, así que oferta solo lo que estés dispuesta a pagar. Si ganas, igual conservas tu derecho a retracto una vez que recibas la prenda.",
      },
      {
        p: "¿Qué es la venta directa?",
        r: "Algunas prendas tienen un precio para comprarlas de inmediato. Está disponible solo mientras ninguna oferta haya alcanzado el mínimo; si la usas, la prenda es tuya y se cierran las ofertas.",
      },
      {
        p: "¿Cómo sé si gané?",
        r: "Te escribimos al correo con el que ingresaste, con el precio final y las instrucciones de pago. También puedes revisar tus ofertas en la sección «Mis ofertas».",
      },
    ],
  },
  {
    titulo: "Tu cuenta",
    preguntas: [
      {
        p: "¿Necesito crear una cuenta o una contraseña?",
        r: "No. Solo escribes tu correo y te enviamos un enlace para ingresar. Debes ser mayor de 18 años para ofertar o comprar.",
      },
      {
        p: "No me llegó el enlace para ingresar",
        r: "Revisa la carpeta de spam o promociones y espera un par de minutos. Abre el enlace en el mismo dispositivo y navegador donde lo pediste; vence después de un rato, así que si pasó mucho tiempo pide uno nuevo.",
      },
    ],
  },
  {
    titulo: "Pago, envío y boleta",
    preguntas: [
      {
        p: "¿Cómo pago?",
        r: `Por transferencia bancaria o con un link de pago que te enviamos. Tienes ${EMPRESA.horasParaPagar} horas desde que te confirmamos la compra para pagar.`,
      },
      {
        p: "¿Qué pasa si no pago a tiempo?",
        r: "La venta queda sin efecto y la prenda puede pasar a la siguiente mejor oferta o volver a publicarse. Si se repite, podemos suspender la cuenta.",
      },
      {
        p: "¿Cuánto cuesta el envío?",
        r: `Enviamos a todo Chile por ${EMPRESA.couriers} en modalidad por pagar: pagas el envío directamente al courier al recibir o retirar el paquete, según su tarifa.`,
      },
      {
        p: "¿Cuándo envían mi prenda?",
        r: `Dentro de ${EMPRESA.diasHabilesDespacho} días hábiles desde que confirmamos tu pago, y te mandamos el número de seguimiento.`,
      },
      {
        p: "¿Entregan boleta?",
        r: "Sí, por cada compra emitimos boleta electrónica.",
      },
    ],
  },
  {
    titulo: "Prendas, cambios y devoluciones",
    preguntas: [
      {
        p: "¿Las prendas son nuevas o usadas?",
        r: "La mayoría son de segunda mano, usadas o seminuevas; si una es nueva o tiene etiqueta, lo decimos en su ficha. Cada ficha tiene fotos reales y describe el estado de la prenda y cualquier detalle que tenga.",
      },
      {
        p: "¿Puedo devolver una prenda?",
        r: "Sí. Tienes derecho a retracto: dentro de los 10 días siguientes a recibirla puedes devolverla sin dar motivos, en el mismo estado en que llegó y con sus etiquetas si las tenía. Escríbenos y te damos las instrucciones; te devolvemos lo pagado.",
        enlace: { href: "/terminos", texto: "Ver el punto 9 de los términos" },
      },
      {
        p: "¿Y si la prenda llega con un defecto que no estaba informado?",
        r: "Tienes garantía legal de 6 meses: puedes elegir el cambio si es posible, la reparación o la devolución de lo pagado. Escríbenos con fotos del problema. Los detalles que sí estaban informados en la ficha no dan derecho a garantía.",
      },
      {
        p: "¿Hacen cambios de talla?",
        r: "Como cada prenda es única, no podemos cambiarla por otra talla. Si no te queda, puedes usar tu derecho a retracto. Revisa la talla y la descripción y, si tienes dudas, pregúntanos antes de ofertar.",
      },
    ],
  },
  {
    titulo: "Privacidad y contacto",
    preguntas: [
      {
        p: "¿Qué hacen con mis datos?",
        r: "Los usamos solo para gestionar tus ofertas y compras, coordinar el pago y el envío, y cumplir la ley. En el historial público de ofertas solo aparece un alias abreviado, nunca tu correo.",
        enlace: { href: "/privacidad", texto: "Leer la política de privacidad" },
      },
      {
        p: "¿Cómo los contacto?",
        r: `Escríbenos a ${EMPRESA.correo} o por mensaje directo en Instagram (@elroperodecarolaina).`,
      },
    ],
  },
];

const datosEstructurados = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: SECCIONES.flatMap((s) =>
    s.preguntas.map((q) => ({ "@type": "Question", name: q.p, acceptedAnswer: { "@type": "Answer", text: q.r } })),
  ),
};

export default function PreguntasFrecuentes() {
  return (
    <div className="texto-legal">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(datosEstructurados) }} />
      <h1>Preguntas frecuentes</h1>
      <p>
        Todo lo que necesitas saber para ofertar, pagar y recibir tu prenda. Si no encuentras tu respuesta, escríbenos
        a <a href={`mailto:${EMPRESA.correo}`}>{EMPRESA.correo}</a>.
      </p>

      {SECCIONES.map((s) => (
        <section key={s.titulo} className="space-y-2">
          <h2>{s.titulo}</h2>
          {s.preguntas.map((q) => (
            <details key={q.p} className="group rounded-2xl bg-white px-5 py-3 ring-1 ring-arena">
              <summary className="cursor-pointer list-none font-medium marker:hidden">
                <span className="flex items-center justify-between gap-4">
                  {q.p}
                  <span className="text-rosa transition group-open:rotate-45">+</span>
                </span>
              </summary>
              <p className="mt-2 text-tinta/80">
                {q.r}
                {q.enlace && (
                  <>
                    {" "}
                    <Link href={q.enlace.href}>{q.enlace.texto}</Link>.
                  </>
                )}
              </p>
            </details>
          ))}
        </section>
      ))}
    </div>
  );
}
