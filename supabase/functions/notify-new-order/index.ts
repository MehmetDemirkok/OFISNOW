// OfisNow: notify-new-order Edge Function
//
// Bir Supabase Database Webhook (orders tablosu, INSERT olayı) bu fonksiyonu
// tetikler. Fonksiyon, aktif ve push_token'ı olan tüm garsonlara Expo Push
// Notifications üzerinden anlık, yüksek öncelikli ve özel sesli bir bildirim
// gönderir. Kurulum adımları için repo kökündeki SETUP.md dosyasına bakın.
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";

interface WebhookPayload {
  type: "INSERT" | "UPDATE" | "DELETE";
  table: string;
  record: { id: string } | null;
}

interface WaiterProfile {
  id: string;
  push_token: string;
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
        `id, custom_location, company_id,
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
    // garsonlarına gitmeli, başka şirketlerin garsonlarına sızmamalı.
    const { data: waiters, error: waitersError } = await supabase
      .from("profiles")
      .select("id, push_token")
      .eq("role", "waiter")
      .eq("is_active", true)
      .eq("company_id", order.company_id)
      .not("push_token", "is", null);

    if (waitersError) {
      console.error("notify-new-order: garsonlar alınamadı", waitersError);
      return jsonResponse({ error: "WAITERS_FETCH_FAILED" }, 500);
    }

    const activeWaiters = (waiters ?? []) as WaiterProfile[];

    if (activeWaiters.length === 0) {
      console.warn("notify-new-order: push token'ı olan aktif garson bulunamadı");
      return jsonResponse({ ok: true, sent: 0 }, 200);
    }

    // Supabase embed ilişkisi bire-bir olsa da PostgREST bazı durumlarda dizi
    // döndürebilir; her iki şekli de güvenle ele al.
    const employee = firstOrValue(order.employee) as { full_name?: string } | null;
    const location = firstOrValue(order.location) as { name?: string } | null;
    const items = (order.order_items ?? []) as OrderItemRow[];

    const itemsSummary = items.map((it) => `${it.quantity}x ${it.product_name}`).join(", ");
    const locationName = location?.name ?? order.custom_location ?? "Belirtilmedi";
    const employeeName = employee?.full_name ?? "Bir çalışan";

    const messages = activeWaiters.map((w) => ({
      to: w.push_token,
      title: "🔔 Yeni Sipariş",
      body: `${employeeName} • ${itemsSummary} • ${locationName}`,
      sound: "new-order.wav",
      channelId: "new-order",
      priority: "high",
      data: { orderId: order.id, type: "new_order" },
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
      return jsonResponse({ error: "EXPO_PUSH_FAILED" }, 502);
    }

    const result = await expoResponse.json();
    const tickets = Array.isArray(result?.data) ? result.data : [];

    await Promise.all(
      tickets.map(async (ticket: { status: string; details?: { error?: string } }, index: number) => {
        if (ticket?.status !== "error") return;

        console.error("notify-new-order: push gönderim hatası", ticket);
        const waiter = activeWaiters[index];

        if (ticket.details?.error === "DeviceNotRegistered" && waiter?.id) {
          await supabase.from("profiles").update({ push_token: null }).eq("id", waiter.id);
        }
      })
    );

    return jsonResponse({ ok: true, sent: messages.length }, 200);
  } catch (err) {
    console.error("notify-new-order: beklenmeyen hata", err);
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
