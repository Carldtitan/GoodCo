create or replace function public.finalize_marketplace_transfer(
  p_listing_id uuid,
  p_request_id uuid,
  p_source_lot_id uuid,
  p_source_pantry_id uuid,
  p_destination_pantry_id uuid,
  p_quantity numeric,
  p_unit text,
  p_actor_id uuid,
  p_temperature_at_pickup numeric default null,
  p_temperature_at_receipt numeric default null,
  p_photo_url text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  source_lot inventory_lots%rowtype;
  v_destination_lot_id uuid;
begin
  if p_quantity <= 0 then
    raise exception 'quantity_must_be_positive';
  end if;

  select *
  into source_lot
  from inventory_lots
  where id = p_source_lot_id
    and pantry_id = p_source_pantry_id
  for update;

  if source_lot.id is null then
    raise exception 'source_lot_not_found';
  end if;

  if source_lot.quantity_on_hand < p_quantity then
    raise exception 'insufficient_on_hand_quantity';
  end if;

  if source_lot.quantity_reserved < p_quantity then
    raise exception 'insufficient_reserved_quantity';
  end if;

  update inventory_lots
  set quantity_on_hand = quantity_on_hand - p_quantity,
      quantity_reserved = quantity_reserved - p_quantity,
      updated_at = now()
  where id = p_source_lot_id;

  insert into inventory_lots (
    product_id,
    pantry_id,
    quantity_on_hand,
    quantity_reserved,
    unit,
    source_type,
    received_at,
    best_by,
    use_by,
    sell_by,
    expiration_date,
    production_date,
    packaging_date,
    move_by,
    date_label_type,
    date_raw_text,
    date_voice_transcript,
    date_source,
    date_confidence,
    date_review_status,
    lot_code,
    storage_type,
    tefap_flag,
    redistribution_allowed,
    confidence,
    review_status
  )
  values (
    source_lot.product_id,
    p_destination_pantry_id,
    p_quantity,
    0,
    p_unit,
    source_lot.source_type,
    now(),
    source_lot.best_by,
    source_lot.use_by,
    source_lot.sell_by,
    source_lot.expiration_date,
    source_lot.production_date,
    source_lot.packaging_date,
    source_lot.move_by,
    source_lot.date_label_type,
    source_lot.date_raw_text,
    source_lot.date_voice_transcript,
    source_lot.date_source,
    source_lot.date_confidence,
    source_lot.date_review_status,
    source_lot.lot_code,
    source_lot.storage_type,
    false,
    false,
    source_lot.confidence,
    'confirmed'
  )
  returning id into v_destination_lot_id;

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
    p_source_lot_id,
    'marketplace_transferred',
    -p_quantity,
    p_unit,
    p_actor_id,
    p_listing_id,
    p_request_id,
    'Transferred through marketplace'
  );

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
    v_destination_lot_id,
    'receiving',
    p_quantity,
    p_unit,
    p_actor_id,
    p_listing_id,
    p_request_id,
    'Marketplace transfer received'
  );

  update marketplace_transfers
  set destination_lot_id = v_destination_lot_id,
      receipt_confirmed_by = p_actor_id,
      temperature_at_pickup = coalesce(temperature_at_pickup, p_temperature_at_pickup),
      temperature_at_receipt = p_temperature_at_receipt,
      photo_url = coalesce(p_photo_url, photo_url),
      completed_at = now()
  where request_id = p_request_id;

  if not found then
    insert into marketplace_transfers (
    request_id,
    listing_id,
    source_lot_id,
    v_destination_lot_id,
    source_pantry_id,
    destination_pantry_id,
    quantity_transferred,
    unit,
    handoff_confirmed_by,
    receipt_confirmed_by,
    temperature_at_pickup,
    temperature_at_receipt,
    photo_url,
    completed_at
  )
    values (
    p_request_id,
    p_listing_id,
    p_source_lot_id,
    destination_lot_id,
    p_source_pantry_id,
    p_destination_pantry_id,
    p_quantity,
    p_unit,
    p_actor_id,
    p_actor_id,
    p_temperature_at_pickup,
    p_temperature_at_receipt,
    p_photo_url,
    now()
    );
  end if;

  update marketplace_requests
  set status = 'received',
      updated_at = now()
  where id = p_request_id;

  update marketplace_listings
  set status = case when quantity_available = 0 then 'fulfilled' else 'active' end,
      updated_at = now()
  where id = p_listing_id;

  return v_destination_lot_id;
end;
$$;
