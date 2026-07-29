// OfisNow: notify-order-pending Edge Function
//
// public.notify_pending_orders() (pg_cron, her dakika) bu fonksiyonu çağırır:
// bir garson siparişi üstlenip ("seen") 15 dakika içinde "TAMAMLANDI"
// dememişse, siparişi üstlenen garsona -yalnızca ona- nazik, tek seferlik bir
// hatırlatma bildirimi gönderir. notify-order-cancelled ile aynı Expo Push +
// Web Push deseni kullanılır. Kurulum için repo kökündeki SETUP.md dosyasına
// bakın.
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import webpush from "npm:web-push@3.6.7";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";

const VAPID_PUBLIC_KEY = Deno.env.get("VAPID_PUBLIC_KEY");
const VAPID_PRIVATE_KEY = Deno.env.get("VAPID_PRIVATE_KEY");
const VAPID_SUBJECT = Deno.env.get("VAPID_SUBJECT") ?? "mailto:destek@ofisnow.app";

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
}

interface WebhookPayload {
  type: "REMINDER";
  table: string;
  record: { id: string } | null;
}

interface WaiterProfile {
  id: string;
  push_token: string | null;
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

    if (!orderId) {
      return jsonResponse({ error: "MISSING_ORDER_ID" }, 400);
    }

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select(
        `id, status, custom_location, seen_by,
         location:locations(name)`
      )
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      console.error("notify-order-pending: sipariş bulunamadı", orderError);
      return jsonResponse({ error: "ORDER_NOT_FOUND" }, 404);
    }

    // Hatırlatma tarama ile gönderim arasındaki kısa sürede sipariş zaten
    // tamamlanmış/iptal edilmiş olabilir; bu durumda bildirim göndermeye gerek yok.
    if (order.status !== "seen" || !order.seen_by) {
      return jsonResponse({ ok: true, sent: 0, reason: "ORDER_NO_LONGER_PENDING" }, 200);
    }

    const { data: waiter, error: waiterError } = await supabase
      .from("profiles")
      .select("id, push_token, web_push_subscription")
      .eq("id", order.seen_by)
      .single();

    if (waiterError || !waiter) {
      console.error("notify-order-pending: garson bulunamadı", waiterError);
      return jsonResponse({ error: "WAITER_NOT_FOUND" }, 404);
    }

    const waiterProfile = waiter as WaiterProfile;
    if (!waiterProfile.push_token && !waiterProfile.web_push_subscription) {
      return jsonResponse({ ok: true, sent: 0, reason: "NO_PUSH_TARGET" }, 200);
    }

    const location = firstOrValue(order.location) as { name?: string } | null;
    const locationName = location?.name ?? order.custom_location ?? "belirttiğiniz konum";

    const title = "🙏 Küçük bir hatırlatma";
    const body = `${locationName} için üstlendiğiniz sipariş 15 dakikadır açık görünüyor. Teslim ettiyseniz uygulamadan "Tamamlandı" diyerek kapatmayı unutmayın — emeğiniz için şimdiden teşekkürler!`;

    const nativeWaiters = waiterProfile.push_token ? [waiterProfile] : [];
    const webWaiters = waiterProfile.web_push_subscription ? [waiterProfile] : [];

    const [expoSent] = await Promise.all([
      sendExpoPush(supabase, nativeWaiters, { title, body, orderId: order.id }),
      sendWebPush(supabase, webWaiters, { title, body, orderId: order.id }),
    ]);

    return jsonResponse({ ok: true, sent: expoSent + webWaiters.length }, 200);
  } catch (err) {
    console.error("notify-order-pending: beklenmeyen hata", err);
    return jsonResponse({ error: "INTERNAL_ERROR" }, 500);
  }
});

async function sendExpoPush(
  supabase: ReturnType<typeof createClient>,
  waiters: WaiterProfile[],
  info: { title: string; body: string; orderId: string }
): Promise<number> {
  if (waiters.length === 0) return 0;

  const messages = waiters.map((w) => ({
    to: w.push_token,
    title: info.title,
    body: info.body,
    // Yeni bir özel .wav asseti gerektirmesin diye sistemin varsayılan
    // bildirim sesi kullanılır (kanal: hooks/useNotifications.ts).
    sound: "default",
    channelId: "orders-pending-v2",
    priority: "high",
    data: { orderId: info.orderId, type: "order_pending_reminder" },
  }));

  const expoResponse = await fetch(EXPO_PUSH_URL, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Accept-Encoding": "gzip, deflate",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(messages),
  });

  if (!expoResponse.ok) {
    console.error("notify-order-pending: expo push isteği başarısız", await expoResponse.text());
    return 0;
  }

  const result = await expoResponse.json();
  const tickets = Array.isArray(result?.data) ? result.data : [];

  await Promise.all(
    tickets.map(async (ticket: { status: string; details?: { error?: string } }, index: number) => {
      if (ticket?.status !== "error") return;

      console.error("notify-order-pending: expo push gönderim hatası", ticket);
      const waiter = waiters[index];

      if (ticket.details?.error === "DeviceNotRegistered" && waiter?.id) {
        await supabase.from("profiles").update({ push_token: null }).eq("id", waiter.id);
      }
    })
  );

  return messages.length;
}

async function sendWebPush(
  supabase: ReturnType<typeof createClient>,
  waiters: WaiterProfile[],
  info: { title: string; body: string; orderId: string }
): Promise<void> {
  if (waiters.length === 0 || !VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) return;

  const payloadJson = JSON.stringify({
    title: info.title,
    body: info.body,
    orderId: info.orderId,
    vibrate: [200, 100, 200],
  });

  await Promise.all(
    waiters.map(async (w) => {
      try {
        await webpush.sendNotification(w.web_push_subscription, payloadJson);
      } catch (err) {
        const statusCode = (err as { statusCode?: number })?.statusCode;
        console.error("notify-order-pending: web push gönderim hatası", statusCode, err);

        if ((statusCode === 404 || statusCode === 410) && w.id) {
          await supabase.from("profiles").update({ web_push_subscription: null }).eq("id", w.id);
        }
      }
    })
  );
}

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
