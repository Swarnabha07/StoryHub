"use client";
import Image from "next/image";
import Navbar from "@/components/layout/Navbar";
import { Lora } from "next/font/google";
import Footer from "@/components/layout/Footer";
import Login from "@/components/shared/Login";
import { useEffect, useState, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useSession } from "next-auth/react";
import Sidebar from "@/components/layout/Sidebar";
import { useStore } from "@/Store/store";
import PostCard from "@/components/shared/posts/PostCard";
import PostSkeleton from "@/components/shared/posts/PostSkeleton";
import Link from "next/link";
import FollowButton from "../shared/profile/FollowButton";
import { useRouter } from "next/navigation";
import PostResultCard from "../shared/search/PostResultCard";

const lora = Lora({
  weight: "700",
  subsets: ["latin"],
});

export default function HomeClient({
  bookmarkedIds,
  suggestedUsers,
  recentBookmarkedPosts,
}) {
  const { data: session, status } = useSession();
  const [showLogin, setShowLogin] = useState(false);
  const [signInClicked, setSignInClicked] = useState(false);
  const { isSidebarOpen, setIsSidebarOpen } = useStore();
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const loadMoreRef = useRef(null);
  const bookmarkedSetRef = useRef(new Set(bookmarkedIds));
  const router = useRouter();

  useEffect(() => {
    document.body.style.overflow = showLogin ? "hidden" : "auto";
  }, [showLogin]);

  useEffect(() => {
    if (hasMore) {
      getPosts(page, 10);
    }
  }, [page]);

  useEffect(() => {
    if (!loadMoreRef.current || loading || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setPage((prev) => prev + 1);
        }
      },
      {
        root: null,
        rootMargin: "200px", // triggers slightly before bottom
        threshold: 0,
      },
    );

    observer.observe(loadMoreRef.current);

    return () => observer.disconnect();
  }, [loading, hasMore]);

  async function getPosts(page = 1, limit = 10) {
    try {
      setLoading(true);

      const res = await fetch(`/api/posts?page=${page}&limit=${limit}`, {
        cache: "no-store", // always fresh data
      });

      if (!res.ok) {
        throw new Error("Failed to fetch posts");
      }

      const data = await res.json();

      if (data.posts.length < limit) {
        setHasMore(false);
      }

      setPosts((prev) => (page === 1 ? data.posts : [...prev, ...data.posts]));
    } catch (err) {
      console.error(err);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }

  if (session) {
    return (
      <>
        <Navbar />
        <div className="bg-black h-0.5 opacity-20"></div>
        <section
          className="bg-[#FFFDF9] min-h-screen py-10 md:grid md:grid-cols-2 
          block transition-all duration-300"
        >
          {/* Sidebar (appears only when open) */}
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

          {/* Left Section */}
          <div className="flex justify-end">
            <div className="flex flex-col gap-4 px-4 md:px-6 w-full">
              {/* Header */}
              <div className="flex justify-center items-center">
                <h2 className="font-bold text-2xl text-[#5A2A27] underline">
                  For you
                </h2>
              </div>

              {/* Posts List */}
              <div className="posts ">
                {loading && page === 1 ? (
                  <div className="flex flex-col items-center gap-6 w-full">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <PostSkeleton key={i} />
                    ))}
                  </div>
                ) : posts.length === 0 ? (
                  <p
                    className={`text-gray-400 text-center my-10 text-4xl ${lora.className} opacity-60`}
                  >
                    No posts published yet
                  </p>
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

              {/* invisible sentinel div */}
              <div
                ref={loadMoreRef}
                className="h-10 flex justify-center items-center"
              >
                {hasMore && (
                  <div className="w-5 h-5 border-2 border-[#5A2A27] border-t-transparent rounded-full animate-spin" />
                )}
              </div>
            </div>
          </div>
          {/* Right Section */}
          <div className="w-full  flex justify-center border-l border-[#f0ebe7]">
            <div className="right-section w-3/4 bg-[#FFFDF9] px-5 py-0 space-y-6 sticky top-[100px] h-fit hidden md:block ">
              {/* Header */}
              <div className="flex justify-center items-center">
                <h2 className="font-bold text-2xl text-[#5A2A27] underline">
                  Featured
                </h2>
              </div>
              {/* Recommended Topics */}
              <div className="  border border-[#f0ebe7] rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300 h-[200px] flex flex-col">
                <h3 className="text-[#5A2A27] font-semibold text-lg mb-3">
                  Recommended Topics
                </h3>
                <div className="flex flex-wrap gap-2 overflow-y-auto">
                  {[
                    "AI",
                    "Productivity",
                    "Frontend",
                    "UX Design",
                    "Writing",
                    "Startups",
                  ].map((topic) => (
                    <span
                      key={topic}
                      className="px-3 py-1 text-sm bg-[#faf7f3] border border-[#ede6e1] rounded-full text-[#5A2A27] hover:bg-[#5A2A27] hover:text-[#FFFDF9] transition-colors duration-200 cursor-pointer"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </div>

              {/* Who to Follow */}
              <div
                className={`  border border-[#f0ebe7] rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300 ${suggestedUsers.length === 0 ? "h-[200px]" : "h-[250px]"}  flex flex-col justify-between`}
              >
                <h3 className="text-[#5A2A27] font-semibold text-lg mb-3">
                  Who to Follow
                </h3>
                <div className="space-y-4 flex-1 overflow-y-auto">
                  {suggestedUsers.length === 0 && (
                    <p className="opacity-45 my-2">
                      No user is suggested right now for following
                    </p>
                  )}
                  {suggestedUsers.map((user) => (
                    <div
                      key={user.username}
                      className="flex justify-between items-center group"
                    >
                      <div className="flex items-center gap-3">
                        <Link href={`/profile/${user.username}`}>
                          <Image
                            src={user.profileImageUrl || "/defaultAvatar.png"}
                            width={40}
                            height={40}
                            className="rounded-full w-10 h-10  object-cover"
                            alt={user.username}
                            unoptimized
                          />
                        </Link>
                        <div>
                          <Link href={`/profile/${user.username}`}>
                            <h4 className="text-sm font-medium text-[#1f1f1f] group-hover:text-[#5A2A27] transition-colors duration-200 hover:underline">
                              {user.name}
                            </h4>
                          </Link>
                          <p className="text-xs text-[#6b625e]">
                            {user.username}
                          </p>
                        </div>
                      </div>
                      <FollowButton
                        userId={user._id}
                        initialIsFollowing={false}
                        className="text-xs font-medium px-3 py-1.5"
                      />
                    </div>
                  ))}
                </div>
                {suggestedUsers.length > 0 && (
                  <Link href={`profile/${session?.user?.username}/suggested`}>
                    <p className="text-sm text-[#6b625e] mt-4 cursor-pointer hover:text-[#8b170f] transition-colors duration-200">
                      View all suggested followers →
                    </p>
                  </Link>
                )}
              </div>

              {/* Bookmarks */}
              <div
                className={`  border border-[#f0ebe7] rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300 min-h-[200px] max-h-[600px] overflow-y-auto pr-2 flex flex-col`}
              >
                <div>
                  <h3 className="text-[#5A2A27] font-semibold text-lg mb-3">
                    Bookmarks
                  </h3>
                  {recentBookmarkedPosts.length === 0 && (
                    <p className="opacity-45 my-2">
                      No post is bookmarked by you yet
                    </p>
                  )}
                  <div className="">
                    {recentBookmarkedPosts.map((post) => (
                      <PostResultCard key={post._id} post={post} />
                    ))}
                  </div>
                </div>
                {recentBookmarkedPosts.length > 0 && (
                  <Link
                    href={"/library"}
                    className="text-sm text-[#6b625e] mt-auto pt-3 cursor-pointer hover:text-[#8b170f] transition-colors duration-200"
                  >
                    View all bookmarks →
                  </Link>
                )}
              </div>
            </div>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <Navbar
        showLogin={showLogin}
        setShowLogin={setShowLogin}
        signInClicked={signInClicked}
        setSignInClicked={setSignInClicked}
      />
      <div className="bg-black h-0.5 opacity-90"></div>
      <section className="bg-[#FFFDF9] grid grid-cols-3 min-h-screen">
        <div className="flex justify-center items-center gap-6">
          <Image
            className="mix-blend-darken rotate-90 opacity-65 mb-32"
            src={`/simpleflower.png`}
            height={250}
            width={250}
            alt="leaf image"
          ></Image>
          <Image
            className="mix-blend-darken rotate-90 opacity-65 mt-32"
            src={`/leaf.png`}
            height={250}
            width={250}
            alt="leaf image"
          ></Image>
        </div>
        <div className="flex flex-col justify-center items-center gap-14 text-center">
          <AnimatePresence>
            {showLogin && (
              <div
                onClick={() => {
                  setShowLogin(false);
                  setSignInClicked(false);
                }}
                className="fixed inset-0 flex items-center justify-center bg-black/50 z-50"
              >
                <Login />
              </div>
            )}
          </AnimatePresence>
          <h1
            className={`text-7xl font-bold ${lora.className} flex flex-col gap-1 text-[#1C1C1C] leading-tight`}
          >
            <span>Your words.</span>
            <span className="text-[#C5A572]">Your world.</span>
            <span>StoryHub.</span>
          </h1>

          <p className="font-medium text-[#6A6A6A] text-xl tracking-wide">
            Write, share, inspire — all in one hub
          </p>
          <button
            onClick={() => {
              setShowLogin(true);
            }}
            className="bg-[#C5A572] text-white px-12 py-3 rounded-full cursor-pointer font-semibold text-xl tracking-wide shadow-md hover:bg-[#b9985e] hover:shadow-lg transition-all duration-300"
          >
            Get Started
          </button>
        </div>
        <div className="flex justify-end items-center">
          <Image
            className="mix-blend-darken"
            src={`/book&pen.png`}
            height={600}
            width={600}
            alt="book and pen image"
          ></Image>
        </div>
      </section>
      <div className="bg-black h-0.5 opacity-90"></div>
      <Footer />
    </>
  );
}
