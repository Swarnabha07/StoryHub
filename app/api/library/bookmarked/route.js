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
    const limit = Number(searchParams.get("limit")) || 10;

    const skip = (page - 1) * limit;

    await connectDB();

    const user = await User.findById(session.user.id).select("bookmarks");

    if (!user) {
      return NextResponse.json(
        {
          posts: [],
          total: 0,
          hasMore: false,
          page,
        },
        { status: 200 },
      );
    }

    const reversedBookmarks = [...user.bookmarks].reverse();

    const paginatedIds = reversedBookmarks.slice(skip, skip + limit);

    const totalBookmarks = reversedBookmarks.length;

    const posts = await Post.find({
      _id: { $in: paginatedIds },
      status: "published",
      isDeleted: false,
    }).populate("author", "username name profileImagePath bio");

    const enrichedPosts = await Promise.all(
      posts.map(async (post) => {
        let profileImageUrl = null;

        if (post.author?.profileImagePath) {
          const signedImage = await getSignedProfileImage(post.author._id);

          profileImageUrl = signedImage?.profileImage || null;
        }

        const coverImageUrl = post.coverImagePath
          ? await getSignedPostImage(post.coverImagePath)
          : null;

        return {
          _id: post._id.toString(),
          title: post.title,
          slug: post.slug,
          content: post.content,
          tags: post.tags,
          excerpt: post.excerpt,
          publishedDate: post.publishedAt
            ? post.publishedAt.toDateString()
            : null,
          author: {
            username: post.author.username,
            name: post.author.name,
            profileImageUrl,
          },
          likes: post.likes,
          likesCount: post.likesCount,
          coverImageUrl,
        };
      }),
    );

    const orderedPosts = paginatedIds
      .map((id) => enrichedPosts.find((post) => post._id === id.toString()))
      .filter(Boolean);

    return NextResponse.json(
      {
        posts: orderedPosts,
        total: totalBookmarks,
        hasMore: skip + limit < totalBookmarks,
        page,
      },
      { status: 200 },
    );
  } catch (err) {
    console.error("Fetch bookmarked library posts error:", err);

    return NextResponse.json(
      { error: "Failed to fetch bookmarked posts" },
      { status: 500 },
    );
  }
}
