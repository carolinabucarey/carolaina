-- El Ropero de Carolaina · esquema de subastas con adjudicación en 24 h
-- Reglas (las mismas del Instagram):
--   1. Las prendas se publican SIN PRECIO y se adjudican a la mejor oferta.
--   2. Cada prenda tiene un mínimo interno (oculto al público).
--   3. Cuando una oferta alcanza el mínimo, se abren 24 h finales para más ofertas.
--   4. Al cerrar las 24 h, gana la oferta más alta (en empate, la más antigua).
--   5. Venta directa opcional ("Ver producto") mientras no haya partido la cuenta regresiva.

create extension if not exists pg_cron;
create extension if not exists pg_net;

-- ───────────── Perfiles y administradores ─────────────
create table public.perfiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nombre text,
  email text,
  telefono text,
  instagram text,
  created_at timestamptz not null default now()
);

create table public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade
);

create or replace function public.es_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

-- Crea el perfil automáticamente al registrarse
create or replace function public.crear_perfil() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.perfiles (id, nombre, email)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)), new.email);
  return new;
end $$;

create trigger al_crear_usuario after insert on auth.users
  for each row execute function public.crear_perfil();

-- ───────────── Artículos ─────────────
create type public.estado_articulo as enum (
  'borrador',              -- cargado pero no visible
  'activo',                -- recibiendo ofertas, mínimo aún no alcanzado
  'cuenta_regresiva',      -- mínimo alcanzado: corren las 24 h finales
  'adjudicado',            -- cerrado con ganador
  'vendido_directo',       -- comprado con venta directa
  'retirado'               -- oculto (vendido por otro canal, etc.)
);

