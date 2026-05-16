import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Comment from "@/models/Comment";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import mongoose from "mongoose";
import { getSignedProfileImage } from "@/actions/getSignedProfileImage";
import { timeAgo } from "@/lib/activity/timeAgo";
import { sanitizePlainText } from "@/lib/security/sanitizePlainText";

export async function PATCH(req, { params }) {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { commentId } = await params;

    if (!mongoose.isValidObjectId(commentId)) {
      return NextResponse.json({ error: "Invalid ID format" }, { status: 400 });
    }

    const { content } = await req.json();

    if (typeof content !== "string") {
      return NextResponse.json(
        { error: "Invalid input type" },
        { status: 400 },
      );
    }

    const cleanContent = sanitizePlainText(content);

    if (cleanContent === undefined || !cleanContent.trim()) {
      return NextResponse.json(
        { error: "Comment cannot be empty" },
        { status: 400 },
      );
    }

    if (cleanContent.trim().length > 1000) {
      return NextResponse.json(
        { error: "Comment length is too large" },
        { status: 400 },
      );
    }

    const comment = await Comment.findById(commentId);
    if (!comment || comment.isDeleted)
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });

    if (comment.author.toString() !== session.user.id) {
      return NextResponse.json(
        { error: "You are not allowed to edit this comment" },
        { status: 403 },
      );
    }

    comment.content = cleanContent.trim();
    comment.isEdited = true;
    comment.editedAt = new Date();

    await comment.save();

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

    return NextResponse.json(
      {
        success: true,
        comment: commentWithImage,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Update comment error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(req, { params }) {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { commentId } = await params;

    if (!mongoose.isValidObjectId(commentId)) {
      return NextResponse.json({ error: "Invalid ID format" }, { status: 400 });
    }

    const comment = await Comment.findById(commentId);
    if (!comment || comment.isDeleted)
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });

    if (comment.author.toString() !== session.user.id) {
      return NextResponse.json(
        { error: "You are not allowed to delete this comment" },
        { status: 403 },
      );
    }

    comment.isDeleted = true;
    comment.content = "[deleted]";
    comment.deletedAt = new Date();

    await comment.save();

    return NextResponse.json(
      { success: true, message: "Comment deleted successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Delete comment error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
