import { getServerSession } from "next-auth";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import HomeClient from "../page/HomeClient";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getSuggestedUsers } from "@/lib/connections/getSuggestedUsers";
import { attachProfileImages } from "@/lib/attachProfileImages";
import { getRecentBookmarkedPosts } from "@/lib/user/getRecentBookmarkedPosts";

export default async function HomeServer() {
  const session = await getServerSession(authOptions);

  const viewerId = session?.user?.id || null;

  const result = await getSuggestedUsers({
    viewerId,
    limit: 3,
  });

  const usersWithImages = result?.users?.length
    ? await attachProfileImages(result.users)
    : [];

  let bookmarkedSet = new Set();

  if (session?.user?.id) {
    await connectDB();
    const user = await User.findById(session.user.id).select("bookmarks");

    if (user?.bookmarks) {
      bookmarkedSet = new Set(user.bookmarks.map((id) => id.toString()));
    }
  }

  const recentBookmarkedPosts = await getRecentBookmarkedPosts([
    ...bookmarkedSet,
  ]);

  return (
    <HomeClient
      suggestedUsers={usersWithImages}
      bookmarkedIds={[...bookmarkedSet]} // serialized
      recentBookmarkedPosts={recentBookmarkedPosts}
    />
  );
}
