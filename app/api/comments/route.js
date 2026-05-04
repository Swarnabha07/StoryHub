import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Comment from "@/models/Comment";
import Post from "@/models/Post";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import mongoose from "mongoose";
import { getSignedProfileImage } from "@/actions/getSignedProfileImage";
import { timeAgo } from "@/lib/activity/timeAgo";
import { createActivity } from "@/lib/activity/createActivity";
import { updateDailyStats } from "@/lib/analytics/updateDailyStats";

export async function POST(req) {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { content, postId, parentCommentId } = await req.json();

    if (!postId) {
      return NextResponse.json(
        { error: "Post ID is required" },
        { status: 400 },
      );
    }

    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: "Content cannot be empty" },
        { status: 400 },
      );
    }

    if (content.length > 1000) {
      return NextResponse.json({ error: "Content too long" }, { status: 400 });
    }

    if (!mongoose.isValidObjectId(postId)) {
      return NextResponse.json({ error: "Invalid ID format" }, { status: 400 });
    }

    if (parentCommentId && !mongoose.isValidObjectId(parentCommentId)) {
      return NextResponse.json({ error: "Invalid ID format" }, { status: 400 });
    }

    const postExists = await Post.findById(postId).select(
      "_id isDeleted status author",
    );
    if (!postExists || postExists.isDeleted || postExists.status === "draft") {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    let parent;
    if (parentCommentId) {
      parent = await Comment.findById(parentCommentId);

      if (!parent || parent.isDeleted || parent.post.toString() !== postId) {
        return NextResponse.json(
          { error: "Comment not found" },
          { status: 404 },
        );
      }

      await Comment.findByIdAndUpdate(parentCommentId, {
        $inc: { replyCount: 1 },
      });
    }

    const comment = await Comment.create({
      content: content.trim(),
      post: postId,
      author: session.user.id,
      parentComment: parentCommentId || null,
    });

    //for incrementing comments count of that post
    await Post.findByIdAndUpdate(postId, {
      $inc: { commentsCount: 1 },
    });

    //for updating daily stats of a post for every new comment
    await updateDailyStats({
      postId,
      authorId: postExists.author,
      type: "comment",
    });

    //For creating comment activity
    if (parentCommentId) {
      //replying to a comment
      await createActivity({
        actor: session.user.id,
        targetUser: parent.author,
        type: "COMMENT_REPLY",
        post: postId,
        comment: comment._id,
      });
    } else {
      //commenting on a post
      await createActivity({
        actor: session.user.id,
        targetUser: postExists.author,
        type: "POST_COMMENT",
        post: postId,
        comment: comment._id,
      });
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

    return NextResponse.json(
      { success: true, comment: commentWithImage },
      { status: 201 },
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
