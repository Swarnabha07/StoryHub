import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { connectDB } from "@/lib/db";
import Post from "@/models/Post";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { createActivity } from "@/lib/activity/createActivity";
import { updateDailyStats } from "@/lib/analytics/updateDailyStats";

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

    const post = await Post.findById(id);
    if (!post || post.isDeleted) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    if (post.status !== "published") {
      return NextResponse.json(
        { error: "Cannot like unpublished posts" },
        { status: 403 },
      );
    }

    const userId = session.user.id;

    // SAFETY INITIALIZATION
    if (!Array.isArray(post.likes)) {
      post.likes = [];
    }

    if (typeof post.likesCount !== "number") {
      post.likesCount = 0;
    }

    const alreadyLiked = post.likes.some((uid) => uid.toString() === userId);

    if (alreadyLiked) {
      // UNLIKE
      post.likes = post.likes.filter((uid) => uid.toString() !== userId);
      post.likesCount -= 1;

      await updateDailyStats({
        postId: post._id,
        authorId: post.author,
        type: "like",
        isUnlike: true,
      });
    } else {
      // LIKE
      post.likes.push(userId);
      post.likesCount += 1;

      await createActivity({
        actor: userId,
        targetUser: post.author,
        type: "POST_LIKE",
        post: post._id,
      });

      await updateDailyStats({
        postId: post._id,
        authorId: post.author,
        type: "like",
        isUnlike: false,
      });
    }

    await post.save();

    return NextResponse.json(
      {
        liked: !alreadyLiked,
        likesCount: post.likesCount,
      },
      { status: 200 },
    );
  } catch (err) {
    console.error("Like toggle error:", err);
    return NextResponse.json(
      { error: "Failed to toggle like" },
      { status: 500 },
    );
  }
}
