// OfisNow: send-auth-email Edge Function
//
// Supabase Auth "Send Email" Hook'unu karşılar. Supabase'in kendi e-posta
// gönderimini (çirkin şablon + varsayılan localhost yönlendirmesi) devre dışı
// bırakıp onun yerine Resend üzerinden markalı, Türkçe e-postalar gönderir.
// Kurulum adımları için repo kökündeki SETUP.md dosyasına bakın.
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { Webhook } from "https://esm.sh/standardwebhooks@1.0.0";
import { renderButton, renderCodeBadge, renderEmailShell, sendEmail } from "../_shared/resend.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
// Dashboard > Authentication > Hooks bölümünde üretilen "v1,whsec_..." formatındaki
// secret; standardwebhooks yalnızca base64 kısmını (whsec_ önekiyle) bekler.
const HOOK_SECRET = (Deno.env.get("SEND_EMAIL_HOOK_SECRET") ?? "").replace("v1,whsec_", "");

interface HookPayload {
  user: { email: string };
  email_data: {
    token: string;
    token_hash: string;
    redirect_to: string;
    email_action_type: string;
    site_url: string;
    token_new: string;
    token_hash_new: string;
  };
}

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response("not allowed", { status: 400 });
  }

  const payload = await req.text();
  const headers = Object.fromEntries(req.headers);

  let data: HookPayload;
  try {
    const wh = new Webhook(HOOK_SECRET);
    data = wh.verify(payload, headers) as HookPayload;
  } catch (err) {
    console.error("send-auth-email: webhook doğrulama hatası", err);
    return jsonResponse({ error: { message: "Geçersiz webhook imzası" } }, 401);
  }

  const { user, email_data } = data;
  const { token, token_hash, redirect_to, email_action_type } = email_data;

  const verifyUrl = `${SUPABASE_URL}/auth/v1/verify?token=${token_hash}&type=${email_action_type}&redirect_to=${encodeURIComponent(redirect_to)}`;

  const { subject, html } = buildEmail(email_action_type, { token, verifyUrl });

  try {
    await sendEmail({ to: user.email, subject, html });
  } catch (err) {
    console.error("send-auth-email: gönderim hatası", err);
    return jsonResponse({ error: { message: "E-posta gönderilemedi" } }, 500);
  }

  return jsonResponse({}, 200);
});

function buildEmail(actionType: string, ctx: { token: string; verifyUrl: string }): { subject: string; html: string } {
  switch (actionType) {
    case "signup":
      return {
        subject: "OfisNow — E-posta adresini onayla",
        html: renderEmailShell(
          "E-postanı onayla",
          `<h1 style="margin:0 0 12px;font-size:20px;">Hoş geldin! 👋</h1>
           <p style="margin:0 0 4px;font-size:15px;line-height:1.5;color:#48454E;">
             OfisNow'a katıldığın için teşekkürler. Hesabını aktifleştirmek ve
             siparişlerini oluşturmaya başlamak için aşağıdaki butona tıklayarak
             e-posta adresini onayla.
           </p>
           ${renderButton(ctx.verifyUrl, "E-postamı Onayla")}
           <p style="margin:16px 0 0;font-size:13px;color:#79747E;">Buton çalışmazsa bu bağlantıyı tarayıcına yapıştır:<br/>${ctx.verifyUrl}</p>`,
          "OfisNow hesabını aktifleştirmek için e-postanı onayla."
        ),
      };
    case "recovery":
      return {
        subject: `OfisNow — Şifre sıfırlama kodun: ${ctx.token}`,
        html: renderEmailShell(
          "Şifreni sıfırla",
          `<h1 style="margin:0 0 12px;font-size:20px;">Şifre sıfırlama isteği</h1>
           <p style="margin:0 0 4px;font-size:15px;line-height:1.5;color:#48454E;">
             Hesabın için yeni bir şifre belirlemek üzere OfisNow uygulamasındaki
             "Şifremi Unuttum" ekranına aşağıdaki kodu gir. Bu isteği sen
             yapmadıysan hiçbir şey yapmana gerek yok, kod birkaç dakika içinde
             kendiliğinden geçersiz olur.
           </p>
           ${renderCodeBadge(ctx.token)}`,
          `Şifre sıfırlama kodun: ${ctx.token}`
        ),
      };
    case "invite":
      return {
        subject: "OfisNow — Davet edildin",
        html: renderEmailShell(
          "Davet edildin",
          `<h1 style="margin:0 0 12px;font-size:20px;">Ekibe katılmaya davetlisin</h1>
           <p style="margin:0 0 4px;font-size:15px;line-height:1.5;color:#48454E;">
             OfisNow üzerinde bir hesap oluşturman için davet edildin. Başlamak için aşağıdaki bağlantıya tıkla.
           </p>
           ${renderButton(ctx.verifyUrl, "Daveti Kabul Et")}
           <p style="margin:16px 0 0;font-size:13px;color:#79747E;">Bağlantı çalışmazsa: ${ctx.verifyUrl}</p>`
        ),
      };
    case "email_change":
      return {
        subject: "OfisNow — E-posta değişikliğini onayla",
        html: renderEmailShell(
          "E-posta değişikliği",
          `<h1 style="margin:0 0 12px;font-size:20px;">E-posta adresini onayla</h1>
           <p style="margin:0 0 4px;font-size:15px;line-height:1.5;color:#48454E;">
             Hesabının e-posta adresini değiştirmek için aşağıdaki bağlantıya tıkla.
             Bu isteği sen yapmadıysan hiçbir şey yapmana gerek yok.
           </p>
           ${renderButton(ctx.verifyUrl, "Değişikliği Onayla")}
           <p style="margin:16px 0 0;font-size:13px;color:#79747E;">Bağlantı çalışmazsa: ${ctx.verifyUrl}</p>`
        ),
      };
    case "reauthentication":
      return {
        subject: `OfisNow — Doğrulama kodun: ${ctx.token}`,
        html: renderEmailShell(
          "Doğrulama kodu",
          `<h1 style="margin:0 0 12px;font-size:20px;">Kimliğini doğrula</h1>
           <p style="margin:0 0 4px;font-size:15px;line-height:1.5;color:#48454E;">
             Bu işlemi tamamlamak için uygulamaya aşağıdaki kodu gir:
           </p>
           ${renderCodeBadge(ctx.token)}`,
          `Doğrulama kodun: ${ctx.token}`
        ),
      };
    case "magiclink":
    default:
      return {
        subject: "OfisNow — Giriş bağlantın",
        html: renderEmailShell(
          "Giriş yap",
          `<h1 style="margin:0 0 12px;font-size:20px;">Giriş bağlantın hazır</h1>
           <p style="margin:0 0 4px;font-size:15px;line-height:1.5;color:#48454E;">
             OfisNow'a giriş yapmak için aşağıdaki bağlantıya tıkla.
           </p>
           ${renderButton(ctx.verifyUrl, "Giriş Yap")}
           <p style="margin:16px 0 0;font-size:13px;color:#79747E;">Bağlantı çalışmazsa: ${ctx.verifyUrl}</p>`
        ),
      };
  }
}

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
