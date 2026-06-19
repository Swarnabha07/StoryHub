"use client";

import { useEffect, useState, useRef } from "react";
import PostCard from "../shared/posts/PostCard";
import Navbar from "../layout/Navbar";
import { AnimatePresence, motion } from "framer-motion";
import Sidebar from "../layout/Sidebar";
import { useStore } from "@/Store/store";
import { Lora } from "next/font/google";
import PostSkeleton from "../shared/posts/PostSkeleton";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

const lora = Lora({
  weight: "700",
  subsets: ["latin"],
});

const TABS = ["all", "draft", "published", "scheduled"];

export default function StoriesPageClient({ bookmarkedIds }) {
  const [activeTab, setActiveTab] = useState("all");
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);

  const { isSidebarOpen, setIsSidebarOpen } = useStore();
  const { data: session, status } = useSession();
  const router = useRouter();
  const observerRef = useRef(null);
  const sentinelRef = useRef(null);
  const abortControllerRef = useRef(null);
  const bookmarkedSetRef = useRef(new Set(bookmarkedIds));

  const limit = 10;

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // redirect unauthenticated users
  useEffect(() => {
    if (status === "loading") return;

    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetchPosts(activeTab, page);
  }, [activeTab, page, status]);

  useEffect(() => {
    if (loading || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          setPage((prev) => prev + 1);
        }
      },
      {
        root: null,
        rootMargin: "200px", // triggers slightly before bottom
        threshold: 0,
      },
    );

    if (sentinelRef.current) {
      observer.observe(sentinelRef.current);
    }

    observerRef.current = observer;

    return () => observer.disconnect();
  }, [loading, hasMore]);

  async function fetchPosts(status, page) {
    // Abort any previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoading(true);

    try {
      const res = await fetch(
        `/api/posts/me?status=${status}&page=${page}&limit=${limit}`,
        { signal: controller.signal },
      );

      if (!res.ok) throw new Error("Failed to fetch posts");

      const data = await res.json();

      // If request was aborted, stop here
      if (controller.signal.aborted) return;

      setPosts((prev) => {
        const newPosts = page === 1 ? data.posts : [...prev, ...data.posts];
        return Array.from(new Map(newPosts.map((p) => [p._id, p])).values());
      });

      setHasMore(data.posts.length === limit);
      setTotal(data.total);
    } catch (err) {
      // Ignore abort errors
      if (err.name === "AbortError") return;

      console.error(err);
      // Only clear posts if initial page fails
      if (page === 1) {
        setPosts([]);
      }
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
        setInitialLoading(false);
      }
    }
  }

  function handleTabChange(tab) {
    setActiveTab(tab);
    setPosts([]);
    setPage(1); // reset pagination when switching tabs
    setInitialLoading(true); //reset initial loading to true when switching tabs
    setHasMore(true);
  }

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

      <main className="w-full md:w-3/4 mx-auto px-4 py-6">
        <h1 className={`text-xl md:text-3xl ${lora.className} mb-6`}>
          Your Stories
        </h1>

        {/* Tabs */}
        <div className="flex gap-4 border-b mb-6">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => handleTabChange(tab)}
              className={`pb-2 capitalize text-sm md:text-base ${
                activeTab === tab
                  ? "border-b-2 border-black font-medium"
                  : "text-gray-500"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content */}
        {initialLoading ? (
          <div className="flex flex-col items-center gap-4 py-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <PostSkeleton key={i} />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <p className={`text-gray-500 ${lora.className}`}>No posts found.</p>
        ) : (
          <div className="flex flex-col items-center gap-4 py-2">
            {posts.map((post) => (
              <PostCard
                key={post._id}
                post={post}
                bookmarkedSet={bookmarkedSetRef.current}
              />
            ))}
          </div>
        )}

        {/* invisible sentinel div */}
        {hasMore && (
          <div
            ref={sentinelRef}
            className="h-10 flex items-center justify-center text-xs md:text-sm opacity-60"
          >
            {loading && (
              <div className="w-5 h-5 border-2 border-[#5A2A27] border-t-transparent rounded-full animate-spin" />
            )}
          </div>
        )}
      </main>
    </div>
  );
}
