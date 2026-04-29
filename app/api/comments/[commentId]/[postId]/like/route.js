import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { getServerSession } from "next-auth";
import { connectDB } from "@/lib/db";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Comment from "@/models/Comment";
import Post from "@/models/Post";
import { createActivity } from "@/lib/activity/createActivity";

export async function POST(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { commentId, postId } = await params;

    if (
      !mongoose.isValidObjectId(commentId) ||
      !mongoose.isValidObjectId(postId)
    ) {
      return NextResponse.json(
        { error: "Invalid comment id" },
        { status: 400 },
      );
    }

    await connectDB();

    const comment = await Comment.findById(commentId).select(
      "likes likesCount author post isDeleted",
    );
    if (!comment || comment.isDeleted) {
      return NextResponse.json({ error: "comment not found" }, { status: 404 });
    }

    if (comment.post.toString() !== postId) {
      return NextResponse.json({ error: "Post mismatch" }, { status: 400 });
    }

    const userId = session.user.id;

    const alreadyLiked = comment.likes.some((uid) => uid.toString() === userId);

    if (alreadyLiked) {
      // UNLIKE
      comment.likes = comment.likes.filter((uid) => uid.toString() !== userId);
      comment.likesCount -= 1;
    } else {
      // LIKE
      comment.likes.push(userId);
      comment.likesCount += 1;

      //creating liking a comment event
      await createActivity({
        actor: userId,
        targetUser: comment.author,
        type: "COMMENT_LIKE",
        post: postId,
        comment: comment._id,
      });
    }

    await comment.save();

    return NextResponse.json(
      {
        liked: !alreadyLiked,
        likesCount: comment.likesCount,
      },
      { status: 200 },
    );
  } catch (err) {
    console.error("Like toggle error:", err);
    return NextResponse.json(
      { error: "Failed to toggle like" },
      { status: 500 },
    );
  }
}
