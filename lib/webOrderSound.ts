import { Platform } from "react-native";

// Web'de expo-notifications push altyapısı yok (bkz. hooks/useNotifications.ts),
// bu yüzden sipariş sesleri burada Web Audio ile ayrıca çalınır. Tarayıcıların
// autoplay kısıtlaması nedeniyle ilk çalma denemesi ancak bir kullanıcı
// etkileşiminden (tıklama/tuş) sonra "kilidi açılmış" olur.
const SOUND_URLS = {
  newOrder: "/sounds/new_order.wav",
  orderCancelled: "/sounds/order_cancelled.wav",
} as const;

type SoundKey = keyof typeof SOUND_URLS;

const audioEls: Partial<Record<SoundKey, HTMLAudioElement>> = {};
let unlocked = false;

function getAudio(key: SoundKey): HTMLAudioElement | null {
  if (Platform.OS !== "web" || typeof window === "undefined") return null;
  if (!audioEls[key]) {
    const el = new window.Audio(SOUND_URLS[key]);
    el.preload = "auto";
    el.volume = 1;
    audioEls[key] = el;
  }
  return audioEls[key]!;
}

function unlock() {
  if (unlocked) return;
  const elements = (Object.keys(SOUND_URLS) as SoundKey[]).map(getAudio).filter((el): el is HTMLAudioElement => !!el);
  if (elements.length === 0) return;

  Promise.all(
    elements.map((el) =>
      el
        .play()
        .then(() => {
          el.pause();
          el.currentTime = 0;
        })
        .catch(() => {
          // Kullanıcı etkileşimi yeterli olmadı; bir sonraki etkileşimde tekrar denenecek.
        })
    )
  ).then(() => {
    unlocked = true;
  });
}

/** Tarayıcı autoplay kısıtlamasını aşmak için ilk kullanıcı etkileşiminde sesleri kilitler. */
export function initWebOrderSoundUnlock() {
  if (Platform.OS !== "web" || typeof document === "undefined") return () => {};

  const events: Array<"pointerdown" | "keydown"> = ["pointerdown", "keydown"];
  events.forEach((event) => document.addEventListener(event, unlock, { once: true }));

  return () => {
    events.forEach((event) => document.removeEventListener(event, unlock));
  };
}

const pendingRetry = new Set<SoundKey>();
let retryListenersAttached = false;

function attachRetryListeners() {
  if (retryListenersAttached || typeof document === "undefined") return;
  retryListenersAttached = true;

  const events: Array<"pointerdown" | "keydown"> = ["pointerdown", "keydown"];
  const retry = () => {
    pendingRetry.forEach((key) => {
      const el = getAudio(key);
      el?.play().catch(() => {
        // Hâlâ engelleniyorsa bir sonraki etkileşimde tekrar denenmeye devam eder.
      });
    });
    pendingRetry.clear();
  };

  events.forEach((event) => document.addEventListener(event, retry));
}

function playSound(key: SoundKey, vibratePattern: number[]) {
  const el = getAudio(key);
  if (!el) return;

  el.currentTime = 0;
  el.play().catch((err) => {
    console.warn(`[OfisNow] Web bildirim sesi çalınamadı (${key}), sonraki dokunuşta tekrar denenecek`, err);
    // Kullanıcı sayfayla hiç etkileşime girmeden bildirim gelirse tarayıcı
    // otomatik ses çalmayı sessizce engelleyebilir. Kaybolup gitmesin diye,
    // bir sonraki dokunuş/tuşta bu ses tekrar denenir.
    pendingRetry.add(key);
    attachRetryListeners();
  });

  // Sessiz/titreşim modundaki Android cihazlarda ekstra dikkat çekici olarak
  // titreşim de tetiklenir (iOS Safari bu API'yi desteklemediği için no-op'tur).
  if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
    navigator.vibrate(vibratePattern);
  }
}

/** Yeni sipariş geldiğinde web'de bildirim sesini çalar (garson ekranı). */
export function playNewOrderWebSound() {
  playSound("newOrder", [200, 100, 200, 100, 200]);
}

/** Sipariş iptal edildiğinde web'de farklı, düşük tonlu uyarı sesini çalar (garson ekranı). */
export function playOrderCancelledWebSound() {
  playSound("orderCancelled", [300, 100, 300]);
}
