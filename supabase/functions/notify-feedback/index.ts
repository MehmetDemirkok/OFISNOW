// OfisNow: notify-feedback Edge Function
//
// feedback tablosuna her INSERT'te feedback_notify_new tetikleyicisi
// (bkz. 20260726000002_feedback_webhook.sql) bu fonksiyonu çağırır.
// Gönderilen mesajı, gönderen kişi ve şirket bilgisiyle birlikte Resend
// üzerinden ekip e-postasına iletir.
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { renderEmailShell, sendEmail } from "../_shared/resend.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const FEEDBACK_NOTIFY_EMAIL = Deno.env.get("FEEDBACK_NOTIFY_EMAIL") ?? "mehmetdemirkok@gmail.com";

const CATEGORY_LABELS: Record<string, string> = {
  suggestion: "Öneri",
  bug: "Hata Bildirimi",
  complaint: "Şikayet",
  other: "Diğer",
};

interface WebhookPayload {
  type: "INSERT" | "UPDATE" | "DELETE";
  table: string;
  record: {
    id: string;
    company_id: string;
    user_id: string;
    category: string;
    message: string;
    created_at: string;
  } | null;
}

Deno.serve(async (req: Request) => {
  try {
    const payload = (await req.json()) as WebhookPayload;
    const feedback = payload?.record;

    if (!feedback) {
      return jsonResponse({ error: "MISSING_FEEDBACK" }, 400);
    }

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, email, job_title")
      .eq("id", feedback.user_id)
      .single();

    const { data: company } = await supabase
      .from("companies")
      .select("name")
      .eq("id", feedback.company_id)
      .single();

    const categoryLabel = CATEGORY_LABELS[feedback.category] ?? feedback.category;
    const senderName = profile?.full_name ?? "Bilinmeyen kullanıcı";
    const senderEmail = profile?.email ?? "-";
    const companyName = company?.name ?? "-";
    const createdAt = new Date(feedback.created_at).toLocaleString("tr-TR", { timeZone: "Europe/Istanbul" });

    const bodyHtml = `
      <h2 style="margin:0 0 16px;font-size:18px;color:#1a1c1a;">📬 Yeni Geri Bildirim</h2>
      <p style="margin:0 0 4px;font-size:14px;color:#434843;"><strong>Kategori:</strong> ${escapeHtml(categoryLabel)}</p>
      <p style="margin:0 0 4px;font-size:14px;color:#434843;"><strong>Gönderen:</strong> ${escapeHtml(senderName)} (${escapeHtml(senderEmail)})</p>
      <p style="margin:0 0 4px;font-size:14px;color:#434843;"><strong>Şirket:</strong> ${escapeHtml(companyName)}</p>
      <p style="margin:0 0 16px;font-size:14px;color:#434843;"><strong>Tarih:</strong> ${escapeHtml(createdAt)}</p>
      <div style="padding:16px;background-color:#f3f4f0;border-radius:10px;">
        <p style="margin:0;font-size:15px;color:#1a1c1a;white-space:pre-wrap;">${escapeHtml(feedback.message)}</p>
      </div>
    `;

    await sendEmail({
      to: FEEDBACK_NOTIFY_EMAIL,
      subject: `OfisNow Geri Bildirim: ${categoryLabel} — ${senderName}`,
      html: renderEmailShell("Yeni Geri Bildirim", bodyHtml),
    });

    return jsonResponse({ ok: true }, 200);
  } catch (err) {
    console.error("notify-feedback: beklenmeyen hata", err);
    return jsonResponse({ error: "INTERNAL_ERROR" }, 500);
  }
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
    headers: { "Content-Type": "application/json" },
  });
}
