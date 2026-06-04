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

    const range = req.nextUrl.searchParams.get("range") || "7d";

    const days = range === "30d" ? 30 : 7;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const formattedStart = startDate.toISOString().split("T")[0];

    const post = await Post.findById(id).select(
      "author viewsCount uniqueViewsCount likesCount commentsCount isDeleted",
    );

    if (!post || post.isDeleted) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    if (post.author.toString() !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const growth = await PostAnalytics.aggregate([
      {
        $match: {
          post: new mongoose.Types.ObjectId(id),

          author: new mongoose.Types.ObjectId(session.user.id),

          date: {
            $gte: formattedStart,
          },
        },
      },

      {
        $sort: {
          date: 1,
        },
      },
    ]);

    // Create map from aggregation
    const growthMap = new Map();

    growth.forEach((item) => {
      growthMap.set(item.date, {
        impressions: item.views,
        reach: item.uniqueViews,
        likes: item.likes,
        comments: item.comments,
      });
    });

    // Generate full date range
    const filledData = [];

    const today = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);

      const dateStr = d.toISOString().split("T")[0]; // "YYYY-MM-DD"

      const existing = growthMap.get(dateStr);

      const impressions = existing?.impressions || 0;
      const reach = existing?.reach || 0;
      const likes = existing?.likes || 0;
      const comments = existing?.comments || 0;

      filledData.push({
        rawDate: dateStr,
        date: d.toLocaleDateString("en-US", {
          day: "numeric",
          month: "short",
        }),
        impressions,
        reach,
        likes,
        comments,
        engagement: reach * 0.6 + likes * 2 + comments * 3,
      });
    }

    return NextResponse.json({
      success: true,
      growth: filledData,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
