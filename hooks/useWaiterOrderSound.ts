import { useEffect } from "react";

import { useOrdersRealtime } from "@/hooks/useOrdersRealtime";
import { initWebOrderSoundUnlock, playNewOrderWebSound, playOrderCancelledWebSound } from "@/lib/webOrderSound";

/**
 * Garson için web bildirim sesini uygulamanın KÖKÜNDE, tek bir ekrana bağlı
 * olmadan çalıştırır (bkz. app/_layout.tsx). Daha önce bu mantık yalnızca
 * garson ana sekmesinde (waiter/(tabs)/index.tsx) çalışıyordu; useNotifications
 * ve useWebPushSubscription gibi diğer global bildirim kancalarıyla tutarlı
 * olacak şekilde ve hangi ekranda olursa olsun ses/titreşimin kesintisiz
 * çalışması için buraya taşındı.
 */
export function useWaiterOrderSound(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;
    return initWebOrderSoundUnlock();
  }, [enabled]);

  useOrdersRealtime(({ eventType, newStatus, oldStatus }) => {
    if (eventType === "INSERT") {
      playNewOrderWebSound();
    } else if (eventType === "UPDATE" && newStatus === "cancelled" && oldStatus !== "cancelled") {
      playOrderCancelledWebSound();
    }
  }, enabled);
}
