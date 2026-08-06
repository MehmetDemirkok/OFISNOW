// OfisNow: invite-teammate Edge Function
//
// Hesabım ekranındaki "Arkadaşını Davet Et" formu bu fonksiyonu doğrudan
// çağırır (webhook değil). İsteği gönderen kullanıcının JWT'si forward
// edilerek RLS/current_role() ile aynı yetki kontrolü (employee veya waiter)
// sağlanır; token üretimi create_team_invitation() RPC'sine bırakılır,
// burada yalnızca e-posta gönderimi yapılır.
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { renderButton, renderCodeBadge, renderEmailShell, sendEmail } from "../_shared/resend.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
// Kayıt ekranını doğrudan davet linkiyle açabilmek için opsiyonel; ayarlı
// değilse e-postada yalnızca kodu girmesi gereken talimat gösterilir.
const SITE_URL = Deno.env.get("SITE_URL");

const ROLE_LABELS: Record<string, string> = {
  employee: "Çalışan",
  waiter: "Görevli",
};

// Web/PWA istemcisi doğrudan bu fonksiyonu çağırdığı için (webhook değil),
// tarayıcı önce bir CORS preflight (OPTIONS) isteği gönderir.
const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface InvitePayload {
  email?: string;
  role?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "METHOD_NOT_ALLOWED" }, 405);
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return jsonResponse({ error: "UNAUTHORIZED" }, 401);
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return jsonResponse({ error: "UNAUTHORIZED" }, 401);
  }

  let payload: InvitePayload;
  try {
    payload = await req.json();
  } catch {
    return jsonResponse({ error: "INVALID_BODY" }, 400);
  }

  const email = (payload.email ?? "").trim().toLowerCase();
  const role = payload.role === "waiter" ? "waiter" : "employee";

  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return jsonResponse({ error: "INVALID_EMAIL" }, 400);
  }
  if (user.email && email === user.email.toLowerCase()) {
    return jsonResponse({ error: "CANNOT_INVITE_SELF" }, 400);
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("full_name, role, company_id")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    return jsonResponse({ error: "PROFILE_NOT_FOUND" }, 404);
  }
  if (profile.role !== "employee" && profile.role !== "waiter") {
    return jsonResponse({ error: "FORBIDDEN" }, 403);
  }

  const { data: token, error: rpcError } = await supabase.rpc("create_team_invitation", {
    p_email: email,
    p_role: role,
  });

  if (rpcError || !token) {
    console.error("invite-teammate: create_team_invitation hatası", rpcError);
    // create_team_invitation() RAISE EXCEPTION ile fırlattığı mesajı olduğu gibi
    // error.message'a koyar; bilinen kodları istemciye taşıyoruz, bilmediklerimizi
    // genel bir 500'e düşürüyoruz.
    const KNOWN_CODES = ["FORBIDDEN", "INVALID_EMAIL", "ALREADY_MEMBER"];
    const knownCode = KNOWN_CODES.find((code) => rpcError?.message?.includes(code));
    return jsonResponse({ error: knownCode ?? "INVITATION_FAILED" }, knownCode ? 400 : 500);
  }

  const { data: company } = await supabase.from("companies").select("name").eq("id", profile.company_id).single();

  const roleLabel = ROLE_LABELS[role] ?? role;
  const companyName = company?.name ?? "İkram X";
  const inviterName = profile.full_name || "Bir ekip arkadaşın";

  const inviteLink = SITE_URL ? `${SITE_URL.replace(/\/$/, "")}/register?invite=${token}&role=${role}` : null;

  const bodyHtml = `
    <h1 style="margin:0 0 12px;font-size:20px;">Ekibe katılmaya davetlisin 🎉</h1>
    <p style="margin:0 0 4px;font-size:15px;line-height:1.5;color:#48454E;">
      <strong>${escapeHtml(inviterName)}</strong>, seni <strong>${escapeHtml(companyName)}</strong>
      şirketine İkram X üzerinde <strong>${escapeHtml(roleLabel)}</strong> olarak davet etti.
    </p>
    ${
      inviteLink
        ? `${renderButton(inviteLink, "Daveti Kabul Et")}
           <p style="margin:16px 0 0;font-size:13px;color:#79747E;">Buton çalışmazsa bu bağlantıyı tarayıcına yapıştır:<br/>${inviteLink}</p>`
        : `<p style="margin:0 0 4px;font-size:15px;line-height:1.5;color:#48454E;">
             İkram X uygulamasını aç, "Davet Koduyla Katıl" seçeneğini seç ve aşağıdaki kodu gir:
           </p>
           ${renderCodeBadge(token)}`
    }
    <p style="margin:16px 0 0;font-size:13px;color:#79747E;">
      Bu davet 7 gün geçerlidir ve yalnızca ${escapeHtml(email)} adresiyle kayıt olunca kullanılabilir.
    </p>`;

  try {
    await sendEmail({
      to: email,
      subject: `${companyName} — İkram X'e davet edildin`,
      html: renderEmailShell("Ekibe katılmaya davetlisin", bodyHtml, `${inviterName} seni ${companyName} ekibine davet etti.`),
    });
  } catch (err) {
    console.error("invite-teammate: e-posta gönderim hatası", err);
    return jsonResponse({ error: "EMAIL_SEND_FAILED" }, 500);
  }

  return jsonResponse({ ok: true }, 200);
});

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...CORS_HEADERS },
  });
}
