import { useEffect, useRef } from "react";
import { Platform } from "react-native";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { router } from "expo-router";

import { updateMyPushToken } from "@/lib/api/profiles";

// Android bildirim kanalları oluşturulduktan sonra sesi DEĞİŞTİRİLEMEZ (OS
// kısıtlaması) — cihazda kanal daha önce yanlış/eksik ses ile oluşturulmuşsa
// (ör. .wav dosyası native derlemeye eklenmeden önce), o kanal o cihazda
// sonsuza dek öyle kalır. Bu yüzden kanal ID'leri "v2" ile bitiyor: eski
// kurulumlarda da temiz, doğru sesli yeni bir kanal oluşturulmasını garanti
// eder. Bu ID'ler supabase/functions/notify-new-order ve
// notify-order-cancelled Edge Function'larındaki channelId değerleriyle
// BİREBİR aynı olmalı; biri değişirse diğeri de güncellenmeli.
const NEW_ORDER_CHANNEL_ID = "orders-new-v2";
const ORDER_CANCELLED_CHANNEL_ID = "orders-cancelled-v2";
const ORDER_PENDING_CHANNEL_ID = "orders-pending-v2";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

async function ensureAndroidChannel() {
  if (Platform.OS !== "android") return;

  await Notifications.setNotificationChannelAsync(NEW_ORDER_CHANNEL_ID, {
    name: "Yeni Sipariş",
    importance: Notifications.AndroidImportance.HIGH,
    sound: "new_order.wav",
    vibrationPattern: [0, 250, 150, 250],
    lightColor: "#3E6350",
    bypassDnd: false,
    enableVibrate: true,
  });

  await Notifications.setNotificationChannelAsync(ORDER_CANCELLED_CHANNEL_ID, {
    name: "Sipariş İptali",
    importance: Notifications.AndroidImportance.HIGH,
    sound: "order_cancelled.wav",
    vibrationPattern: [0, 300, 100, 300],
    lightColor: "#ba1a1a",
    bypassDnd: false,
    enableVibrate: true,
  });

  // Özel bir .wav asseti gerektirmesin diye sistemin varsayılan bildirim
  // sesi kullanılır (sound: "default").
  await Notifications.setNotificationChannelAsync(ORDER_PENDING_CHANNEL_ID, {
    name: "Sipariş Hatırlatması",
    importance: Notifications.AndroidImportance.HIGH,
    sound: "default",
    vibrationPattern: [0, 200, 100, 200],
    lightColor: "#3E6350",
    bypassDnd: false,
    enableVibrate: true,
  });
}

async function registerForPushNotifications(): Promise<string | null> {
  if (!Device.isDevice) {
    console.warn("[OfisNow] Push bildirimleri yalnızca gerçek cihazlarda çalışır.");
    return null;
  }

  await ensureAndroidChannel();

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    console.warn("[OfisNow] Bildirim izni verilmedi.");
    return null;
  }

  try {
    const tokenResponse = await Notifications.getExpoPushTokenAsync();
    return tokenResponse.data;
  } catch (err) {
    console.error("[OfisNow] Push token alınamadı", err);
    return null;
  }
}

/** Push token kaydı yapar ve bildirime tıklanınca ilgili sipariş detayına yönlendirir. */
export function useNotifications(enabled: boolean) {
  const hasRegistered = useRef(false);

  useEffect(() => {
    // Web'de Expo push token servisi (APNs/FCM) yok; web için ayrı VAPID
    // tabanlı Web Push aboneliği useWebPushSubscription tarafından yönetilir.
    if (Platform.OS === "web") return;
    if (!enabled || hasRegistered.current) return;
    hasRegistered.current = true;

    registerForPushNotifications().then(async (token) => {
      if (token) {
        try {
          await updateMyPushToken(token);
        } catch (err) {
          console.error("[OfisNow] Push token kaydedilemedi", err);
        }
      }
    });
  }, [enabled]);

  useEffect(() => {
    if (Platform.OS === "web") return;

    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      const orderId = response.notification.request.content.data?.orderId as string | undefined;
      if (orderId) {
        router.push(`/(waiter)/siparis/${orderId}`);
      }
    });

    return () => subscription.remove();
  }, []);
}
