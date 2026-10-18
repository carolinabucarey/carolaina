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

  // Fotos nuevas
  const archivos = formData.getAll("fotos").filter((f): f is File => f instanceof File && f.size > 0);
  if (archivos.length) {
    const { data: actual } = await supabase.from("articulos").select("fotos").eq("id", articuloId).single();
    const urls: string[] = [...(actual?.fotos ?? [])];
    for (const f of archivos) {
      const ext = f.name.split(".").pop()?.toLowerCase() || "jpg";
      const ruta = `${articuloId}/${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage.from("fotos").upload(ruta, f, { contentType: f.type });
      if (error) throw new Error(`No se pudo subir ${f.name}: ${error.message}`);
      urls.push(supabase.storage.from("fotos").getPublicUrl(ruta).data.publicUrl);
    }
    await supabase.from("articulos").update({ fotos: urls }).eq("id", articuloId);
  }

  revalidatePath("/admin");
  redirect(`/admin/articulo/${articuloId}?guardado=1`);
}

export async function quitarFoto(articuloId: string, url: string) {
  const { supabase } = await exigirAdmin();
  const { data } = await supabase.from("articulos").select("fotos").eq("id", articuloId).single();
  const fotos = (data?.fotos ?? []).filter((f: string) => f !== url);
  await supabase.from("articulos").update({ fotos }).eq("id", articuloId);
  const ruta = url.split("/fotos/")[1];
  if (ruta) await supabase.storage.from("fotos").remove([ruta]);
  revalidatePath(`/admin/articulo/${articuloId}`);
}

export async function cambiarEstado(articuloId: string, estado: EstadoArticulo) {
  const { supabase } = await exigirAdmin();
  if (estado === "activo") {
    const { data: min } = await supabase.from("articulos_minimo").select("precio_minimo").eq("articulo_id", articuloId).maybeSingle();
    if (!min) throw new Error("Define el mínimo interno antes de publicar");
  }
  const { error } = await supabase
    .from("articulos")
    .update({ estado, updated_at: new Date().toISOString() })
    .eq("id", articuloId);
  if (error) throw new Error(error.message);
  revalidatePath("/admin");
  revalidatePath(`/admin/articulo/${articuloId}`);
}
