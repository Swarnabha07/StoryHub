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
    const { title, content, status, coverImagePath } = body;

    // empty update guard
    if (
      title === undefined &&
      content === undefined &&
      status === undefined &&
      coverImagePath === undefined
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

    // 7️ Validation
    if (title !== undefined && !title.trim()) {
      return NextResponse.json(
        { error: "Title cannot be empty" },
        { status: 400 },
      );
    }

    if (content !== undefined && !content.trim()) {
      return NextResponse.json(
        { error: "Content cannot be empty" },
        { status: 400 },
      );
    }

    if (status && !["draft", "published"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid post status" },
        { status: 400 },
      );
    }

    // 8️ Apply updates
    if (title !== undefined) post.title = title.trim();
    if (content !== undefined) {
      post.content = content;
      post.excerpt = generateExcerpt(content);
      post.readingTime = calculateReadingTime(content);
    }
    if (title !== undefined || content !== undefined) {
      const finalTitle = title ?? post.title;
      const finalContent = content ?? post.content;
      post.tags = generateTagsFromContent(finalContent, finalTitle);
    }
    if (coverImagePath !== undefined) post.coverImagePath = coverImagePath;

    // 9️ Publish logic
    if (status !== undefined) {
      post.status = status;
      if (status === "published" && !post.publishedAt) {
        post.publishedAt = new Date();
      }
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
