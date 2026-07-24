-- Web Push aboneliği: ekran kilitliyken/PWA arka plandayken de gerçek sistem
-- bildirimi (+ ses/titreşim) alabilmek için tarayıcının PushSubscription'ını
-- (endpoint + anahtarlar) saklar. push_token (native/Expo) ile aynı deseni
-- izler: kullanıcı yalnızca kendi profilini günceller.

alter table public.profiles add column if not exists web_push_subscription jsonb;

create or replace function public.update_my_web_push_subscription(p_subscription jsonb)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.profiles set web_push_subscription = p_subscription where id = auth.uid();
end;
$$;

revoke all on function public.update_my_web_push_subscription(jsonb) from public, anon;
grant execute on function public.update_my_web_push_subscription(jsonb) to authenticated;
