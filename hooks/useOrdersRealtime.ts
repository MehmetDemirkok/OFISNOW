import { useEffect, useRef } from "react";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";

import { supabase } from "@/lib/supabase";

type OrdersChangeHandler = (eventType: RealtimePostgresChangesPayload<Record<string, unknown>>["eventType"]) => void;

/** orders tablosundaki INSERT/UPDATE olaylarında callback'i tetikler (görevli ekranları için). */
export function useOrdersRealtime(onChange: OrdersChangeHandler) {
  const callbackRef = useRef(onChange);
  callbackRef.current = onChange;

  useEffect(() => {
    const channel = supabase
      .channel("orders-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, (payload) => {
        callbackRef.current(payload.eventType);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
}
