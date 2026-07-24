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

/**
 * orders tablosundaki INSERT/UPDATE olaylarında callback'i tetikler (görevli
 * ekranları için). Birden fazla ekran aynı anda mount olabildiğinden (ör. tab
 * bar'daki diğer sekmeler), her çağrı kendi benzersiz kanalını açar — aksi
 * halde paylaşılan bir kanalın bir ekranda unmount olması diğerlerinin de
 * sessizce güncellenmeyi bırakmasına yol açar.
 */
export function useOrdersRealtime(onChange: OrdersChangeHandler) {
  const callbackRef = useRef(onChange);
  callbackRef.current = onChange;
  const instanceId = useId();

  useEffect(() => {
    const channel = supabase
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
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [instanceId]);
}
