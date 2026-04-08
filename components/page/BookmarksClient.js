"use client";
import { useEffect, useState, useRef } from "react";
import PostCard from "../shared/posts/PostCard";
import { AnimatePresence, motion } from "framer-motion";
import { useStore } from "@/Store/store";
import PostSkeleton from "../shared/posts/PostSkeleton";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import { Lora } from "next/font/google";

const lora = Lora({
  weight: "700",
  subsets: ["latin"],
});

export default function BookmarksClient({ bookmarkedIds }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isSidebarOpen, setIsSidebarOpen } = useStore();
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const bookmarkedSetRef = useRef(new Set(bookmarkedIds));
  const loadMoreRef = useRef(null);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    if (!loadMoreRef.current || loading || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setPage((prev) => {
            const nextPage = prev + 1;
            fetchBookmarks(nextPage);
            return nextPage;
          });
        }
      },
      {
        root: null, // viewport
        rootMargin: "100px", // prefetch early
        threshold: 0,
      }
    );

    observer.observe(loadMoreRef.current);

    return () => observer.disconnect();
  }, [loading, hasMore]);

  useEffect(() => {
    fetchBookmarks(1).finally(() => setLoading(false));
  }, []);

  async function fetchBookmarks(pageNumber) {
    if (loadingMore || !hasMore) return;

    setLoadingMore(true);

    const res = await fetch(`/api/users/bookmarks?page=${pageNumber}&limit=5`);
    const data = await res.json();

    setPosts((prev) => {
      const existingIds = new Set(prev.map((p) => p._id));
      const uniqueNewPosts = (data.posts || []).filter(
        (p) => !existingIds.has(p._id)
      );
      return [...prev, ...uniqueNewPosts];
    });

    setHasMore(data.hasMore);

    setLoadingMore(false);
  }

  return (
    <main className=" min-h-screen bg-[#FFFDF9]">
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
      <h1 className="text-2xl my-8 text-center underline font-bold text-[#5A2A27]">
        Your Bookmarks
      </h1>

      <div className="posts w-2/3 mx-auto my-10">
        {loading && page === 1 ? (
          <div className="flex flex-col items-center gap-6 w-full">
            {Array.from({ length: 4 }).map((_, i) => (
              <PostSkeleton key={i} />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className={`text-gray-400 text-center my-10 ${lora.className}`}>
            <p className="text-2xl">No bookmarks yet</p>
            <p className="text-xl mt-2">Save posts to read them later.</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-6 w-full">
            {posts.map((post) => (
              <PostCard
                key={post._id}
                post={post}
                bookmarkedSet={bookmarkedSetRef.current}
              />
            ))}
          </div>
        )}
      </div>

      {/* Invinsible sentinel div */}
      <div ref={loadMoreRef} className="h-10 flex justify-center items-center">
        {hasMore && loadingMore && posts.length > 0 && (
          <div className="w-5 h-5 border-2 border-[#5A2A27] border-t-transparent rounded-full animate-spin" />
        )}
      </div>
    </main>
  );
}
