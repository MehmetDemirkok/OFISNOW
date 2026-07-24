import { Platform } from "react-native";

// Web'de expo-notifications push altyapısı yok (bkz. hooks/useNotifications.ts),
// bu yüzden yeni sipariş sesi burada Web Audio ile ayrıca çalınır. Tarayıcıların
// autoplay kısıtlaması nedeniyle ilk çalma denemesi ancak bir kullanıcı
// etkileşiminden (tıklama/tuş) sonra "kilidi açılmış" olur.
const SOUND_URL = "/sounds/new_order.wav";

let audioEl: HTMLAudioElement | null = null;
let unlocked = false;

function getAudio(): HTMLAudioElement | null {
  if (Platform.OS !== "web" || typeof window === "undefined") return null;
  if (!audioEl) {
    audioEl = new window.Audio(SOUND_URL);
    audioEl.preload = "auto";
    audioEl.volume = 1;
  }
  return audioEl;
}

function unlock() {
  if (unlocked) return;
  const el = getAudio();
  if (!el) return;
  el.play()
    .then(() => {
      el.pause();
      el.currentTime = 0;
      unlocked = true;
    })
    .catch(() => {
      // Kullanıcı etkileşimi yeterli olmadı; bir sonraki etkileşimde tekrar denenecek.
    });
}

/** Tarayıcı autoplay kısıtlamasını aşmak için ilk kullanıcı etkileşiminde sesi kilitler. */
export function initWebOrderSoundUnlock() {
  if (Platform.OS !== "web" || typeof document === "undefined") return () => {};

  const events: Array<"pointerdown" | "keydown"> = ["pointerdown", "keydown"];
  events.forEach((event) => document.addEventListener(event, unlock, { once: true }));

  return () => {
    events.forEach((event) => document.removeEventListener(event, unlock));
  };
}

/** Yeni sipariş geldiğinde web'de bildirim sesini çalar (garson ekranı). */
export function playNewOrderWebSound() {
  const el = getAudio();
  if (!el) return;

  el.currentTime = 0;
  el.play().catch((err) => {
    console.warn("[OfisNow] Web bildirim sesi çalınamadı", err);
  });

  // Sessiz/titreşim modundaki Android cihazlarda ekstra dikkat çekici olarak
  // titreşim de tetiklenir (iOS Safari bu API'yi desteklemediği için no-op'tur).
  if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
    navigator.vibrate([200, 100, 200, 100, 200]);
  }
}
