import { supabase } from "@/lib/supabase";
import type { Profile } from "@/types/database";

// ---- Admin: kullanıcı yönetimi ----
export async function fetchAllProfiles(): Promise<Profile[]> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .order("role")
    .order("full_name");

  if (error) throw error;
  return data as Profile[];
}

export async function updateProfile(
  id: string,
  patch: Partial<Pick<Profile, "role" | "is_active">>
): Promise<void> {
  const { error } = await supabase.from("profiles").update(patch).eq("id", id);
  if (error) throw error;
}

export async function updateMyPushToken(token: string): Promise<void> {
  const { error } = await supabase.rpc("update_my_push_token", { p_token: token });
  if (error) throw error;
}
