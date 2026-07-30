import { supabase } from "@/lib/supabase";
import type { Company, UserRole } from "@/types/database";

export async function fetchMyCompany(): Promise<Company> {
  // RLS ("companies_select_own"), yalnızca geçerli kullanıcının şirketini döndürür.
  const { data, error } = await supabase.from("companies").select("*").single();
  if (error) throw error;
  return data as Company;
}

/** Şirketin davet kodunu döndürür; kod 10 dakikadan eskiyse otomatik olarak yeniler. Yalnızca employee çağırabilir. */
export async function fetchOrRotateInviteCode(): Promise<string> {
  const { data, error } = await supabase.rpc("get_or_rotate_invite_code");
  if (error) throw error;
  return data as string;
}

/**
 * Belirli bir e-posta adresine, verilen rol için 7 gün geçerli bir davet
 * gönderir (invite-teammate Edge Function, Resend üzerinden e-postayı yollar).
 * Yalnızca employee çağırabilir; sunucu tarafında da bu kontrol tekrar yapılır.
 */
export async function inviteTeammateByEmail(email: string, role: UserRole): Promise<void> {
  const { error } = await supabase.functions.invoke("invite-teammate", { body: { email, role } });
  if (error) {
    let code = "";
    const context = (error as { context?: Response }).context;
    if (context && typeof context.json === "function") {
      try {
        const body = await context.json();
        code = body?.error ?? "";
      } catch {
        // yanıt gövdesi okunamadı, generic mesaja düşülecek
      }
    }
    throw new Error(code || error.message);
  }
}
