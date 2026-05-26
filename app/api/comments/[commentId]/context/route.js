import { getSignedProfileImage } from "@/actions/getSignedProfileImage";
import { timeAgo } from "@/lib/activity/timeAgo";
import { connectDB } from "@/lib/db";
import Comment from "@/models/Comment";
import mongoose from "mongoose";
import { NextResponse } from "next/server";
import Post from "@/models/Post";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req, { params }) {
  await connectDB();

  const session = await getServerSession(authOptions);

  const { commentId } = await params;

  if (!mongoose.isValidObjectId(commentId)) {
    return NextResponse.json({ error: "Invalid ID format" }, { status: 400 });
  }

  const comment = await Comment.findById(commentId);

  if (!comment || comment.isDeleted) {
    return NextResponse.json({ error: "Comment not found" }, { status: 404 });
  }

  const post = await Post.findById(comment.post).select(
    "author status isDeleted",
  );

  if (!post || post.isDeleted) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  const canAccess =
    post.status === "published" || session?.user?.id === post.author.toString();

  if (!canAccess) {
    return NextResponse.json({ error: "Comment not found" }, { status: 404 });
  }

  const populatedComment = await comment.populate(
    "author",
    "username profileImagePath",
  );

  let profileImageUrl = null;

  // generate signed image if exists
  if (populatedComment.author?.profileImagePath) {
    const signedImage = await getSignedProfileImage(
      populatedComment.author._id,
    );
    profileImageUrl = signedImage?.profileImage || null;
  }

  // final enriched comment object
  const commentWithImage = {
    ...populatedComment.toObject(), // convert mongoose doc → plain object
    createdDate: populatedComment.createdAt
      ? timeAgo(populatedComment.createdAt)
      : null,
    author: {
      ...populatedComment.author.toObject(),
      profileImageUrl,
    },
  };

  let parents = [];
  let current = comment;

  while (current.parentComment) {
    const parent = await Comment.findById(current.parentComment).populate(
      "author",
      "username profileImagePath",
    );

    if (!parent) break;

    // prevent cross-post chain corruption
    if (parent.post.toString() !== comment.post.toString()) {
      break;
    }

    // defensive loop protection
    if (parent._id.toString() === current._id.toString()) {
      break;
    }

    let profileImageUrl = null;

    if (parent.author?.profileImagePath) {
      const signedImage = await getSignedProfileImage(parent.author._id);
      profileImageUrl = signedImage?.profileImage || null;
    }

    parents.unshift({
      ...parent.toObject(),
      createdDate: parent.createdAt ? timeAgo(parent.createdAt) : null,
      author: {
        ...parent.author.toObject(),
        profileImageUrl,
      },
    });

    current = parent;
  }

  return NextResponse.json({
    comment: commentWithImage,
    parents,
  });
}
