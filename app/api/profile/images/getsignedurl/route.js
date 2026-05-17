import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { supabaseAdmin } from "@/lib/supabase/supabaseAdmin";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    // Get userId from query string
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "userId required" }, { status: 400 });
    }

    // Validate Mongo ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json({ error: "Invalid userId" }, { status: 400 });
    }

    // Connect DB
    await connectDB();

    // Fetch only needed fields
    const user = await User.findById(userId).select(
      "profileImagePath coverImagePath",
    );

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Prepare fields + bucket mapping
    const fields = [
      {
        field: "profileImage",
        pathField: "profileImagePath",
        bucket: "Avatars",
      },
      {
        field: "coverImage",
        pathField: "coverImagePath",
        bucket: "Covers",
      },
    ];

    const result = {};

    // Generate fresh signed URLs
    for (const { field, pathField, bucket } of fields) {
      const storagePath = user[pathField];

      if (!storagePath) {
        result[field] = null;
        continue;
      }

      // SECURITY: controlled path validation
      const allowedPrefix = `${userId}/`;

      if (!storagePath.startsWith(allowedPrefix)) {
        result[field] = null;
        continue;
      }

      // SECURITY: allow only webp uploads
      if (!storagePath.endsWith(".webp")) {
        result[field] = null;
        continue;
      }

      const { data, error } = await supabaseAdmin.storage
        .from(bucket)
        .createSignedUrl(storagePath, 3600);

      result[field] = error ? null : data.signedUrl;
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("Signed URL generation error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
