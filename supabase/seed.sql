-- OfisNow: örnek başlangıç verisi (kategoriler, konumlar, ürünler)
-- Not: profiles satırları auth.users üzerinden (Supabase Auth) oluşturulan
-- kullanıcılar için handle_new_user trigger'ı ile otomatik oluşur.
-- Çalışan/görevli kullanıcılarını Supabase Dashboard > Authentication
-- veya Admin API üzerinden, user_metadata içinde { "full_name": "...", "role": "employee" }
-- (katalog/konum/davet kodu yönetimi) veya { "role": "waiter" } (yalnızca
-- sipariş karşılama) ile oluşturun.

insert into public.categories (name, sort_order) values
  ('Sıcak İçecekler', 1),
  ('Soğuk İçecekler', 2),
  ('Yiyecekler', 3),
  ('Diğer', 4);

insert into public.locations (name, sort_order) values
  ('Ofis', 1),
  ('Toplantı Odası 1', 2),
  ('Toplantı Odası 2', 3),
  ('Yönetim Ofisi', 4),
  ('Resepsiyon', 5),
  ('Diğer', 6);

insert into public.products (category_id, name, description)
select id, 'Türk Kahvesi', 'Geleneksel yöntemle pişirilmiş, bol köpüklü.'
from public.categories where name = 'Sıcak İçecekler';

insert into public.products (category_id, name, description)
select id, 'Filtre Kahve', 'Taze demlenmiş filtre kahve.'
from public.categories where name = 'Sıcak İçecekler';

insert into public.products (category_id, name, description)
select id, 'Çay', 'Demli Türk çayı.'
from public.categories where name = 'Sıcak İçecekler';

insert into public.products (category_id, name, description)
select id, 'Espresso', 'Yoğun kıvamlı tek shot espresso.'
from public.categories where name = 'Sıcak İçecekler';

insert into public.products (category_id, name, description)
select id, 'Su', 'Soğuk şişe su.'
from public.categories where name = 'Soğuk İçecekler';

insert into public.products (category_id, name, description)
select id, 'Soda', 'Soğuk maden sodası.'
from public.categories where name = 'Soğuk İçecekler';

insert into public.products (category_id, name, description)
select id, 'Ice Latte', 'Buzlu sütlü kahve.'
from public.categories where name = 'Soğuk İçecekler';

insert into public.products (category_id, name, description)
select id, 'Meyve Suyu', 'Taze sıkılmış meyve suyu.'
from public.categories where name = 'Soğuk İçecekler';

insert into public.products (category_id, name, description)
select id, 'Kuruyemiş', 'Karışık kuruyemiş.'
from public.categories where name = 'Yiyecekler';
