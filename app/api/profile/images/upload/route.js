import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/route";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { supabaseAdmin } from "@/lib/supabase/supabaseAdmin";
import { fileTypeFromBuffer } from "file-type";
import sharp from "sharp";
import { NextResponse } from "next/server";

export async function PUT(request) {
  try {
    // AUTH
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const MAX_FILE_SIZE = 5 * 1024 * 1024;
    const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
    const ALLOWED_EXTENSIONS = ["jpg", "jpeg", "png", "webp"];

    // PARSE FORMDATA
    const form = await request.formData();
    const file = form.get("file");
    const field = form.get("field");

    // FIELD VALIDATION
    if (!["profileImage", "coverImage"].includes(field)) {
      return NextResponse.json({ error: "Invalid Field" }, { status: 400 });
    }

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "File too large" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
    }

    // CONNECT DB
    await connectDB();

    // BUCKET NAME
    const bucket = field === "coverImage" ? "Covers" : "Avatars";

    // CREATE FILE PATH
    const originalName = file.name;
    const ext = originalName.split(".").pop()?.toLowerCase();

    if (!ext || !ALLOWED_EXTENSIONS.includes(ext)) {
      return NextResponse.json(
        { error: "Invalid file extension" },
        { status: 400 },
      );
    }

    const filePath = `${session.user.id}/${field}-${Date.now()}.webp`;

    // CONVERT TO BUFFER
    const fileArrayBuffer = await file.arrayBuffer();
    const fileBuffer = Buffer.from(fileArrayBuffer);

    // prevents :- renamed executables, spoofed MIME, types disguised SVGs, fake PNG/JPG payloads
    const detectedType = await fileTypeFromBuffer(fileBuffer);

    if (!detectedType || !ALLOWED_TYPES.includes(detectedType.mime)) {
      return NextResponse.json(
        { error: "Invalid file content" },
        { status: 400 },
      );
    }

    // prevents :- ensures file is a parseable image , rejects malformed payloads , helps stop parser abuse , prevents absurd image dimensions
    let metadata;

    try {
      metadata = await sharp(fileBuffer).metadata();
    } catch {
      return NextResponse.json(
        { error: "Corrupted or invalid image" },
        { status: 400 },
      );
    }

    if (
      metadata.width < 50 ||
      metadata.height < 50 ||
      metadata.width > 5000 ||
      metadata.height > 5000
    ) {
      return NextResponse.json(
        { error: "Invalid image dimensions" },
        { status: 400 },
      );
    }

    //Image Re-encoding
    const sanitizedBuffer = await sharp(fileBuffer)
      .rotate()
      .webp({ quality: 90 })
      .toBuffer();

    // UPLOAD TO SUPABASE
    const { error: uploadError } = await supabaseAdmin.storage
      .from(bucket)
      .upload(filePath, sanitizedBuffer, {
        contentType: "image/webp",
        upsert: true,
        cacheControl: "3600",
      });

    if (uploadError) {
      console.log("Image upload error to supabase : ", uploadError.message);
      return NextResponse.json(
        { error: "Image upload failed" },
        { status: 500 },
      );
    }

    // UPDATE DATABASE
    const update = {
      [`${field}Path`]: filePath, // permanent storage path
    };

    const user = await User.findOneAndUpdate(
      { _id: session.user.id },
      { $set: update },
      { returnDocument: "after" },
    );

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(
      {
        success: true,
      },
      { status: 200 },
    );
  } catch (err) {
    console.error("Profile image upload error:", err);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
