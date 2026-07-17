create or replace function public.reserve_marketplace_quantity(
  p_listing_id uuid,
  p_request_id uuid,
  p_lot_id uuid,
  p_quantity numeric,
  p_unit text,
  p_actor_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  available_quantity numeric;
begin
  if p_quantity <= 0 then
    raise exception 'quantity_must_be_positive';
  end if;

  select quantity_on_hand - quantity_reserved
  into available_quantity
  from inventory_lots
  where id = p_lot_id
  for update;

  if available_quantity is null then
    raise exception 'lot_not_found';
  end if;

  if available_quantity < p_quantity then
    raise exception 'insufficient_quantity';
  end if;

  update inventory_lots
  set quantity_reserved = quantity_reserved + p_quantity,
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
    'marketplace_reserved',
    p_quantity,
    p_unit,
    p_actor_id,
    p_listing_id,
    p_request_id,
    'Reserved for marketplace request'
  );
end;
$$;
