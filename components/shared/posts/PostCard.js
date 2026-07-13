import Image from "next/image";
import Link from "next/link";
import LikeButton from "./LikeButton";
import BookmarkButton from "./BookmarkButton";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import createDOMPurify from "dompurify";

export default function PostCard({ post, bookmarkedSet }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [content, setContent] = useState("");

  useEffect(() => {
    const DOMPurify = createDOMPurify(window);
    setContent(DOMPurify.sanitize(post.excerpt || post.content));
  }, [post.excerpt || post.content]);

  const likedByMe =
    !!session?.user?.id &&
    post.likes?.some((id) => id.toString() === session.user.id);

  const bookmarkedByMe = bookmarkedSet?.has(post._id.toString());

  return (
    <div
      role="link"
      tabIndex={0}
      onClick={() => router.push(`/posts/${post.slug}`)}
      onKeyDown={(e) => {
        if (e.key === "Enter") router.push(`/posts/${post.slug}`);
      }}
      className="post bg-[#FFFDF9] border border-[#f0ebe7] rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer w-full md:w-3/4 min-h-[280px] max-h-[340px] flex flex-col justify-between"
    >
      {/* Profile */}
      <div className="flex items-center gap-2 mb-3">
        <Link
          href={`/profile/${post.author.username}`}
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <Image
            src={
              typeof post.author.profileImageUrl === "string"
                ? post.author.profileImageUrl
                : "/defaultAvatar.png"
            }
            unoptimized
            height={30}
            width={30}
            alt="profile"
            className="rounded-full border object-cover border-[#e8e2dd] p-1 bg-white h-[45px] w-[45px] md:h-[60px] md:w-[60px]"
          />
        </Link>
        <Link
          href={`/profile/${post.author.username}`}
          onClick={(e) => {
            e.stopPropagation();
          }}
          className="text-xs md:text-sm font-medium text-[#5A2A27] tracking-tight truncate hover:underline"
        >
          {post.author.username}
        </Link>
      </div>

      {/* Content + Cover Image Row */}
      <div className="flex gap-4 items-start">
        {/* Text content */}
        <div className="flex-1">
          <h3 className="text-base md:text-lg font-semibold text-[#1f1f1f] leading-snug hover:text-[#5A2A27] transition-colors duration-200 line-clamp-2">
            {post.title}
          </h3>

          <p
            className="text-xs md:text-sm text-[#6b625e] mt-2 line-clamp-3"
            dangerouslySetInnerHTML={{
              __html: content,
            }}
          ></p>
        </div>

        {/* Right side cover image */}
        {typeof post.coverImageUrl === "string" &&
          post.coverImageUrl.length > 0 && (
            <div className="w-[95px] h-15 md:w-[110px] md:h-20 shrink-0 overflow-hidden rounded-sm border border-[#f0ebe7]">
              <Image
                src={post.coverImageUrl}
                alt="Post cover"
                width={220}
                height={160}
                unoptimized
                className="w-full h-full object-cover"
              />
            </div>
          )}
      </div>

      {/* Bottom Actions */}
      <div className="flex justify-between items-center mt-4 text-xs md:text-sm text-[#6b625e]">
        <h5 className="font-medium px-1 py-1 rounded-full">
          {post.scheduledFor
            ? `Scheduled for ${new Date(post.scheduledFor).toLocaleString([], {
                dateStyle: "medium",
                timeStyle: "short",
              })}`
            : post.publishedDate
              ? `Published at ${post.publishedDate}`
              : "Draft"}
        </h5>

        <div className="flex items-center gap-4">
          {/* Likes */}
          <div
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <LikeButton
              postId={post._id}
              initialLiked={likedByMe}
              initialCount={post.likesCount}
            />
          </div>

          {/* Bookmark */}
          <div
            onClick={(e) => {
              e.stopPropagation();
            }}
            className="mt-0.5"
          >
            <BookmarkButton
              postId={post._id}
              initialBookmarked={bookmarkedByMe}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
