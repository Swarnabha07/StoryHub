"use client";
import React from "react";
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
import DOMPurify from "dompurify";

const PostPageClient = ({ post }) => {
  const { isSidebarOpen, setIsSidebarOpen } = useStore();
  const { data: session } = useSession();
  const router = useRouter();

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
      <main className="max-w-3xl mx-auto px-6 py-14">
        {/* Author */}
        <div className="flex items-center justify-between mb-10">
          {/* Left: Author Info */}
          <div className="flex items-center gap-4">
            <Link href={`/profile/${post.author.username}`}>
              <Image
                src={
                  typeof post.author.profileImageUrl === "string"
                    ? post.author.profileImageUrl
                    : "/defaultAvatar.png"
                }
                alt="Author avatar"
                width={48}
                height={48}
                unoptimized
                className="rounded-full border object-cover h-20 w-20"
              />
            </Link>

            <div>
              <p className="font-medium text-[#1f1f1f] hover:underline">
                <Link href={`/profile/${post.author.username}`}>
                  {post.author.name}
                </Link>
              </p>
              <p className="text-sm text-[#6b625e]">{post.author.username}</p>
            </div>
          </div>

          {/* Right: Follow button || Post edit button (based on admin roles)*/}
          {post.author._id === session?.user?.id ? (
            <PostOptionsMenu postId={post._id} />
          ) : (
            <FollowButton
              userId={post.author._id}
              initialIsFollowing={post.isFollowing}
              className={`px-5 py-2 text-sm font-medium`}
            />
          )}
        </div>

        <div className="bg-black h-0.5 opacity-5"></div>
        {/* Meta Actions */}
        <div className="flex items-center justify-between my-4 text-sm text-[#6b625e]">
          {/* Left: Likes + Comments + Bookmark + Share Menu */}
          <div className="flex items-center gap-6">
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
              className={`flex items-center gap-1 text-sm transition-colors duration-200 cursor-pointer text-gray-400 hover:text-[#C5A572]`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="24px"
                viewBox="0 -960 960 960"
                width="24px"
                fill="currentColor"
              >
                <path d="M240-400h320v-80H240v80Zm0-120h480v-80H240v80Zm0-120h480v-80H240v80ZM80-80v-720q0-33 23.5-56.5T160-880h640q33 0 56.5 23.5T880-800v480q0 33-23.5 56.5T800-240H240L80-80Zm126-240h594v-480H160v525l46-45Zm-46 0v-480 480Z" />
              </svg>
            </button>

            {/* Bookmark */}
            <BookmarkButton
              postId={post._id}
              initialBookmarked={post.bookmarkedByMe}
            />

            {/* Share Menu */}
            <ShareMenu title={post.title} />
          </div>

          {/* Right: Published Date + Reading Time */}
          <div className="flex gap-4">
            <span className="text-md text-[#8a7f7a]">
              {post.readingTime} min read
            </span>
            ·
            <span className="text-md text-[#8a7f7a]">{post.publishedDate}</span>
          </div>
        </div>
        <div className="bg-black h-0.5 opacity-5"></div>

        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-bold leading-tight my-10">
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
          className="prose prose-lg max-w-none prose-headings:text-[#1f1f1f]"
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.content) }}
        />
      </main>
    </div>
  );
};

export default PostPageClient;
