create or replace function public.cancel_marketplace_reservation(
  p_listing_id uuid,
  p_request_id uuid,
  p_lot_id uuid,
  p_quantity numeric,
  p_unit text,
  p_actor_id uuid,
  p_reason text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  reserved_quantity numeric;
begin
  if p_quantity <= 0 then
    raise exception 'quantity_must_be_positive';
  end if;

  select quantity_reserved
  into reserved_quantity
  from inventory_lots
  where id = p_lot_id
  for update;

  if reserved_quantity is null then
    raise exception 'lot_not_found';
  end if;

  if reserved_quantity < p_quantity then
    raise exception 'reserved_quantity_too_low';
  end if;

  update inventory_lots
  set quantity_reserved = quantity_reserved - p_quantity,
      updated_at = now()
  where id = p_lot_id;

  insert into inventory_movements (
    lot_id,
    movement_type,
    quantity_delta,
    unit,
    actor_id,
    marketplace_listing_id,
    marketplace_request_id,
    note
  )
  values (
    p_lot_id,
    'marketplace_cancelled',
    -p_quantity,
    p_unit,
    p_actor_id,
    p_listing_id,
    p_request_id,
    coalesce(p_reason, 'Cancelled marketplace request')
  );
end;
$$;
