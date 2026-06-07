import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Post from "@/models/Post";

export async function GET(request) {
  try {
    const authHeader = request.headers.get("authorization");

    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const now = new Date();

    const result = await Post.updateMany(
      {
        status: "scheduled",
        scheduledFor: { $lte: now },
        isDeleted: false,
      },
      {
        $set: {
          status: "published",
          publishedAt: now,
          scheduledFor: null,
        },
      },
    );

    return NextResponse.json({
      success: true,
      publishedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error("Cron publish error:", error);

    return NextResponse.json(
      {
        error: "Internal server error",
      },
      {
        status: 500,
      },
    );
  }
}
