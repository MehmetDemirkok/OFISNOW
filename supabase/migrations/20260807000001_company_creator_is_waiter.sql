-- İkram X / OfisNow: şirket kurucusu görevli (waiter) olarak başlar.
--
-- Önceki davranış: company_name ile kayıt → employee. Employee UI'da katalog
-- yok; metin ise "katalog sende olacak" diyordu. App Review bunu "gizli
-- özellik" olarak yorumladı (Guideline 5.6).
--
-- Yeni model:
--   - Şirketi kuran = görevli (katalog + sipariş paneli + ekip daveti)
--   - Çalışan = ofisten sipariş verir
-- Davet / davet kodu artık employee VE waiter tarafından kullanılabilir.

-- ============================================================
-- handle_new_user(): kurucu = waiter
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
    -- Şirketi kuran kişi ikram/katalog tarafını yönetir → görevli.
    v_role := 'waiter';
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

-- ============================================================
-- create_team_invitation(): employee veya waiter davet edebilir
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
  v_caller_role public.user_role;
begin
  v_caller_role := public.current_role();
  if v_caller_role is distinct from 'employee' and v_caller_role is distinct from 'waiter' then
    raise exception 'FORBIDDEN' using errcode = '42501';
  end if;

  if v_email = '' or v_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then
    raise exception 'INVALID_EMAIL' using errcode = 'P0001';
  end if;

  if exists (select 1 from public.profiles where lower(email) = v_email) then
    raise exception 'ALREADY_MEMBER' using errcode = 'P0001';
  end if;

  v_token := upper(replace(gen_random_uuid()::text, '-', '') || replace(gen_random_uuid()::text, '-', ''));

  insert into public.team_invitations (company_id, invited_by, email, role, token)
  values (public.current_company_id(), auth.uid(), v_email, p_role, v_token);

  return v_token;
end;
$$;

comment on table public.team_invitations is 'Employee veya waiter tarafından belirli bir e-postaya gönderilen, tek kullanımlık şirket davetleri.';

-- ============================================================
-- get_or_rotate_invite_code(): employee veya waiter kullanabilir
-- ============================================================
create or replace function public.get_or_rotate_invite_code()
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_company_id uuid;
  v_code text;
  v_generated_at timestamptz;
  v_caller_role public.user_role;
begin
  v_caller_role := public.current_role();
  if v_caller_role is distinct from 'employee' and v_caller_role is distinct from 'waiter' then
    raise exception 'FORBIDDEN' using errcode = '42501';
  end if;

  v_company_id := public.current_company_id();

  select invite_code, invite_code_generated_at into v_code, v_generated_at
  from public.companies
  where id = v_company_id;

  if v_generated_at < now() - interval '10 minutes' then
    loop
      v_code := public.generate_invite_code();
      begin
        update public.companies
        set invite_code = v_code, invite_code_generated_at = now()
        where id = v_company_id;
        exit;
      exception when unique_violation then
        -- kod çakıştı, tekrar dene
      end;
    end loop;
  end if;

  return v_code;
end;
$$;
