import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Comment from "@/models/Comment";
import mongoose from "mongoose";
import { getSignedProfileImage } from "@/actions/getSignedProfileImage";
import { timeAgo } from "@/lib/activity/timeAgo";
import Post from "@/models/Post";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req, { params }) {
  await connectDB();

  const session = await getServerSession(authOptions);

  const { postId } = await params;

  if (!mongoose.isValidObjectId(postId)) {
    return NextResponse.json({ error: "Invalid ID format" }, { status: 400 });
  }

  const post = await Post.findById(postId).select("author status isDeleted");

  if (!post || post.isDeleted) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  const canAccess =
    post.status === "published" || session?.user?.id === post.author.toString();

  if (!canAccess) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  const { searchParams } = req.nextUrl;
  const cursor = searchParams.get("cursor");
  const limit = Math.min(parseInt(searchParams.get("limit")) || 20, 50);

  let query = { post: postId };

  if (cursor && mongoose.isValidObjectId(cursor)) {
    const cursorDoc = await Comment.findOne({
      _id: cursor,
      post: postId,
    })
      .select("createdAt")
      .lean();

    if (cursorDoc) {
      query.$or = [
        { createdAt: { $lt: cursorDoc.createdAt } },
        {
          createdAt: cursorDoc.createdAt,
          _id: { $lt: cursor },
        },
      ];
    }
  }

  const comments = await Comment.find(query)
    .populate("author", "username profileImagePath")
    .sort({ createdAt: -1, _id: -1 })
    .limit(limit + 1) // fetch extra to detect next page
    .lean();

  const hasMore = comments.length > limit;
  if (hasMore) comments.pop();

  const commentsWithImages = await Promise.all(
    comments.map(async (comment) => {
      let profileImageUrl = null;

      if (comment.author?.profileImagePath) {
        const signedImage = await getSignedProfileImage(comment.author._id);
        profileImageUrl = signedImage?.profileImage || null;
      }

      return {
        ...comment,
        createdDate: comment.createdAt ? timeAgo(comment.createdAt) : null,
        author: {
          ...comment.author,
          profileImageUrl,
        },
      };
    }),
  );

  const nextCursor = hasMore
    ? comments[comments.length - 1]._id.toString()
    : null;

  return NextResponse.json({
    comments: commentsWithImages,
    nextCursor,
    hasMore,
  });
}
