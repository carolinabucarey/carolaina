import { NextResponse } from "next/server";
import { crearClienteServidor } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const volver = url.searchParams.get("volver") || "/";
  const destino = volver.startsWith("/") && !volver.startsWith("//") ? volver : "/";
  if (code) {
    const supabase = await crearClienteServidor();
    await supabase.auth.exchangeCodeForSession(code);
  }
  return NextResponse.redirect(new URL(destino, url.origin));
}
