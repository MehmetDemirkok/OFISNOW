-- OfisNow: admin rolünü kaldır.
-- Kategori/ürün/konum yönetimi artık garson rolüne ait; kullanıcı yönetimi
-- ekranı (aktif/pasif yapma, rol değiştirme, davet kodu yenileme) tamamen
-- kaldırıldı. Şirketi kuran kişi artık admin değil, garson olarak başlar.

-- ============================================================
-- Mevcut admin kullanıcılarını tamamen sil.
-- auth.users -> public.profiles cascade ile silinir.
-- ============================================================
delete from auth.users where id in (select id from public.profiles where role = 'admin');

-- ============================================================
-- current_role()'e bağımlı tüm eski politikaları kaldır. Fonksiyonu (ve
-- ardından enum tipini) yeniden oluşturabilmek için önce bu bağımlılıkların
-- kaldırılması gerekiyor.
-- ============================================================
drop policy if exists "companies_admin_update_own" on public.companies;

drop policy if exists "profiles_select" on public.profiles;
drop policy if exists "profiles_admin_all" on public.profiles;

drop policy if exists "categories_select" on public.categories;
drop policy if exists "categories_admin_all" on public.categories;

drop policy if exists "products_select" on public.products;
drop policy if exists "products_admin_all" on public.products;

drop policy if exists "locations_select" on public.locations;
drop policy if exists "locations_admin_all" on public.locations;

drop policy if exists "location_contacts_select" on public.location_contacts;
drop policy if exists "location_contacts_admin_all" on public.location_contacts;

drop policy if exists "orders_select" on public.orders;
drop policy if exists "orders_admin_all" on public.orders;

drop policy if exists "order_items_select" on public.order_items;
drop policy if exists "order_items_admin_all" on public.order_items;

-- ============================================================
-- user_role enum'undan 'admin' değerini kaldır. Postgres enum'lardan değer
-- silmeyi desteklemediği için tipi yeniden oluşturuyoruz. current_role()'ün
-- dönüş tipi ve profiles.role kolonu bu tipe sabit bağımlı; önce onları
-- kaldırıp tip değiştikten sonra yeniden kuruyoruz.
-- ============================================================
drop function if exists public.current_role();

alter table public.profiles alter column role drop default;
alter table public.profiles alter column role type text using role::text;

drop type public.user_role;
create type public.user_role as enum ('employee', 'waiter');

alter table public.profiles
  alter column role type public.user_role using role::public.user_role,
  alter column role set default 'employee';

create or replace function public.current_role()
returns user_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

revoke execute on function public.current_role() from public, anon;
grant execute on function public.current_role() to authenticated;

-- ============================================================
-- handle_new_user(): şirketi kuran kişi artık garson olarak başlar.
-- ============================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_company_id uuid;
  v_company_name text;
  v_invite_code text;
  v_role user_role;
  v_code text;
begin
  v_company_name := nullif(trim(new.raw_user_meta_data ->> 'company_name'), '');
  v_invite_code := nullif(trim(new.raw_user_meta_data ->> 'invite_code'), '');

  if v_company_name is not null then
    loop
      v_code := public.generate_invite_code();
      begin
        insert into public.companies (name, invite_code)
        values (v_company_name, v_code)
        returning id into v_company_id;
        exit;
      exception when unique_violation then
        -- kod çakıştı, tekrar dene
      end;
    end loop;
    v_role := 'waiter';
  elsif v_invite_code is not null then
    select id into v_company_id
    from public.companies
    where invite_code = upper(v_invite_code);

    if v_company_id is null then
      raise exception 'INVALID_INVITE_CODE' using errcode = 'P0001';
    end if;

    v_role := coalesce((new.raw_user_meta_data ->> 'role')::user_role, 'employee');
  else
    raise exception 'COMPANY_INFO_REQUIRED' using errcode = 'P0001';
  end if;

  insert into public.profiles (id, full_name, email, role, company_id)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.email),
    new.email,
    v_role,
    v_company_id
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

