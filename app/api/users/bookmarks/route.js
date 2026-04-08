import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Post from "@/models/Post";
import { getSignedPostImage } from "@/actions/getSignedPostImage";
import { getSignedProfileImage } from "@/actions/getSignedProfileImage";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = req.nextUrl;

    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 5;

    const skip = (page - 1) * limit;

    await connectDB();

    const user = await User.findById(session.user.id).select("bookmarks");
    if (!user) {
      return NextResponse.json({ posts: [] }, { status: 200 });
    }

    const totalBookmarks = user.bookmarks.length;

    const paginatedIds = user.bookmarks
      .slice()
      .reverse() // newest first
      .slice(skip, skip + limit);

    const posts = await Post.find({
      _id: { $in: paginatedIds },
      status: "published",
      isDeleted: false,
    }).populate("author", "username name profileImagePath bio");

    const enrichedPosts = await Promise.all(
      posts.map(async (post) => {
        const obj = post.toObject();

        obj.coverImageUrl = post.coverImagePath
          ? await getSignedPostImage(post.coverImagePath)
          : null;

        if (post.author?.profileImagePath) {
          const signed = await getSignedProfileImage(post.author._id);
          obj.author.profileImageUrl = signed?.profileImage || null;
        }

        return obj;
      }),
    );

    return NextResponse.json(
      {
        posts: enrichedPosts,
        hasMore: skip + limit < totalBookmarks,
        page,
      },
      { status: 200 },
    );
  } catch (err) {
    console.error("Fetch bookmarks error:", err);
    return NextResponse.json(
      { error: "Failed to fetch bookmarks" },
      { status: 500 },
    );
  }
}
