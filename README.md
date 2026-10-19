# El Ropero de Carolaina · Subastas en 24 h

Web de subastas para las prendas de [@elroperodecarolaina](https://www.instagram.com/elroperodecarolaina/), con las mismas reglas del Instagram:

1. Las prendas se adjudican a la mejor oferta.
2. Cada prenda muestra una **oferta mínima** (precio de partida): la primera oferta debe alcanzarla.
3. La primera oferta abre **24 h finales** para mejorarla.
4. Al cerrar, gana la oferta más alta (en empate, la primera). La ganadora recibe un correo y la prenda aparece en «Por coordinar» en el panel.
5. **Venta directa** opcional, disponible hasta la primera oferta.

## Stack

- Next.js 15 (App Router) + Tailwind CSS 4
- Supabase: Postgres, Auth (enlace por correo), Storage (fotos y videos), Realtime (oferta en vivo) y `pg_cron` (cierre automático cada minuto)
- Resend para correos (opcional)
- Despliegue sugerido: Vercel

Toda la lógica de la subasta vive en la base de datos (`supabase/migrations/0001_subastas.sql`): las funciones `ofertar`, `comprar_directo` y `cerrar_subastas_vencidas` bloquean la fila del artículo, así que dos ofertas simultáneas nunca se pisan.

## Puesta en marcha

1. **Supabase**: crea un proyecto y, en *SQL Editor*, ejecuta en orden los archivos de `supabase/migrations/` y luego `supabase/seed.sql` (44 prendas del Instagram como borradores).
   - En *Database → Extensions* deben quedar activas `pg_cron` y `pg_net`.
   - En *Authentication → URL Configuration* agrega `https://TU-SITIO/auth/callback` (y `http://localhost:3000/auth/callback`).
2. **Variables**: copia `.env.example` a `.env.local` y completa los valores.
3. **Local**:
   ```bash
   npm install
   npm run dev
   ```
4. **Hazte admin**: ingresa una vez en el sitio con tu correo y luego, en el SQL Editor:
   ```sql
   insert into public.admins (user_id)
   select id from auth.users where email = 'TU_CORREO';
   ```
5. **Carga el catálogo**: en `/admin → Borradores`, abre cada prenda, sube fotos (y videos, de hasta 50 MB), define la **oferta mínima** (y si quieres, la venta directa) y presiona **Publicar**.

## Avisos por correo

`/api/cron/notificar` cierra subastas vencidas y envía:
- a la ganadora: confirmación con el monto;
- a la admin (`ADMIN_EMAIL`): cada adjudicación y cada vez que una prenda recibe su primera oferta (momento de subir la historia de «últimas 24 h»).

Lo llama **Vercel Cron** cada 5 minutos (`vercel.json`). Vercel envía `Authorization: Bearer CRON_SECRET` automáticamente cuando la variable `CRON_SECRET` existe en el proyecto, así que no hay que configurar nada más. Para probarlo al instante: Vercel → proyecto → *Settings → Cron Jobs → Run*.

Los correos salen por Resend desde el dominio verificado `luxeskin.cl` (`CORREO_REMITENTE`). Los enlaces de acceso de Supabase también usan Resend como SMTP (*Authentication → Emails → SMTP Settings*: `smtp.resend.com`, puerto 465, usuario `resend`, contraseña = API key).

## Catálogo desde Instagram

`scripts/catalogo-instagram.mjs` contiene las prendas tomadas del perfil y genera `supabase/seed.sql`. Las fotos de Instagram no se pueden reutilizar por enlace (expiran), por eso se suben desde el panel.

## Pendiente para siguientes versiones

- Pago en línea al adjudicar (Mercado Pago / Webpay).
- Aviso a quien fue superada por otra oferta.
- Perfil con teléfono/Instagram editable por la usuaria.
