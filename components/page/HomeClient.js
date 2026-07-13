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
import DecorativeSvgs from "../shared/home/DecorativeSvgs";

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

      {/* Hero section */}
      <section className="relative bg-[#FFFDF9] overflow-hidden">
        {/* Background Glow Blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Top Left */}
          <div
            className="
      absolute
      -top-40
      -left-40
      h-[32rem]
      w-[32rem]
      rounded-full
      bg-[#F5D8A7]
      opacity-50
      blur-[140px]
    "
          />

          {/* Bottom Right */}
          <div
            className="
      absolute
      -bottom-52
      -right-44
      h-[36rem]
      w-[36rem]
      rounded-full
      bg-[#C5A572]
      opacity-50
      blur-[170px]
    "
          />

          {/* Middle Accent */}
          <div
            className="
      absolute
      top-[40%]
      left-1/2
      -translate-x-1/2
      -translate-y-1/2
      h-[40rem]
      w-[20rem]
      rounded-full
      bg-[#E9D2A8]
      opacity-35
      blur-[120px]
    "
          />
        </div>

        {/* Decorative SVG Layer */}
        <div className="hidden xl:block">
          <DecorativeSvgs />
        </div>

        <div className="relative z-10">
          <div className="min-h-screen flex items-center justify-center text-center px-6">
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
                className={`text-4xl md:text-7xl font-bold ${lora.className} flex flex-col gap-1 text-[#1C1C1C] leading-tight`}
              >
                <span>Your words.</span>
                <span className="text-[#C5A572]">Your world.</span>
                <span>StoryHub.</span>
              </h1>

              <p className="font-medium text-[#6A6A6A] text-xs md:text-xl tracking-[0.12em]">
                Write, share, inspire — all in one hub
              </p>
              <button
                onClick={() => {
                  setShowLogin(true);
                }}
                className="bg-[#C5A572] text-white px-6 py-2 md:px-12 md:py-3 rounded-full cursor-pointer font-semibold text-sm md:text-xl tracking-wide shadow-[0_0_35px_rgba(197,165,114,0.25)] hover:bg-[#b9985e] hover:shadow-[0_0_45px_rgba(197,165,114,0.45)] transition-all duration-500"
              >
                Get Started
              </button>
            </div>
          </div>

          {/* What is StoryHub */}

          <motion.div
            className="py-28 max-w-4xl mx-auto px-6 text-center"
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7 }}
          >
            <h2
              className={`text-3xl md:text-5xl font-bold ${lora.className} text-[#1C1C1C]`}
            >
              What is <span className="text-[#C5A572]">StoryHub?</span>
            </h2>

            <p className="mt-8 text-xs md:text-xl leading-relaxed text-[#6A6A6A]">
              StoryHub is a home for writers, thinkers, and storytellers. A
              place where your ideas find readers, your words find meaning, and
              your stories become a part of something greater.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <motion.section
        className="relative bg-[#F8F3E9] py-24 px-6 overflow-hidden"
        initial={{ opacity: 0, y: 60 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.7 }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className={`text-3xl md:text-5xl font-bold ${lora.className} text-black`}>
              Why Writers Choose StoryHub
            </h2>

            <p className="mt-4 text-[#6A6A6A] text-sm md:text-lg">
              Everything you need to write, share, and grow.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <motion.div
              initial={{ opacity: 0, x: -80 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.6,
                delay: 0.1,
              }}
              className=" bg-white rounded-3xl p-8 shadow-md hover:shadow-xl hover:-translate-y-2 transition-all duration-300"
            >
              <h3 className="text-base md:text-xl font-semibold mb-4 text-[#5A2A27]">
                Connect with Writers
              </h3>

              <p className="text-[#6A6A6A] leading-relaxed text-xs md:text-base">
                Discover new writers, follow their journeys, join discussions,
                and build meaningful connections through stories.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -80 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.6,
                delay: 0.2,
              }}
              className=" bg-white rounded-3xl p-8 shadow-md hover:shadow-xl hover:-translate-y-2 transition-all duration-300"
            >
              <h3 className="text-base md:text-xl font-semibold mb-4 text-[#5A2A27]">
                Share Your Ideas
              </h3>

              <p className="text-[#6A6A6A] leading-relaxed text-xs md:text-base">
                Publish your stories and reach readers around the world.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -80 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.6,
                delay: 0.3,
              }}
              className="
  bg-white
  rounded-3xl
  p-8
  shadow-md
  hover:shadow-xl
  hover:-translate-y-2
  transition-all
  duration-300
