-- OfisNow: örnek başlangıç verisi (kategoriler, konumlar, ürünler)
-- Not: profiles satırları auth.users üzerinden (Supabase Auth) oluşturulan
-- kullanıcılar için handle_new_user trigger'ı ile otomatik oluşur.
-- Çalışan/garson/admin kullanıcılarını Supabase Dashboard > Authentication
-- veya Admin API üzerinden, user_metadata içinde { "full_name": "...", "role": "waiter" }
-- ile oluşturun.

insert into public.categories (name, sort_order) values
  ('Sıcak İçecekler', 1),
  ('Soğuk İçecekler', 2),
  ('Yemekler', 3),
  ('Atıştırmalıklar', 4),
  ('Diğer', 5);

insert into public.locations (name, sort_order) values
  ('Ofis', 1),
  ('Toplantı Odası 1', 2),
  ('Toplantı Odası 2', 3),
  ('Yönetim Ofisi', 4),
  ('Resepsiyon', 5),
  ('Diğer', 6);

insert into public.products (category_id, name, description, price)
select id, 'Türk Kahvesi', 'Geleneksel yöntemle pişirilmiş, bol köpüklü.', 45.00
from public.categories where name = 'Sıcak İçecekler';

insert into public.products (category_id, name, description, price)
select id, 'Filtre Kahve', 'Taze demlenmiş filtre kahve.', 55.00
from public.categories where name = 'Sıcak İçecekler';

insert into public.products (category_id, name, description, price)
select id, 'Çay', 'Demli Türk çayı.', 20.00
from public.categories where name = 'Sıcak İçecekler';

insert into public.products (category_id, name, description, price)
select id, 'Espresso', 'Yoğun kıvamlı tek shot espresso.', 40.00
from public.categories where name = 'Sıcak İçecekler';

insert into public.products (category_id, name, description, price)
select id, 'Su', 'Soğuk şişe su.', 10.00
from public.categories where name = 'Soğuk İçecekler';

insert into public.products (category_id, name, description, price)
select id, 'Soda', 'Soğuk maden sodası.', 15.00
from public.categories where name = 'Soğuk İçecekler';

insert into public.products (category_id, name, description, price)
select id, 'Ice Latte', 'Buzlu sütlü kahve.', 60.00
from public.categories where name = 'Soğuk İçecekler';

insert into public.products (category_id, name, description, price)
select id, 'Meyve Suyu', 'Taze sıkılmış meyve suyu.', 35.00
from public.categories where name = 'Soğuk İçecekler';

insert into public.products (category_id, name, description, price)
select id, 'Tost', 'Kaşarlı ve sucuklu tost.', 65.00
from public.categories where name = 'Yemekler';

insert into public.products (category_id, name, description, price)
select id, 'Sandviç', 'Tavuklu ve sebzeli sandviç.', 70.00
from public.categories where name = 'Yemekler';

insert into public.products (category_id, name, description, price)
select id, 'Çikolata', 'Sütlü çikolata bar.', 25.00
from public.categories where name = 'Atıştırmalıklar';

insert into public.products (category_id, name, description, price)
select id, 'Kraker', 'Tuzlu kraker paketi.', 20.00
from public.categories where name = 'Atıştırmalıklar';
