create or replace function public.is_admin()
returns boolean as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$ language sql security definer stable;

create policy "Admins can view all profiles" on public.profiles
  for select using (public.is_admin());
create policy "Admins can view all subscriptions" on public.subscriptions
  for select using (public.is_admin());
create policy "Admins can view all proposals" on public.proposals
  for select using (public.is_admin());
