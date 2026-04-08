import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import BookmarksClient from "@/components/page/BookmarksClient";
import User from "@/models/User";
import { connectDB } from "@/lib/db";

export default async function BookmarksPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/");
  }

  let bookmarkedSet = new Set();

  if (session?.user?.id) {
    await connectDB();
    const user = await User.findById(session.user.id).select("bookmarks");

    if (user?.bookmarks) {
      bookmarkedSet = new Set(user.bookmarks.map((id) => id.toString()));
    }
  }

  return <BookmarksClient bookmarkedIds={[...bookmarkedSet]} />;
}