create table public.articulos (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  titulo text not null,
  descripcion text,
  marca text,
  talla text,
  categoria text not null default 'Otros',
  fotos text[] not null default '{}',
  instagram_url text,
  estado public.estado_articulo not null default 'borrador',
  precio_venta_directa integer check (precio_venta_directa > 0),
  incremento_minimo integer not null default 1000 check (incremento_minimo > 0),
  oferta_actual integer,                 -- denormalizado para la vista pública y realtime
  total_ofertas integer not null default 0,
  minimo_alcanzado_at timestamptz,
  cierre_at timestamptz,                 -- fin de las 24 h
  ganador_id uuid references auth.users(id),
  monto_final integer,
  adjudicado_at timestamptz,
  notificado_at timestamptz,            -- aviso de adjudicación enviado
  aviso_minimo_at timestamptz,           -- aviso a la admin de que partieron las 24 h
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index on public.articulos (estado);
create index on public.articulos (cierre_at) where estado = 'cuenta_regresiva';

-- El mínimo vive en una tabla aparte: solo admins pueden leerlo.
create table public.articulos_minimo (
  articulo_id uuid primary key references public.articulos(id) on delete cascade,
  precio_minimo integer not null check (precio_minimo > 0)
);

create table public.ofertas (
  id bigint generated always as identity primary key,
  articulo_id uuid not null references public.articulos(id) on delete cascade,
  usuario_id uuid not null references auth.users(id) on delete cascade,
  monto integer not null check (monto > 0),
  created_at timestamptz not null default now()
);
create index on public.ofertas (articulo_id, monto desc, created_at);
create index on public.ofertas (usuario_id);

-- ───────────── RLS ─────────────
alter table public.perfiles enable row level security;
alter table public.admins enable row level security;
alter table public.articulos enable row level security;
alter table public.articulos_minimo enable row level security;
alter table public.ofertas enable row level security;

create policy "perfil propio" on public.perfiles for select using (id = auth.uid() or public.es_admin());
create policy "editar perfil propio" on public.perfiles for update using (id = auth.uid());

create policy "admins ven admins" on public.admins for select using (public.es_admin());

create policy "público ve artículos publicados" on public.articulos for select
  using (estado not in ('borrador', 'retirado') or public.es_admin());
create policy "admin gestiona artículos" on public.articulos for all
  using (public.es_admin()) with check (public.es_admin());

create policy "admin gestiona mínimos" on public.articulos_minimo for all
  using (public.es_admin()) with check (public.es_admin());

-- Las ofertas se insertan solo vía la función ofertar(); cada quien ve las suyas.
create policy "ver ofertas propias" on public.ofertas for select
  using (usuario_id = auth.uid() or public.es_admin());

-- ───────────── Lógica de subasta ─────────────

-- Cierra las subastas cuyas 24 h vencieron. La llama pg_cron cada minuto
-- y también se invoca antes de cada oferta/lectura para no depender del cron.
create or replace function public.cerrar_subastas_vencidas() returns integer
language plpgsql security definer set search_path = public as $$
declare
  a record;
  mejor record;
  n integer := 0;
begin
  for a in
    select id from articulos
    where estado = 'cuenta_regresiva' and cierre_at <= now()
    for update skip locked
  loop
    select usuario_id, monto into mejor
    from ofertas where articulo_id = a.id
    order by monto desc, created_at asc limit 1;

    update articulos set
      estado = 'adjudicado',
      ganador_id = mejor.usuario_id,
      monto_final = mejor.monto,
      adjudicado_at = now(),
      updated_at = now()
    where id = a.id;
    n := n + 1;
  end loop;
  return n;
end $$;

create or replace function public.ofertar(p_articulo uuid, p_monto integer) returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  v_uid uuid := auth.uid();
  art articulos%rowtype;
  v_minimo integer;
  v_piso integer;
  v_minimo_alcanzado boolean := false;
begin
  if v_uid is null then
    raise exception 'Debes iniciar sesión para ofertar' using errcode = '28000';
  end if;

  perform cerrar_subastas_vencidas();

  select * into art from articulos where id = p_articulo for update;
  if not found then
    raise exception 'El artículo no existe';
  end if;
  if art.estado not in ('activo', 'cuenta_regresiva') then
    raise exception 'Esta subasta ya no recibe ofertas';
  end if;

  v_piso := coalesce(art.oferta_actual + art.incremento_minimo, art.incremento_minimo);
  if p_monto < v_piso then
    raise exception 'La oferta debe ser de al menos $%', replace(to_char(v_piso, 'FM999,999,999'), ',', '.');
  end if;

  insert into ofertas (articulo_id, usuario_id, monto) values (p_articulo, v_uid, p_monto);

  select precio_minimo into v_minimo from articulos_minimo where articulo_id = p_articulo;

  if art.estado = 'activo' and v_minimo is not null and p_monto >= v_minimo then
    v_minimo_alcanzado := true;
    update articulos set
      estado = 'cuenta_regresiva',
      minimo_alcanzado_at = now(),
      cierre_at = now() + interval '24 hours',
      oferta_actual = p_monto,
      total_ofertas = total_ofertas + 1,
      updated_at = now()
    where id = p_articulo
    returning * into art;
  else
    update articulos set
      oferta_actual = p_monto,
      total_ofertas = total_ofertas + 1,
      updated_at = now()
    where id = p_articulo
    returning * into art;
  end if;

  return jsonb_build_object(
    'estado', art.estado,
    'oferta_actual', art.oferta_actual,
    'cierre_at', art.cierre_at,
    'minimo_alcanzado', v_minimo_alcanzado
  );
end $$;

create or replace function public.comprar_directo(p_articulo uuid) returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  v_uid uuid := auth.uid();
  art articulos%rowtype;
begin
  if v_uid is null then
    raise exception 'Debes iniciar sesión para comprar' using errcode = '28000';
  end if;
  select * into art from articulos where id = p_articulo for update;
  if not found then raise exception 'El artículo no existe'; end if;
  if art.precio_venta_directa is null then
    raise exception 'Este artículo no tiene venta directa';
  end if;
  if art.estado <> 'activo' then
    raise exception 'La venta directa ya no está disponible para este artículo';
  end if;

  update articulos set
    estado = 'vendido_directo',
    ganador_id = v_uid,
    monto_final = precio_venta_directa,
    adjudicado_at = now(),
    updated_at = now()
  where id = p_articulo;

  return jsonb_build_object('estado', 'vendido_directo', 'monto', art.precio_venta_directa);
end $$;

-- Historial público: montos y alias enmascarado (sin exponer usuarios).
create or replace function public.historial_ofertas(p_articulo uuid)
returns table (monto integer, alias text, created_at timestamptz)
language sql stable security definer set search_path = public as $$
  select o.monto,
         case when p.nombre is null or length(p.nombre) < 2 then 'Anónima'
              else left(p.nombre, 1) || repeat('•', greatest(length(p.nombre) - 2, 1)) || right(p.nombre, 1)
         end,
         o.created_at
  from ofertas o
  join articulos a on a.id = o.articulo_id and a.estado not in ('borrador', 'retirado')
  left join perfiles p on p.id = o.usuario_id
  where o.articulo_id = p_articulo
  order by o.monto desc, o.created_at asc
  limit 50;
$$;

revoke all on function public.cerrar_subastas_vencidas() from public, anon, authenticated;
grant execute on function public.cerrar_subastas_vencidas() to service_role;
grant execute on function public.ofertar(uuid, integer) to authenticated;
grant execute on function public.comprar_directo(uuid) to authenticated;
grant execute on function public.historial_ofertas(uuid) to anon, authenticated;

-- Realtime: la ficha del artículo escucha cambios en su fila.
alter publication supabase_realtime add table public.articulos;

-- Fotos: bucket público de solo lectura; solo admins suben.
insert into storage.buckets (id, name, public) values ('fotos', 'fotos', true)
  on conflict (id) do nothing;
create policy "admins suben fotos" on storage.objects for insert
  with check (bucket_id = 'fotos' and public.es_admin());
create policy "admins borran fotos" on storage.objects for delete
  using (bucket_id = 'fotos' and public.es_admin());

-- Cierre automático cada minuto.
select cron.schedule('cerrar-subastas', '* * * * *', $$select public.cerrar_subastas_vencidas();$$);
