// lib/getRecentBookmarkedPosts.js
import { getSignedPostImage } from "@/actions/getSignedPostImage";
import { getSignedProfileImage } from "@/actions/getSignedProfileImage";
import Post from "@/models/Post";
import mongoose from "mongoose";

export async function getRecentBookmarkedPosts(bookmarkedIds = []) {
  if (!Array.isArray(bookmarkedIds) || bookmarkedIds.length === 0) {
    return [];
  }

  // Ensure valid ObjectIds
  const validIds = bookmarkedIds
    .filter((id) => mongoose.isValidObjectId(id))
    .slice(0, 50); // safety cap (optional but recommended)

  const posts = await Post.find({ _id: { $in: validIds }, isDeleted: false })
    .sort({ publishedAt: -1 }) // most recent first
    .limit(3)
    .select("slug title excerpt coverImagePath publishedAt author")
    .populate({
      path: "author",
      select: "username profileImagePath",
    })
    .lean(); // faster + easier to shape response

  const postsWithImages = await Promise.all(
    posts.map(async (post) => {
      const coverImageUrl = post.coverImagePath
        ? await getSignedPostImage(post.coverImagePath)
        : null;

      const authorProfileImageUrl = post.author?.profileImagePath
        ? (await getSignedProfileImage(post.author._id))?.profileImage || null
        : null;

      return {
        _id: post._id.toString(),
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,

        publishedDate: post.publishedAt
          ? new Date(post.publishedAt).toDateString()
          : null,

        coverImageUrl,

        author: {
          _id: post.author._id.toString(),
          username: post.author.username,
          profileImageUrl: authorProfileImageUrl,
        },
      };
    }),
  );

  return postsWithImages;
}
