import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { connectDB } from "@/lib/db";
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

    const totalLikedPosts = await Post.countDocuments({
      likes: session.user.id,
      status: "published",
      isDeleted: false,
    });

    const posts = await Post.find({
      likes: session.user.id,
      status: "published",
      isDeleted: false,
    })
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("author", "username name profileImagePath bio");

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

    return NextResponse.json(
      {
        posts: enrichedPosts,
        total: totalLikedPosts,
        hasMore: skip + limit < totalLikedPosts,
        page,
      },
      { status: 200 },
    );
  } catch (err) {
    console.error("Fetch liked library posts error:", err);

    return NextResponse.json(
      { error: "Failed to fetch liked posts" },
      { status: 500 },
    );
  }
}
