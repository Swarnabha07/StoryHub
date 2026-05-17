import { getServerSession } from "next-auth";
import { connectDB } from "@/lib/db";
import Post from "@/models/Post";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/supabaseAdmin";
import mongoose from "mongoose";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { fileTypeFromBuffer } from "file-type";
import sharp from "sharp";

export async function POST(req, { params }) {
  try {
    // AUTH
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const MAX_FILE_SIZE = 10 * 1024 * 1024;

    const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

    const ALLOWED_EXTENSIONS = ["jpg", "jpeg", "png", "webp"];

    // VALIDATE POST ID
    const { id: postId } = await params;

    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return NextResponse.json({ error: "Invalid post ID" }, { status: 400 });
    }

    // PARSE FORM DATA
    const formData = await req.formData();

    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // FILE SIZE VALIDATION
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "File too large" }, { status: 400 });
    }

    // MIME VALIDATION
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
    }

    // EXTENSION VALIDATION
    const originalName = file.name;

    const ext = originalName.split(".").pop()?.toLowerCase();

    if (!ext || !ALLOWED_EXTENSIONS.includes(ext)) {
      return NextResponse.json(
        { error: "Invalid file extension" },
        { status: 400 },
      );
    }

    // CONNECT DB
    await connectDB();

    // FETCH POST
    const post = await Post.findById(postId);

    if (!post || post.isDeleted) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // OWNERSHIP CHECK
    if (post.author.toString() !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // CONVERT TO BUFFER
    const fileArrayBuffer = await file.arrayBuffer();

    const fileBuffer = Buffer.from(fileArrayBuffer);

    // MAGIC BYTE VALIDATION
    const detectedType = await fileTypeFromBuffer(fileBuffer);

    if (!detectedType || !ALLOWED_TYPES.includes(detectedType.mime)) {
      return NextResponse.json(
        { error: "Invalid file content" },
        { status: 400 },
      );
    }

    // IMAGE PARSER VALIDATION
    let metadata;

    try {
      metadata = await sharp(fileBuffer).metadata();
    } catch {
      return NextResponse.json(
        { error: "Corrupted or invalid image" },
        { status: 400 },
      );
    }

    // DIMENSION VALIDATION
    if (
      metadata.width < 100 ||
      metadata.height < 100 ||
      metadata.width > 8000 ||
      metadata.height > 8000
    ) {
      return NextResponse.json(
        { error: "Invalid image dimensions" },
        { status: 400 },
      );
    }

    // IMAGE RE-ENCODING + SANITIZATION
    const sanitizedBuffer = await sharp(fileBuffer)
      .rotate()
      .webp({ quality: 90 })
      .toBuffer();

    // STANDARDIZED FILE PATH
    const filePath = `${postId}/cover-${Date.now()}.webp`;

    // UPLOAD TO SUPABASE
    const { error: uploadError } = await supabaseAdmin.storage
      .from("post-covers")
      .upload(filePath, sanitizedBuffer, {
        upsert: true,
        contentType: "image/webp",
        cacheControl: "3600",
      });

    if (uploadError) {
      console.error("Post image upload error:", uploadError.message);

      return NextResponse.json(
        { error: "Image upload failed" },
        { status: 500 },
      );
    }

    // SAVE PATH IN DB
    post.coverImagePath = filePath;

    await post.save();

    return NextResponse.json(
      {
        success: true,
        coverImagePath: filePath,
      },
      { status: 200 },
    );
  } catch (err) {
    console.error("Cover upload error:", err);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
