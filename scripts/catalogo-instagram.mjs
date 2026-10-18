// Catálogo inicial tomado de @elroperodecarolaina (Instagram, octubre 2026).
// Genera supabase/seed.sql. Todos quedan en "borrador": falta definir el mínimo
// interno y subir fotos desde /admin antes de publicarlos.
//   node scripts/catalogo-instagram.mjs
import { writeFileSync } from "node:fs";

const IG = "https://www.instagram.com/p/";

// [idPublicacion, titulo, marca, talla, categoria]
const items = [
  ["DVrVmTwgQGB", "Botines Burano de cuero con diseño floral", "Burano", "36", "Zapatos"],
  ["DVoUFKbESiZ", "Botas biker Vanesa Gil", "Vanesa Gil", "37", "Zapatos"],
  ["DVjIfpjDdpf", "Vestido Rapsodia blanco", "Rapsodia", "M", "Vestidos"],
  ["DVgkIapjToE", "Pantalón Zara tiro alto", "Zara", null, "Pantalones"],
  ["DVf2lDnjW7Q", "Pantalón Lolita Pocket beige", "Lolita", null, "Pantalones"],
  ["DVeheLZEsuP", "Falda denim negra H&M Divided (nueva con etiqueta)", "H&M", "36", "Faldas"],
  ["DVeJgUDkdMm", "Falda short liviana", null, null, "Faldas"],
  ["DVd1tZ6DZzt", "Falda denim larga Studio F con cinturón", "Studio F", "40", "Faldas"],
  ["DVXRAP4DIIC", "Pantalón europeo Costes", "Costes", null, "Pantalones"],
  ["DVWerlNkRhU", "Sandalias Aldo de cuero (usadas una vez)", "Aldo", "36", "Zapatos"],
  ["DVWEnngDZRd", "Vestido largo de encaje", null, "S", "Vestidos"],
  ["DVUhWW8gREZ", "Vestido largo IO", "IO", "S", "Vestidos"],
  ["DVT6bZ8Ee1Q", "Sandalias plateadas de fiesta", null, "37", "Zapatos"],
  ["DVTqPIRjUvc", "Zapatos dorados elegantes", null, "35", "Zapatos"],
  ["DVTXhdADWah", "Vestido Mango de lunares", "Mango", "M", "Vestidos"],
  ["DVR-idrjWGe", "Vestido estilo brasileño", null, null, "Vestidos"],
  ["DVRZVb9D_xH", "Jeans Levi's 501 Original", "Levi's", "26", "Pantalones"],
  ["DVHg-mvkh7j", "Vestido fresquito de verano", null, null, "Vestidos"],
  ["DVAJcFxDD4W", "Chaqueta de cuero Prüne", "Prüne", "S", "Chaquetas"],
  ["DU83qYJEp55", "Vestido Zara", "Zara", "M", "Vestidos"],
  ["DU4VhagjGrf", "Zapatos de cuero de diseño único", null, null, "Zapatos"],
  ["DU2u_RrFVTe", "Zapatos con textura snake metalizada", null, "38", "Zapatos"],
  ["DU0afUXEesX", "Chaqueta denim bordada", null, "XL", "Chaquetas"],
  ["DUyn3SbEn-_", "Dúo de vestidos livianos", null, "L", "Vestidos"],
  ["DUwfYGMD0lS", "Dúo verano", null, "L", "Vestidos"],
  ["DUp922nkTFS", "Zapatillas Colloki fucsia", "Colloki", "38", "Zapatos"],
  ["DUoxLKSjBUv", "Falda Studio F asimétrica", "Studio F", null, "Faldas"],
  ["DUlskhhEuCF", "Chaqueta Desigual", "Desigual", "38", "Chaquetas"],
  ["DUlFQE7jYtV", "Jeans con diseño", null, "34", "Pantalones"],
  ["DUhCxwWDAqr", "Sandalias Gacel azules y verdes", "Gacel", null, "Zapatos"],
  ["DUgMTUdkcI7", "Jeans GAP tiro alto", "GAP", "28", "Pantalones"],
  ["DUf4HHokSta", "Polera halter satinada Zara", "Zara", "S", "Blusas"],
  ["DUfwUQACL_e", "Vestido Dalu by Privilege", "Privilege", "S", "Vestidos"],
  ["DUed0DGD72B", "Chaqueta de mezclilla clásica", null, null, "Chaquetas"],
  [null, "Sandalias Bon-Bonite boho", "Bon-Bonite", null, "Zapatos"],
  ["DUd0niYiDcF", "Vestido Mossimo floral", "Mossimo", "M", "Vestidos"],
  ["DUdf_uNiMWd", "Polera cruzada de encaje Umbrale", "Umbrale", "M", "Blusas"],
  ["DUdLZIQiZNF", "Sandalias cómodas y elegantes", null, "36", "Zapatos"],
  ["DUciMN7DXaF", "Polera floral rojo y marfil", null, null, "Blusas"],
  ["DUcNm4Uj3m_", "Polera de encaje negro Umbrale", "Umbrale", "M", "Blusas"],
  ["DUYq9pwkeFr", "Zapatos Burano esmeralda iridiscente", "Burano", "35", "Zapatos"],
  ["DUWo22Bktw_", "Botines Zappa de cuero", "Zappa", "36", "Zapatos"],
  ["DUOPncUkXKK", "Zapatillas MIM café", "MIM", "36", "Zapatos"],
  ["DUEld16kuqc", "Cartera Kipling Felix rose gold", "Kipling", null, "Carteras"],
];

const slugify = (s) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()
    .replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
const q = (v) => (v == null ? "null" : `'${String(v).replace(/'/g, "''")}'`);

const usados = new Set();
const filas = items.map(([ig, titulo, marca, talla, cat]) => {
  let slug = slugify(titulo);
  while (usados.has(slug)) slug += "-2";
  usados.add(slug);
  const url = ig ? IG + ig + "/" : "https://www.instagram.com/elroperodecarolaina/";
  return `  (${q(slug)}, ${q(titulo)}, ${q(marca)}, ${q(talla)}, ${q(cat)}, ${q(url)}, 'borrador')`;
});

const sql = `-- Generado por scripts/catalogo-instagram.mjs
insert into public.articulos (slug, titulo, marca, talla, categoria, instagram_url, estado) values
${filas.join(",\n")}
on conflict (slug) do nothing;
`;
writeFileSync(new URL("../supabase/seed.sql", import.meta.url), sql);
console.log(`seed.sql con ${items.length} artículos`);
