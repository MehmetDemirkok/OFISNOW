import { useEffect, useRef } from "react";
import { Platform } from "react-native";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { router } from "expo-router";

import { updateMyPushToken } from "@/lib/api/profiles";

const NEW_ORDER_CHANNEL_ID = "new-order";

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
    lightColor: "#00236f",
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
    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      const orderId = response.notification.request.content.data?.orderId as string | undefined;
      if (orderId) {
        router.push(`/(waiter)/siparis/${orderId}`);
      }
    });

    return () => subscription.remove();
  }, []);
}
