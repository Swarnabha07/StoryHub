import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Post from "@/models/Post";
import { getSignedProfileImage } from "@/actions/getSignedProfileImage";
import { getSignedPostImage } from "@/actions/getSignedPostImage";

export async function GET(req) {
  try {
    const { searchParams } = req.nextUrl;
    const q = searchParams.get("q")?.trim();

    if (!q || q.length < 2) {
      return NextResponse.json({ users: [], posts: [] });
    }

    await connectDB();

    const PREFIX_LIMIT = 5;
    const isShortQuery = q.length <= PREFIX_LIMIT;

    const [users, posts] = await Promise.all([
      // USERS
      isShortQuery
        ? User.find({
            username: { $regex: `^${q}`, $options: "i" },
          })
            .limit(5)
            .select("username name profileImagePath")
        : User.find(
            { $text: { $search: q } },
            { score: { $meta: "textScore" } },
          )
            .sort({ score: { $meta: "textScore" } })
            .limit(5)
            .select("username name profileImagePath"),

      // POSTS
      isShortQuery
        ? Post.find({
            title: { $regex: `^${q}`, $options: "i" },
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
              $text: { $search: q },
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
          ...user.toObject(),
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

    return NextResponse.json({
      users: usersWithImages,
      posts: postsWithImages,
    });
  } catch (err) {
    console.error("Search error:", err);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
