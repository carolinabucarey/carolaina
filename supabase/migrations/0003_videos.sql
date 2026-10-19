-- Videos cortos de la prenda. Van en su propia columna para que la portada, las tarjetas
-- del catálogo y la imagen para compartir sigan usando solo fotos; la ficha los muestra
-- en el carrusel justo después de la portada.
-- Se guardan en el mismo bucket `fotos` ({articulo_id}/{uuid}.mp4) y se suben directo
-- desde el navegador del panel: la función de Vercel no acepta cuerpos de más de 4,5 MB.
alter table public.articulos add column if not exists videos text[] not null default '{}';
