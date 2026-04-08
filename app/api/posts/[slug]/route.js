import { getSignedPostImage } from "@/actions/getSignedPostImage";
import { getSignedProfileImage } from "@/actions/getSignedProfileImage";
import { connectDB } from "@/lib/db";
import Post from "@/models/Post";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function GET(req, { params }) {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);
    const { slug } = await params;

    const post = await Post.findOne({
      slug,
      isDeleted: false,
    }).populate("author", "username name profileImagePath bio");

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    if (
      post.status === "draft" &&
      (!session || session.user.id !== post.author._id.toString())
    ) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const postObj = post.toObject();

    postObj.author.profileImageUrl = null;

    if (post.author?.profileImagePath) {
      const signedImage = await getSignedProfileImage(post.author._id);
      postObj.author.profileImageUrl = signedImage?.profileImage || null;
    }

    postObj.coverImageUrl = post.coverImagePath
      ? await getSignedPostImage(post.coverImagePath)
      : null;

    postObj.publishedDate = post.publishedAt
      ? post.publishedAt.toDateString()
      : null;

    return NextResponse.json({ post: postObj }, { status: 200 });
  } catch (err) {
    console.error("Fetch post error:", err);
    return NextResponse.json(
      { error: "Failed to fetch post" },
      { status: 500 },
    );
  }
}
