-- OfisNow: konum modelini şirket-genelinde paylaşılan "locations" listesinden
-- her çalışanın kendi profiline (kat/oda) taşır. Garson artık ortak konum
-- listesini yönetmez; yalnızca çalışanların kayıtlı konumlarını görüntüler.
-- Ayrıca çalışan için ürünsüz "garson çağır" aksiyonu eklenir.

-- ============================================================
-- profiles: her çalışanın kendi kat/oda bilgisi
-- ============================================================
alter table public.profiles add column floor text;
alter table public.profiles add column room text;

-- ============================================================
-- orders: sipariş tipi (ürün siparişi / garson çağrısı)
-- ============================================================
create type public.order_type as enum ('product', 'call');

alter table public.orders add column order_type public.order_type not null default 'product';

-- ============================================================
-- my_location_label(): geçerli kullanıcının kat/oda bilgisini okunabilir
-- tek bir metne çevirir. create_order ve call_waiter tarafından ortak
-- kullanılır; hiçbiri location_id/custom_location parametresi almaz artık.
-- ============================================================
create or replace function public.my_location_label()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select nullif(
    trim(
      concat_ws(
        ' - ',
        case when nullif(trim(floor), '') is not null then 'Kat ' || trim(floor) end,
        case when nullif(trim(room), '') is not null then 'Oda ' || trim(room) end
      )
    ),
    ''
  )
  from public.profiles
  where id = auth.uid();
$$;

revoke execute on function public.my_location_label() from public, anon;
grant execute on function public.my_location_label() to authenticated;

-- ============================================================
-- create_order: artık konum parametresi almaz, çalışanın kendi kat/oda
-- bilgisinden otomatik türetir. Eski (uuid, text, text, jsonb) imzası
-- kaldırılır.
-- ============================================================
drop function if exists public.create_order(uuid, text, text, jsonb);

create or replace function public.create_order(
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
  v_location text;
begin
  if public.current_role() <> 'employee' then
    raise exception 'FORBIDDEN' using errcode = '42501';
  end if;

  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'EMPTY_ORDER' using errcode = 'P0001';
  end if;

  v_location := public.my_location_label();
  if v_location is null then
    raise exception 'LOCATION_REQUIRED' using errcode = 'P0001';
  end if;

  insert into public.orders (employee_id, custom_location, note, company_id, order_type)
  values (
    auth.uid(),
    v_location,
    nullif(trim(p_note), ''),
    v_company_id,
    'product'
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

revoke execute on function public.create_order(text, jsonb) from public, anon;
grant execute on function public.create_order(text, jsonb) to authenticated;

-- ============================================================
-- call_waiter: ürünsüz, yalnızca garsonu çağırmak için özel sipariş kaydı.
-- Aynı GÖRDÜM/TAMAMLANDI yaşam döngüsünü ve push bildirimini kullanır.
-- ============================================================
create or replace function public.call_waiter(p_note text)
returns public.orders
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order public.orders;
  v_location text;
begin
  if public.current_role() <> 'employee' then
    raise exception 'FORBIDDEN' using errcode = '42501';
  end if;

  v_location := public.my_location_label();
  if v_location is null then
    raise exception 'LOCATION_REQUIRED' using errcode = 'P0001';
  end if;

  insert into public.orders (employee_id, custom_location, note, company_id, order_type)
  values (
    auth.uid(),
    v_location,
    nullif(trim(p_note), ''),
    public.current_company_id(),
    'call'
  )
  returning * into v_order;

  return v_order;
end;
$$;

revoke execute on function public.call_waiter(text) from public, anon;
grant execute on function public.call_waiter(text) to authenticated;

-- ============================================================
-- update_my_location: kullanıcı yalnızca kendi kat/oda bilgisini günceller.
-- ============================================================
create or replace function public.update_my_location(p_floor text, p_room text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.profiles
  set floor = nullif(trim(p_floor), ''), room = nullif(trim(p_room), '')
  where id = auth.uid();
end;
$$;

revoke execute on function public.update_my_location(text, text) from public, anon;
grant execute on function public.update_my_location(text, text) to authenticated;

-- ============================================================
-- handle_new_user(): davetle katılan çalışan için kat/oda bilgisini
-- kayıt sırasında profile yazar.
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

  insert into public.profiles (id, full_name, email, role, company_id, floor, room)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.email),
    new.email,
    v_role,
    v_company_id,
    nullif(trim(new.raw_user_meta_data ->> 'floor'), ''),
    nullif(trim(new.raw_user_meta_data ->> 'room'), '')
  )
  on conflict (id) do nothing;

  return new;
end;
$$;
