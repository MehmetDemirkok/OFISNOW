import { supabase } from "@/lib/supabase";
import type { Company } from "@/types/database";

export async function fetchMyCompany(): Promise<Company> {
  // RLS ("companies_select_own"), yalnızca geçerli kullanıcının şirketini döndürür.
  const { data, error } = await supabase.from("companies").select("*").single();
  if (error) throw error;
  return data as Company;
}

export async function regenerateInviteCode(): Promise<string> {
  const { data, error } = await supabase.rpc("regenerate_invite_code");
  if (error) throw error;
  return data as string;
}
