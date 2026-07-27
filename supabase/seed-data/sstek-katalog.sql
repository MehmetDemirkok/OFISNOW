-- SSTEK A.Ş. (ilk müşterimiz) için başlangıç katalog verisi.
-- Şirket: bodyfitonurhoca@gmail.com (Onur Saidoğlu, waiter) ile ilişkili
-- company_id = 10ea7fae-48e8-4514-95cf-dd506a2bd526
-- Kategoriler zaten mevcut (Sıcak İçecekler / Soğuk İçecekler / Atıştırmalıklar);
-- burada yalnızca ürünler ekleniyor.

insert into public.products (company_id, category_id, name, description) values
  -- Sıcak İçecekler (297be208-8741-4bc8-8613-00d2f77daa71)
  ('10ea7fae-48e8-4514-95cf-dd506a2bd526', '297be208-8741-4bc8-8613-00d2f77daa71', 'Filtre Kahve', 'Taze demlenmiş filtre kahve.'),
  ('10ea7fae-48e8-4514-95cf-dd506a2bd526', '297be208-8741-4bc8-8613-00d2f77daa71', 'Flat White', 'Ristretto ve buharda ısıtılmış süt köpüğü.'),
  ('10ea7fae-48e8-4514-95cf-dd506a2bd526', '297be208-8741-4bc8-8613-00d2f77daa71', 'Double Espresso', 'Çift shot yoğun espresso.'),
  ('10ea7fae-48e8-4514-95cf-dd506a2bd526', '297be208-8741-4bc8-8613-00d2f77daa71', 'Sıcak Süt', 'Buharda ısıtılmış sıcak süt.'),
  ('10ea7fae-48e8-4514-95cf-dd506a2bd526', '297be208-8741-4bc8-8613-00d2f77daa71', 'Latte Machiato', 'Sütlü, hafif espresso katmanlı sıcak kahve.'),
  ('10ea7fae-48e8-4514-95cf-dd506a2bd526', '297be208-8741-4bc8-8613-00d2f77daa71', 'Tekli Espresso', 'Tek shot yoğun kıvamlı espresso.'),
  ('10ea7fae-48e8-4514-95cf-dd506a2bd526', '297be208-8741-4bc8-8613-00d2f77daa71', 'Cappuccino', 'Espresso, süt ve bol köpük.'),
  ('10ea7fae-48e8-4514-95cf-dd506a2bd526', '297be208-8741-4bc8-8613-00d2f77daa71', 'Türk Kahvesi', 'Geleneksel yöntemle pişirilmiş, bol köpüklü.'),
  ('10ea7fae-48e8-4514-95cf-dd506a2bd526', '297be208-8741-4bc8-8613-00d2f77daa71', 'Makine Kahvesi', 'Otomatik kahve makinesinden hazırlanan sıcak kahve.'),
  ('10ea7fae-48e8-4514-95cf-dd506a2bd526', '297be208-8741-4bc8-8613-00d2f77daa71', 'Çay', 'Demli Türk çayı.'),
  -- Soğuk İçecekler (0786d014-e1e3-4e44-8417-04d53baa2ae3)
  ('10ea7fae-48e8-4514-95cf-dd506a2bd526', '0786d014-e1e3-4e44-8417-04d53baa2ae3', 'Soda', 'Soğuk maden sodası.'),
  ('10ea7fae-48e8-4514-95cf-dd506a2bd526', '0786d014-e1e3-4e44-8417-04d53baa2ae3', 'Churcle', 'Soğuk servis edilen gazlı içecek.'),
  ('10ea7fae-48e8-4514-95cf-dd506a2bd526', '0786d014-e1e3-4e44-8417-04d53baa2ae3', 'Su', 'Soğuk şişe su.'),
  -- Atıştırmalıklar (6f6ba391-5bb6-4d1b-ac7b-38cb14441fb3)
  ('10ea7fae-48e8-4514-95cf-dd506a2bd526', '6f6ba391-5bb6-4d1b-ac7b-38cb14441fb3', 'Karışık Kuruyemiş', 'Taze karışık kuruyemiş.');
