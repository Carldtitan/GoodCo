create or replace function public.is_network_member(target_network_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from pantry_memberships pm
    join pantries p on p.id = pm.pantry_id
    where pm.user_id = auth.uid()
      and p.network_id = target_network_id
  );
$$;

drop policy if exists "members can view their pantries" on pantries;

create policy "members can view their pantries"
on pantries for select
to authenticated
using (
  is_pantry_member(id)
  or is_network_admin(network_id)
  or is_network_member(network_id)
);
