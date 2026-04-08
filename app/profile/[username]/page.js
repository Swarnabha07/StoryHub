import UserPage from "@/components/page/UserPage";
import { getServerSession } from "next-auth";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export default async function Page({ params }) {
  const { username } = await params;

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_URL}/api/posts/user/${username}`,
    {
      cache: "no-store", // always fresh for blog content
    }
  );

  const { posts } = await res.json();

  const session = await getServerSession(authOptions);

  let bookmarkedSet = new Set();
  let followingSet = new Set();

  if (session?.user?.id) {
    await connectDB();
    const user = await User.findById(session.user.id).select(
      "bookmarks following"
    );

    if (user?.bookmarks) {
      bookmarkedSet = new Set(user.bookmarks.map((id) => id.toString()));
    }

    if (user?.following) {
      followingSet = new Set(user.following.map((id) => id.toString()));
    }
  }

  return (
    <div className="min-h-screen bg-[#FFFDF9]">
      <UserPage
        posts={posts}
        username={username}
        bookmarkedIds={[...bookmarkedSet]}
        followingIds={[...followingSet]}
      />
    </div>
  );
}
