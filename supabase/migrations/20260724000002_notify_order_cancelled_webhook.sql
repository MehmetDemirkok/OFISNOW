-- orders_notify_new_order (INSERT) ile aynı desende: bir sipariş "cancelled"
-- durumuna geçtiğinde notify-order-cancelled Edge Function'ını tetikler.
-- Bu fonksiyon şimdilik yalnızca Web Push gönderir (native/Expo push akışına
-- dokunmaz); garson ekranı kapalı/kilitliyken de iptal bildirimi ulaşsın diye.

create or replace function public.notify_order_cancelled()
returns trigger
security definer
set search_path = public
language plpgsql
as $$
begin
  if new.status = 'cancelled' and old.status is distinct from 'cancelled' then
    perform net.http_post(
      url := 'https://fsksmdubigkzlsdmrebt.supabase.co/functions/v1/notify-order-cancelled',
      headers := jsonb_build_object('Content-Type', 'application/json'),
      body := jsonb_build_object('type', 'UPDATE', 'table', 'orders', 'record', to_jsonb(new))
    );
  end if;
  return new;
end;
$$;

create trigger orders_notify_order_cancelled
  after update on public.orders
  for each row
  execute function public.notify_order_cancelled();

revoke execute on function public.notify_order_cancelled() from public, anon, authenticated;
