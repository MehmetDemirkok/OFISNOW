-- notify-new-order Edge Function'ını her yeni siparişte tetikleyen webhook.
--
-- SETUP.md, bunun Supabase Dashboard > Database > Webhooks üzerinden manuel
-- kurulmasını belgeliyordu, ancak bu adım hiç uygulanmamıştı: orders
-- tablosunda INSERT sonrası fonksiyonu çağıran herhangi bir tetikleyici
-- yoktu, dolayısıyla garsonlara push bildirimi hiç gitmiyordu. Bu migration
-- aynı davranışı, sürüm kontrollü ve tekrarlanabilir şekilde pg_net ile kurar.

create extension if not exists pg_net;

create or replace function public.notify_new_order()
returns trigger
security definer
set search_path = public
language plpgsql
as $$
begin
  perform net.http_post(
    url := 'https://fsksmdubigkzlsdmrebt.supabase.co/functions/v1/notify-new-order',
    headers := jsonb_build_object('Content-Type', 'application/json'),
    body := jsonb_build_object('type', 'INSERT', 'table', 'orders', 'record', to_jsonb(new))
  );
  return new;
end;
$$;

create trigger orders_notify_new_order
  after insert on public.orders
  for each row
  execute function public.notify_new_order();
