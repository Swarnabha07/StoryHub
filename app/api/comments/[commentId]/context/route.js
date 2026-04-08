import { getSignedProfileImage } from "@/actions/getSignedProfileImage";
import { timeAgo } from "@/lib/activity/timeAgo";
import { connectDB } from "@/lib/db";
import Comment from "@/models/Comment";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  await connectDB();

  const { commentId } = await params;

  if (!mongoose.isValidObjectId(commentId)) {
    return NextResponse.json({ error: "Invalid ID format" }, { status: 400 });
  }

  const comment = await Comment.findById(commentId);

  if (!comment || comment.isDeleted) {
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
