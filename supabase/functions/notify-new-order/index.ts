// OfisNow: notify-new-order Edge Function
//
// Bir Supabase Database Webhook (orders tablosu, INSERT olayı) bu fonksiyonu
// tetikler. Fonksiyon, aktif görevlilere hem Expo Push Notifications (native
// uygulama) hem de Web Push (tarayıcı/PWA, ekran kilitliyken de çalışır)
// üzerinden anlık, özel sesli bir bildirim gönderir. Kurulum adımları için
// repo kökündeki SETUP.md dosyasına bakın.
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
  type: "INSERT" | "UPDATE" | "DELETE";
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

interface OrderItemRow {
  product_name: string;
  quantity: number;
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
        `id, custom_location, company_id, order_type,
         employee:profiles!orders_employee_id_fkey(full_name),
         location:locations(name),
         order_items(product_name, quantity)`
      )
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      console.error("notify-new-order: sipariş bulunamadı", orderError);
      return jsonResponse({ error: "ORDER_NOT_FOUND" }, 404);
    }

    // Service role RLS'i atlar; bildirim yalnızca siparişin ait olduğu şirketin
    // görevlilerine gitmeli, başka şirketlerin görevlilerine sızmamalı.
    const { data: waiters, error: waitersError } = await supabase
      .from("profiles")
      .select("id, push_token, web_push_subscription")
      .eq("role", "waiter")
      .eq("is_active", true)
      .eq("company_id", order.company_id)
      .or("push_token.not.is.null,web_push_subscription.not.is.null");

    if (waitersError) {
      console.error("notify-new-order: görevliler alınamadı", waitersError);
      return jsonResponse({ error: "WAITERS_FETCH_FAILED" }, 500);
    }

    const activeWaiters = (waiters ?? []) as WaiterProfile[];

    if (activeWaiters.length === 0) {
      console.warn("notify-new-order: bildirim kaydı olan aktif görevli bulunamadı");
      return jsonResponse({ ok: true, sent: 0 }, 200);
    }

    // Supabase embed ilişkisi bire-bir olsa da PostgREST bazı durumlarda dizi
    // döndürebilir; her iki şekli de güvenle ele al.
    const employee = firstOrValue(order.employee) as { full_name?: string } | null;
    const location = firstOrValue(order.location) as { name?: string } | null;
    const items = (order.order_items ?? []) as OrderItemRow[];

    const isCall = order.order_type === "call";
    const isPickup = order.order_type === "pickup";
    const itemsSummary = items.map((it) => `${it.quantity}x ${it.product_name}`).join(", ");
    const locationName = location?.name ?? order.custom_location ?? "Belirtilmedi";
    const employeeName = employee?.full_name ?? "Bir çalışan";

    const title = isPickup ? "🧹 Boş Toplama Ricası" : isCall ? "🔔 Görevli Çağrısı" : "🔔 Yeni Sipariş";
    const body = isPickup
      ? `${employeeName}, masasındaki boşları alabilir misiniz diye rica ediyor • ${locationName}`
      : isCall
        ? `${employeeName} sizi çağırıyor • ${locationName}`
        : `${employeeName} • ${itemsSummary} • ${locationName}`;

    const nativeWaiters = activeWaiters.filter((w) => w.push_token);
    const webWaiters = activeWaiters.filter((w) => w.web_push_subscription);

    const [expoSent] = await Promise.all([
      sendExpoPush(supabase, nativeWaiters, { title, body, orderId: order.id, type: isPickup ? "pickup_request" : isCall ? "waiter_call" : "new_order" }),
      sendWebPush(supabase, webWaiters, { title, body, orderId: order.id }),
    ]);

    return jsonResponse({ ok: true, sent: expoSent + webWaiters.length }, 200);
  } catch (err) {
    console.error("notify-new-order: beklenmeyen hata", err);
    return jsonResponse({ error: "INTERNAL_ERROR" }, 500);
  }
});

async function sendExpoPush(
  supabase: ReturnType<typeof createClient>,
  waiters: WaiterProfile[],
  info: { title: string; body: string; orderId: string; type: string }
): Promise<number> {
  if (waiters.length === 0) return 0;

  const messages = waiters.map((w) => ({
    to: w.push_token,
    title: info.title,
    body: info.body,
    sound: "new_order.wav",
    channelId: "new-order",
    priority: "high",
    data: { orderId: info.orderId, type: info.type },
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
    console.error("notify-new-order: expo push isteği başarısız", await expoResponse.text());
    return 0;
  }

  const result = await expoResponse.json();
  const tickets = Array.isArray(result?.data) ? result.data : [];

  await Promise.all(
    tickets.map(async (ticket: { status: string; details?: { error?: string } }, index: number) => {
      if (ticket?.status !== "error") return;

      console.error("notify-new-order: expo push gönderim hatası", ticket);
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

  const payload = JSON.stringify({
    title: info.title,
    body: info.body,
    orderId: info.orderId,
    vibrate: [200, 100, 200, 100, 200],
  });

  await Promise.all(
    waiters.map(async (w) => {
      try {
        await webpush.sendNotification(w.web_push_subscription, payload);
      } catch (err) {
        const statusCode = (err as { statusCode?: number })?.statusCode;
        console.error("notify-new-order: web push gönderim hatası", statusCode, err);

        // 404/410: abonelik artık geçersiz (tarayıcı bildirimi engellemiş, iptal
        // edilmiş vb.); bir sonraki denemede tekrar hataya düşmemek için temizle.
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
