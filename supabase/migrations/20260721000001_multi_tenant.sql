-- OfisNow: çok kiracılı (multi-tenant) mimariye geçiş.
-- Artık sabit tek bir "admin" rolü yerine, her şirket kendi verisiyle izole
-- çalışır. Bir şirketi ilk oluşturan kişi otomatik olarak o şirketin admini
-- olur; sonraki çalışan/garsonlar admin'in ürettiği davet koduyla katılır.

-- ============================================================
-- companies
-- ============================================================
create table public.companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  invite_code text not null unique,
  created_at timestamptz not null default now()
);

comment on table public.companies is 'Her biri kendi verisiyle izole çalışan kiracı (tenant) şirketler.';

create or replace function public.generate_invite_code()
returns text
language sql
volatile
as $$
  select upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8));
$$;

-- Mevcut tüm veriyi barındıracak ilk şirket (geriye dönük uyumluluk).
insert into public.companies (name, invite_code)
values ('OfisNow Demo', public.generate_invite_code());

-- ============================================================
-- company_id kolonlarını ekle ve mevcut satırları demo şirkete bağla
-- ============================================================
alter table public.profiles add column company_id uuid references public.companies (id) on delete cascade;
alter table public.categories add column company_id uuid references public.companies (id) on delete cascade;
alter table public.products add column company_id uuid references public.companies (id) on delete cascade;
alter table public.locations add column company_id uuid references public.companies (id) on delete cascade;
alter table public.orders add column company_id uuid references public.companies (id) on delete cascade;

update public.profiles set company_id = (select id from public.companies where name = 'OfisNow Demo');
update public.categories set company_id = (select id from public.companies where name = 'OfisNow Demo');
update public.products set company_id = (select id from public.companies where name = 'OfisNow Demo');
update public.locations set company_id = (select id from public.companies where name = 'OfisNow Demo');
update public.orders set company_id = (select id from public.companies where name = 'OfisNow Demo');

alter table public.profiles alter column company_id set not null;
alter table public.categories alter column company_id set not null;
alter table public.products alter column company_id set not null;
alter table public.locations alter column company_id set not null;
alter table public.orders alter column company_id set not null;

create index profiles_company_id_idx on public.profiles (company_id);
create index categories_company_id_idx on public.categories (company_id);
create index products_company_id_idx on public.products (company_id);
create index locations_company_id_idx on public.locations (company_id);
create index orders_company_id_idx on public.orders (company_id);

-- ============================================================
-- current_company_id(): geçerli kullanıcının şirketi (current_role() ile aynı desen)
-- ============================================================
create or replace function public.current_company_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select company_id from public.profiles where id = auth.uid();
$$;

-- ============================================================
-- Yeni kayıtlarda company_id'yi otomatik damgala (client kodu değişmesin diye)
-- ============================================================
create or replace function public.set_company_id()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.company_id is null then
    new.company_id := public.current_company_id();
  end if;
  return new;
end;
$$;

create trigger categories_set_company_id
before insert on public.categories
for each row execute function public.set_company_id();

create trigger products_set_company_id
before insert on public.products
for each row execute function public.set_company_id();

create trigger locations_set_company_id
before insert on public.locations
for each row execute function public.set_company_id();

-- ============================================================
-- handle_new_user(): kayıt sırasında ya yeni şirket kurulur (admin olur)
-- ya da davet koduyla mevcut bir şirkete çalışan/garson olarak katılır.
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
    v_role := 'admin';
  elsif v_invite_code is not null then
    select id into v_company_id
    from public.companies
    where invite_code = upper(v_invite_code);

    if v_company_id is null then
      raise exception 'INVALID_INVITE_CODE' using errcode = 'P0001';
    end if;

    v_role := coalesce((new.raw_user_meta_data ->> 'role')::user_role, 'employee');
    if v_role = 'admin' then
      v_role := 'employee';
    end if;
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
-- regenerate_invite_code(): yalnızca admin, kendi şirketinin kodunu yeniler.
-- ============================================================
create or replace function public.regenerate_invite_code()
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_company_id uuid := public.current_company_id();
  v_code text;
