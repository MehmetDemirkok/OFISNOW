-- notify_feedback() yalnızca feedback_notify_new tetikleyicisi tarafından
-- çağrılmalı; harden_notify_new_order ile aynı desende PostgREST üzerinden
-- anon/authenticated rollerine yanlışlıkla açılan RPC erişimini kapat.

revoke execute on function public.notify_feedback() from public, anon, authenticated;
