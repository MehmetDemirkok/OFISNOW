// OfisNow: Apple Push Notification service (APNs) HTTP/2 API üzerinden
// native iOS (İkram X, ikram-x-ios reposu) istemcisine doğrudan push
// bildirimi gönderir.
//
// Expo Push Service yalnızca "ExponentPushToken[...]" biçimindeki tokenları
// kabul eder; İkram X'in native Swift istemcisi ise APNs'in verdiği ham
// cihaz token'ını (64 haneli hex) `profiles.push_token`'a kaydeder — Expo'ya
// gönderilirse sessizce reddedilir. Bu modül o tokenlara APNs'e JWT
// (ES256, APNs Auth Key) ile imzalanmış istekle doğrudan gönderim yapar.
// Kurulum için repo kökündeki SETUP.md > "APNs (İkram X native)" bölümüne
// bakın.
import type { createClient } from "jsr:@supabase/supabase-js@2";

type SupabaseClientType = ReturnType<typeof createClient>;

const PRODUCTION_HOST = "https://api.push.apple.com";
const SANDBOX_HOST = "https://api.sandbox.push.apple.com";

const APNS_KEY_ID = Deno.env.get("APNS_KEY_ID");
const APNS_TEAM_ID = Deno.env.get("APNS_TEAM_ID");
const APNS_BUNDLE_ID = Deno.env.get("APNS_BUNDLE_ID");
const APNS_AUTH_KEY = Deno.env.get("APNS_AUTH_KEY");

export const APNS_CONFIGURED = Boolean(APNS_KEY_ID && APNS_TEAM_ID && APNS_BUNDLE_ID && APNS_AUTH_KEY);

// Apple, aynı JWT'nin 20-60 dakika arası tekrar kullanılmasını önerir/zorunlu
// kılar (her istekte yeni token üretmek rate limit'e takılır).
const TOKEN_MAX_AGE_SECONDS = 50 * 60;

let cachedKey: CryptoKey | null = null;
let cachedToken: { jwt: string; issuedAt: number } | null = null;

function pemToPkcs8(pem: string): ArrayBuffer {
  const base64 = pem
    .replace(/-----BEGIN PRIVATE KEY-----/, "")
    .replace(/-----END PRIVATE KEY-----/, "")
    .replace(/\s+/g, "");
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

async function getSigningKey(): Promise<CryptoKey> {
  if (cachedKey) return cachedKey;
  cachedKey = await crypto.subtle.importKey(
    "pkcs8",
    pemToPkcs8(APNS_AUTH_KEY!),
    { name: "ECDSA", namedCurve: "P-256" },
    false,
    ["sign"]
  );
  return cachedKey;
}

function base64url(data: ArrayBuffer | string): string {
  const bytes = typeof data === "string" ? new TextEncoder().encode(data) : new Uint8Array(data);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function getAuthToken(): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  if (cachedToken && now - cachedToken.issuedAt < TOKEN_MAX_AGE_SECONDS) {
    return cachedToken.jwt;
  }

  const header = { alg: "ES256", kid: APNS_KEY_ID };
  const claims = { iss: APNS_TEAM_ID, iat: now };
  const signingInput = `${base64url(JSON.stringify(header))}.${base64url(JSON.stringify(claims))}`;

  const key = await getSigningKey();
  const signature = await crypto.subtle.sign(
    { name: "ECDSA", hash: "SHA-256" },
    key,
    new TextEncoder().encode(signingInput)
  );

  const jwt = `${signingInput}.${base64url(signature)}`;
  cachedToken = { jwt, issuedAt: now };
  return jwt;
}

export interface ApnsPushInput {
  deviceToken: string;
  title: string;
  body: string;
  /** IkramX.app bundle'ındaki .caf dosya adı (ör. "new_order.caf") veya "default". */
  sound: string;
  data?: Record<string, unknown>;
}

export interface ApnsPushResult {
  ok: boolean;
  /** Token artık geçersiz (Unregistered/BadDeviceToken) — DB'den temizlenmeli. */
  invalidToken: boolean;
}

async function postToApns(host: string, input: ApnsPushInput, jwt: string): Promise<Response> {
  const payload = {
    aps: {
      alert: { title: input.title, body: input.body },
      sound: { critical: 0, name: input.sound, volume: 1.0 },
      "interruption-level": "time-sensitive",
    },
    ...(input.data ?? {}),
  };

  return await fetch(`${host}/3/device/${input.deviceToken}`, {
    method: "POST",
    headers: {
      authorization: `bearer ${jwt}`,
      "apns-topic": APNS_BUNDLE_ID!,
      "apns-push-type": "alert",
      "apns-priority": "10",
      "apns-expiration": "0",
    },
    body: JSON.stringify(payload),
  });
}

/**
 * Bir native iOS cihazına doğrudan APNs üzerinden push gönderir.
 *
 * TestFlight/App Store derlemeleri APNs production ortamını kullanır; yalnızca
 * Xcode'dan doğrudan yüklenen development derlemeleri sandbox token'ı üretir.
 * Hangi ortamın token'ı elimizdeki olduğunu önceden bilemediğimiz için önce
 * production denenir, "BadDeviceToken" dönerse sandbox'a düşülür.
 */
export async function sendApnsPush(input: ApnsPushInput): Promise<ApnsPushResult> {
  if (!APNS_CONFIGURED) return { ok: false, invalidToken: false };

  try {
    const jwt = await getAuthToken();
    let response = await postToApns(PRODUCTION_HOST, input, jwt);

    if (response.status === 400) {
      const body = await response.clone().json().catch(() => null);
      if (body?.reason === "BadDeviceToken") {
        response = await postToApns(SANDBOX_HOST, input, jwt);
      }
    }

    if (response.ok) return { ok: true, invalidToken: false };

    const errorBody = await response.json().catch(() => null);
    const reason = errorBody?.reason;
    console.error("apns: gönderim hatası", response.status, reason);

    const invalidToken = response.status === 410 || reason === "BadDeviceToken" || reason === "Unregistered";
    return { ok: false, invalidToken };
  } catch (err) {
    console.error("apns: beklenmeyen hata", err);
    return { ok: false, invalidToken: false };
  }
}

/**
 * Expo push token'ları ("ExponentPushToken[...]", RN istemcisi) ile ham APNs
 * cihaz token'larını (İkram X native istemcisi, 64+ haneli hex) birbirinden
 * ayırır.
 */
export function isApnsDeviceToken(token: string): boolean {
  return /^[0-9a-fA-F]{64,200}$/.test(token);
}

export interface ApnsWaiter {
  id: string;
  push_token: string;
}

/**
 * apnsWaiters listesindeki her cihaza APNs push gönderir; geçersiz token'ları
 * (Unregistered/BadDeviceToken) profiles.push_token'dan temizler. notify-*
 * fonksiyonlarındaki sendExpoPush ile aynı temizlik deseni.
 */
export async function sendApnsPushToWaiters(
  supabase: SupabaseClientType,
  waiters: ApnsWaiter[],
  build: (waiter: ApnsWaiter) => Omit<ApnsPushInput, "deviceToken">
): Promise<number> {
  if (waiters.length === 0 || !APNS_CONFIGURED) return 0;

  let sent = 0;
  await Promise.all(
    waiters.map(async (waiter) => {
      const result = await sendApnsPush({ deviceToken: waiter.push_token, ...build(waiter) });
      if (result.ok) {
        sent += 1;
      } else if (result.invalidToken) {
        await supabase.from("profiles").update({ push_token: null }).eq("id", waiter.id);
      }
    })
  );
  return sent;
}
