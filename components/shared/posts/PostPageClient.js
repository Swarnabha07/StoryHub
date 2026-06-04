"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { useStore } from "@/Store/store";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import Link from "next/link";
import { useSession } from "next-auth/react";
import PostOptionsMenu from "./PostOptionsMenu";
import ShareMenu from "./ShareMenu";
import LikeButton from "./LikeButton";
import BookmarkButton from "./BookmarkButton";
import FollowButton from "../profile/FollowButton";
import { useRouter } from "next/navigation";
import createDOMPurify from "dompurify";

const PostPageClient = ({ post }) => {
  const { isSidebarOpen, setIsSidebarOpen } = useStore();
  const { data: session } = useSession();
  const router = useRouter();
  const [content, setContent] = useState("");

  useEffect(() => {
    const DOMPurify = createDOMPurify(window);
    setContent(DOMPurify.sanitize(post.content));
  }, [post.content]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetch(`/api/posts/${post.slug}/view`, {
        method: "POST",
      });
    }, 5000); // 5 sec delay

    return () => clearTimeout(timer);
  }, [post.slug]);

  return (
    <div className="bg-[#FFFDF9]">
      <Navbar />
      <div className="bg-black h-0.5 opacity-20"></div>
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            {/* Overlay (click outside to close) */}
            <motion.div
              className="fixed inset-0 bg-black/60 z-40"
              onClick={() => setIsSidebarOpen(false)}
              initial={{ opacity: 1 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            />
            <Sidebar />
          </>
        )}
      </AnimatePresence>

      <main className="w-full md:max-w-5xl mx-auto px-2 py-7 md:px-6 md:py-14">
        {/* Author */}
        <div className="flex items-center justify-between mb-6 md:mb-10 gap-4">
          {/* Left: Author Info */}
          <div className="flex items-center gap-3 md:gap-4 min-w-0">
            <Link href={`/profile/${post.author.username}`}>
              <Image
                src={
                  typeof post.author.profileImageUrl === "string"
                    ? post.author.profileImageUrl
                    : "/defaultAvatar.png"
                }
                alt="Author avatar"
                width={50}
                height={50}
                unoptimized
                className="rounded-full border object-cover h-12 w-12 md:h-16 md:w-16 lg:h-20 lg:w-20"
              />
            </Link>

            <div>
              <p className="font-medium text-sm md:text-base text-[#1f1f1f] hover:underline">
                <Link href={`/profile/${post.author.username}`}>
                  {post.author.name}
                </Link>
              </p>
              <p className="text-xs md:text-sm text-[#6b625e] truncate max-w-[120px] md:max-w-none">
                {post.author.username}
              </p>
            </div>
          </div>

          {/* Right: Follow button || Post edit button (based on admin roles)*/}
          {post.author._id === session?.user?.id ? (
            <PostOptionsMenu postId={post._id} />
          ) : (
            <FollowButton
              userId={post.author._id}
              initialIsFollowing={post.isFollowing}
              className={`px-3 py-1.5 md:px-5 md:py-2 text-xs md:text-sm font-medium`}
            />
          )}
        </div>

        <div className="bg-black h-0.5 opacity-5"></div>
        {/* Meta Actions */}
        <div className="flex items-center justify-between my-4 text-sm text-[#6b625e]">
          {/* Left: Likes + Comments + Bookmark + Share Menu */}
          <div className="flex items-center gap-4 md:gap-6 flex-wrap">
            {/* Likes */}

            <LikeButton
              postId={post._id}
              initialLiked={post.likedByMe}
              initialCount={post.likesCount}
            />

            {/* Comments */}
            <button
              onClick={() => {
                router.push(`/posts/${post.slug}/comments`);
              }}
              className={`flex items-center gap-1 text-xs md:text-sm transition-colors duration-200 cursor-pointer text-gray-400 hover:text-[#c5694d]`}
            >
              <svg
                className="h-5 w-5 md:h-6 md:w-6"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 -960 960 960"
                fill="currentColor"
              >
                <path d="M240-400h320v-80H240v80Zm0-120h480v-80H240v80Zm0-120h480v-80H240v80ZM80-80v-720q0-33 23.5-56.5T160-880h640q33 0 56.5 23.5T880-800v480q0 33-23.5 56.5T800-240H240L80-80Zm126-240h594v-480H160v525l46-45Zm-46 0v-480 480Z" />
              </svg>
              {post.commentsCount}
            </button>

            {/* Post Analytics */}
            {post.author._id === session?.user?.id && (
              <button
                onClick={() => {
                  router.push(`/posts/${post.slug}/analytics`);
                }}
                className={`flex items-center gap-1 text-xs md:text-sm transition-colors duration-200 cursor-pointer text-gray-400 hover:text-[#3db66b]`}
              >
                <svg
                  className="h-5 w-5 md:h-6 md:w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 -960 960 960"
                  fill="currentColor"
                >
                  <path d="M640-160v-280h160v280H640Zm-240 0v-640h160v640H400Zm-240 0v-440h160v440H160Z" />
                </svg>
              </button>
            )}

            {/* Bookmark */}
            <BookmarkButton
              postId={post._id}
              initialBookmarked={post.bookmarkedByMe}
            />

            {/* Share Menu */}
            <ShareMenu title={post.title} />
          </div>

          {/* Right: Published Date + Reading Time */}
          <div className="flex gap-1.5 md:gap-4 items-center text-[11px] md:text-base">
            <span className="text-[11px] md:text-base text-[#8a7f7a]">
              {post.readingTime} min read
            </span>
            <span className="text-lg text-[#8a7f7a]">·</span>
            <span className="text-[11px] md:text-base text-[#8a7f7a]">
              {post.publishedDate}
            </span>
          </div>
        </div>
        <div className="bg-black h-0.5 opacity-5"></div>

        {/* Title */}
        <h1 className="text-2xl md:text-4xl font-bold leading-tight my-6 md:my-10">
          {post.title}
        </h1>

        {/* Cover Image */}
        {post.coverImageUrl && (
          <div className="mb-8 overflow-hidden rounded-xl border border-[#f0ebe7]">
            <Image
              src={post.coverImageUrl}
              alt="Post cover image"
              width={1200}
              height={600}
              unoptimized
              className="w-full h-auto object-cover"
            />
          </div>
        )}

        {/* Content */}
        <article
          className="prose prose-lg max-w-none prose-headings:text-[#1f1f1f] text-xs md:text-base wrap-break-word overflow-hidden"
          dangerouslySetInnerHTML={{
            __html: content,
          }}
        />
      </main>
    </div>
  );
};

export default PostPageClient;
