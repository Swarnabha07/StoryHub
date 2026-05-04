import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Post from "@/models/Post";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redis } from "@/lib/queue/redis";
import { updateDailyStats } from "@/lib/analytics/updateDailyStats";

export async function POST(req, { params }) {
  try {
    await connectDB();

    const { slug } = await params;

    const session = await getServerSession(authOptions);

    // Identify user
    const ip =
      req.headers.get("x-forwarded-for") ||
      req.headers.get("x-real-ip") ||
      "anonymous";

    const identifier = session?.user?.id || ip;

    const post = await Post.findOne({
      slug,
      status: "published",
      isDeleted: false,
    }).select("_id author");

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const key = `view:${post._id}:${identifier}`;

    const exists = await redis.get(key);

    if (!exists) {
      // first time view in this window
      await redis.set(key, "1", "EX", 3600); // 1 hour

      await Post.findByIdAndUpdate(post._id, {
        $inc: {
          viewsCount: 1,
          uniqueViewsCount: 1,
        },
        $set: {
          lastViewedAt: new Date(),
        },
      });

      await updateDailyStats({
        postId: post._id,
        authorId: post.author,
        type: "view",
        isUnique: true,
      });
    } else {
      // repeat view
      await Post.findByIdAndUpdate(post._id, {
        $inc: { viewsCount: 1 },
      });

      await updateDailyStats({
        postId: post._id,
        authorId: post.author,
        type: "view",
        isUnique: false,
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
