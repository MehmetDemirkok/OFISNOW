// OfisNow Web Push service worker.
//
// Sayfa kapalı/arka planda veya telefon ekranı kilitliyken de garsona sistem
// bildirimi göstermek için gerekli. Statik dosya olarak /sw.js'de servis
// edilir (kök scope'ta kayıt olması için); hooks/useWebPushSubscription.ts
// tarafından kaydedilir.

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
  let payload = { title: "OfisNow", body: "Yeni bir bildiriminiz var." };
  try {
    if (event.data) payload = { ...payload, ...event.data.json() };
  } catch {
    // JSON değilse varsayılan metinle devam edilir.
  }

  const orderId = payload.orderId ?? null;

  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: "/pwa/icon-192.png",
      badge: "/pwa/icon-192.png",
      vibrate: payload.vibrate ?? [200, 100, 200],
      tag: orderId ? `order-${orderId}` : undefined,
      renotify: true,
      data: { orderId },
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const orderId = event.notification.data?.orderId;
  const targetUrl = orderId ? `/siparis/${orderId}` : "/";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if ("focus" in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      return self.clients.openWindow(targetUrl);
    })
  );
});
