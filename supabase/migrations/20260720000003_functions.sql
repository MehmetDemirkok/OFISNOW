-- OfisNow: sipariş yaşam döngüsü fonksiyonları
-- Tüm fonksiyonlar SECURITY DEFINER'dır; yetki kontrolünü kendi içinde yapar
-- ve RLS'i bilinçli olarak atlayarak tek, denetimli bir mutasyon yolu sağlar.

-- ============================================================
-- create_order: sipariş + kalemlerini tek işlemde (atomik) oluşturur
-- p_items örneği: [{"product_id": "...", "product_name": "Türk Kahvesi", "quantity": 2, "special_request": "Şekersiz"}]
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

  insert into public.orders (employee_id, location_id, custom_location, note)
  values (
    auth.uid(),
    p_location_id,
    nullif(trim(p_custom_location), ''),
    nullif(trim(p_note), '')
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

grant execute on function public.create_order(uuid, text, text, jsonb) to authenticated;

-- ============================================================
-- claim_order ("GÖRDÜM"): yalnızca status='new' iken atomik olarak 'seen' yapar.
-- WHERE koşuluna sahip tek bir UPDATE, Postgres'te satır kilidiyle atomik
-- çalışır; iki garson aynı anda basarsa yalnızca biri satırı günceller,
-- diğeri 0 satır döner ve ORDER_ALREADY_SEEN hatası alır.
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
  if public.current_role() not in ('waiter', 'admin') then
    raise exception 'FORBIDDEN' using errcode = '42501';
  end if;

  update public.orders
  set status = 'seen', seen_by = auth.uid(), seen_at = now()
  where id = p_order_id and status = 'new'
  returning * into v_order;

  if v_order.id is null then
    raise exception 'ORDER_ALREADY_SEEN' using errcode = 'P0001';
  end if;

  return v_order;
end;
$$;

grant execute on function public.claim_order(uuid) to authenticated;

-- ============================================================
-- complete_order ("TAMAMLANDI"): yalnızca siparişi gören garson (veya admin)
-- ve yalnızca status='seen' iken tamamlayabilir.
-- ============================================================
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
    and (seen_by = auth.uid() or public.current_role() = 'admin')
  returning * into v_order;

  if v_order.id is null then
    raise exception 'ORDER_NOT_COMPLETABLE' using errcode = 'P0001';
  end if;

  return v_order;
end;
$$;

grant execute on function public.complete_order(uuid) to authenticated;

-- ============================================================
-- cancel_order: çalışan yalnızca henüz görülmemiş (status='new') kendi
-- siparişini iptal edebilir. Admin her zaman iptal edebilir.
-- ============================================================
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
    and (employee_id = auth.uid() or public.current_role() = 'admin')
  returning * into v_order;

  if v_order.id is null then
    raise exception 'ORDER_NOT_CANCELLABLE' using errcode = 'P0001';
  end if;

  return v_order;
end;
$$;

grant execute on function public.cancel_order(uuid) to authenticated;

-- ============================================================
-- update_my_push_token: kullanıcı yalnızca kendi push token'ını günceller.
-- Ayrı bir fonksiyon olması, profiles tablosunda genel bir UPDATE
-- politikasına (ve dolayısıyla role/is_active gibi alanların istismarına)
-- gerek bırakmaz.
-- ============================================================
create or replace function public.update_my_push_token(p_token text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.profiles set push_token = nullif(trim(p_token), '') where id = auth.uid();
end;
$$;

grant execute on function public.update_my_push_token(text) to authenticated;
