import { useEffect, useId, useRef } from "react";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";

import { supabase } from "@/lib/supabase";
import type { OrderStatus } from "@/types/database";

export type OrdersChangeInfo = {
  eventType: RealtimePostgresChangesPayload<Record<string, unknown>>["eventType"];
  newStatus: OrderStatus | null;
  oldStatus: OrderStatus | null;
};

type OrdersChangeHandler = (info: OrdersChangeInfo) => void;

const RECONNECT_DELAY_MS = 3000;

/**
 * orders tablosundaki INSERT/UPDATE olaylarında callback'i tetikler (görevli
 * ekranları için). Birden fazla ekran aynı anda mount olabildiğinden (ör. tab
 * bar'daki diğer sekmeler), her çağrı kendi benzersiz kanalını açar — aksi
 * halde paylaşılan bir kanalın bir ekranda unmount olması diğerlerinin de
 * sessizce güncellenmeyi bırakmasına yol açar.
 *
 * Bildirim sesi bu olaylara bağlı olduğu için bağlantı kopması (ağ kesintisi,
 * cihazın uykudan uyanması, arka plandan dönüş) sessizce kalıcı olmamalı:
 * CHANNEL_ERROR/TIMED_OUT/CLOSED durumunda kısa bir gecikmeyle otomatik
 * olarak yeniden bağlanılır.
 *
 * `enabled` false ise hiç kanal açılmaz (ör. çalışan rolünde gereksiz bir
 * garson-odaklı aboneliği önlemek için).
 */
export function useOrdersRealtime(onChange: OrdersChangeHandler, enabled = true) {
  const callbackRef = useRef(onChange);
  callbackRef.current = onChange;
  const instanceId = useId();

  useEffect(() => {
    if (!enabled) return;
    let active = true;
    let channel: ReturnType<typeof supabase.channel> | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

    function connect() {
      if (!active) return;

      channel = supabase
        .channel(`orders-changes-${instanceId}`)
        .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, (payload) => {
          const newRow = payload.new as { status?: OrderStatus } | undefined;
          const oldRow = payload.old as { status?: OrderStatus } | undefined;
          callbackRef.current({
            eventType: payload.eventType,
            newStatus: newRow?.status ?? null,
            oldStatus: oldRow?.status ?? null,
          });
        })
        .subscribe((status) => {
          if (!active) return;
          if (status !== "CHANNEL_ERROR" && status !== "TIMED_OUT" && status !== "CLOSED") return;

          console.warn(`[OfisNow] Realtime kanalı koptu (${status}), yeniden bağlanılıyor...`);
          if (channel) supabase.removeChannel(channel);
          reconnectTimer = setTimeout(connect, RECONNECT_DELAY_MS);
        });
    }

    connect();

    return () => {
      active = false;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      if (channel) supabase.removeChannel(channel);
    };
  }, [instanceId, enabled]);
}
