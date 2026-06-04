import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import Post from "@/models/Post";
import PostAnalytics from "@/models/PostAnalytics";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req, { params }) {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json({ error: "Invalid post id" }, { status: 400 });
    }

    const post = await Post.findById(id).select(
      "author viewsCount uniqueViewsCount likesCount commentsCount isDeleted",
    );

    if (!post || post.isDeleted) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    if (post.author.toString() !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const engagementScore =
      post.uniqueViewsCount > 0
        ? ((post.likesCount + post.commentsCount * 0.3) /
            post.uniqueViewsCount) *
          100
        : 0;

    return NextResponse.json({
      success: true,

      stats: {
        totalImpressions: post.viewsCount,
        totalReach: post.uniqueViewsCount,
        totalLikes: post.likesCount,
        totalComments: post.commentsCount,
        engagementScore: Number(engagementScore.toFixed(2)),
      },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
