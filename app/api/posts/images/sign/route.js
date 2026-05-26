import { NextResponse } from "next/server";
import { getSignedPostImage } from "@/actions/getSignedPostImage";
import Post from "@/models/Post";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/db";

export async function POST(req) {
  try {
    const body = await req.json();

    if (!body || typeof body.coverImagePath !== "string") {
      return NextResponse.json(
        { error: "Invalid image path" },
        { status: 400 },
      );
    }

    await connectDB();

    const session = await getServerSession(authOptions);

    const post = await Post.findOne({
      isDeleted: false,
      coverImagePath: body.coverImagePath,
    }).select("author status isDeleted coverImagePath");

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const canAccess =
      post.status === "published" ||
      session?.user?.id === post.author.toString();

    if (!canAccess) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const signedUrl = await getSignedPostImage(post.coverImagePath);

    if (!signedUrl) {
      return NextResponse.json(
        { error: "Invalid image path" },
        { status: 400 },
      );
    }

    return NextResponse.json({ signedUrl }, { status: 200 });
  } catch (err) {
    console.error("Sign cover error:", err);

    return NextResponse.json(
      { error: "Failed to sign image" },
      { status: 500 },
    );
  }
}
