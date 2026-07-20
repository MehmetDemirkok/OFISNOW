-- OfisNow: Row Level Security politikaları
-- Tüm yazma işlemleri (sipariş oluşturma, "gördüm", "tamamlandı", iptal) 20260720000003_functions.sql
-- içindeki SECURITY DEFINER fonksiyonlar üzerinden yapılır. Buradaki politikalar
-- yalnızca SELECT ve admin panelinin doğrudan tablo erişimini kapsar.

-- Geçerli kullanıcının rolünü getirir. SECURITY DEFINER: profiles üzerindeki
-- RLS politikalarının kendi kendine referans verip sonsuz döngüye girmesini engeller.
create or replace function public.current_role()
returns user_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

-- ============================================================
-- profiles
-- ============================================================
alter table public.profiles enable row level security;

-- Herkes kendi profilini görebilir. Garson/admin rolündeki profiller
-- (siparişte "kim gördü" bilgisini göstermek için) herkese açık sayılır.
-- Garson ve admin ise tüm profilleri görebilir (yönetim ve sipariş listesi için).
create policy "profiles_select" on public.profiles
for select using (
  id = auth.uid()
  or role in ('waiter', 'admin')
  or public.current_role() in ('waiter', 'admin')
);

create policy "profiles_admin_all" on public.profiles
for all using (public.current_role() = 'admin')
with check (public.current_role() = 'admin');

-- ============================================================
-- categories
-- ============================================================
alter table public.categories enable row level security;

create policy "categories_select" on public.categories
for select using (is_active or public.current_role() = 'admin');

create policy "categories_admin_all" on public.categories
for all using (public.current_role() = 'admin')
with check (public.current_role() = 'admin');

-- ============================================================
-- products
-- ============================================================
alter table public.products enable row level security;

create policy "products_select" on public.products
for select using (is_active or public.current_role() = 'admin');

create policy "products_admin_all" on public.products
for all using (public.current_role() = 'admin')
with check (public.current_role() = 'admin');

-- ============================================================
-- locations
-- ============================================================
alter table public.locations enable row level security;

create policy "locations_select" on public.locations
for select using (is_active or public.current_role() = 'admin');

create policy "locations_admin_all" on public.locations
for all using (public.current_role() = 'admin')
with check (public.current_role() = 'admin');

-- ============================================================
-- orders
-- ============================================================
alter table public.orders enable row level security;

-- Çalışan yalnızca kendi siparişini görür, garson/admin tüm siparişleri görür.
create policy "orders_select" on public.orders
for select using (
  employee_id = auth.uid()
  or public.current_role() in ('waiter', 'admin')
);

-- Doğrudan INSERT/UPDATE politikası yok: create_order / claim_order /
-- complete_order / cancel_order fonksiyonları SECURITY DEFINER olarak
-- çalışır ve yetki kontrolünü kendi içinde yapar. Bu, "gördüm" yarış
-- durumunun (race condition) tek bir atomik UPDATE ile güvenle
-- yönetilmesini sağlar. Admin, düzeltme amacıyla doğrudan erişebilir.
create policy "orders_admin_all" on public.orders
for all using (public.current_role() = 'admin')
with check (public.current_role() = 'admin');

-- ============================================================
-- order_items
-- ============================================================
alter table public.order_items enable row level security;

create policy "order_items_select" on public.order_items
for select using (
  exists (
    select 1 from public.orders o
    where o.id = order_items.order_id
      and (o.employee_id = auth.uid() or public.current_role() in ('waiter', 'admin'))
  )
);

create policy "order_items_admin_all" on public.order_items
for all using (public.current_role() = 'admin')
with check (public.current_role() = 'admin');
