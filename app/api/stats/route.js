import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Post from "@/models/Post";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import mongoose from "mongoose";
import { getSignedProfileImage } from "@/actions/getSignedProfileImage";
import { getSignedPostImage } from "@/actions/getSignedPostImage";

export async function GET() {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const userObjectId = new mongoose.Types.ObjectId(userId);

    // Aggregation Pipeline
    const stats = await Post.aggregate([
      {
        $match: {
          author: userObjectId,
          status: "published",
          isDeleted: false,
        },
      },
      {
        $group: {
          _id: null,
          totalPosts: { $sum: 1 },
          totalReach: { $sum: "$uniqueViewsCount" },
          totalViews: { $sum: "$viewsCount" },
          totalLikes: { $sum: "$likesCount" },
          totalComments: { $sum: "$commentsCount" },
        },
      },
    ]);

    const result = stats[0] || {
      totalPosts: 0,
      totalReach: 0,
      totalViews: 0,
      totalLikes: 0,
      totalComments: 0,
    };

    // Engagement Rate
    const engagementRate =
      result.totalViews > 0
        ? ((result.totalLikes + result.totalComments * 0.3) /
            result.totalViews) *
          100
        : 0;

    // Top Posts
    const topPosts = await Post.aggregate([
      {
        $match: {
          author: userObjectId,
          status: "published",
          isDeleted: false,
        },
      },
      {
        $addFields: {
          score: {
            $add: [
              { $multiply: ["$viewsCount", 0.6] },
              { $multiply: ["$likesCount", 2] },
              { $multiply: ["$commentsCount", 3] },
            ],
          },
        },
      },
      {
        $sort: { score: -1 },
      },
      {
        $limit: 5,
      },

      // THIS replaces .populate("author")
      {
        $lookup: {
          from: "users", // collection name
          localField: "author",
          foreignField: "_id",
          as: "author",
        },
      },
      {
        $unwind: "$author",
      },

      // Select only required fields (like populate projection)
      {
        $project: {
          title: 1,
          slug: 1,
          coverImagePath: 1,
          excerpt: 1,
          content: 1,
          publishedAt: 1,
          viewsCount: 1,
          likesCount: 1,
          commentsCount: 1,
          score: 1,

          "author._id": 1,
          "author.username": 1,
          "author.profileImagePath": 1,
        },
      },
    ]);

    const postsWithImages = await Promise.all(
      topPosts.map(async (post) => {
        let profileImageUrl = null;

        if (post.author?.profileImagePath) {
          const signedImage = await getSignedProfileImage(post.author._id);
          profileImageUrl = signedImage?.profileImage || null;
        }

        const coverImageUrl = post.coverImagePath
          ? await getSignedPostImage(post.coverImagePath)
          : null;

        return {
          ...post,
          publishedDate: post.publishedAt
            ? new Date(post.publishedAt).toDateString()
            : null,
          author: {
            ...post.author,
            profileImageUrl,
          },
          coverImageUrl,
        };
      }),
    );

    return NextResponse.json({
      success: true,
      stats: {
        ...result,
        engagementRate: Number(engagementRate.toFixed(2)),
        topPosts: postsWithImages,
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
