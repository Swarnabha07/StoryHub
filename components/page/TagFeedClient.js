"use client";

import { useEffect, useState } from "react";
import Navbar from "../layout/Navbar";
import Sidebar from "../layout/Sidebar";
import { AnimatePresence, motion } from "framer-motion";
import { useStore } from "@/Store/store";
import PostResultCard from "../shared/search/PostResultCard";
import PostResultCardSkeleton from "../shared/posts/PostResultCardSkeleton";

export default function TagFeedClient({ tag }) {
  const { isSidebarOpen, setIsSidebarOpen } = useStore();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);

        const res = await fetch(`/api/tags/${tag}`);
        const data = await res.json();
        setPosts(data);
      } catch (error) {
        console.error("Failed to fetch posts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [tag]);

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

      <div className="max-w-5xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold mt-4 mb-8 text-center underline">
          #{tag}
        </h1>
        {loading ? (
          <div className="flex flex-col items-center gap-6 w-full">
            {Array.from({ length: 4 }).map((_, i) => (
              <PostResultCardSkeleton key={i} />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <p
            className={`text-gray-400 text-center my-10 text-4xl font-semibold opacity-60`}
          >
            No posts belong to this tag
          </p>
        ) : (
          <div>
            {posts.map((post) => (
              <PostResultCard key={post._id} post={post} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
