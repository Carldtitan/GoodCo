insert into app_admin_accounts (email)
values ('jiyun@uni.minerva.edu')
on conflict (email) do nothing;

do $$
declare
  admin_user record;
begin
  for admin_user in
    select id, email
    from auth.users
    where lower(email) = 'jiyun@uni.minerva.edu'
  loop
    perform public.ensure_goodco_admin_membership(admin_user.id, admin_user.email);
  end loop;
end;
$$;
