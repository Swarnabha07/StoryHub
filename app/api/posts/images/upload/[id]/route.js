import { getServerSession } from "next-auth";
import { connectDB } from "@/lib/db";
import Post from "@/models/Post";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/supabaseAdmin";
import mongoose from "mongoose";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req, { params }) {
  try {
    // 1️ Auth
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2️ Validate Post ID
    const { id: postId } = await params;
    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return NextResponse.json({ error: "Invalid post ID" }, { status: 400 });
    }

    // 3️ Parse form data
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // 4️ DB connect + fetch post
    await connectDB();
    const post = await Post.findById(postId);

    if (!post || post.isDeleted) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // 5️ Ownership check
    if (post.author.toString() !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // 6️ Prepare storage path
    const fileExt = file.name.split(".").pop();
    const filePath = `${postId}/cover.${fileExt}`;

    // 7️ Upload to Supabase
    const { error: uploadError } = await supabaseAdmin.storage
      .from("post-covers")
      .upload(filePath, file, {
        upsert: true,
        contentType: file.type,
      });

    if (uploadError) {
      console.error(uploadError);
      return NextResponse.json(
        { error: "Image upload failed" },
        { status: 500 }
      );
    }

    // 8️ Save path in DB
    post.coverImagePath = filePath;
    await post.save();

    return NextResponse.json(
      { success: true, coverImagePath: filePath },
      { status: 200 }
    );
  } catch (err) {
    console.error("Cover upload error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
