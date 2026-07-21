import { supabase } from "@/lib/supabase";
import type { Company } from "@/types/database";

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
