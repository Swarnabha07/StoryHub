import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import UserAnalytics from "@/models/UserAnalytics";
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

    // Determine range
    const days = range === "30d" ? 30 : 7;

    // Start date
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Convert to YYYY-MM-DD
    const startDateStr = startDate.toISOString().split("T")[0];

    // Aggregate followers analytics
    const growth = await UserAnalytics.aggregate([
      {
        $match: {
          user: userId,
          date: { $gte: startDateStr },
        },
      },
      {
        $group: {
          _id: "$date",
          gained: { $sum: "$followersGained" },
          lost: { $sum: "$followersLost" },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    // Create quick lookup map
    const growthMap = new Map();

    growth.forEach((item) => {
      growthMap.set(item._id, {
        gained: item.gained,
        lost: item.lost,
      });
    });

    // Fill missing dates
    const filledData = [];

    const today = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(today);

      d.setDate(today.getDate() - i);

      const dateStr = d.toISOString().split("T")[0];

      const existing = growthMap.get(dateStr);

      const gained = existing?.gained || 0;
      const lost = existing?.lost || 0;

      filledData.push({
        rawDate: dateStr,
        date: d.toLocaleDateString("en-US", {
          day: "numeric",
          month: "short",
        }),
        gained,
        lost,
        net: gained - lost,
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
