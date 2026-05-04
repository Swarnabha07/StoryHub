import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import PostAnalytics from "@/models/PostAnalytics";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function GET(req) {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = req.nextUrl;
    const range = searchParams.get("range") || "7d";

    const userId = new mongoose.Types.ObjectId(session.user.id);

    // Determine date range
    const days = range === "30d" ? 30 : 7;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // convert to string format
    const startDateStr = startDate.toISOString().split("T")[0];

    const growth = await PostAnalytics.aggregate([
      {
        $match: {
          author: userId,
          date: { $gte: startDateStr }, // filter by range
        },
      },
      {
        $group: {
          _id: "$date",
          views: { $sum: "$uniqueViews" },
          likes: { $sum: "$likes" },
          comments: { $sum: "$comments" },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    // Create map from aggregation
    const growthMap = new Map();

    growth.forEach((item) => {
      growthMap.set(item._id, {
        views: item.views,
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

      const views = existing?.views || 0;
      const likes = existing?.likes || 0;
      const comments = existing?.comments || 0;

      filledData.push({
        rawDate: dateStr,
        date: d.toLocaleDateString("en-US", {
          day: "numeric",
          month: "short",
        }),
        views,
        likes,
        comments,
        engagement: views * 0.6 + likes * 2 + comments * 3,
      });
    }

    return NextResponse.json({ success: true, growth: filledData });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
