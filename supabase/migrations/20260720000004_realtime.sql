-- OfisNow: Realtime yayınına siparişleri ekle.
-- Garson ekranlarının anlık güncellenmesi (Postgres Changes) için gereklidir.
-- RLS, realtime değişikliklerinde de geçerlidir; her kullanıcı yalnızca
-- SELECT yetkisi olan satırlardaki değişiklikleri alır.
alter publication supabase_realtime add table public.orders;
