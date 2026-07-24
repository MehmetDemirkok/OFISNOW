import { useEffect, useRef } from "react";
import { Platform } from "react-native";

import { updateMyWebPushSubscription } from "@/lib/api/profiles";

const VAPID_PUBLIC_KEY = process.env.EXPO_PUBLIC_VAPID_PUBLIC_KEY;

function urlBase64ToUint8Array(base64Url: string): Uint8Array {
  const padding = "=".repeat((4 - (base64Url.length % 4)) % 4);
  const base64 = (base64Url + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

async function subscribe() {
  if (!VAPID_PUBLIC_KEY) {
    console.warn("[OfisNow] EXPO_PUBLIC_VAPID_PUBLIC_KEY tanımlı değil, web push atlanıyor.");
    return;
  }
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;

  const permission = await Notification.requestPermission();
  if (permission !== "granted") return;

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
 * için Web Push aboneliğini kaydeder (bkz. public/sw.js). Yalnızca web'de,
 * oturum açıkken ve tarayıcı destekliyorsa çalışır.
 */
export function useWebPushSubscription(enabled: boolean) {
  const hasRun = useRef(false);

  useEffect(() => {
    if (Platform.OS !== "web" || !enabled || hasRun.current) return;
    hasRun.current = true;

    subscribe().catch((err) => {
      console.error("[OfisNow] Web push aboneliği kurulamadı", err);
    });
  }, [enabled]);
}
