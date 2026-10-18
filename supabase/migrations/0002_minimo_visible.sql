-- El mínimo deja de ser oculto: es el precio de partida que se muestra en cada prenda.
-- La primera oferta debe alcanzarlo, y con ella parten de inmediato las 24 h finales.

-- Copia pública del mínimo. El panel lo sigue guardando en articulos_minimo;
-- el trigger de abajo mantiene esta columna sincronizada.
alter table public.articulos add column if not exists precio_minimo integer check (precio_minimo > 0);

update public.articulos a
set precio_minimo = m.precio_minimo
from public.articulos_minimo m
where m.articulo_id = a.id;

create or replace function public.sincronizar_precio_minimo() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'DELETE' then
    update articulos set precio_minimo = null where id = old.articulo_id;
    return old;
  end if;
  update articulos set precio_minimo = new.precio_minimo where id = new.articulo_id;
  return new;
end $$;

drop trigger if exists sincronizar_precio_minimo on public.articulos_minimo;
create trigger sincronizar_precio_minimo
  after insert or update or delete on public.articulos_minimo
  for each row execute function public.sincronizar_precio_minimo();

-- Ofertar: la oferta debe ser al menos el mínimo (si aún no hay ofertas)
-- o la oferta actual más el incremento.
create or replace function public.ofertar(p_articulo uuid, p_monto integer) returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  v_uid uuid := auth.uid();
  art articulos%rowtype;
  v_piso integer;
  v_minimo_alcanzado boolean := false;
begin
  if v_uid is null then
    raise exception 'Debes iniciar sesión para ofertar' using errcode = '28000';
  end if;

  perform cerrar_subastas_vencidas();

  select * into art from articulos where id = p_articulo for update;
  if not found then
    raise exception 'La prenda no existe';
  end if;
  if art.estado not in ('activo', 'cuenta_regresiva') then
    raise exception 'Esta prenda ya no recibe ofertas';
  end if;

  v_piso := greatest(
    coalesce(art.oferta_actual + art.incremento_minimo, art.incremento_minimo),
    coalesce(art.precio_minimo, 0)
  );
  if p_monto < v_piso then
    raise exception 'La oferta debe ser de al menos $%', replace(to_char(v_piso, 'FM999,999,999'), ',', '.');
  end if;

  insert into ofertas (articulo_id, usuario_id, monto) values (p_articulo, v_uid, p_monto);

  if art.estado = 'activo' and art.precio_minimo is not null and p_monto >= art.precio_minimo then
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
