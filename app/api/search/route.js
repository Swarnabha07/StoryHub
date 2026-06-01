import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Post from "@/models/Post";
import { getSignedProfileImage } from "@/actions/getSignedProfileImage";
import { getSignedPostImage } from "@/actions/getSignedPostImage";
import { escapeRegex } from "@/lib/security/escapeRegex";

export async function GET(req) {
  try {
    const { searchParams } = req.nextUrl;
    const rawQuery = searchParams.get("q");

    if (typeof rawQuery !== "string") {
      return NextResponse.json({ users: [], posts: [] }, { status: 400 });
    }

    const normalizedQuery = rawQuery.trim().toLowerCase();

    if (
      !normalizedQuery ||
      normalizedQuery.length < 2 ||
      normalizedQuery.length > 50
    ) {
      return NextResponse.json({ users: [], posts: [] });
    }

    const escapedQuery = escapeRegex(normalizedQuery);

    await connectDB();

    const PREFIX_LIMIT = 5;
    const isShortQuery = escapedQuery.length <= PREFIX_LIMIT;

    const [users, posts] = await Promise.all([
      // USERS
      isShortQuery
        ? User.find({
            username: { $regex: `^${escapedQuery}`, $options: "i" },
          })
            .limit(5)
            .select("username name profileImagePath")
        : User.find(
            { $text: { $search: normalizedQuery } },
            { score: { $meta: "textScore" } },
          )
            .sort({ score: { $meta: "textScore" } })
            .limit(5)
            .select("username name profileImagePath"),

      // POSTS
      isShortQuery
        ? Post.find({
            title: { $regex: `^${escapedQuery}`, $options: "i" },
            status: "published",
            isDeleted: false,
          })
            .limit(5)
            .populate("author", "username name profileImagePath")
            .select(
              "slug title excerpt tags content coverImagePath publishedAt",
            )
        : Post.find(
            {
              $text: { $search: normalizedQuery },
              status: "published",
              isDeleted: false,
            },
            { score: { $meta: "textScore" } },
          )
            .sort({ score: { $meta: "textScore" } })
            .limit(5)
            .populate("author", "username name profileImagePath")
            .select(
              "slug title excerpt tags content coverImagePath publishedAt",
            ),
    ]);

    // Attach profileImageUrl for Users
    const usersWithImages = await Promise.all(
      users.map(async (user) => {
        let profileImageUrl = null;

        if (user.profileImagePath) {
          const signedImage = await getSignedProfileImage(user._id);
          profileImageUrl = signedImage?.profileImage || null;
        }

        return {
          _id: user._id.toString(),
          username: user.username,
          name: user.name,
          profileImageUrl,
        };
      }),
    );

    // Attach author.profileImageUrl + coverImageUrl for Posts
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
          _id: post._id.toString(),
          title: post.title,
          slug: post.slug,
          content: post.content,
          tags: post.tags,
          excerpt: post.excerpt,
          publishedDate: post.publishedAt
            ? post.publishedAt.toDateString()
            : null,
          author: {
            username: post.author.username,
            name: post.author.name,
            profileImageUrl,
          },
          coverImageUrl,
        };
      }),
    );

    return NextResponse.json({
      users: usersWithImages,
      posts: postsWithImages,
    });
  } catch (err) {
    console.error("Search error:", err);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
