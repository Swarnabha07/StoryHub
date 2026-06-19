import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Post from "@/models/Post";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { getSignedPostImage } from "@/actions/getSignedPostImage";
import { getSignedProfileImage } from "@/actions/getSignedProfileImage";

export async function GET(req) {
  await connectDB();

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = req.nextUrl;
  const status = searchParams.get("status") || "all";

  const page = Math.max(Number(searchParams.get("page")) || 1, 1);

  const limit = Math.min(
    Math.max(Number(searchParams.get("limit")) || 10, 1),
    50,
  );

  const skip = (page - 1) * limit;

  if (
    status !== undefined &&
    !["all", "draft", "scheduled", "published"].includes(status)
  ) {
    return NextResponse.json({ error: "Invalid post status" }, { status: 400 });
  }

  let statusFilter = {};
  if (status === "published") {
    statusFilter = { status: "published" };
  } else if (status === "draft") {
    statusFilter = { status: "draft" };
  } else if (status === "scheduled") {
    statusFilter = { status: "scheduled" };
  }

  const posts = await Post.find({
    author: session.user.id,
    ...statusFilter,
    isDeleted: false,
  })
    .sort({ updatedAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate("author", "username name profileImagePath")
    .lean();

  const postsWithImages = await Promise.all(
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
        status: post.status,
        excerpt: post.excerpt,
        scheduledFor: post.scheduledFor?.toISOString?.() || post.scheduledFor,
        publishedDate: post.publishedAt
          ? new Date(post.publishedAt).toDateString()
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

  const total = await Post.countDocuments({
    author: session.user.id,
    ...statusFilter,
    isDeleted: false,
  });

  return NextResponse.json(
    {
      status,
      page,
      limit,
      total,
      posts: postsWithImages,
    },
    { status: 200 },
  );
}
