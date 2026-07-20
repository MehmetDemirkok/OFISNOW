import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || "https://YOUR-PROJECT.supabase.co";
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || "YOUR-ANON-KEY";

export const isSupabaseConfigured =
  !!process.env.EXPO_PUBLIC_SUPABASE_URL && !!process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!isSupabaseConfigured) {
  console.warn(
    "[OfisNow] EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_ANON_KEY tanımlı değil. " +
      ".env dosyasını .env.example'a göre oluşturun."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

/** Supabase / ağ hatalarını kullanıcıya gösterilecek Türkçe, anlaşılır bir mesaja çevirir. */
export function toFriendlyErrorMessage(error: unknown): string {
  if (!isSupabaseConfigured) {
    return "Sunucu bağlantısı yapılandırılmamış. Lütfen yönetici ile iletişime geçin.";
  }

  const message = error instanceof Error ? error.message : String(error ?? "");

  if (message.includes("Network request failed") || message.includes("Failed to fetch")) {
    return "İnternet bağlantısı yok. Lütfen bağlantınızı kontrol edip tekrar deneyin.";
  }
  if (message.includes("EMPTY_ORDER")) {
    return "Sepetiniz boş. Lütfen en az bir ürün seçin.";
  }
  if (message.includes("LOCATION_REQUIRED")) {
    return "Lütfen bir teslimat konumu seçin.";
  }
  if (message.includes("INVALID_QUANTITY")) {
    return "Ürün adedi geçersiz.";
  }
  if (message.includes("ORDER_ALREADY_SEEN")) {
    return "Bu sipariş az önce başka bir garson tarafından görüldü.";
  }
  if (message.includes("ORDER_NOT_COMPLETABLE")) {
    return "Bu sipariş şu anda tamamlanamıyor. Ekranı yenileyin.";
  }
  if (message.includes("ORDER_NOT_CANCELLABLE")) {
    return "Bu sipariş artık iptal edilemiyor.";
  }
  if (message.includes("Invalid login credentials")) {
    return "E-posta veya şifre hatalı.";
  }
  if (message.includes("FORBIDDEN")) {
    return "Bu işlem için yetkiniz yok.";
  }

  return "Bir şeyler ters gitti. Lütfen tekrar deneyin.";
}
