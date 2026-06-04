import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import PostStatsClient from "@/components/page/PostStatsClient";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/db";
import Post from "@/models/Post";
import PostNotFound from "@/components/shared/posts/PostNotFound";

export default async function PostStatsPage({ params }) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/");
  }

  const { slug } = await params;
  await connectDB();

  const post = await Post.findOne({ slug: slug })
    .select("_id title slug author isDeleted")
    .lean();

  if (!post || post.isDeleted) {
    return <PostNotFound />;
  }

  if (post.author.toString() !== session.user.id) {
    redirect(`/posts/${post.slug}`);
  }

  return <PostStatsClient postId={post._id.toString()} postSlug={post.slug} />;
}
