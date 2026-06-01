import { getSignedPostImage } from "@/actions/getSignedPostImage";
import { getSignedProfileImage } from "@/actions/getSignedProfileImage";
import { connectDB } from "@/lib/db";
import Post from "@/models/Post";
import User from "@/models/User";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  try {
    await connectDB();

    const { username } = await params;

    const user = await User.findOne({ username });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const posts = await Post.find({
      author: user._id,
      status: "published",
      isDeleted: false,
    })
      .sort({ publishedAt: -1 })
      .populate("author", "username name profileImagePath");

    let profileImageUrl = null;

    if (user.profileImagePath) {
      const signedImage = await getSignedProfileImage(user._id);
      profileImageUrl = signedImage?.profileImage || null;
    }

    const postsWithImages = await Promise.all(
      posts.map(async (post) => {
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

    return NextResponse.json({ posts: postsWithImages }, { status: 200 });
  } catch (err) {
    console.error("Profile posts error:", err);
    return NextResponse.json(
      { error: "Failed to fetch user posts" },
      { status: 500 },
    );
  }
}
