// Datos del proveedor que exigen el Reglamento de Comercio Electrónico (Decreto 6/2021)
// y la Ley 21.719. Se muestran en el footer, los términos y la política de privacidad.
const DIRECCION = { calle: "Coventry 1985", comuna: "Ñuñoa", region: "Región Metropolitana" };

export const EMPRESA = {
  marca: "El Ropero de Carolaina",
  razonSocial: "Luxe Skin Chile SpA",
  rut: "78.136.093-7",
  direccion: DIRECCION,
  domicilio: `${DIRECCION.calle}, ${DIRECCION.comuna}, ${DIRECCION.region}, Chile`,
  correo: "carolina@luxeskin.cl",
  instagram: "https://www.instagram.com/elroperodecarolaina/",
  // El art. 14 ter de la Ley 19.628 (texto de la Ley 21.719) pide identificar al representante legal.
  representanteLegal: null as string | null,
  horasParaPagar: 24,
  diasHabilesDespacho: 3,
  couriers: "Starken, Chilexpress o Blue Express",
};

export const SITIO_URL = process.env.NEXT_PUBLIC_SITIO_URL ?? "https://elroperodecarolaina.vercel.app";

export const VERSION_LEGAL = { version: "1.0", vigencia: "18 de octubre de 2026" };