"
            >
              <h3 className="text-base md:text-xl font-semibold mb-4 text-[#5A2A27]">
                Understand Your Audience
              </h3>

              <p className="text-[#6A6A6A] leading-relaxed text-xs md:text-base">
                Track views, engagement, and reader interactions to understand
                how your stories resonate
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -80 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.6,
                delay: 0.4,
              }}
              className=" bg-white rounded-3xl p-8 shadow-md hover:shadow-xl hover:-translate-y-2 transition-all duration-300"
            >
              <h3 className="text-base md:text-xl font-semibold mb-4 text-[#5A2A27]">
                Preserve Stories
              </h3>

              <p className="text-[#6A6A6A] leading-relaxed text-xs md:text-base">
                Build a personal collection of meaningful stories and revisit
                the ideas that inspire you.
              </p>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Vision */}
      <motion.section
        className="relative bg-[#FFFDF9] py-24 px-8 overflow-hidden"
        initial={{ opacity: 0, y: 60 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.7 }}
      >
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <div>
            <h2
              className={`text-3xl md:text-5xl font-bold ${lora.className} text-[#5A2A27] mb-6`}
            >
              Our Vision
            </h2>

            <p className="text-[#6A6A6A] leading-relaxed text-sm md:text-lg">
              We believe stories have the power to move people, shape ideas, and
              leave a legacy. StoryHub exists to create a calm and elegant space
              where words take center stage.
            </p>
          </div>

          <div className="relative">
            <div className="bg-[#C5A572] opacity-30 rounded-full w-64 h-64 absolute -top-10 -left-10 blur-3xl"></div>

            <div className="bg-[#5A2A27] opacity-20 rounded-full w-72 h-72 absolute bottom-0 right-0 blur-3xl"></div>

            <div className="relative bg-white rounded-3xl shadow-xl p-8">
              <h3 className="text-lg md:text-2xl font-semibold mb-5">Our Core Values</h3>

              <ul className="text-sm md:text-base space-y-4 text-[#6A6A6A]">
                <li>✦ Authenticity in expression</li>
                <li>✦ Elegance in design</li>
                <li>✦ Empathy in communication</li>
                <li>✦ Creativity in storytelling</li>
              </ul>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Story */}
      <motion.section
        className="relative bg-[#F8F3E9] py-24 px-6 overflow-hidden"
        initial={{ opacity: 0, y: 60 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.7 }}
      >
        <div className="max-w-4xl mx-auto text-center">
          <h2
            className={`text-3xl md:text-5xl font-bold ${lora.className} text-[#5A2A27] mb-8`}
          >
            The Story Behind StoryHub
          </h2>

          <p className="text-xs md:text-lg text-[#6A6A6A] leading-relaxed">
            StoryHub was born from a love for timeless writing and thoughtful
            design. It was built for people who believe every idea deserves to
            be shared beautifully. The experience combines simplicity and
            elegance to make writing feel as natural as pen and paper.
          </p>
        </div>
      </motion.section>

      {/* Final CTA */}
      <motion.section
        className="relative bg-[#F6EFE3] py-24 px-6 text-center overflow-hidden"
        initial={{ opacity: 0, y: 60 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.7 }}
      >
        <h2 className={`text-2xl md:text-5xl font-bold ${lora.className} text-black mb-6`}>
          Your Words. Your Legacy.
        </h2>

        <p className="max-w-2xl mx-auto text-xs md:text-lg text-[#6A6A6A] leading-relaxed mb-10">
          Start writing with StoryHub and share your voice with the world —
          where every story becomes part of something greater.
        </p>

        <button
          onClick={() => {
            setShowLogin(true);
          }}
          className="bg-[#C5A572] text-white px-6 py-2 md:px-12 md:py-3 rounded-full cursor-pointer font-semibold text-sm md:text-xl tracking-wide shadow-[0_0_35px_rgba(197,165,114,0.25)] hover:bg-[#b9985e] hover:shadow-[0_0_45px_rgba(197,165,114,0.45)] transition-all duration-500"
        >
          Start Writing
        </button>
      </motion.section>

      <div className="bg-black h-0.5 opacity-90"></div>

      <Footer />
    </>
  );
}
