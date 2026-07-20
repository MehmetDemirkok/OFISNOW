-- Supabase projelerinde yeni fonksiyonlara varsayılan olarak anon+authenticated
-- rollerine doğrudan EXECUTE veriliyor (ALTER DEFAULT PRIVILEGES); yalnızca
-- PUBLIC'ten geri almak yetmiyor, anon'dan da açıkça kaldırmak gerekiyor.
revoke execute on function public.create_order(uuid, text, text, jsonb) from anon;
revoke execute on function public.claim_order(uuid) from anon;
revoke execute on function public.complete_order(uuid) from anon;
revoke execute on function public.cancel_order(uuid) from anon;
revoke execute on function public.update_my_push_token(text) from anon;
revoke execute on function public.regenerate_invite_code() from anon;
revoke execute on function public.current_role() from anon;
revoke execute on function public.current_company_id() from anon;
revoke execute on function public.generate_invite_code() from anon;
revoke execute on function public.handle_new_user() from anon;
revoke execute on function public.set_company_id() from anon;
