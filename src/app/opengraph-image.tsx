import { ImageResponse } from "next/og";

export const alt = "El Ropero de Carolaina · Ropa de segunda mano por ofertas";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function ImagenOpenGraph() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#f8f3ec",
          color: "#6b4f3a",
          padding: 80,
        }}
      >
        <div style={{ fontSize: 26, letterSpacing: 8, textTransform: "uppercase", color: "#b9706f" }}>
          Ropa de segunda mano · sin precio
        </div>
        <div style={{ marginTop: 28, fontSize: 92, fontStyle: "italic", fontFamily: "serif" }}>
          El Ropero de Carolaina
        </div>
        <div style={{ marginTop: 28, fontSize: 36, color: "#2f2620", textAlign: "center" }}>
          Deja tu oferta, llévate la prenda
        </div>
        <div style={{ marginTop: 48, fontSize: 24, color: "#6b4f3a" }}>Envíos a todo Chile</div>
      </div>
    ),
    size,
  );
}
