import PostNotFound from "@/components/shared/posts/PostNotFound";
import PostPageClient from "@/components/shared/posts/PostPageClient";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth";
import User from "@/models/User";
import { connectDB } from "@/lib/db";
import { headers } from "next/headers";

export default async function SinglePostPage({ params }) {
  const { slug } = await params;

  const cookieHeader = (await headers()).get("cookie") ?? "";

  const res = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/posts/${slug}`, {
    cache: "no-store",
    headers: {
      cookie: cookieHeader,
    },
  });

  if (!res.ok) {
    return <PostNotFound />;
  }

  const { post } = await res.json();

  if (!post) {
    return <PostNotFound />;
  }

  await connectDB();

  const session = await getServerSession(authOptions);
  const user = await User.findById(session?.user?.id).select(
    "bookmarks following",
  );

  const bookmarkedByMe = !!user?.bookmarks?.includes(post._id.toString());

  const likedByMe =
    !!session?.user?.id &&
    post.likes?.some((id) => id.toString() === session.user.id);

  const isFollowing =
    !!post.author._id && user?.following?.includes(post.author._id.toString());

  const enrichedPost = {
    ...post,
    likedByMe,
    bookmarkedByMe,
    isFollowing,
  };

  return <PostPageClient post={enrichedPost} />;
}