begin
  if public.current_role() <> 'admin' then
    raise exception 'FORBIDDEN' using errcode = '42501';
  end if;

  loop
    v_code := public.generate_invite_code();
    begin
      update public.companies set invite_code = v_code where id = v_company_id;
      exit;
    exception when unique_violation then
      -- kod çakıştı, tekrar dene
    end;
  end loop;

  return v_code;
end;
$$;

grant execute on function public.regenerate_invite_code() to authenticated;

-- ============================================================
-- companies: RLS
-- ============================================================
alter table public.companies enable row level security;

create policy "companies_select_own" on public.companies
for select using (id = public.current_company_id());

create policy "companies_admin_update_own" on public.companies
for update using (id = public.current_company_id() and public.current_role() = 'admin')
with check (id = public.current_company_id() and public.current_role() = 'admin');

-- ============================================================
-- profiles: RLS'i şirket bazlı sınırla
-- ============================================================
drop policy if exists "profiles_select" on public.profiles;
create policy "profiles_select" on public.profiles
for select using (
  company_id = public.current_company_id()
  and (
    id = auth.uid()
    or role in ('waiter', 'admin')
    or public.current_role() in ('waiter', 'admin')
  )
);

drop policy if exists "profiles_admin_all" on public.profiles;
create policy "profiles_admin_all" on public.profiles
for all using (public.current_role() = 'admin' and company_id = public.current_company_id())
with check (public.current_role() = 'admin' and company_id = public.current_company_id());

-- ============================================================
-- categories: RLS'i şirket bazlı sınırla
-- ============================================================
drop policy if exists "categories_select" on public.categories;
create policy "categories_select" on public.categories
for select using (
  company_id = public.current_company_id()
  and (is_active or public.current_role() = 'admin')
);

drop policy if exists "categories_admin_all" on public.categories;
create policy "categories_admin_all" on public.categories
for all using (public.current_role() = 'admin' and company_id = public.current_company_id())
with check (public.current_role() = 'admin' and company_id = public.current_company_id());

-- ============================================================
-- products: RLS'i şirket bazlı sınırla
-- ============================================================
drop policy if exists "products_select" on public.products;
create policy "products_select" on public.products
for select using (
  company_id = public.current_company_id()
  and (is_active or public.current_role() = 'admin')
);

drop policy if exists "products_admin_all" on public.products;
create policy "products_admin_all" on public.products
for all using (public.current_role() = 'admin' and company_id = public.current_company_id())
with check (public.current_role() = 'admin' and company_id = public.current_company_id());

-- ============================================================
-- locations: RLS'i şirket bazlı sınırla
-- ============================================================
drop policy if exists "locations_select" on public.locations;
create policy "locations_select" on public.locations
for select using (
  company_id = public.current_company_id()
  and (is_active or public.current_role() = 'admin')
);

drop policy if exists "locations_admin_all" on public.locations;
create policy "locations_admin_all" on public.locations
for all using (public.current_role() = 'admin' and company_id = public.current_company_id())
with check (public.current_role() = 'admin' and company_id = public.current_company_id());

-- ============================================================
-- location_contacts: konum üzerinden şirket bazlı sınırla
-- ============================================================
drop policy if exists "location_contacts_select" on public.location_contacts;
create policy "location_contacts_select" on public.location_contacts
for select using (
  exists (
    select 1 from public.locations l
    where l.id = location_contacts.location_id
      and l.company_id = public.current_company_id()
      and (l.is_active or public.current_role() = 'admin')
  )
);

drop policy if exists "location_contacts_admin_all" on public.location_contacts;
create policy "location_contacts_admin_all" on public.location_contacts
for all using (
  public.current_role() = 'admin'
  and exists (
    select 1 from public.locations l
    where l.id = location_contacts.location_id and l.company_id = public.current_company_id()
  )
)
with check (
  public.current_role() = 'admin'
  and exists (
    select 1 from public.locations l
    where l.id = location_contacts.location_id and l.company_id = public.current_company_id()
  )
);

