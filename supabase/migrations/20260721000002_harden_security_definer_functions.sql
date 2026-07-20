-- generate_invite_code için search_path sabitlensin (mutable search_path uyarısı).
create or replace function public.generate_invite_code()
returns text
language sql
volatile
set search_path = public
as $$
  select upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8));
$$;

-- SECURITY DEFINER fonksiyonlar varsayılan olarak PUBLIC'e (dolayısıyla anon'a) açık
-- kalır; bunları yalnızca authenticated ile sınırla. Trigger fonksiyonları
-- (handle_new_user, set_company_id) hiçbir role'e RPC olarak açılmamalı.
revoke execute on function public.create_order(uuid, text, text, jsonb) from public;
revoke execute on function public.claim_order(uuid) from public;
revoke execute on function public.complete_order(uuid) from public;
revoke execute on function public.cancel_order(uuid) from public;
revoke execute on function public.update_my_push_token(text) from public;
revoke execute on function public.regenerate_invite_code() from public;
revoke execute on function public.current_role() from public;
revoke execute on function public.current_company_id() from public;
revoke execute on function public.generate_invite_code() from public;

grant execute on function public.create_order(uuid, text, text, jsonb) to authenticated;
grant execute on function public.claim_order(uuid) to authenticated;
grant execute on function public.complete_order(uuid) to authenticated;
grant execute on function public.cancel_order(uuid) to authenticated;
grant execute on function public.update_my_push_token(text) to authenticated;
grant execute on function public.regenerate_invite_code() to authenticated;
grant execute on function public.current_role() to authenticated;
grant execute on function public.current_company_id() to authenticated;

revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.set_company_id() from public, anon, authenticated;
