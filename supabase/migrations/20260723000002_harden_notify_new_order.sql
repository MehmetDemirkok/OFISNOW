-- notify_new_order() yalnızca orders_notify_new_order tetikleyicisi tarafından
-- çağrılmalı; PostgREST üzerinden anon/authenticated rollerine yanlışlıkla
-- açılan RPC erişimini kapat.
--
-- Not: pg_net eklentisi ALTER EXTENSION ... SET SCHEMA'yı desteklemediği için
-- public şemada kalıyor (Supabase linter'ın "Extension in Public" uyarısı
-- kozmetiktir, extension'ın kendisi ek bir yetki açmaz).

revoke execute on function public.notify_new_order() from public, anon, authenticated;
