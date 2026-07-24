// OfisNow: notify-order-cancelled Edge Function
//
// orders_notify_order_cancelled tetikleyicisi (orders tablosu, status
// "cancelled" olduğunda) bu fonksiyonu çağırır. Şimdilik yalnızca Web Push
// gönderir: garson ekranı web'de kapalı/arka planda/telefon kilitliyken de
// iptal bildirimi ve titreşim ulaşsın diye (native/Expo push akışına
// dokunmaz). Kurulum için repo kökündeki SETUP.md dosyasına bakın.
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import webpush from "npm:web-push@3.6.7";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const VAPID_PUBLIC_KEY = Deno.env.get("VAPID_PUBLIC_KEY");
const VAPID_PRIVATE_KEY = Deno.env.get("VAPID_PRIVATE_KEY");
const VAPID_SUBJECT = Deno.env.get("VAPID_SUBJECT") ?? "mailto:destek@ofisnow.app";

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
}

interface WebhookPayload {
  type: "INSERT" | "UPDATE" | "DELETE";
  table: string;
  record: { id: string; company_id: string; custom_location: string | null } | null;
}

interface WaiterProfile {
  id: string;
  web_push_subscription: WebPushSubscriptionJson | null;
}

interface WebPushSubscriptionJson {
  endpoint: string;
  keys: { p256dh: string; auth: string };
}

Deno.serve(async (req: Request) => {
  try {
    const payload = (await req.json()) as WebhookPayload;
    const orderId = payload?.record?.id;

    if (!orderId || !VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
      return jsonResponse({ ok: true, skipped: true }, 200);
    }

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select(
        `id, custom_location, company_id,
         location:locations(name)`
      )
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      console.error("notify-order-cancelled: sipariş bulunamadı", orderError);
      return jsonResponse({ error: "ORDER_NOT_FOUND" }, 404);
    }

    const { data: waiters, error: waitersError } = await supabase
      .from("profiles")
      .select("id, web_push_subscription")
      .eq("role", "waiter")
      .eq("is_active", true)
      .eq("company_id", order.company_id)
      .not("web_push_subscription", "is", null);

    if (waitersError) {
      console.error("notify-order-cancelled: görevliler alınamadı", waitersError);
      return jsonResponse({ error: "WAITERS_FETCH_FAILED" }, 500);
    }

    const webWaiters = (waiters ?? []) as WaiterProfile[];
    if (webWaiters.length === 0) {
      return jsonResponse({ ok: true, sent: 0 }, 200);
    }

    const location = firstOrValue(order.location) as { name?: string } | null;
    const locationName = location?.name ?? order.custom_location ?? "Belirtilmedi";

    const payloadJson = JSON.stringify({
      title: "❌ Sipariş İptal Edildi",
      body: `${locationName} konumundaki sipariş iptal edildi`,
      orderId: order.id,
      vibrate: [300, 100, 300],
    });

    await Promise.all(
      webWaiters.map(async (w) => {
        try {
          await webpush.sendNotification(w.web_push_subscription, payloadJson);
        } catch (err) {
          const statusCode = (err as { statusCode?: number })?.statusCode;
          console.error("notify-order-cancelled: web push gönderim hatası", statusCode, err);

          if ((statusCode === 404 || statusCode === 410) && w.id) {
            await supabase.from("profiles").update({ web_push_subscription: null }).eq("id", w.id);
          }
        }
      })
    );

    return jsonResponse({ ok: true, sent: webWaiters.length }, 200);
  } catch (err) {
    console.error("notify-order-cancelled: beklenmeyen hata", err);
    return jsonResponse({ error: "INTERNAL_ERROR" }, 500);
  }
});

function firstOrValue<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
