# El Ropero de Carolaina · Subastas en 24 h

Web de subastas para las prendas de [@elroperodecarolaina](https://www.instagram.com/elroperodecarolaina/), con las mismas reglas del Instagram:

1. Las prendas se publican **sin precio** y se adjudican a la mejor oferta.
2. Cada prenda tiene un **mínimo interno** (oculto al público).
3. Cuando una oferta alcanza el mínimo, se abren **24 h finales** para más ofertas.
4. Al cerrar, gana la oferta más alta (en empate, la primera). La ganadora recibe un correo y la prenda aparece en «Por coordinar» en el panel.
5. **Venta directa** opcional, disponible mientras no se alcance el mínimo.

## Stack

- Next.js 15 (App Router) + Tailwind CSS 4
- Supabase: Postgres, Auth (enlace por correo), Storage (fotos), Realtime (oferta en vivo) y `pg_cron` (cierre automático cada minuto)
- Resend para correos (opcional)
- Despliegue sugerido: Vercel

Toda la lógica de la subasta vive en la base de datos (`supabase/migrations/0001_subastas.sql`): las funciones `ofertar`, `comprar_directo` y `cerrar_subastas_vencidas` bloquean la fila del artículo, así que dos ofertas simultáneas nunca se pisan.

## Puesta en marcha

1. **Supabase**: crea un proyecto y, en *SQL Editor*, ejecuta `supabase/migrations/0001_subastas.sql` y luego `supabase/seed.sql` (44 prendas del Instagram como borradores).
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
5. **Carga el catálogo**: en `/admin → Borradores`, abre cada prenda, sube fotos, define el **mínimo interno** (y si quieres, la venta directa) y presiona **Publicar**.

## Avisos por correo

`/api/cron/notificar` cierra subastas vencidas y envía:
- a la ganadora: confirmación con el monto;
- a la admin (`ADMIN_EMAIL`): cada adjudicación y cada vez que una prenda alcanza el mínimo (momento de subir la historia de «últimas 24 h»).

Prográmalo desde Supabase cada 5 minutos (reemplaza la URL y el secreto):

```sql
select cron.schedule('notificar', '*/5 * * * *', $$
  select net.http_get(
    url := 'https://TU-SITIO/api/cron/notificar',
    headers := jsonb_build_object('Authorization', 'Bearer TU_CRON_SECRET')
  );
$$);
```

## Catálogo desde Instagram

`scripts/catalogo-instagram.mjs` contiene las prendas tomadas del perfil y genera `supabase/seed.sql`. Las fotos de Instagram no se pueden reutilizar por enlace (expiran), por eso se suben desde el panel.

## Pendiente para siguientes versiones

- Pago en línea al adjudicar (Mercado Pago / Webpay).
- Aviso a quien fue superada por otra oferta.
- Perfil con teléfono/Instagram editable por la usuaria.