-- ============================================================
-- regenerate_invite_code(): kullanıcı yönetimi ekranıyla birlikte kaldırıldı.
-- ============================================================
drop function if exists public.regenerate_invite_code();

-- ============================================================
-- profiles: garson tüm profilleri görebilir, herkes kendi profilini görür.
-- ============================================================
create policy "profiles_select" on public.profiles
for select using (
  company_id = public.current_company_id()
  and (id = auth.uid() or role = 'waiter' or public.current_role() = 'waiter')
);

-- ============================================================
-- categories / products / locations / location_contacts:
-- admin yerine garson tam yetkili.
-- ============================================================
create policy "categories_select" on public.categories
for select using (
  company_id = public.current_company_id()
  and (is_active or public.current_role() = 'waiter')
);

create policy "categories_waiter_all" on public.categories
for all using (public.current_role() = 'waiter' and company_id = public.current_company_id())
with check (public.current_role() = 'waiter' and company_id = public.current_company_id());

create policy "products_select" on public.products
for select using (
  company_id = public.current_company_id()
  and (is_active or public.current_role() = 'waiter')
);

create policy "products_waiter_all" on public.products
for all using (public.current_role() = 'waiter' and company_id = public.current_company_id())
with check (public.current_role() = 'waiter' and company_id = public.current_company_id());

create policy "locations_select" on public.locations
for select using (
  company_id = public.current_company_id()
  and (is_active or public.current_role() = 'waiter')
);

create policy "locations_waiter_all" on public.locations
for all using (public.current_role() = 'waiter' and company_id = public.current_company_id())
with check (public.current_role() = 'waiter' and company_id = public.current_company_id());

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

-- ============================================================
-- orders / order_items: doğrudan admin erişimi kaldırıldı; sipariş yaşam
-- döngüsü yalnızca create_order / claim_order / complete_order / cancel_order
-- fonksiyonları üzerinden yönetilir.
-- ============================================================
create policy "orders_select" on public.orders
for select using (
  company_id = public.current_company_id()
  and (employee_id = auth.uid() or public.current_role() = 'waiter')
);

create policy "order_items_select" on public.order_items
for select using (
  exists (
    select 1 from public.orders o
    where o.id = order_items.order_id
      and o.company_id = public.current_company_id()
      and (o.employee_id = auth.uid() or public.current_role() = 'waiter')
  )
);

-- ============================================================
-- Sipariş fonksiyonları: admin kontrolleri kaldırıldı.
-- ============================================================
create or replace function public.claim_order(p_order_id uuid)
returns public.orders
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order public.orders;
begin
  if public.current_role() <> 'waiter' then
    raise exception 'FORBIDDEN' using errcode = '42501';
  end if;

  update public.orders
  set status = 'seen', seen_by = auth.uid(), seen_at = now()
  where id = p_order_id
    and status = 'new'
    and company_id = public.current_company_id()
  returning * into v_order;

  if v_order.id is null then
    raise exception 'ORDER_ALREADY_SEEN' using errcode = 'P0001';
  end if;

  return v_order;
end;
$$;

create or replace function public.complete_order(p_order_id uuid)
returns public.orders
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order public.orders;
begin
  if public.current_role() <> 'waiter' then
    raise exception 'FORBIDDEN' using errcode = '42501';
  end if;

  update public.orders
  set status = 'completed', completed_at = now()
  where id = p_order_id
    and status = 'seen'
    and company_id = public.current_company_id()
    and seen_by = auth.uid()
  returning * into v_order;

  if v_order.id is null then
    raise exception 'ORDER_NOT_COMPLETABLE' using errcode = 'P0001';
  end if;

  return v_order;
end;
$$;

create or replace function public.cancel_order(p_order_id uuid)
returns public.orders
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order public.orders;
begin
  update public.orders
  set status = 'cancelled'
  where id = p_order_id
    and status = 'new'
    and company_id = public.current_company_id()
    and employee_id = auth.uid()
  returning * into v_order;

  if v_order.id is null then
    raise exception 'ORDER_NOT_CANCELLABLE' using errcode = 'P0001';
  end if;

  return v_order;
end;
$$;
