-- Bir garson siparişi "GÖRDÜM" diyip üstlendikten (status='seen') sonra 15
-- dakika içinde "TAMAMLANDI" demezse, siparişi üstlenen garsona nazik bir
-- hatırlatma bildirimi gönderir. notify-new-order / notify-order-cancelled
-- ile aynı pg_net + Edge Function deseni kullanılır; tek fark, bir DB
-- trigger'ı değil, pg_cron ile her dakika çalışan bir tarama tarafından
-- tetiklenmesi (zamana bağlı olduğu için trigger yeterli değil).

create extension if not exists pg_net;
create extension if not exists pg_cron;

alter table public.orders
  add column if not exists reminder_sent_at timestamptz;

create or replace function public.notify_pending_orders()
returns void
security definer
set search_path = public
language plpgsql
as $$
declare
  v_order record;
begin
  -- Yalnızca bir garson tarafından üstlenilmiş (seen_by dolu), 15 dakikadır
  -- kapatılmamış ve daha önce hatırlatma gönderilmemiş siparişler.
  -- Garsonu tekrar tekrar rahatsız etmemek için hatırlatma tek seferliktir.
  for v_order in
    select id
    from public.orders
    where status = 'seen'
      and seen_by is not null
      and seen_at <= now() - interval '15 minutes'
      and reminder_sent_at is null
  loop
    perform net.http_post(
      url := 'https://fsksmdubigkzlsdmrebt.supabase.co/functions/v1/notify-order-pending',
      headers := jsonb_build_object('Content-Type', 'application/json'),
      body := jsonb_build_object('type', 'REMINDER', 'table', 'orders', 'record', jsonb_build_object('id', v_order.id))
    );

    update public.orders
    set reminder_sent_at = now()
    where id = v_order.id;
  end loop;
end;
$$;

revoke execute on function public.notify_pending_orders() from public, anon, authenticated;

-- Migration yeniden çalıştırılabilir olsun diye önce aynı isimli job varsa kaldırılır.
do $$
begin
  if exists (select 1 from cron.job where jobname = 'notify-pending-orders-every-minute') then
    perform cron.unschedule('notify-pending-orders-every-minute');
  end if;
end
$$;

select cron.schedule(
  'notify-pending-orders-every-minute',
  '* * * * *',
  $$select public.notify_pending_orders();$$
);
