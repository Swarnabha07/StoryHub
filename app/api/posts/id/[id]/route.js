import { getServerSession } from "next-auth";
import { connectDB } from "@/lib/db";
import Post from "@/models/Post";
import { NextResponse } from "next/server";
import { authOptions } from "../../../auth/[...nextauth]/route";
import mongoose from "mongoose";
import { getSignedPostImage } from "@/actions/getSignedPostImage";
import { generateExcerpt } from "@/lib/posts/generateExcerpt";
import { generateTagsFromContent } from "@/lib/posts/generateTags";
import { calculateReadingTime } from "@/lib/posts/calculateReadingTime";
import { sanitizePostHtml } from "@/lib/security/sanitizeHtml";
import { sanitizePlainText } from "@/lib/security/sanitizePlainText";

//UPDATE PARTIAL POST
export async function PATCH(req, { params }) {
  try {
    // 1️ Auth check
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2️ Extract & validate ID
    const { id } = await params;

    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json({ error: "Invalid ID format" }, { status: 400 });
    }

    // 3️ Parse body
    const body = await req.json();
    const { title, content, status, coverImagePath, scheduledFor } = body;

    // empty update guard
    if (
      title === undefined &&
      content === undefined &&
      status === undefined &&
      coverImagePath === undefined &&
      scheduledFor === undefined
    ) {
      return NextResponse.json(
        { error: "No fields provided to update" },
        { status: 400 },
      );
    }

    // 4️ DB connect
    await connectDB();

    // 5️ Fetch post
    const post = await Post.findById(id);

    if (!post || post.isDeleted) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // 6️ Ownership check
    if (post.author.toString() !== session.user.id) {
      return NextResponse.json(
        { error: "You are not allowed to edit this post" },
        { status: 403 },
      );
    }

    if (
      (title !== undefined && typeof title !== "string") ||
      (content !== undefined && typeof content !== "string") ||
      (status !== undefined && typeof status !== "string") ||
      (coverImagePath !== undefined &&
        coverImagePath !== null &&
        typeof coverImagePath !== "string") ||
      (scheduledFor !== undefined &&
        scheduledFor !== null &&
        isNaN(new Date(scheduledFor).getTime()))
    ) {
      return NextResponse.json(
        { error: "Invalid input type" },
        { status: 400 },
      );
    }

    const cleanTitle =
      title !== undefined ? sanitizePlainText(title) : post.title;

    const cleanContent =
      content !== undefined ? sanitizePostHtml(content) : post.content;

    // 7️ Validation
    if (cleanTitle !== undefined && !cleanTitle.trim()) {
      return NextResponse.json(
        { error: "Title cannot be empty" },
        { status: 400 },
      );
    }

    if (cleanContent !== undefined && !cleanContent.trim()) {
      return NextResponse.json(
        { error: "Content cannot be empty" },
        { status: 400 },
      );
    }

    if (cleanTitle.length < 3) {
      return NextResponse.json({ error: "Title too short" }, { status: 400 });
    }

    if (cleanTitle.length > 150) {
      return NextResponse.json({ error: "Title too long" }, { status: 400 });
    }

    if (cleanContent.length < 5) {
      return NextResponse.json({ error: "Content too short" }, { status: 400 });
    }

    if (cleanContent.length > 200000) {
      return NextResponse.json({ error: "Content too large" }, { status: 400 });
    }

    if (
      status !== undefined &&
      !["draft", "scheduled", "published"].includes(status)
    ) {
      return NextResponse.json(
        { error: "Invalid post status" },
        { status: 400 },
      );
    }

    if (scheduledFor !== undefined && status !== "scheduled") {
      return NextResponse.json(
        {
          error: "scheduledFor can only be used with scheduled status",
        },
        { status: 400 },
      );
    }

    let scheduleDate = null;

    // Scheduling validations
    if (status === "scheduled") {
      if (!scheduledFor) {
        return NextResponse.json(
          { error: "Schedule date is required" },
          { status: 400 },
        );
      }

      scheduleDate = new Date(scheduledFor);

      if (scheduleDate <= new Date()) {
        return NextResponse.json(
          { error: "Schedule date must be in the future" },
          { status: 400 },
        );
      }
    }

    if (post.status === "published" && status === "scheduled") {
      return NextResponse.json(
        {
          error: "Published posts must be moved to draft before scheduling",
        },
        { status: 400 },
      );
    }

    // 8️ Apply updates
    if (cleanTitle !== undefined) post.title = cleanTitle.trim();
    if (cleanContent !== undefined) {
      post.content = cleanContent;
      post.excerpt = generateExcerpt(cleanContent);
      post.readingTime = calculateReadingTime(cleanContent);
    }
    if (title !== undefined || content !== undefined) {
      const finalTitle = cleanTitle ?? post.title;
      post.tags = generateTagsFromContent(cleanContent, finalTitle);
    }
    if (coverImagePath !== undefined) post.coverImagePath = coverImagePath;

    // 9️ status logic (draft , published , scheduled)
    if (status === "published") {
      post.status = "published";
      post.publishedAt = new Date();
      post.scheduledFor = null;
    }

    if (status === "scheduled") {
      post.status = "scheduled";
      post.scheduledFor = scheduleDate;
    }

    if (status === "draft") {
      post.status = "draft";
      post.scheduledFor = null;
    }

    // 10 Save
    await post.save();

    return NextResponse.json(
      {
        success: true,
        post: {
          id: post._id,
          status: post.status,
          updatedAt: post.updatedAt,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Update post error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

//SOFT DELETE POST
export async function DELETE(req, { params }) {
  try {
    // 1️ Auth check
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2 Validate post ID
    const { id } = await params;

    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json({ error: "Invalid post ID" }, { status: 400 });
    }

    // 3 DB connect
    await connectDB();

    // 4 Fetch post
    const post = await Post.findById(id);

    if (!post || post.isDeleted) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // 5 Ownership check
    if (post.author.toString() !== session.user.id) {
      return NextResponse.json(
        { error: "You are not allowed to delete this post" },
        { status: 403 },
      );
    }

    // 6 Soft delete
    post.isDeleted = true;
    post.deletedAt = new Date();
    await post.save();

    // 7 Response
    return NextResponse.json(
      { success: true, message: "Post deleted successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Delete post error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// FOR FETCHING POST BY ID
export async function GET(req, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json({ error: "Invalid ID format" }, { status: 400 });
    }

    await connectDB();

    const post = await Post.findById(id);

    if (!post || post.isDeleted) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Ownership check
    if (post.author.toString() !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const postObj = post.toObject();

    postObj.coverImageUrl = post.coverImagePath
      ? await getSignedPostImage(post.coverImagePath)
      : null;

    return NextResponse.json({ post: postObj }, { status: 200 });
  } catch (err) {
    console.error("Fetch post by id error:", err);
    return NextResponse.json(
      { error: "Failed to fetch post" },
      { status: 500 },
    );
  }
}
