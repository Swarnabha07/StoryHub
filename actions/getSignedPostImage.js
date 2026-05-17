import mongoose from "mongoose";
import { supabaseAdmin } from "@/lib/supabase/supabaseAdmin";

export async function getSignedPostImage(coverImagePath) {
  try {
    if (!coverImagePath || typeof coverImagePath !== "string") {
      return null;
    }

    const normalizedPath = coverImagePath.trim();

    // Prevent absurd input
    if (
      normalizedPath.length > 200 ||
      normalizedPath.includes("..") ||
      normalizedPath.includes("\\")
    ) {
      return null;
    }

    // Enforce normalized upload structure:
    // postId/cover.webp
    const pathParts = normalizedPath.split("/");

    if (pathParts.length !== 2) {
      return null;
    }

    const [postId, filename] = pathParts;

    // Validate Mongo ObjectId
    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return null;
    }

    // Enforce fixed filename
    if (!filename.startsWith("cover-") || !filename.endsWith(".webp")) {
      return null;
    }

    const { data, error } = await supabaseAdmin.storage
      .from("post-covers")
      .createSignedUrl(normalizedPath, 3600);

    if (error) {
      console.error("Cover image signed URL error:", error.message);
      return null;
    }

    return data.signedUrl;
  } catch (error) {
    console.error("getSignedPostImage error:", error);
    return null;
  }
}
