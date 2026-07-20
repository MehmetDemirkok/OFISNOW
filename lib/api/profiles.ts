import { supabase } from "@/lib/supabase";
import type { Profile } from "@/types/database";

export async function fetchEmployees(): Promise<Profile[]> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("role", "employee")
    .order("full_name");

  if (error) throw error;
  return data as Profile[];
}

export async function fetchWaiters(): Promise<Profile[]> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("role", "waiter")
    .order("full_name");

  if (error) throw error;
  return data as Profile[];
}

export async function updateMyPushToken(token: string): Promise<void> {
  const { error } = await supabase.rpc("update_my_push_token", { p_token: token });
  if (error) throw error;
}
