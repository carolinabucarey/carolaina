"use client";
import { useTransition } from "react";
import Foto from "@/components/Foto";
import { quitarFoto } from "../../acciones";

export default function FotosEditables({ id, fotos }: { id: string; fotos: string[] }) {
  const [pendiente, iniciar] = useTransition();
  return (
    <div className="grid grid-cols-4 gap-3">
      {fotos.map((f, i) => (
        <div key={f} className="relative">
          <Foto src={f} alt={`Foto ${i + 1}`} className="aspect-square w-full rounded-xl" />
          <button
            type="button"
            disabled={pendiente}
            onClick={() => confirm("¿Quitar esta foto?") && iniciar(() => quitarFoto(id, f))}
            className="absolute right-1 top-1 rounded-full bg-white/90 px-2 text-xs text-rosa shadow"
          >
            ✕
          </button>
          {i === 0 && <span className="absolute bottom-1 left-1 rounded bg-white/90 px-1.5 text-[10px]">Portada</span>}
        </div>
      ))}
    </div>
  );
}
