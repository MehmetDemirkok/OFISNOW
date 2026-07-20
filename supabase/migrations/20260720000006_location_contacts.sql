-- OfisNow: konumlara bağlı kişi dizini (bir konumda birden fazla kişi olabilir).

create table public.location_contacts (
  id uuid primary key default gen_random_uuid(),
  location_id uuid not null references public.locations (id) on delete cascade,
  full_name text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

comment on table public.location_contacts is 'Bir konumda bulunan kişilerin adları (konum başına çoklu kişi).';

create index location_contacts_location_id_idx on public.location_contacts (location_id);

alter table public.location_contacts enable row level security;

create policy "location_contacts_select" on public.location_contacts
for select using (
  exists (
    select 1 from public.locations l
    where l.id = location_contacts.location_id
      and (l.is_active or public.current_role() = 'admin')
  )
);

create policy "location_contacts_admin_all" on public.location_contacts
for all using (public.current_role() = 'admin')
with check (public.current_role() = 'admin');
