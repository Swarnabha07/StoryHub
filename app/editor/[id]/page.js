import { connectDB } from "@/lib/db";
import Post from "@/models/Post";
import PostEditor from "@/components/shared/editor/PostEditor";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getSignedPostImage } from "@/actions/getSignedPostImage";
import { serializePost } from "@/lib/posts/serializePost";

export default async function EditPostPage({ params }) {
  const { id } = await params;

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) notFound();

  await connectDB();

  const post = await Post.findOne({
    _id: id,
    author: session.user.id,
    isDeleted: false,
  }).lean();

  if (!post) notFound();

  const postObj = {
    ...post,
    coverImageUrl: post.coverImagePath
      ? await getSignedPostImage(post.coverImagePath)
      : null,
  };

  return <PostEditor initialPost={serializePost(postObj)} />;
}
