// OfisNow: Resend REST API üzerinden e-posta gönderimi için ortak yardımcı.
// Auth email hook'u ve ileride eklenecek bildirim e-postaları (sipariş özeti
// vb.) bu modülü paylaşır.
const RESEND_API_URL = "https://api.resend.com/emails";

export interface SendEmailInput {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
}

/** OfisNow marka renkleriyle ortak e-posta kabuğu (header + içerik + footer). */
export function renderEmailShell(title: string, bodyHtml: string, preheader?: string): string {
  return `<!DOCTYPE html>
<html lang="tr">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${title}</title>
  </head>
  <body style="margin:0;padding:0;background-color:#FAFAFF;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
    ${
      preheader
        ? `<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${preheader}</div>`
        : ""
    }
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#FAFAFF;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="max-width:480px;width:100%;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(27,27,35,0.08);">
            <tr>
              <td style="background-color:#4F46E5;padding:28px 32px;">
                <span style="color:#ffffff;font-size:20px;font-weight:700;letter-spacing:0.3px;">🏢 OfisNow</span>
                <div style="color:#C7D2FE;font-size:12px;margin-top:2px;">Kurumsal sipariş sistemi</div>
              </td>
            </tr>
            <tr>
              <td style="padding:32px;color:#1B1B23;">
                ${bodyHtml}
              </td>
            </tr>
            <tr>
              <td style="padding:20px 32px;background-color:#EEF2FF;">
                <p style="margin:0 0 4px;font-size:12px;color:#3730A3;">Bu e-postayı beklemiyorsan güvenle yok sayabilirsin.</p>
                <p style="margin:0;font-size:12px;color:#6366F1;">OfisNow · destek@ofisnow.app</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export function renderButton(href: string, label: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0;">
    <tr>
      <td style="border-radius:10px;background-color:#4F46E5;">
        <a href="${href}" target="_blank" style="display:inline-block;padding:14px 28px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:10px;">${label}</a>
      </td>
    </tr>
  </table>`;
}

/** 6 haneli doğrulama kodunu büyük, aralıklı rakamlarla gösteren rozet. */
export function renderCodeBadge(code: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:20px 0;">
    <tr>
      <td style="background-color:#EEF2FF;border:1px dashed #818CF8;border-radius:12px;padding:18px 28px;">
        <span style="font-size:32px;font-weight:700;letter-spacing:8px;color:#3730A3;font-family:'Courier New',monospace;">${code}</span>
      </td>
    </tr>
  </table>`;
}

/** Resend REST API'sine doğrudan fetch ile e-posta gönderir. */
export async function sendEmail(input: SendEmailInput): Promise<void> {
  const apiKey = Deno.env.get("RESEND_API_KEY");
  if (!apiKey) throw new Error("RESEND_API_KEY tanımlı değil");

  const from = input.from ?? Deno.env.get("RESEND_FROM_EMAIL") ?? "OfisNow <onboarding@resend.dev>";

  const response = await fetch(RESEND_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: Array.isArray(input.to) ? input.to : [input.to],
      subject: input.subject,
      html: input.html,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Resend gönderim hatası (${response.status}): ${text}`);
  }
}
