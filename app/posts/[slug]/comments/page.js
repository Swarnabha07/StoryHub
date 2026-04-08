import CommentsClient from "@/components/page/CommentsClient";
import { connectDB } from "@/lib/db";
import Post from "@/models/Post";

export default async function CommentsPage({ params }) {
  const { slug } = await params;
  await connectDB();

  const post = await Post.findOne({ slug: slug })
    .select("_id title slug author")
    .lean();

  if (!post) return notFound();

  return (
    <CommentsClient
      postId={post._id.toString()}
      postSlug={post.slug}
      postAuthor={post.author.toString()}
    />
  );
}
