create table if not exists app_admin_accounts (
  email text primary key check (email = lower(email)),
  created_at timestamptz not null default now()
);

alter table app_admin_accounts enable row level security;

insert into app_admin_accounts (email)
values ('carl@uni.minerva.edu')
on conflict (email) do nothing;

create or replace function public.ensure_goodco_admin_membership(
  target_user_id uuid,
  target_email text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  admin_network_id constant uuid := '9b75fa8d-4d26-4a0c-8d51-9fb6a0e1a111';
  admin_pantry_id constant uuid := '73fe61fe-3f74-4ec4-97b1-8232fd994111';
begin
  if target_user_id is null or target_email is null then
    return;
  end if;

  if not exists (
    select 1
    from app_admin_accounts
    where email = lower(target_email)
  ) then
    return;
  end if;

  insert into pantries (
    id,
    network_id,
    name,
    county,
    address,
    approved_status,
    storage_capabilities
  )
  values (
    admin_pantry_id,
    admin_network_id,
    'GoodCo Admin',
    'Bay Area',
    'GoodCo network administration',
    'approved',
    array['dry', 'refrigerated', 'frozen', 'ambient_short_shelf_life']
  )
  on conflict (id) do update
  set
    network_id = excluded.network_id,
    approved_status = 'approved',
    storage_capabilities = excluded.storage_capabilities,
    updated_at = now();

  insert into pantry_memberships (pantry_id, user_id, role)
  values (admin_pantry_id, target_user_id, 'network_admin')
  on conflict (pantry_id, user_id) do update
  set role = 'network_admin';
end;
$$;

create or replace function public.handle_goodco_admin_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.ensure_goodco_admin_membership(new.id, new.email);
  return new;
end;
$$;

drop trigger if exists goodco_admin_auth_user_bootstrap on auth.users;

create trigger goodco_admin_auth_user_bootstrap
after insert or update of email on auth.users
for each row
execute function public.handle_goodco_admin_auth_user();

do $$
declare
  admin_user record;
begin
  for admin_user in
    select id, email
    from auth.users
    where lower(email) in (select email from app_admin_accounts)
  loop
    perform public.ensure_goodco_admin_membership(admin_user.id, admin_user.email);
  end loop;
end;
$$;
