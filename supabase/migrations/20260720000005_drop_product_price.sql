-- OfisNow: OfisNow ticari bir sipariş sistemi değil, ofis içi çalışan-garson
-- iletişim aracıdır. Ürünlerde fiyat gösterilmez/tutulmaz.
alter table public.products drop column price;
