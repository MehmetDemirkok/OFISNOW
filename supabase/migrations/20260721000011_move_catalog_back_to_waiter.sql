-- OfisNow: Katalog (kategori/ürün) ve konum yönetimi tekrar görevli
-- (waiter) rolüne devredildi — çalışan ekranında katalog yönetiminin işi
-- yoktu. Davet kodu yönetimi employee'de kalmaya devam ediyor, bu migration
-- yalnızca kategori/ürün/konum/konum kişileri yetkisini etkiler.

drop policy if exists "categories_select" on public.categories;
drop policy if exists "categories_employee_all" on public.categories;

create policy "categories_select" on public.categories
for select using (
  company_id = public.current_company_id()
  and (is_active or public.current_role() = 'waiter')
);

create policy "categories_waiter_all" on public.categories
for all using (public.current_role() = 'waiter' and company_id = public.current_company_id())
with check (public.current_role() = 'waiter' and company_id = public.current_company_id());

drop policy if exists "products_select" on public.products;
drop policy if exists "products_employee_all" on public.products;

create policy "products_select" on public.products
for select using (
  company_id = public.current_company_id()
  and (is_active or public.current_role() = 'waiter')
);

create policy "products_waiter_all" on public.products
for all using (public.current_role() = 'waiter' and company_id = public.current_company_id())
with check (public.current_role() = 'waiter' and company_id = public.current_company_id());

drop policy if exists "locations_select" on public.locations;
drop policy if exists "locations_employee_all" on public.locations;

create policy "locations_select" on public.locations
for select using (
  company_id = public.current_company_id()
  and (is_active or public.current_role() = 'waiter')
);

create policy "locations_waiter_all" on public.locations
for all using (public.current_role() = 'waiter' and company_id = public.current_company_id())
with check (public.current_role() = 'waiter' and company_id = public.current_company_id());

drop policy if exists "location_contacts_select" on public.location_contacts;
drop policy if exists "location_contacts_employee_all" on public.location_contacts;

create policy "location_contacts_select" on public.location_contacts
for select using (
  exists (
    select 1 from public.locations l
    where l.id = location_contacts.location_id
      and l.company_id = public.current_company_id()
      and (l.is_active or public.current_role() = 'waiter')
  )
);

create policy "location_contacts_waiter_all" on public.location_contacts
for all using (
  public.current_role() = 'waiter'
  and exists (
    select 1 from public.locations l
    where l.id = location_contacts.location_id and l.company_id = public.current_company_id()
  )
)
with check (
  public.current_role() = 'waiter'
  and exists (
    select 1 from public.locations l
    where l.id = location_contacts.location_id and l.company_id = public.current_company_id()
  )
);
