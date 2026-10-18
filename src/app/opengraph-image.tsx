import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const alt = "El Ropero de Carolaina · Ropa de segunda mano por ofertas";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function ImagenOpenGraph() {
  const logo = await readFile(join(process.cwd(), "public/logo.png"));
  const logoSrc = `data:image/png;base64,${logo.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 72,
          background: "#f8f3ec",
          padding: 80,
        }}
      >
        <img src={logoSrc} width={380} height={380} alt="" />
        <div style={{ display: "flex", flexDirection: "column", maxWidth: 600 }}>
          <div style={{ fontSize: 20, letterSpacing: 3, textTransform: "uppercase", color: "#b9706f" }}>
            Ropa de segunda mano · sin precio
          </div>
          <div style={{ marginTop: 24, fontSize: 64, lineHeight: 1.1, color: "#6b4f3a" }}>
            Deja tu oferta, llévate la prenda
          </div>
          <div style={{ marginTop: 32, fontSize: 28, color: "#2f2620" }}>Envíos a todo Chile</div>
        </div>
      </div>
    ),
    size,
  );
}
