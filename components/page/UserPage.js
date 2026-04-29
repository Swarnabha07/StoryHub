"use client";
import React, { useEffect, useState, useRef } from "react";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useStore } from "@/Store/store";
import Image from "next/image";
import Link from "next/link";
import { fetchUser } from "@/actions/useractions";
import ProfileOptionsMenu from "../shared/profile/ProfileOptionsMenu";
import ProfileSkeletonLoader from "../shared/profile/ProfileSkeletonLoader";
import ProfileNotFound from "../shared/profile/ProfileNotFound";
import PostCard from "../shared/posts/PostCard";
import FollowButton from "../shared/profile/FollowButton";

const UserPage = ({ username, posts, bookmarkedIds, followingIds }) => {
  const { data: session, status } = useSession();
  const { isSidebarOpen, setIsSidebarOpen } = useStore();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(null);
  const [images, setImages] = useState({
    profileImage: null,
    coverImage: null,
  });
  const [userLoading, setUserLoading] = useState(true);
  const [mutualCount, setMutualCount] = useState(null);
  const [mutualPreview, setMutualPreview] = useState([]);
  const [mutualLoading, setMutualLoading] = useState(true);
  const [followersCount, setFollowersCount] = useState(0);
  const [expanded, setExpanded] = useState(false);

  const bookmarkedSetRef = useRef(new Set(bookmarkedIds));

  const isFollowing =
    !!currentUser?._id && followingIds?.includes(currentUser._id);

  useEffect(() => {
    if (status !== "authenticated") return;
    getData();
  }, [status]);

  useEffect(() => {
    if (!currentUser?.username) return;

    async function fetchMutuals() {
      try {
        setMutualLoading(true);

        const res = await fetch(`/api/profile/${currentUser.username}/mutuals`);

        const data = await res.json();

        setMutualCount(data.mutualFollowersCount ?? 0);
        setMutualPreview(data.previewUsers ?? []);
      } catch (err) {
        console.error(err);
      } finally {
        setMutualLoading(false);
      }
    }

    fetchMutuals();
  }, [currentUser?.username]);

  useEffect(() => {
    if (currentUser?.followersCount != null) {
      setFollowersCount(currentUser.followersCount);
    }
  }, [currentUser?.followersCount]);

  useEffect(() => {
    if (!currentUser?._id) return;

    async function loadImages() {
      try {
        const res = await fetch(
          `/api/profile/images/getsignedurl?userId=${currentUser?._id}`,
        );
        const data = await res.json();

        setImages({
          profileImage: data.profileImage || null,
          coverImage: data.coverImage || null,
        });
      } catch (err) {
        console.error(err);
      }
    }

    loadImages();
  }, [currentUser?._id]);

  useEffect(() => {
    if (status === "loading") return;

    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  useEffect(() => {
    setExpanded(false);
  }, [currentUser?.bio]);

  const getData = async () => {
    try {
      let u = await fetchUser(username);
      if (u.error) {
        setCurrentUser(null);
      } else {
        setCurrentUser(u);
      }
    } finally {
      setUserLoading(false);
    }
  };

  if (status === "loading" || userLoading) {
    return (
      <div>
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
        <ProfileSkeletonLoader />
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div>
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
        <ProfileNotFound />
      </div>
    );
  }

  return (
    <div>
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

      <section className="w-full flex flex-col items-center bg-[#FFFDF9] min-h-screen">
        {/* ================= COVER + HEADER ================= */}
        <div className="w-full">
          {/* Banner */}
          <div className="relative w-full h-[170px] md:h-[320px] overflow-hidden">
            <Image
              src={images.coverImage || "/defaultCover.png"}
              width={1200}
              height={400}
              alt="Profile cover picture"
              className="w-full h-full object-cover"
              unoptimized
            />
            {/* Gradient overlay — stronger, editorial */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          </div>

          {/* Profile Card */}
          <div className="relative px-2 md:px-8">
            {/* Avatar + Identity Row */}
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 md:gap-4 -mt-8 md:-mt-12">
              {/* Avatar */}
              <div className="flex items-end gap-3 md:gap-6">
                <div className="relative shrink-0">
                  <Image
                    className="rounded-full object-cover w-[84px] h-[84px] md:w-[128px] md:h-[128px] border-4 border-[#FFFDF9] shadow-lg"
                    src={images.profileImage || "/defaultAvatar.png"}
                    height={128}
                    width={128}
                    alt="User profile picture"
                    unoptimized
                  />
                </div>

                <div className="mb-1">
                  <h1 className="text-lg md:text-3xl font-bold text-gray-900 leading-tight tracking-tight">
                    {currentUser.name}
                  </h1>
                  <p className="text-sm md:text-lg text-[#834541] font-medium mt-1">
                    @{currentUser.username}
                  </p>
                </div>
              </div>

              {/* CTA */}
              <div className="flex items-center gap-3 mb-1">
                {currentUser.email === session?.user?.email ? (
                  <Link href="/dashboard">
                    <button className="font-semibold text-xs md:text-lg px-6 md:px-8 py-2 rounded-xl border border-[#5A2A27] text-[#5A2A27] hover:bg-[#5A2A27] hover:text-[#FFFDF9] transition-all duration-200">
                      Edit profile
                    </button>
                  </Link>
                ) : (
                  <FollowButton
                    userId={currentUser._id}
                    initialIsFollowing={isFollowing}
                    onFollowersChange={setFollowersCount}
                    className="font-semibold text-xs md:text-lg px-6 md:px-8 py-2"
                  />
                )}
                {/* Options button */}
                <div className="">
                  <ProfileOptionsMenu currentUser={currentUser} />
                </div>
              </div>
            </div>

            {/* Bio */}
            {currentUser.bio && (
              <div className="px-1.5 md:px-0 mt-8 max-w-xl">
                <div className="relative">
                  <p
                    className={`text-gray-500 text-xs md:text-base leading-relaxed wrap-break-word transition-all duration-300 ${
                      expanded ? "" : "line-clamp-3"
                    }`}
                  >
                    {currentUser.bio}
                  </p>

                  {!expanded && currentUser.bio.length > 180 && (
                    <div className="absolute bottom-0 left-0 w-full h-6 bg-linear-to-t from-[#FFFDF9] to-transparent pointer-events-none" />
                  )}
                </div>

                {currentUser.bio.length > 180 && (
                  <button
                    onClick={() => setExpanded(!expanded)}
                    className="text-[#C5A572] text-xs md:text-sm mt-1 hover:underline"
                  >
                    {expanded ? "Show less" : "Read more"}
                  </button>
                )}
              </div>
            )}

            {/* Stats + Mutuals Row */}
            <div className="flex flex-wrap justify-center md:justify-start items-center gap-10 mt-10 pb-5 border-b border-gray-100">
              {/* Stats */}
              <Link href={`/profile/${currentUser.username}/followers`}>
                <div className="group cursor-pointer">
                  <p className="text-base md:text-xl font-bold text-gray-900 group-hover:text-[#834541] transition-colors">
                    {followersCount}
                  </p>
                  <span className="text-xs md:text-base text-gray-400 uppercase tracking-wider">
                    Followers
                  </span>
                </div>
              </Link>

              <div className="h-8 w-px bg-gray-200" />

              <Link href={`/profile/${currentUser.username}/following`}>
                <div className="group cursor-pointer">
                  <p className="text-base md:text-xl font-bold text-gray-900 group-hover:text-[#834541] transition-colors">
                    {currentUser.followingCount}
                  </p>
                  <span className="text-xs md:text-base text-gray-400 uppercase tracking-wider">
                    Following
                  </span>
                </div>
              </Link>

              {/* Mutuals */}
              {currentUser.email !== session?.user?.email && (
                <>
                  {mutualLoading ? (
                    <div className="flex items-center gap-3 animate-pulse ml-2">
                      <div className="flex -space-x-2">
                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-neutral-200 border-2 border-white" />
                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-neutral-200 border-2 border-white" />
                      </div>
                      <div className="h-3 w-24 bg-neutral-200 rounded-full" />
                    </div>
                  ) : (
                    mutualPreview.length > 0 && (
                      <div className="flex items-center gap-3 ml-2">
                        <div className="flex -space-x-2">
                          {mutualPreview.map((u) => (
                            <Image
                              key={u._id}
                              src={u.profileImageUrl || "/defaultAvatar.png"}
                              alt={u.username}
                              width={28}
                              height={28}
                              className="rounded-full border-2 border-white object-cover w-10 h-10 md:w-12 md:h-12"
                              unoptimized
                            />
                          ))}
                        </div>
                        <Link
                          href={`/profile/${currentUser.username}/mutuals`}
                          className="text-base md:text-xl text-[#834541] hover:text-[#2e0502] transition-colors"
                        >
                          {mutualCount} mutual{mutualCount > 1 ? "s" : ""}
                        </Link>
                      </div>
                    )
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* ================= POSTS ================= */}
        <div className="w-full max-w-7xl flex flex-col items-center gap-6 mt-10 px-4 pb-16">
          <div className="flex items-center gap-3 w-full">
            <h3 className="text-base md:text-lg font-semibold uppercase tracking-[0.15em] text-gray-400">
              Recent Stories
            </h3>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          <div className="flex flex-col items-center gap-5 w-full">
            {posts.length === 0 ? (
              <div className="w-full">
                {currentUser.email === session?.user?.email ? (
                  <div className="flex flex-col items-center gap-8 py-16 text-center">
                    <p className="text-gray-400 text-base md:text-lg">
                      Nothing here yet — your stories are waiting.
                    </p>
                    <Link href="/editor/new">
                      <button className="px-6 md:px-8 py-2 text-sm md:text-base font-medium bg-[#fcf8f2] border border-[#ede6e1] rounded-full text-black hover:bg-[#c5a572] hover:text-[#FFFDF9] transition-colors duration-200 cursor-pointer">
                        Write your first story
                      </button>
                    </Link>
                  </div>
                ) : (
                  <p className="text-gray-400 text-base md:text-lg text-center py-16">
                    No published stories yet.
                  </p>
                )}
              </div>
            ) : (
              posts.map((post) => (
                <PostCard
                  key={post._id}
                  post={post}
                  bookmarkedSet={bookmarkedSetRef.current}
                />
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default UserPage;
