-- OfisNow: garsonun (waiter) katalogda ürünlere görsel ekleyebilmesi için
-- products tablosuna image_url kolonu ve buna eşlik eden `product-images`
-- storage bucket'ı + RLS politikaları eklenir. Desen: avatars bucket'ı
-- (20260721000009_profile_editing.sql) ile aynı, tek fark klasör anahtarının
-- auth.uid() değil company_id olması (ürünler kullanıcıya değil şirkete ait).

alter table public.products add column image_url text;

-- ============================================================
-- product-images: herkes okuyabilir (public bucket); yalnızca waiter
-- rolündeki kullanıcı KENDİ ŞİRKETİNİN klasörüne (companyId/dosya) yazabilir.
-- ============================================================
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

create policy "product_images_read_all" on storage.objects
for select using (bucket_id = 'product-images');

create policy "product_images_insert_own_company" on storage.objects
for insert to authenticated
with check (
  bucket_id = 'product-images'
  and public.current_role() = 'waiter'
  and (storage.foldername(name))[1] = public.current_company_id()::text
);

create policy "product_images_update_own_company" on storage.objects
for update to authenticated
using (
  bucket_id = 'product-images'
  and public.current_role() = 'waiter'
  and (storage.foldername(name))[1] = public.current_company_id()::text
)
with check (
  bucket_id = 'product-images'
  and public.current_role() = 'waiter'
  and (storage.foldername(name))[1] = public.current_company_id()::text
);

create policy "product_images_delete_own_company" on storage.objects
for delete to authenticated
using (
  bucket_id = 'product-images'
  and public.current_role() = 'waiter'
  and (storage.foldername(name))[1] = public.current_company_id()::text
);
