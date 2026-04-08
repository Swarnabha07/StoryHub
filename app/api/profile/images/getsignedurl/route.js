import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { supabaseAdmin } from "@/lib/supabase/supabaseAdmin";
import mongoose from "mongoose";

export async function GET(request) {
  // Get userId from query string
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!userId) { 
    return new Response(JSON.stringify({ error: "userId required" }), {
      status: 400,
    });
  }

  // Validate Mongo ObjectId 
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return new Response(JSON.stringify({ error: "Invalid userId" }), {
      status: 400,
    });
  }

  // Connect DB
  await connectDB();

  // Fetch user
  const user = await User.findById(userId);
  if (!user) {
    return new Response(JSON.stringify({ error: "User not found" }), {
      status: 404,
    });
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
  return new Response(JSON.stringify(result), { status: 200 });
}
