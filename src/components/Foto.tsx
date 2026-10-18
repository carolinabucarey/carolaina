/* eslint-disable @next/next/no-img-element */
export default function Foto({ src, alt, className = "" }: { src?: string; alt: string; className?: string }) {
  if (!src) {
    return (
      <div className={`flex items-center justify-center bg-arena font-serif text-sm italic text-cafe/60 ${className}`}>
        Foto pronto
      </div>
    );
  }
  return <img src={src} alt={alt} className={`object-cover ${className}`} loading="lazy" />;
}
