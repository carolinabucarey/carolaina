import Image from "next/image";

/**
 * Foto de una prenda. Usa next/image para servirla redimensionada y en WebP/AVIF:
 * las fotos se suben desde el celular a tamaño completo (varios MB).
 * `sizes` debe describir el ancho con que se muestra, para que el navegador pida la versión justa.
 */
export default function Foto({
  src,
  alt,
  className = "",
  sizes = "100vw",
  priority = false,
  loading,
}: {
  src?: string;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  loading?: "eager" | "lazy";
}) {
  if (!src) {
    return (
      <div className={`flex items-center justify-center bg-arena font-serif text-sm italic text-cafe/90 ${className}`}>
        Foto pronto
      </div>
    );
  }
  return (
    <Image
      src={src}
      alt={alt}
      width={800}
      height={1000}
      sizes={sizes}
      priority={priority}
      loading={loading}
      className={`object-cover ${className}`}
    />
  );
}
