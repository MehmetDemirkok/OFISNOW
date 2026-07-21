-- OfisNow: katalog/konum/davet kodu yönetimi artık "employee" rolüne ait.
-- Şirketi kuran kişi employee olarak başlar; "waiter" (görevli) rolü yalnızca
-- gelen siparişleri karşılayan (claim/complete) saha personelidir ve katalog/
-- konum/davet kodu üzerinde artık hiçbir yetkisi yoktur. Sipariş görünürlüğü
-- (görevli tüm siparişleri görür, employee yalnızca kendi siparişini görür)
-- ve profil görünürlüğü DEĞİŞMEDİ — yalnızca yönetim yetkisi taşındı.

-- ============================================================
-- categories / products / locations / location_contacts:
-- görevli yerine employee tam yetkili.
-- ============================================================
drop policy if exists "categories_select" on public.categories;
drop policy if exists "categories_waiter_all" on public.categories;

create policy "categories_select" on public.categories
for select using (
  company_id = public.current_company_id()
  and (is_active or public.current_role() = 'employee')
);

create policy "categories_employee_all" on public.categories
for all using (public.current_role() = 'employee' and company_id = public.current_company_id())
with check (public.current_role() = 'employee' and company_id = public.current_company_id());

drop policy if exists "products_select" on public.products;
drop policy if exists "products_waiter_all" on public.products;

create policy "products_select" on public.products
for select using (
  company_id = public.current_company_id()
  and (is_active or public.current_role() = 'employee')
);

create policy "products_employee_all" on public.products
for all using (public.current_role() = 'employee' and company_id = public.current_company_id())
with check (public.current_role() = 'employee' and company_id = public.current_company_id());

drop policy if exists "locations_select" on public.locations;
drop policy if exists "locations_waiter_all" on public.locations;

create policy "locations_select" on public.locations
for select using (
  company_id = public.current_company_id()
  and (is_active or public.current_role() = 'employee')
);

create policy "locations_employee_all" on public.locations
for all using (public.current_role() = 'employee' and company_id = public.current_company_id())
with check (public.current_role() = 'employee' and company_id = public.current_company_id());

drop policy if exists "location_contacts_select" on public.location_contacts;
drop policy if exists "location_contacts_waiter_all" on public.location_contacts;

create policy "location_contacts_select" on public.location_contacts
for select using (
  exists (
    select 1 from public.locations l
    where l.id = location_contacts.location_id
      and l.company_id = public.current_company_id()
      and (l.is_active or public.current_role() = 'employee')
  )
);

create policy "location_contacts_employee_all" on public.location_contacts
for all using (
  public.current_role() = 'employee'
  and exists (
    select 1 from public.locations l
    where l.id = location_contacts.location_id and l.company_id = public.current_company_id()
  )
)
with check (
  public.current_role() = 'employee'
  and exists (
    select 1 from public.locations l
    where l.id = location_contacts.location_id and l.company_id = public.current_company_id()
  )
);

-- ============================================================
-- Davet kodu artık 10 dakikada bir kendiliğinden yenilenir. Ayrı bir
-- zamanlanmış görev (pg_cron) kurmak yerine, kod her görüntülendiğinde
-- (get_or_rotate_invite_code çağrıldığında) süresi dolmuşsa tembel biçimde
-- yenilenir.
-- ============================================================
alter table public.companies add column invite_code_generated_at timestamptz not null default now();

-- ============================================================
-- handle_new_user(): şirketi kuran kişi artık employee olarak başlar.
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
        insert into public.companies (name, invite_code, invite_code_generated_at)
        values (v_company_name, v_code, now())
        returning id into v_company_id;
        exit;
      exception when unique_violation then
        -- kod çakıştı, tekrar dene
      end;
    end loop;
    v_role := 'employee';
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

  insert into public.profiles (id, full_name, email, role, company_id, location_description)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.email),
    new.email,
    v_role,
    v_company_id,
    nullif(trim(new.raw_user_meta_data ->> 'location_description'), '')
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

-- ============================================================
-- get_or_rotate_invite_code(): davet kodunu döndürür, süresi dolmuşsa yeniler.
-- ============================================================
create or replace function public.get_or_rotate_invite_code()
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_company_id uuid;
  v_code text;
  v_generated_at timestamptz;
begin
  if public.current_role() <> 'employee' then
    raise exception 'FORBIDDEN' using errcode = '42501';
  end if;

  v_company_id := public.current_company_id();

  select invite_code, invite_code_generated_at into v_code, v_generated_at
  from public.companies
  where id = v_company_id;

  if v_generated_at < now() - interval '10 minutes' then
    loop
      v_code := public.generate_invite_code();
      begin
        update public.companies
        set invite_code = v_code, invite_code_generated_at = now()
        where id = v_company_id;
        exit;
      exception when unique_violation then
        -- kod çakıştı, tekrar dene
      end;
    end loop;
  end if;

  return v_code;
end;
$$;

revoke execute on function public.get_or_rotate_invite_code() from public, anon;
grant execute on function public.get_or_rotate_invite_code() to authenticated;
