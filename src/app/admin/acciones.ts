"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { EstadoArticulo } from "@/lib/tipos";
import { exigirAdmin } from "./guardia";

const slugify = (s: string) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

const entero = (v: FormDataEntryValue | null) => {
  const n = Number(String(v ?? "").replace(/\D/g, ""));
  return n > 0 ? n : null;
};
const texto = (v: FormDataEntryValue | null) => {
  const s = String(v ?? "").trim();
  return s.length ? s : null;
};

export async function guardarArticulo(formData: FormData) {
  const { supabase } = await exigirAdmin();
  const id = texto(formData.get("id"));
  const titulo = texto(formData.get("titulo"));
  if (!titulo) throw new Error("El título es obligatorio");

  const datos = {
    titulo,
    descripcion: texto(formData.get("descripcion")),
    marca: texto(formData.get("marca")),
    talla: texto(formData.get("talla")),
    categoria: texto(formData.get("categoria")) ?? "Otros",
    instagram_url: texto(formData.get("instagram_url")),
    precio_venta_directa: entero(formData.get("precio_venta_directa")),
    incremento_minimo: entero(formData.get("incremento_minimo")) ?? 1000,
    updated_at: new Date().toISOString(),
  };

  let articuloId = id;
  if (id) {
    const { error } = await supabase.from("articulos").update(datos).eq("id", id);
    if (error) throw new Error(error.message);
  } else {
    const slug = `${slugify(titulo)}-${Date.now().toString(36).slice(-4)}`;
    const { data, error } = await supabase.from("articulos").insert({ ...datos, slug }).select("id").single();
    if (error) throw new Error(error.message);
    articuloId = data.id;
  }

  const minimo = entero(formData.get("precio_minimo"));
  if (minimo) {
    const { error } = await supabase.from("articulos_minimo").upsert({ articulo_id: articuloId, precio_minimo: minimo });
    if (error) throw new Error(error.message);
  }

  revalidatePath("/admin");
  redirect(`/admin/articulo/${articuloId}?guardado=1`);
}

export async function quitarFoto(articuloId: string, url: string) {
  await quitarArchivo(articuloId, url, "fotos");
}

export async function quitarVideo(articuloId: string, url: string) {
  await quitarArchivo(articuloId, url, "videos");
}

async function quitarArchivo(articuloId: string, url: string, campo: "fotos" | "videos") {
  const { supabase } = await exigirAdmin();
  const { data } = await supabase.from("articulos").select(campo).eq("id", articuloId).single<Record<string, string[]>>();
  const lista = (data?.[campo] ?? []).filter((f) => f !== url);
  await supabase.from("articulos").update({ [campo]: lista }).eq("id", articuloId);
  const ruta = url.split("/fotos/")[1];
  if (ruta) await supabase.storage.from("fotos").remove([ruta]);
  revalidatePath(`/admin/articulo/${articuloId}`);
}

export async function agregarFotos(articuloId: string, rutas: string[]) {
  await agregarArchivos(articuloId, rutas, "fotos");
}

export async function agregarVideos(articuloId: string, rutas: string[]) {
  await agregarArchivos(articuloId, rutas, "videos");
}

/**
 * Anota al final de la lista los archivos que el panel ya subió directo al bucket desde el navegador
 * (una server action en Vercel no acepta cuerpos de más de 4,5 MB). Recibe rutas, no URLs,
 * y solo acepta las de la carpeta de esta prenda.
 */
async function agregarArchivos(articuloId: string, rutas: string[], campo: "fotos" | "videos") {
  const { supabase } = await exigirAdmin();
  if (rutas.some((r) => !r.startsWith(`${articuloId}/`))) throw new Error("Ruta de archivo inválida");
  const { data, error: errorLectura } = await supabase
    .from("articulos")
    .select(campo)
    .eq("id", articuloId)
    .single<Record<string, string[]>>();
  if (errorLectura) throw new Error(errorLectura.message);
  const nuevas = rutas.map((r) => supabase.storage.from("fotos").getPublicUrl(r).data.publicUrl);
  const { error } = await supabase
    .from("articulos")
    .update({ [campo]: [...(data[campo] ?? []), ...nuevas], updated_at: new Date().toISOString() })
    .eq("id", articuloId);
  if (error) throw new Error(error.message);
  revalidatePath(`/admin/articulo/${articuloId}`);
}

export async function ordenarFotos(articuloId: string, urls: string[]) {
  return ordenarArchivos(articuloId, urls, "fotos");
}

export async function ordenarVideos(articuloId: string, urls: string[]) {
  return ordenarArchivos(articuloId, urls, "videos");
}

/**
 * Guarda un nuevo orden (la primera foto es la portada). Solo acepta los mismos archivos que ya tiene la prenda.
 * Devuelve el error en vez de lanzarlo porque en producción Next oculta el mensaje de los errores lanzados.
 */
async function ordenarArchivos(articuloId: string, urls: string[], campo: "fotos" | "videos"): Promise<string | null> {
  const { supabase } = await exigirAdmin();
  const { data, error: errorLectura } = await supabase
    .from("articulos")
    .select(campo)
    .eq("id", articuloId)
    .single<Record<string, string[]>>();
  if (errorLectura) return errorLectura.message;
  const actuales = data[campo] ?? [];
  const mismos = urls.length === actuales.length && [...urls].sort().join("\n") === [...actuales].sort().join("\n");
  if (!mismos) return `Los ${campo} cambiaron mientras los ordenabas. Recarga la página.`;
  const { error } = await supabase
    .from("articulos")
    .update({ [campo]: urls, updated_at: new Date().toISOString() })
    .eq("id", articuloId);
  if (error) return error.message;
  revalidatePath(`/admin/articulo/${articuloId}`);
  return null;
}

export async function cambiarEstado(articuloId: string, estado: EstadoArticulo) {
  const { supabase } = await exigirAdmin();
  if (estado === "activo") {
    const { data: min } = await supabase.from("articulos_minimo").select("precio_minimo").eq("articulo_id", articuloId).maybeSingle();
    if (!min) throw new Error("Define la oferta mínima antes de publicar");
  }
  const { error } = await supabase
    .from("articulos")
    .update({ estado, updated_at: new Date().toISOString() })
    .eq("id", articuloId);
  if (error) throw new Error(error.message);
  revalidatePath("/admin");
  revalidatePath(`/admin/articulo/${articuloId}`);
}
