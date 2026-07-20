-- OfisNow: temel şema
-- profiles, categories, products, locations, orders, order_items

create extension if not exists pgcrypto;

create type user_role as enum ('employee', 'waiter', 'admin');
create type order_status as enum ('new', 'seen', 'completed', 'cancelled');

-- ============================================================
-- profiles
-- ============================================================
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null,
  email text not null,
  role user_role not null default 'employee',
  phone text,
  push_token text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

comment on table public.profiles is 'auth.users ile birebir eşleşen kullanıcı profilleri (çalışan / garson / admin).';

-- auth.users içine yeni kullanıcı eklendiğinde otomatik profil satırı oluştur
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.email),
    new.email,
    coalesce((new.raw_user_meta_data ->> 'role')::user_role, 'employee')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- ============================================================
-- categories
-- ============================================================
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ============================================================
-- products
-- ============================================================
create table public.products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.categories (id) on delete restrict,
  name text not null,
  description text,
  price numeric(10, 2),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index products_category_id_idx on public.products (category_id);

-- ============================================================
-- locations
-- ============================================================
create table public.locations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- ============================================================
-- orders
-- ============================================================
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number bigint generated always as identity,
  employee_id uuid not null references public.profiles (id) on delete cascade,
  status order_status not null default 'new',
  location_id uuid references public.locations (id) on delete set null,
  custom_location text,
  note text,
  seen_by uuid references public.profiles (id) on delete set null,
  seen_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint orders_location_required check (
    location_id is not null or coalesce(trim(custom_location), '') <> ''
  )
);

create index orders_status_idx on public.orders (status);
create index orders_employee_id_idx on public.orders (employee_id);
create index orders_created_at_idx on public.orders (created_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger orders_set_updated_at
before update on public.orders
for each row execute function public.set_updated_at();

-- ============================================================
-- order_items
-- ============================================================
create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  product_id uuid references public.products (id) on delete set null,
  product_name text not null,
  quantity integer not null check (quantity > 0),
  special_request text,
  created_at timestamptz not null default now()
);

create index order_items_order_id_idx on public.order_items (order_id);
