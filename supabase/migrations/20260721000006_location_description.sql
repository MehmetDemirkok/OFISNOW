-- OfisNow: çalışan konumu artık ayrı kat/oda numaralarıyla değil, tek bir
-- serbest metin "tarif" alanıyla tutulur (örn. "3. kat, mutfağın karşısı,
-- mavi kapı"). Kayıt formunda ve garson çalışan dizininde tek bir açıklama
-- alanı kullanılır.

alter table public.profiles add column location_description text;

update public.profiles
set location_description = nullif(
  trim(
    concat_ws(
      ' - ',
      case when nullif(trim(floor), '') is not null then 'Kat ' || trim(floor) end,
      case when nullif(trim(room), '') is not null then 'Oda ' || trim(room) end
    )
  ),
  ''
)
where floor is not null or room is not null;

alter table public.profiles drop column floor;
alter table public.profiles drop column room;

-- ============================================================
-- my_location_label(): artık doğrudan serbest metin tarifi döndürür.
-- ============================================================
create or replace function public.my_location_label()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select location_description
  from public.profiles
  where id = auth.uid();
$$;

-- ============================================================
-- update_my_location: tek parametreli hale geldi (p_floor/p_room yerine
-- p_location).
-- ============================================================
drop function if exists public.update_my_location(text, text);

create or replace function public.update_my_location(p_location text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.profiles
  set location_description = nullif(trim(p_location), '')
  where id = auth.uid();
end;
$$;

revoke execute on function public.update_my_location(text) from public, anon;
grant execute on function public.update_my_location(text) to authenticated;

-- ============================================================
-- handle_new_user(): davetle katılan çalışan için location_description
-- kayıt sırasında profile yazılır (floor/room yerine).
-- ============================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_company_id uuid;
  v_company_name text;
  v_invite_code text;
  v_role user_role;
  v_code text;
begin
  v_company_name := nullif(trim(new.raw_user_meta_data ->> 'company_name'), '');
  v_invite_code := nullif(trim(new.raw_user_meta_data ->> 'invite_code'), '');

  if v_company_name is not null then
    loop
      v_code := public.generate_invite_code();
      begin
        insert into public.companies (name, invite_code)
        values (v_company_name, v_code)
        returning id into v_company_id;
        exit;
      exception when unique_violation then
        -- kod çakıştı, tekrar dene
      end;
    end loop;
    v_role := 'waiter';
  elsif v_invite_code is not null then
    select id into v_company_id
    from public.companies
    where invite_code = upper(v_invite_code);

    if v_company_id is null then
      raise exception 'INVALID_INVITE_CODE' using errcode = 'P0001';
    end if;

    v_role := coalesce((new.raw_user_meta_data ->> 'role')::user_role, 'employee');
  else
    raise exception 'COMPANY_INFO_REQUIRED' using errcode = 'P0001';
  end if;

  insert into public.profiles (id, full_name, email, role, company_id, location_description)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.email),
    new.email,
    v_role,
    v_company_id,
    nullif(trim(new.raw_user_meta_data ->> 'location_description'), '')
  )
  on conflict (id) do nothing;

  return new;
end;
$$;
