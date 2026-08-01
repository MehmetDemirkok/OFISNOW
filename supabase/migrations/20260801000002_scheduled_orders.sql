-- OfisNow: çalışanların "her sabah 09:00 gibi" tekrarlayan siparişler
-- tanımlamasını sağlar. Zamanlanmış kayıtlar salt kullanıcıya ait ayar verisi
-- olduğu için (sipariş mutasyonu değil) diğer tablolardan farklı olarak
-- doğrudan RLS ile CRUD açılır. Gerçek sipariş oluşturma işini her dakika
-- çalışan bir pg_cron job'ı (run_scheduled_orders) yapar ve create_order ile
-- aynı insert mantığını kullanır.
--
-- Not: Bu proje Türkiye ofisleri için olduğundan zaman hesaplamaları
-- 'Europe/Istanbul' saat dilimine göre yapılır.

create table public.scheduled_orders (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references public.profiles(id) on delete cascade,
  company_id uuid not null references public.companies(id) on delete cascade,
  items jsonb not null,
  note text,
  time_of_day time not null,
  -- 0=Pazar .. 6=Cumartesi (extract(dow from ...) ile aynı)
  days_of_week smallint[] not null,
  is_active boolean not null default true,
  last_run_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint scheduled_orders_items_not_empty check (jsonb_typeof(items) = 'array' and jsonb_array_length(items) > 0),
  constraint scheduled_orders_days_not_empty check (array_length(days_of_week, 1) > 0)
);

create index scheduled_orders_employee_idx on public.scheduled_orders(employee_id);
create index scheduled_orders_active_idx on public.scheduled_orders(is_active) where is_active;

alter table public.scheduled_orders enable row level security;

create policy "scheduled_orders_all_own" on public.scheduled_orders
for all using (employee_id = auth.uid() and public.current_role() = 'employee')
with check (employee_id = auth.uid() and public.current_role() = 'employee' and company_id = public.current_company_id());

create trigger scheduled_orders_set_updated_at
before update on public.scheduled_orders
for each row execute function public.set_updated_at();

-- ============================================================
-- run_scheduled_orders(): pg_cron tarafından her dakika çağrılır. Şu anki
-- İstanbul saatine denk gelen, bugün henüz çalıştırılmamış aktif kayıtlar
-- için create_order ile aynı insert mantığıyla sipariş oluşturur.
-- ============================================================
create extension if not exists pg_cron with schema extensions;

create or replace function public.run_scheduled_orders()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_now timestamptz := now();
  v_local_time time := (v_now at time zone 'Europe/Istanbul')::time;
  v_local_dow smallint := extract(dow from (v_now at time zone 'Europe/Istanbul'))::smallint;
  v_local_date date := (v_now at time zone 'Europe/Istanbul')::date;
  v_schedule record;
  v_order public.orders;
  v_item jsonb;
  v_quantity integer;
  v_location text;
begin
  for v_schedule in
    select * from public.scheduled_orders
    where is_active
      and v_local_dow = any(days_of_week)
      and time_of_day <= v_local_time
      and time_of_day > v_local_time - interval '5 minutes'
      and (last_run_date is null or last_run_date <> v_local_date)
  loop
    select location_description into v_location
    from public.profiles where id = v_schedule.employee_id;

    if v_location is null or trim(v_location) = '' then
      -- Konum bilgisi eksikse bu çalıştırmayı atla, bir dahaki güne kadar tekrar denenmez
      update public.scheduled_orders set last_run_date = v_local_date where id = v_schedule.id;
      continue;
    end if;

    insert into public.orders (employee_id, custom_location, note, company_id, order_type)
    values (v_schedule.employee_id, v_location, nullif(trim(coalesce(v_schedule.note, '')), ''), v_schedule.company_id, 'product')
    returning * into v_order;

    for v_item in select * from jsonb_array_elements(v_schedule.items)
    loop
      v_quantity := (v_item ->> 'quantity')::integer;
      if v_quantity is null or v_quantity <= 0 then
        continue;
      end if;

      insert into public.order_items (order_id, product_id, product_name, quantity, special_request)
      values (
        v_order.id,
        nullif(v_item ->> 'product_id', '')::uuid,
        v_item ->> 'product_name',
        v_quantity,
        nullif(trim(coalesce(v_item ->> 'special_request', '')), '')
      );
    end loop;

    update public.scheduled_orders set last_run_date = v_local_date where id = v_schedule.id;
  end loop;
end;
$$;

revoke execute on function public.run_scheduled_orders() from public, anon, authenticated;

select cron.schedule(
  'run-scheduled-orders',
  '* * * * *',
  $$select public.run_scheduled_orders();$$
);
