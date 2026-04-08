import { supabaseAdmin } from "@/lib/supabase/supabaseAdmin";

export async function getSignedPostImage(coverImagePath) {
  if (!coverImagePath) return null;

  const { data, error } = await supabaseAdmin.storage
    .from("post-covers")
    .createSignedUrl(coverImagePath, 3600); // 1 hour

  if (error) {
    console.error("Cover image signed URL error:", error);
    return null;
  }

  return data.signedUrl;
}
