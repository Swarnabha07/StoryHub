import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { connectDB } from "@/lib/db";
import Post from "@/models/Post";
import User from "@/models/User";
import slugify from "slugify";
import { NextResponse } from "next/server";
import { getSignedProfileImage } from "@/actions/getSignedProfileImage";
import { getSignedPostImage } from "@/actions/getSignedPostImage";
import { generateExcerpt } from "@/lib/posts/generateExcerpt";
import { generateTagsFromContent } from "@/lib/posts/generateTags";
import { calculateReadingTime } from "@/lib/posts/calculateReadingTime";
import { sanitizePostHtml } from "@/lib/security/sanitizeHtml";
import { sanitizePlainText } from "@/lib/security/sanitizePlainText";

// CREATE POST
export async function POST(req) {
  try {
    // 1 Auth check
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2 Parse & validate body
    const body = await req.json();
    const { title, content, status = "draft", coverImagePath = null } = body;

    if (typeof title !== "string" || typeof content !== "string") {
      return NextResponse.json(
        { error: "Invalid input type" },
        { status: 400 },
      );
    }

    const cleanTitle = sanitizePlainText(title);
    const cleanContent = sanitizePostHtml(content);

    if (!cleanTitle?.trim() || !cleanContent?.trim()) {
      return NextResponse.json(
        { error: "Title and content are required" },
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
      typeof status !== "string" ||
      !["draft", "published"].includes(status)
    ) {
      return NextResponse.json(
        { error: "Invalid post status" },
        { status: 400 },
      );
    }

    // 3 DB connect
    await connectDB();

    // 4 Slug generation
    let baseSlug = slugify(cleanTitle, {
      lower: true,
      strict: true,
      trim: true,
    });

    if (!baseSlug) {
      return NextResponse.json({ error: "Invalid title" }, { status: 400 });
    }

    let slug = baseSlug;
    let count = 1;

    // Handle slug collisions
    while (await Post.findOne({ slug })) {
      slug = `${baseSlug}-${count}`;
      count++;
    }

    // 5 Publish logic
    const publishedAt = status === "published" ? new Date() : null;

    const generatedExcerpt =
      generateExcerpt(cleanContent) || cleanTitle.slice(0, 150);
    const generatedTags = generateTagsFromContent(cleanContent, cleanTitle);
    const readingTime = calculateReadingTime(cleanContent);

    // 6 Create post
    const post = await Post.create({
      title: cleanTitle.trim(),
      slug,
      content: cleanContent,
      excerpt: generatedExcerpt,
      coverImagePath,
      tags: generatedTags,
      readingTime,
      status,
      publishedAt,
      author: session.user.id,
    });

    // 7 Response
    return NextResponse.json(
      {
        success: true,
        post: { id: post._id.toString(), slug: post.slug, status: post.status },
      },
      { status: 201 },
    );
  } catch (error) {
    if (error.code === 11000) {
      return NextResponse.json(
        { error: "Slug collision, retry" },
        { status: 409 },
      );
    }

    console.error("Create post error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

//READ POSTS (PUBLIC FEED)
export async function GET(req) {
  try {
    await connectDB();

    const { searchParams } = req.nextUrl;
    const page = Math.max(Number(searchParams.get("page")) || 1, 1);
    const limit = Math.min(Number(searchParams.get("limit")) || 10, 50);

    const skip = (page - 1) * limit;

    const posts = await Post.find({
      status: "published",
      isDeleted: false,
    })
      .sort({ publishedAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("author", "username name profileImagePath");

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

    return NextResponse.json({ posts: postsWithImages }, { status: 200 });
  } catch (err) {
    console.error("Fetch posts error:", err);
    return NextResponse.json(
      { error: "Failed to fetch posts" },
      { status: 500 },
    );
  }
}
