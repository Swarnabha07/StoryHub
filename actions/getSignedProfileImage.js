import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { supabaseAdmin } from "@/lib/supabase/supabaseAdmin";
import mongoose from "mongoose";
export async function getSignedProfileImage(userId) {
  if (!userId) {
    return { error: "userId required" };
  }

  // Validate Mongo ObjectId
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return { error: "Invalid userId" };
  }

  // Connect DB
  await connectDB();

  // Fetch user
  const user = await User.findById(userId);
  if (!user) {
    return { error: "User not found" };
  }

  // Prepare fields + bucket mapping
  const fields = [
    { field: "profileImage", pathField: "profileImagePath", bucket: "Avatars" },
    { field: "coverImage", pathField: "coverImagePath", bucket: "Covers" },
  ];

  const result = {};

  // Generate fresh signed URLs
  for (const { field, pathField, bucket } of fields) {
    const storagePath = user[pathField];

    if (!storagePath) {
      result[field] = null;
      continue;
    }

    const { data, error } = await supabaseAdmin.storage
      .from(bucket)
      .createSignedUrl(storagePath, 3600); // 1 hour

    result[field] = error ? null : data.signedUrl;
  }

  // Return signed URLs
  return result;
}
