-- OfisNow: kullanıcılar artık kendi profillerini (ad soyad, doğum tarihi,
-- profil fotoğrafı) düzenleyebilir. Tablo doğrudan RLS ile açılmak yerine,
-- mevcut update_my_location / update_my_push_token deseniyle uyumlu şekilde
-- tek bir security definer fonksiyon üzerinden güncellenir.

alter table public.profiles add column avatar_url text;
alter table public.profiles add column birth_date date;
alter table public.profiles add column job_title text;

create or replace function public.update_my_profile(
  p_full_name text,
  p_birth_date date,
  p_avatar_url text,
  p_job_title text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.profiles
  set full_name = coalesce(nullif(trim(p_full_name), ''), full_name),
      birth_date = p_birth_date,
      avatar_url = p_avatar_url,
      job_title = nullif(trim(p_job_title), '')
  where id = auth.uid();
end;
$$;

revoke execute on function public.update_my_profile(text, date, text, text) from public, anon;
grant execute on function public.update_my_profile(text, date, text, text) to authenticated;

-- ============================================================
-- avatars: her kullanıcı yalnızca kendi klasörüne (userId/dosya) yükleyip
-- güncelleyebilir/silebilir; herkese (bucket public) okunabilir.
-- ============================================================
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

create policy "avatars_read_all" on storage.objects
for select using (bucket_id = 'avatars');

create policy "avatars_insert_own" on storage.objects
for insert to authenticated
with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "avatars_update_own" on storage.objects
for update to authenticated
using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text)
with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "avatars_delete_own" on storage.objects
for delete to authenticated
using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
