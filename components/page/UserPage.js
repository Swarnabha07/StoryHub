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
          `/api/profile/images/getsignedurl?userId=${currentUser?._id}`
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
      <section className="grid grid-cols-2">
        {/* {left section} */}
        <div className="flex flex-col items-center gap-8">
          <div className="w-full rounded-b-2xl">
            {/* Banner */}
            <div className="relative w-full h-[250px] overflow-hidden group">
              <Image
                src={images.coverImage || "/defaultCover.png"}
                width={1200}
                height={400}
                alt="Profile cover picture"
                className="w-full h-full object-cover"
                unoptimized
              />

              {/* Bottom Fade */}
              <div className="absolute bottom-0 left-0 w-full h-[120px] bg-linear-to-t from-black/50 to-transparent"></div>

              {/* Name on banner */}
              <div className="absolute bottom-4 left-3">
                <h1 className="text-3xl md:text-4xl font-bold text-white drop-shadow-lg">
                  {currentUser.name}
                </h1>
              </div>
            </div>

            {/* Options */}
            <div className="w-full flex justify-end px-3 pt-7 -mt-10 relative z-10">
              <ProfileOptionsMenu currentUser={currentUser} />
            </div>
          </div>

          <div className="w-full flex flex-col items-center gap-4 pb-12">
            <h3 className="text-2xl text-gray-800">Recent Stories</h3>
            <div className="bg-black h-0.5 opacity-5 w-full"></div>
            <div className="posts flex flex-col items-center gap-6 w-full">
              {posts.length === 0 ? (
                <div>
                  {currentUser.email === session?.user?.email ? (
                    <div className="flex flex-col items-center gap-12 my-2">
                      <p className="text-gray-500">
                        You have not posted anything yet!
                      </p>
                      <Link href={`/editor/new`}>
                        <button className="px-8 py-2 text-lg bg-[#fcf8f2] border border-[#ede6e1] rounded-full text-black hover:bg-[#c5a572] hover:text-[#FFFDF9] transition-colors duration-200 cursor-pointer">
                          Start posting
                        </button>
                      </Link>
                    </div>
                  ) : (
                    <p className="text-gray-500 my-2">
                      This user has not published any posts yet.
                    </p>
                  )}
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
          </div>
        </div>

        {/* {right section} */}
        <div className="min-h-screen border-l border-[#f0ebe7]">
          <div className="sticky top-20">
            <div className="flex flex-col items-center gap-7 px-28 py-20 my-5">
              <Image
                className="rounded-full object-cover w-[150px] h-[150px]"
                src={images.profileImage || "/defaultAvatar.png"}
                height={100}
                width={100}
                alt="User profile picture"
                unoptimized
              ></Image>
              <h5 className="text-2xl text-gray-900">
                @{currentUser.username}
              </h5>
              <div className="flex gap-20">
                <Link href={`/profile/${currentUser.username}/followers`}>
                  <div className="flex flex-col items-center cursor-pointer hover:bg-gray-100 rounded-xl p-3 transition-all ease-in-out duration-300">
                    <span className="text-xl text-gray-700">Followers</span>
                    <p className="text-xl text-gray-700">{followersCount}</p>
                  </div>
                </Link>
                <Link href={`/profile/${currentUser.username}/following`}>
                  <div className="flex flex-col items-center cursor-pointer hover:bg-gray-100 rounded-xl p-3 transition-all ease-in-out duration-300">
                    <span className="text-xl text-gray-700">Following</span>
                    <p className="text-xl text-gray-700">
                      {currentUser.followingCount}
                    </p>
                  </div>
                </Link>
              </div>

              {currentUser.email !== session?.user?.email && (
                /* We set a fixed height here so the bio doesn't jump when the images appear */
                <div className="flex items-center gap-3 h-10">
                  {mutualLoading ? (
                    /* Match the skeleton exactly as it looks in your ProfileSkeletonLoader */
                    <div className="flex items-center gap-3 animate-pulse">
                      <div className="flex -space-x-2">
                        <div className="w-10 h-10 rounded-full bg-neutral-200 border-2 border-white" />
                        <div className="w-10 h-10 rounded-full bg-neutral-200 border-2 border-white" />
                      </div>
                      <div className="h-4 w-32 bg-neutral-200 rounded" />
                    </div>
                  ) : (
                    /* If data is ready and we have mutuals, show them */
                    mutualPreview.length > 0 && (
                      <div className="flex items-center gap-3">
                        <div className="flex -space-x-2">
                          {mutualPreview.map((u) => (
                            <Image
                              key={u._id}
                              src={u.profileImageUrl || "/defaultAvatar.png"}
                              alt={u.username}
                              width={24}
                              height={24}
                              className="rounded-full border object-cover w-10 h-10"
                              unoptimized
                            />
                          ))}
                        </div>
                        <Link
                          href={`/profile/${currentUser.username}/mutuals`}
                          className="text-md text-[#834541] hover:text-[#2e0502]"
                        >
                          Followed by {mutualCount} mutual
                          {mutualCount > 1 ? "s" : ""}
                        </Link>
                      </div>
                    )
                  )}
                </div>
              )}

              <p className="text-xl text-gray-500">{currentUser.bio}</p>
              {currentUser.email === session?.user?.email ? (
                <button className="font-medium text-xl px-3 py-3 rounded-full bg-[#5A2A27] text-[#FFFDF9] hover:bg-[#4b1f1d] transition-colors duration-200 w-1/4">
                  <Link href={"/dashboard"}>Edit profile</Link>
                </button>
              ) : (
                <FollowButton
                  userId={currentUser._id}
                  initialIsFollowing={isFollowing}
                  onFollowersChange={setFollowersCount}
                  className={`font-medium text-xl px-3 py-3 w-1/4`}
                />
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default UserPage;
