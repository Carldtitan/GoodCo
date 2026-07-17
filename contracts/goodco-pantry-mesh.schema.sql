create extension if not exists "pgcrypto";

create table if not exists pantries (
  id uuid primary key default gen_random_uuid(),
  network_id uuid,
  name text not null,
  county text not null,
  address text not null,
  lat double precision,
  lng double precision,
  contact_name text,
  contact_phone text,
  approved_status text not null default 'pending'
    check (approved_status in ('pending', 'approved', 'suspended')),
  storage_capabilities text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  barcode text,
  name text not null,
  brand text,
  package_size text,
  category text not null,
  subcategory text,
  storage_type text not null
    check (storage_type in ('dry', 'refrigerated', 'frozen', 'ambient_short_shelf_life')),
  ingredients text,
  allergens text[] not null default '{}',
  source text not null
    check (source in ('open_food_facts', 'usda_fdc', 'manual', 'correction_memory')),
  gpc_segment text,
  gpc_family text,
  gpc_class text,
  gpc_brick text,
  open_food_facts_categories text[] not null default '{}',
  fdc_food_category text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists inventory_lots (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id),
  pantry_id uuid not null references pantries(id),
  quantity_on_hand numeric not null check (quantity_on_hand >= 0),
  quantity_reserved numeric not null default 0 check (quantity_reserved >= 0),
  unit text not null check (unit in ('each', 'case', 'box', 'lb', 'oz', 'gal')),
  source_type text not null
    check (source_type in ('food_bank', 'retail_rescue', 'direct_donation', 'purchased', 'unknown')),
  received_at timestamptz not null default now(),
  best_by date,
  use_by date,
  sell_by date,
  expiration_date date,
  production_date date,
  packaging_date date,
  move_by date,
  date_label_type text not null default 'unknown'
    check (date_label_type in ('best_by', 'use_by', 'sell_by', 'expires', 'packed_on', 'produced_on', 'unknown')),
  date_raw_text text,
  date_voice_transcript text,
  date_source text
    check (date_source is null or date_source in ('gs1_barcode', 'ocr', 'voice', 'llm_parse', 'manual', 'default_rule')),
  date_confidence numeric check (date_confidence is null or (date_confidence >= 0 and date_confidence <= 1)),
  date_review_status text not null default 'needs_review'
    check (date_review_status in ('confirmed', 'draft_high_confidence', 'needs_review', 'missing', 'not_applicable')),
  lot_code text,
  storage_type text not null
    check (storage_type in ('dry', 'refrigerated', 'frozen', 'ambient_short_shelf_life')),
  tefap_flag boolean not null default false,
  redistribution_allowed boolean not null default false,
  confidence numeric check (confidence is null or (confidence >= 0 and confidence <= 1)),
  review_status text not null default 'needs_review'
    check (review_status in ('confirmed', 'needs_review')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (quantity_reserved <= quantity_on_hand)
);

create table if not exists category_mappings (
  id uuid primary key default gen_random_uuid(),
  scope text not null check (scope in ('local', 'network', 'base_catalog')),
  pantry_id uuid references pantries(id),
  network_id uuid,
  match_type text not null
    check (match_type in ('barcode', 'product_name', 'brand_product', 'ocr_phrase', 'keyword_rule')),
  match_value text not null,
  category text not null,
  subcategory text,
  storage_type text not null
    check (storage_type in ('dry', 'refrigerated', 'frozen', 'ambient_short_shelf_life')),
  confidence numeric check (confidence is null or (confidence >= 0 and confidence <= 1)),
  created_by uuid,
  approved_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists classification_events (
  id uuid primary key default gen_random_uuid(),
  input_type text not null,
  barcode text,
  product_name text,
  ocr_text text,
  suggested_category text,
  final_category text,
  suggested_subcategory text,
  final_subcategory text,
  model_or_rule_used text,
  confidence numeric check (confidence is null or (confidence >= 0 and confidence <= 1)),
  was_corrected boolean not null default false,
  corrected_by uuid,
  created_at timestamptz not null default now()
);

create table if not exists extraction_jobs (
  id uuid primary key default gen_random_uuid(),
  input_type text not null,
  raw_input_url text,
  extracted_json jsonb not null default '{}'::jsonb,
  confidence numeric check (confidence is null or (confidence >= 0 and confidence <= 1)),
  status text not null default 'pending'
    check (status in ('pending', 'completed', 'failed', 'needs_review')),
  created_at timestamptz not null default now()
);

create table if not exists marketplace_listings (
  id uuid primary key default gen_random_uuid(),
  lot_id uuid not null references inventory_lots(id),
  source_pantry_id uuid not null references pantries(id),
  item_name text not null,
  category text not null,
  subcategory text,
  quantity_listed numeric not null check (quantity_listed > 0),
  quantity_available numeric not null check (quantity_available >= 0),
  unit text not null check (unit in ('each', 'case', 'box', 'lb', 'oz', 'gal')),
  storage_type text not null
    check (storage_type in ('dry', 'refrigerated', 'frozen', 'ambient_short_shelf_life')),
  best_by date,
  expiration_date date,
  move_by date,
  pickup_window_start timestamptz not null,
  pickup_window_end timestamptz not null,
  photo_url text,
  status text not null default 'active'
    check (status in ('active', 'reserved', 'pending_approval', 'fulfilled', 'expired', 'cancelled')),
  approval_mode text not null default 'source_pantry_approval'
    check (approval_mode in ('auto_approve', 'source_pantry_approval', 'network_admin_approval')),
  price_cents integer not null default 0 check (price_cents >= 0),
  payment_required boolean not null default false,
  restriction_status text not null default 'none'
    check (restriction_status in ('none', 'admin_required', 'blocked')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (quantity_available <= quantity_listed),
  check (pickup_window_end > pickup_window_start),
  check ((payment_required = false and price_cents = 0) or payment_required = true)
);

create table if not exists marketplace_requests (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references marketplace_listings(id),
  requesting_pantry_id uuid not null references pantries(id),
  source_pantry_id uuid not null references pantries(id),
  quantity_requested numeric not null check (quantity_requested > 0),
  unit text not null check (unit in ('each', 'case', 'box', 'lb', 'oz', 'gal')),
  status text not null default 'requested'
    check (status in ('requested', 'approved', 'ready_for_pickup', 'picked_up', 'received', 'cancelled', 'rejected')),
  requested_pickup_time timestamptz,
  approved_by uuid,
  approved_at timestamptz,
  cancelled_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists marketplace_transfers (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references marketplace_requests(id),
  listing_id uuid not null references marketplace_listings(id),
  source_lot_id uuid not null references inventory_lots(id),
  destination_lot_id uuid references inventory_lots(id),
  source_pantry_id uuid not null references pantries(id),
  destination_pantry_id uuid not null references pantries(id),
  quantity_transferred numeric not null check (quantity_transferred > 0),
  unit text not null check (unit in ('each', 'case', 'box', 'lb', 'oz', 'gal')),
  handoff_confirmed_by uuid,
  receipt_confirmed_by uuid,
  temperature_at_pickup numeric,
  temperature_at_receipt numeric,
  photo_url text,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists inventory_movements (
  id uuid primary key default gen_random_uuid(),
  lot_id uuid not null references inventory_lots(id),
  movement_type text not null
    check (movement_type in ('receiving', 'manual_adjustment', 'distribution', 'marketplace_reserved', 'marketplace_transferred', 'marketplace_cancelled')),
  quantity_delta numeric not null,
  unit text not null check (unit in ('each', 'case', 'box', 'lb', 'oz', 'gal')),
  actor_id uuid,
  marketplace_listing_id uuid references marketplace_listings(id),
  marketplace_request_id uuid references marketplace_requests(id),
  created_at timestamptz not null default now(),
  note text
);

create table if not exists network_policies (
  id uuid primary key default gen_random_uuid(),
  network_id uuid not null,
  allow_tefap_transfer boolean not null default false,
  allow_paid_transfer boolean not null default false,
  require_admin_approval boolean not null default true,
  restricted_categories text[] not null default '{}',
  max_listing_age_hours integer not null default 72 check (max_listing_age_hours > 0),
  default_listing_expiration_hours integer not null default 24 check (default_listing_expiration_hours > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace view marketplace_eligible_lots as
select
  l.id as lot_id,
  l.pantry_id,
  l.product_id,
  p.name as item_name,
  p.category,
  p.subcategory,
  (l.quantity_on_hand - l.quantity_reserved) as quantity_available,
  l.unit,
  l.storage_type,
  l.best_by,
  l.expiration_date,
  l.move_by,
  l.lot_code,
  l.source_type,
  l.tefap_flag,
  l.redistribution_allowed,
  l.review_status,
  case
    when l.updated_at >= now() - interval '24 hours' then 'confirmed'
    when l.updated_at >= now() - interval '72 hours' then 'likely'
    else 'stale'
  end as availability_confidence
from inventory_lots l
join products p on p.id = l.product_id
where l.review_status = 'confirmed'
  and l.redistribution_allowed = true
  and l.tefap_flag = false
  and (l.quantity_on_hand - l.quantity_reserved) > 0;
