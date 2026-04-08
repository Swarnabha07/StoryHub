import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { supabaseAdmin } from "@/lib/supabase/supabaseAdmin";
import mongoose from "mongoose";

export async function getSignedEmailAvatar(userId) {
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

  const storagePath = user.profileImagePath;

  if (!storagePath) {
    return { profileImage: null };
  }

  // 7 days expiry 
  const ONE_WEEK = 60 * 60 * 24 * 7;

  const { data, error } = await supabaseAdmin.storage
    .from("Avatars")
    .createSignedUrl(storagePath, ONE_WEEK);

  return {
    profileImage: error ? null : data.signedUrl,
  };
}