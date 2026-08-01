-- OfisNow: tamamlanan siparişler için 1-5 yıldız değerlendirme + opsiyonel yorum.
-- Çalışan yalnızca kendi tamamlanmış siparişini, yalnızca bir kez değerlendirebilir
-- (rate_order tekrar çağrılırsa güncelleme yapar). Doğrudan UPDATE politikası
-- açılmıyor; diğer tüm sipariş mutasyonları gibi security definer RPC üzerinden.

alter table public.orders add column rating smallint check (rating between 1 and 5);
alter table public.orders add column rating_comment text;
alter table public.orders add column rated_at timestamptz;

create or replace function public.rate_order(
  p_order_id uuid,
  p_rating smallint,
  p_comment text default null
)
returns public.orders
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order public.orders;
begin
  if public.current_role() <> 'employee' then
    raise exception 'FORBIDDEN' using errcode = '42501';
  end if;

  if p_rating is null or p_rating < 1 or p_rating > 5 then
    raise exception 'INVALID_RATING' using errcode = 'P0001';
  end if;

  select * into v_order from public.orders where id = p_order_id;

  if v_order.id is null or v_order.employee_id <> auth.uid() then
    raise exception 'FORBIDDEN' using errcode = '42501';
  end if;

  if v_order.status <> 'completed' then
    raise exception 'ORDER_NOT_RATABLE' using errcode = 'P0001';
  end if;

  update public.orders
  set rating = p_rating,
      rating_comment = nullif(trim(coalesce(p_comment, '')), ''),
      rated_at = now()
  where id = p_order_id
  returning * into v_order;

  return v_order;
end;
$$;

revoke execute on function public.rate_order(uuid, smallint, text) from public, anon;
grant execute on function public.rate_order(uuid, smallint, text) to authenticated;
