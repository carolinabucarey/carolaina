"use client";
import { useEffect, useState } from "react";

function partes(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const seg = s % 60;
  return [h, m, seg].map((n) => String(n).padStart(2, "0")).join(":");
}

export default function CuentaRegresiva({
  cierre,
  alTerminar,
  className = "",
}: {
  cierre: string;
  alTerminar?: () => void;
  className?: string;
}) {
  const fin = new Date(cierre).getTime();
  const [ahora, setAhora] = useState<number | null>(null);

  useEffect(() => {
    setAhora(Date.now());
    const t = setInterval(() => {
      const n = Date.now();
      setAhora(n);
      if (n >= fin) {
        clearInterval(t);
        alTerminar?.();
      }
    }, 1000);
    return () => clearInterval(t);
  }, [fin, alTerminar]);

  if (ahora === null) return <span className={className}>--:--:--</span>;
  if (ahora >= fin) return <span className={className}>Cerrada</span>;
  return <span className={`tabular-nums ${className}`}>{partes(fin - ahora)}</span>;
}
