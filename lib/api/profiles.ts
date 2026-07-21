import { supabase } from "@/lib/supabase";

export async function updateMyPushToken(token: string): Promise<void> {
  const { error } = await supabase.rpc("update_my_push_token", { p_token: token });
  if (error) throw error;
}

export async function updateMyLocation(locationDescription: string): Promise<void> {
  const { error } = await supabase.rpc("update_my_location", { p_location: locationDescription });
  if (error) throw error;
}

export async function updateMyProfile(input: {
  fullName: string;
  birthDate: string | null;
  avatarUrl: string | null;
  jobTitle: string | null;
}): Promise<void> {
  const { error } = await supabase.rpc("update_my_profile", {
    p_full_name: input.fullName,
    p_birth_date: input.birthDate,
    p_avatar_url: input.avatarUrl,
    p_job_title: input.jobTitle,
  });
  if (error) throw error;
}

/** Seçilen görseli `avatars/{userId}/avatar-{timestamp}.jpg` yoluna yükler ve genel URL'sini döndürür. */
export async function uploadMyAvatar(userId: string, uri: string): Promise<string> {
  const response = await fetch(uri);
  const blob = await response.blob();
  const path = `${userId}/avatar-${Date.now()}.jpg`;

  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(path, blob, { contentType: "image/jpeg", upsert: true });
  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from("avatars").getPublicUrl(path);
  return data.publicUrl;
}
