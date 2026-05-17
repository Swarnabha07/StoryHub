import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { supabaseAdmin } from "@/lib/supabase/supabaseAdmin";
import mongoose from "mongoose";

export async function getSignedProfileImage(userId) {
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

    // Fetch only required fields
    const user = await User.findById(userId).select(
      "profileImagePath coverImagePath",
    );

    if (!user) {
      return { error: "User not found" };
    }

    // Prepare fields + bucket mapping
    const fields = [
      {
        field: "profileImage",
        pathField: "profileImagePath",
        bucket: "Avatars",
        expectedPrefix: "profileImage-",
      },
      {
        field: "coverImage",
        pathField: "coverImagePath",
        bucket: "Covers",
        expectedPrefix: "coverImage-",
      },
    ];

    const result = {};

    // Generate fresh signed URLs
    for (const { field, pathField, bucket, expectedPrefix } of fields) {
      const storagePath = user[pathField];

      if (!storagePath || typeof storagePath !== "string") {
        result[field] = null;
        continue;
      }

      const normalizedPath = storagePath.trim();

      // Prevent malformed/traversal paths
      if (
        normalizedPath.length > 200 ||
        normalizedPath.includes("..") ||
        normalizedPath.includes("\\")
      ) {
        result[field] = null;
        continue;
      }

      // Expected structure:
      // userId/profileImage-123.webp
      // userId/coverImage-123.webp
      const pathParts = normalizedPath.split("/");

      if (pathParts.length !== 2) {
        result[field] = null;
        continue;
      }

      const [pathUserId, filename] = pathParts;

      // Ensure path belongs to requested user
      if (pathUserId !== userId.toString()) {
        result[field] = null;
        continue;
      }

      // Validate ObjectId structure
      if (!mongoose.Types.ObjectId.isValid(pathUserId)) {
        result[field] = null;
        continue;
      }

      // Enforce expected filename pattern
      if (!filename.startsWith(expectedPrefix) || !filename.endsWith(".webp")) {
        result[field] = null;
        continue;
      }

      const { data, error } = await supabaseAdmin.storage
        .from(bucket)
        .createSignedUrl(normalizedPath, 3600); // 1 hour

      result[field] = error ? null : data.signedUrl;
    }

    return result;
  } catch (error) {
    console.error("getSignedProfileImage error:", error);

    return {
      profileImage: null,
      coverImage: null,
    };
  }
}
