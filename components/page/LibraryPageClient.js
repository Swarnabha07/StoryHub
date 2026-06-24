"use client";
import { useEffect, useState, useRef } from "react";
import PostCard from "../shared/posts/PostCard";
import { AnimatePresence, motion } from "framer-motion";
import { useStore } from "@/Store/store";
import PostSkeleton from "../shared/posts/PostSkeleton";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import { Lora } from "next/font/google";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

const lora = Lora({
  weight: "600",
  subsets: ["latin"],
});

const TABS = ["bookmarked", "liked"];

export default function LibraryPageClient({ bookmarkedIds }) {
  const [activeTab, setActiveTab] = useState("bookmarked");
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);

  const { data: session, status } = useSession();
  const observerRef = useRef(null);
  const sentinelRef = useRef(null);
  const abortControllerRef = useRef(null);
  const router = useRouter();
  const { isSidebarOpen, setIsSidebarOpen } = useStore();
  const bookmarkedSetRef = useRef(new Set(bookmarkedIds));

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
      router.replace("/");
    }
  }, [status, router]);

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
        rootMargin: "200px",
        threshold: 0,
      },
    );

    if (sentinelRef.current) {
      observer.observe(sentinelRef.current);
    }

    observerRef.current = observer;

    return () => observer.disconnect();
  }, [loading, hasMore]);

  useEffect(() => {
    fetchPosts(activeTab, page);
  }, [activeTab, page]);

  function handleTabChange(tab) {
    setActiveTab(tab);
    setPosts([]);
    setPage(1);
    setHasMore(true);
    setInitialLoading(true);
  }

  async function fetchPosts(type, page) {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoading(true);

    try {
      const res = await fetch(`/api/library/${type}?page=${page}&limit=10`, {
        signal: controller.signal,
      });

      if (!res.ok) {
        throw new Error("Failed to fetch library posts");
      }

      const data = await res.json();

      if (controller.signal.aborted) return;

      setPosts((prev) => {
        const newPosts = page === 1 ? data.posts : [...prev, ...data.posts];

        return Array.from(new Map(newPosts.map((p) => [p._id, p])).values());
      });

      setHasMore(data.posts.length === 10);
    } catch (err) {
      if (err.name === "AbortError") return;

      console.error(err);

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

      <div className="w-full md:w-3/4 mx-auto px-4 py-6">
        <h1 className={`text-xl md:text-3xl ${lora.className} mb-6`}>
          Your Library
        </h1>

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

        {initialLoading ? (
          <div className="flex flex-col items-center gap-6 w-full">
            {Array.from({ length: 4 }).map((_, i) => (
              <PostSkeleton key={i} />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div>
            <p
              className={`text-gray-500 text-xs md:text-base ${lora.className}`}
            >
              {activeTab === "bookmarked"
                ? "No bookmarked stories yet"
                : "No liked stories yet"}
            </p>
            <p
              className={`text-gray-500 text-xs md:text-base ${lora.className}`}
            >
              {activeTab === "bookmarked"
                ? "Bookmark stories to read them later"
                : "Like stories to read them later"}
            </p>
          </div>
        ) : (
          <div className=" flex flex-col items-center gap-4 md:gap-6 px-2 md:px-0 w-full">
            {posts.map((post) => (
              <PostCard
                key={post._id}
                post={post}
                bookmarkedSet={bookmarkedSetRef.current}
              />
            ))}
          </div>
        )}

        {/* Invinsible sentinel div */}
        {hasMore && (
          <div
            ref={sentinelRef}
            className="h-10 flex items-center justify-center"
          >
            {loading && posts.length > 0 && (
              <div className="w-5 h-5 border-2 border-[#5A2A27] border-t-transparent rounded-full animate-spin" />
            )}
          </div>
        )}
      </div>
    </main>
  );
}
