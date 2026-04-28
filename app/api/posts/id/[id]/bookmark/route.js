import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { connectDB } from "@/lib/db";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import User from "@/models/User";
import Post from "@/models/Post";

export async function POST(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json({ error: "Invalid post id" }, { status: 400 });
    }

    await connectDB();

    const post = await Post.findById(id).select("status isDeleted");

    if (!post || post.isDeleted) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    if (post.status === "draft") {
      return NextResponse.json(
        { error: "Cannot bookmark draft posts" },
        { status: 403 },
      );
    }

    const user = await User.findById(session.user.id).select("bookmarks");
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // SAFETY INIT
    user.bookmarks = user.bookmarks ?? [];

    const alreadyBookmarked = user.bookmarks.some(
      (pid) => pid.toString() === id,
    );

    if (alreadyBookmarked) {
      user.bookmarks = user.bookmarks.filter((pid) => pid.toString() !== id);
    } else {
      user.bookmarks.push(id);
    }

    await user.save();

    return NextResponse.json(
      { bookmarked: !alreadyBookmarked },
      { status: 200 },
    );
  } catch (err) {
    console.error("Bookmark toggle error:", err);
    return NextResponse.json(
      { error: "Failed to toggle bookmark" },
      { status: 500 },
    );
  }
}
