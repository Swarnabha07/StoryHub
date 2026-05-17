import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { supabaseAdmin } from "@/lib/supabase/supabaseAdmin";
import mongoose from "mongoose";

export async function getSignedEmailAvatar(userId) {
  try {
    if (!userId) {
      return { error: "userId required" };
    }

    // Validate Mongo ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return { error: "Invalid userId" };
    }

    // Connect DB
    await connectDB();

    // Fetch only required field
    const user = await User.findById(userId).select(
      "profileImagePath",
    );

    if (!user) {
      return { error: "User not found" };
    }

    const storagePath = user.profileImagePath;

    if (!storagePath || typeof storagePath !== "string") {
      return { profileImage: null };
    }

    const normalizedPath = storagePath.trim();

    // Prevent malformed/traversal paths
    if (
      normalizedPath.length > 200 ||
      normalizedPath.includes("..") ||
      normalizedPath.includes("\\")
    ) {
      return { profileImage: null };
    }

    // Expected structure:
    // userId/profileImage-123.webp
    const pathParts = normalizedPath.split("/");

    if (pathParts.length !== 2) {
      return { profileImage: null };
    }

    const [pathUserId, filename] = pathParts;

    // Ensure image belongs to requested user
    if (pathUserId !== userId.toString()) {
      return { profileImage: null };
    }

    // Validate ObjectId structure
    if (!mongoose.Types.ObjectId.isValid(pathUserId)) {
      return { profileImage: null };
    }

    // Enforce expected filename pattern
    if (
      !filename.startsWith("profileImage-") ||
      !filename.endsWith(".webp")
    ) {
      return { profileImage: null };
    }

    // 7 days expiry
    const ONE_WEEK = 60 * 60 * 24 * 7;

    const { data, error } = await supabaseAdmin.storage
      .from("Avatars")
      .createSignedUrl(normalizedPath, ONE_WEEK);

    return {
      profileImage: error ? null : data.signedUrl,
    };
  } catch (error) {
    console.error("getSignedEmailAvatar error:", error);

    return {
      profileImage: null,
    };
  }
}