import { supabase } from "@/lib/supabase";
import type { FeedbackCategory } from "@/types/database";

export async function sendFeedback(input: { message: string; category: FeedbackCategory }): Promise<void> {
  const { error } = await supabase.rpc("send_feedback", {
    p_message: input.message,
    p_category: input.category,
  });
  if (error) throw error;
}
