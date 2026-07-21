import { useEffect, useRef } from "react";

import { supabase } from "@/lib/supabase";

/** orders tablosundaki INSERT/UPDATE olaylarında callback'i tetikler (görevli ekranları için). */
export function useOrdersRealtime(onChange: () => void) {
  const callbackRef = useRef(onChange);
  callbackRef.current = onChange;

  useEffect(() => {
    const channel = supabase
      .channel("orders-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => {
        callbackRef.current();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
}
