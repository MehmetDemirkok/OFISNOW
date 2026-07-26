-- notify-feedback Edge Function'ını her yeni geri bildirimde tetikleyen
-- webhook. orders_notify_new_order ile aynı pg_net deseni kullanılır.

create or replace function public.notify_feedback()
returns trigger
security definer
set search_path = public
language plpgsql
as $$
begin
  perform net.http_post(
    url := 'https://fsksmdubigkzlsdmrebt.supabase.co/functions/v1/notify-feedback',
    headers := jsonb_build_object('Content-Type', 'application/json'),
    body := jsonb_build_object('type', 'INSERT', 'table', 'feedback', 'record', to_jsonb(new))
  );
  return new;
end;
$$;

create trigger feedback_notify_new
  after insert on public.feedback
  for each row
  execute function public.notify_feedback();
