-- ============================================================
-- request_pickup: call_waiter ile aynı akışı kullanır (GÖRDÜM/TAMAMLANDI,
-- push bildirimi) ama order_type = 'pickup' ile kaydedilir; böylece garson
-- ekranında "Garson çağrısı" ile karıştırılmaz.
-- ============================================================
create or replace function public.request_pickup(p_note text)
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
    'pickup'
  )
  returning * into v_order;

  return v_order;
end;
$$;

revoke execute on function public.request_pickup(text) from public, anon;
grant execute on function public.request_pickup(text) to authenticated;