-- ============================================================
-- orders: RLS'i şirket bazlı sınırla
-- ============================================================
drop policy if exists "orders_select" on public.orders;
create policy "orders_select" on public.orders
for select using (
  company_id = public.current_company_id()
  and (employee_id = auth.uid() or public.current_role() in ('waiter', 'admin'))
);

drop policy if exists "orders_admin_all" on public.orders;
create policy "orders_admin_all" on public.orders
for all using (public.current_role() = 'admin' and company_id = public.current_company_id())
with check (public.current_role() = 'admin' and company_id = public.current_company_id());

-- ============================================================
-- order_items: sipariş üzerinden şirket bazlı sınırla
-- ============================================================
drop policy if exists "order_items_select" on public.order_items;
create policy "order_items_select" on public.order_items
for select using (
  exists (
    select 1 from public.orders o
    where o.id = order_items.order_id
      and o.company_id = public.current_company_id()
      and (o.employee_id = auth.uid() or public.current_role() in ('waiter', 'admin'))
  )
);

drop policy if exists "order_items_admin_all" on public.order_items;
create policy "order_items_admin_all" on public.order_items
for all using (
  public.current_role() = 'admin'
  and exists (
    select 1 from public.orders o
    where o.id = order_items.order_id and o.company_id = public.current_company_id()
  )
)
with check (
  public.current_role() = 'admin'
  and exists (
    select 1 from public.orders o
    where o.id = order_items.order_id and o.company_id = public.current_company_id()
  )
);

-- ============================================================
-- Sipariş fonksiyonlarına şirket kontrolü ekle (SECURITY DEFINER, RLS'i atlar)
-- ============================================================
create or replace function public.create_order(
  p_location_id uuid,
  p_custom_location text,
  p_note text,
  p_items jsonb
)
returns public.orders
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order public.orders;
  v_item jsonb;
  v_quantity integer;
  v_company_id uuid := public.current_company_id();
begin
  if public.current_role() <> 'employee' then
    raise exception 'FORBIDDEN' using errcode = '42501';
  end if;

  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'EMPTY_ORDER' using errcode = 'P0001';
  end if;

  if p_location_id is null and coalesce(trim(p_custom_location), '') = '' then
    raise exception 'LOCATION_REQUIRED' using errcode = 'P0001';
  end if;

  if p_location_id is not null and not exists (
    select 1 from public.locations where id = p_location_id and company_id = v_company_id
  ) then
    raise exception 'INVALID_LOCATION' using errcode = 'P0001';
  end if;

  insert into public.orders (employee_id, location_id, custom_location, note, company_id)
  values (
    auth.uid(),
    p_location_id,
    nullif(trim(p_custom_location), ''),
    nullif(trim(p_note), ''),
    v_company_id
  )
  returning * into v_order;

  for v_item in select * from jsonb_array_elements(p_items)
  loop
    v_quantity := (v_item ->> 'quantity')::integer;

    if v_quantity is null or v_quantity <= 0 then
      raise exception 'INVALID_QUANTITY' using errcode = 'P0001';
    end if;

    insert into public.order_items (order_id, product_id, product_name, quantity, special_request)
    values (
      v_order.id,
      nullif(v_item ->> 'product_id', '')::uuid,
      v_item ->> 'product_name',
      v_quantity,
      nullif(trim(v_item ->> 'special_request'), '')
    );
  end loop;

  return v_order;
end;
$$;

create or replace function public.claim_order(p_order_id uuid)
returns public.orders
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order public.orders;
begin
  if public.current_role() not in ('waiter', 'admin') then
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
  if public.current_role() not in ('waiter', 'admin') then
    raise exception 'FORBIDDEN' using errcode = '42501';
  end if;

  update public.orders
  set status = 'completed', completed_at = now()
  where id = p_order_id
    and status = 'seen'
    and company_id = public.current_company_id()
    and (seen_by = auth.uid() or public.current_role() = 'admin')
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
    and (employee_id = auth.uid() or public.current_role() = 'admin')
  returning * into v_order;

  if v_order.id is null then
    raise exception 'ORDER_NOT_CANCELLABLE' using errcode = 'P0001';
  end if;

  return v_order;
end;
$$;
