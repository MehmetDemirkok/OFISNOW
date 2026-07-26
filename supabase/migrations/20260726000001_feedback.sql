-- OfisNow: kullanıcıların uygulama içinden geri bildirim gönderebilmesi.
-- Yazma işlemi, update_my_profile ile aynı desende tek bir security definer
-- fonksiyon üzerinden yapılır; kullanıcılar yalnızca kendi gönderdiklerini
-- görebilir (select), tabloya doğrudan insert/update/delete yetkisi yoktur.

create table public.feedback (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  category text not null default 'other' check (category in ('suggestion', 'bug', 'complaint', 'other')),
  message text not null check (char_length(trim(message)) > 0),
  created_at timestamptz not null default now()
);

comment on table public.feedback is 'Kullanıcıların Hesabım > Geri Bildirim ekranından gönderdiği mesajlar; notify-feedback Edge Function ile e-postaya iletilir.';

create index feedback_company_id_idx on public.feedback (company_id);
create index feedback_user_id_idx on public.feedback (user_id);

alter table public.feedback enable row level security;

create policy "feedback_select_own" on public.feedback
for select using (user_id = auth.uid());

create or replace function public.send_feedback(p_message text, p_category text default 'other')
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.feedback (company_id, user_id, category, message)
  values (
    public.current_company_id(),
    auth.uid(),
    coalesce(nullif(p_category, ''), 'other'),
    trim(p_message)
  );
end;
$$;

revoke execute on function public.send_feedback(text, text) from public, anon;
grant execute on function public.send_feedback(text, text) to authenticated;
