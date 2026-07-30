-- OfisNow: e-posta ile ekip daveti.
-- Şirketin paylaşılan invite_code'u güvenlik amacıyla 10 dakikada bir
-- kendiliğinden yenilendiği için (bkz. get_or_rotate_invite_code) bir
-- e-postaya gömülüp saatler sonra kullanılmak üzere gönderilemez. Bunun
-- yerine employee, belirli bir e-posta adresine ve role'e özel, 7 gün
-- geçerli, tek kullanımlık bir davet token'ı üretebilir; token yalnızca
-- davet edilen e-posta adresiyle kayıt olunca kabul edilir.

create table public.team_invitations (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  invited_by uuid not null references public.profiles (id) on delete cascade,
  email text not null,
  role public.user_role not null,
  token text not null unique,
  accepted_at timestamptz,
  expires_at timestamptz not null default now() + interval '7 days',
  created_at timestamptz not null default now()
);

comment on table public.team_invitations is 'Employee tarafından belirli bir e-postaya gönderilen, tek kullanımlık şirket davetleri.';

create index team_invitations_company_id_idx on public.team_invitations (company_id);
create index team_invitations_token_idx on public.team_invitations (token);

-- İstemci bu tabloyu hiçbir zaman doğrudan sorgulamaz; yalnızca aşağıdaki
-- SECURITY DEFINER fonksiyonlar (create_team_invitation, handle_new_user)
-- üzerinden erişilir. RLS'i politika eklemeden etkinleştirmek, authenticated
-- rolüne varsayılan olarak tüm erişimi kapatır.
alter table public.team_invitations enable row level security;

-- ============================================================
-- create_team_invitation(): employee, belirli bir e-posta+role için token üretir.
-- ============================================================
create or replace function public.create_team_invitation(p_email text, p_role public.user_role)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email text := lower(trim(p_email));
  v_token text;
begin
  if public.current_role() <> 'employee' then
    raise exception 'FORBIDDEN' using errcode = '42501';
  end if;

  if v_email = '' or v_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then
    raise exception 'INVALID_EMAIL' using errcode = 'P0001';
  end if;

  if exists (select 1 from public.profiles where lower(email) = v_email) then
    raise exception 'ALREADY_MEMBER' using errcode = 'P0001';
  end if;

  -- gen_random_bytes() pgcrypto'nun "extensions" şemasında yaşar ve bu
  -- fonksiyonun search_path'i yalnızca "public"; bunun yerine bu dosyadaki
  -- diğer fonksiyonlarda da kullanılan gen_random_uuid() (çekirdek Postgres)
  -- ile yeterince rastgele, uzun bir token üretiyoruz.
  v_token := upper(replace(gen_random_uuid()::text, '-', '') || replace(gen_random_uuid()::text, '-', ''));

  insert into public.team_invitations (company_id, invited_by, email, role, token)
  values (public.current_company_id(), auth.uid(), v_email, p_role, v_token);

  return v_token;
end;
$$;

revoke execute on function public.create_team_invitation(text, public.user_role) from public, anon;
grant execute on function public.create_team_invitation(text, public.user_role) to authenticated;

-- ============================================================
-- handle_new_user(): invite_code alanına gelen değer önce bir davet
-- token'ına, bulunamazsa şirketin paylaşılan invite_code'una göre kontrol
-- edilir.
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
  v_invitation public.team_invitations%rowtype;
begin
  v_company_name := nullif(trim(new.raw_user_meta_data ->> 'company_name'), '');
  v_invite_code := nullif(trim(new.raw_user_meta_data ->> 'invite_code'), '');

  if v_company_name is not null then
    loop
      v_code := public.generate_invite_code();
      begin
        insert into public.companies (name, invite_code, invite_code_generated_at)
        values (v_company_name, v_code, now())
        returning id into v_company_id;
        exit;
      exception when unique_violation then
        -- kod çakıştı, tekrar dene
      end;
    end loop;
    v_role := 'employee';
  elsif v_invite_code is not null then
    select * into v_invitation
    from public.team_invitations
    where token = upper(v_invite_code)
      and accepted_at is null
      and expires_at > now();

    if v_invitation.id is not null then
      if lower(new.email) <> v_invitation.email then
        raise exception 'INVITE_EMAIL_MISMATCH' using errcode = 'P0001';
      end if;

      v_company_id := v_invitation.company_id;
      v_role := v_invitation.role;

      update public.team_invitations set accepted_at = now() where id = v_invitation.id;
    else
      select id into v_company_id
      from public.companies
      where invite_code = upper(v_invite_code);

      if v_company_id is null then
        raise exception 'INVALID_INVITE_CODE' using errcode = 'P0001';
      end if;

      v_role := coalesce((new.raw_user_meta_data ->> 'role')::user_role, 'employee');
    end if;
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
