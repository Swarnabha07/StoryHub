import { NextResponse } from "next/server";
import Post from "@/models/Post";
import { connectDB } from "@/lib/db";
import { normalizeTag } from "@/lib/nlp/normalizeTag";
import stopWords from "@/lib/nlp/stopWords";
import { getSignedProfileImage } from "@/actions/getSignedProfileImage";
import { getSignedPostImage } from "@/actions/getSignedPostImage";

export async function GET(req, { params }) {
  try {
    await connectDB();

    const { tag } = await params;

    const normalizedTag = normalizeTag(tag);

    if (stopWords.has(normalizedTag)) {
      return NextResponse.json([]);
    }

    const posts = await Post.find({
      tags: normalizedTag,
      status: "published",
      isDeleted: false,
    })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate("author", "username name profileImagePath");

    // Attach author.profileImageUrl + coverImageUrl for Posts
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
          ...post.toObject(),
          publishedDate: post.publishedAt
            ? post.publishedAt.toDateString()
            : null,
          author: {
            ...post.author.toObject(),
            profileImageUrl,
          },
          coverImageUrl,
        };
      }),
    );

    return NextResponse.json(postsWithImages);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch posts" },
      { status: 500 },
    );
  }
}
