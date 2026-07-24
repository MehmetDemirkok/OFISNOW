import { useCallback, useEffect, useState } from "react";
import { Platform } from "react-native";

import { updateMyWebPushSubscription } from "@/lib/api/profiles";

const VAPID_PUBLIC_KEY = process.env.EXPO_PUBLIC_VAPID_PUBLIC_KEY;

export type WebPushStatus = "unsupported" | "unknown" | "default" | "denied" | "granted";

function urlBase64ToUint8Array(base64Url: string): Uint8Array {
  const padding = "=".repeat((4 - (base64Url.length % 4)) % 4);
  const base64 = (base64Url + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

function isSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    "Notification" in window &&
    "serviceWorker" in navigator &&
    "PushManager" in window
  );
}

/** İzin zaten "granted" olduğunda çağrılır: kullanıcı etkileşimi gerektirmez. */
async function registerAndSubscribe() {
  if (!VAPID_PUBLIC_KEY) {
    console.warn("[OfisNow] EXPO_PUBLIC_VAPID_PUBLIC_KEY tanımlı değil, web push atlanıyor.");
    return;
  }

  const registration = await navigator.serviceWorker.register("/sw.js");
  await navigator.serviceWorker.ready;

  let subscription = await registration.pushManager.getSubscription();
  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY) as BufferSource,
    });
  }

  await updateMyWebPushSubscription(subscription.toJSON());
}

/**
 * Ekran kilitliyken/PWA arka plandayken de gerçek sistem bildirimi alabilmek
 * için Web Push aboneliğini yönetir (bkz. public/sw.js).
 *
 * Tarayıcılar (özellikle Chrome/Android) bir kullanıcı etkileşimi olmadan
 * (ör. sayfa yüklenir yüklenmez) tetiklenen `Notification.requestPermission()`
 * çağrılarını "sessiz" modda ele alıp gerçek bir izin penceresi hiç
 * göstermeden reddedebilir. Bu yüzden izin isteği yalnızca `requestAndSubscribe`
 * ile, doğrudan bir buton tıklamasından çağrılmalıdır. İzin zaten verilmişse
 * (ör. önceki oturumdan) etkileşim gerekmeden sessizce yeniden abone olunur.
 */
export function useWebPushSubscription(enabled: boolean) {
  const [status, setStatus] = useState<WebPushStatus>("unknown");

  useEffect(() => {
    if (Platform.OS !== "web" || !enabled) return;

    if (!isSupported()) {
      setStatus("unsupported");
      return;
    }

    setStatus(Notification.permission as WebPushStatus);

    if (Notification.permission === "granted") {
      registerAndSubscribe().catch((err) => {
        console.error("[OfisNow] Web push aboneliği kurulamadı", err);
      });
    }
  }, [enabled]);

  const requestAndSubscribe = useCallback(async () => {
    if (Platform.OS !== "web" || !isSupported()) return;

    const permission = await Notification.requestPermission();
    setStatus(permission as WebPushStatus);
    if (permission !== "granted") return;

    await registerAndSubscribe();
  }, []);

  return { status, requestAndSubscribe };
}
