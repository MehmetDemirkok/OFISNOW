-- OfisNow: çalışanın masasındaki boş bardak/tabakların toplanmasını istemesi
-- için ayrı, daha az "acil" hissettiren bir sipariş tipi eklenir. Garson
-- çağrısından (order_type = 'call') ayrı tutulur ki garson ekranında farklı
-- (daha sakin) bir görünümle ayırt edilebilsin.
alter type public.order_type add value 'pickup';
