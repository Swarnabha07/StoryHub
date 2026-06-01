import UserPage from "@/components/page/UserPage";
import { getServerSession } from "next-auth";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { fetchUser } from "@/actions/useractions";
import { getSignedProfileImage } from "@/actions/getSignedProfileImage";

export default async function Page({ params }) {
  const { username } = await params;

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_URL}/api/posts/user/${username}`,
    {
      cache: "no-store", // always fresh for blog content
    },
  );

  const { posts } = await res.json();

  const session = await getServerSession(authOptions);

  let bookmarkedSet = new Set();
  let followingSet = new Set();

  if (session?.user?.id) {
    await connectDB();
    const user = await User.findById(session.user.id).select(
      "bookmarks following",
    );

    if (user?.bookmarks) {
      bookmarkedSet = new Set(user.bookmarks.map((id) => id.toString()));
    }

    if (user?.following) {
      followingSet = new Set(user.following.map((id) => id.toString()));
    }
  }

  const currentUser = await fetchUser(username);

  if (currentUser.error) {
    return (
      <div className="min-h-screen bg-[#FFFDF9]">
        <UserPage
          currentUser={null}
          posts={posts}
          bookmarkedIds={[...bookmarkedSet]}
          followingIds={[...followingSet]}
        />
      </div>
    );
  }

  const images = await getSignedProfileImage(currentUser._id);

  return (
    <div className="min-h-screen bg-[#FFFDF9]">
      <UserPage
        posts={posts}
        currentUser={currentUser}
        images={images}
        bookmarkedIds={[...bookmarkedSet]}
        followingIds={[...followingSet]}
      />
    </div>
  );
}
