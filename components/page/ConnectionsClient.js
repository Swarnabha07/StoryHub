"use client";
import React, { useState, useEffect, useRef } from "react";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import { useSession } from "next-auth/react";
import { AnimatePresence, motion } from "framer-motion";
import { useStore } from "@/Store/store";
import Link from "next/link";
import Image from "next/image";
import FollowButton from "../shared/profile/FollowButton";
import { Lora } from "next/font/google";
import { useRouter } from "next/navigation";

const lora = Lora({
  weight: "600",
  subsets: ["latin"],
});

export default function ConnectionsClient({
  initialUsers,
  nextCursor,
  initialHasMore,
  type,
  profileUser,
}) {
  const { data: session } = useSession();
  const { isSidebarOpen, setIsSidebarOpen } = useStore();
  const [users, setUsers] = useState(initialUsers);
  const [cursor, setCursor] = useState(nextCursor);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [loading, setLoading] = useState(false);
  const loadMoreRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    if (!profileUser || !session) return;

    const isOwnProfile = profileUser.username === session.user.username;

    if (type === "suggested" && !isOwnProfile) {
      router.replace("/");
    }
  }, [type, profileUser, session, router]);

  useEffect(() => {
    if (!loadMoreRef.current || !hasMore || loading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const firstEntry = entries[0];
        if (firstEntry.isIntersecting) {
          loadMore();
        }
      },
      {
        root: null, // viewport
        rootMargin: "200px", // prefetch before reaching bottom
        threshold: 0,
      },
    );

    observer.observe(loadMoreRef.current);

    return () => {
      observer.disconnect();
    };
  }, [hasMore, loading, cursor]);

  async function loadMore() {
    if (!hasMore || loading) return;

    setLoading(true);

    const res = await fetch(
      `/api/profile/${
        profileUser.username
      }/${type.toLowerCase()}?cursor=${cursor}`,
    );

    const data = await res.json();

    setUsers((prev) => [...prev, ...data.users]);
    setCursor(data.nextCursor);
    setHasMore(data.hasMore);
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-[#FFFDF9]">
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
      <div className="flex flex-col gap-8 md:gap-12 px-2 py-4 md:py-12 md:px-12">
        {/* {navigation} */}
        <div className="flex items-center gap-1.5 md:gap-4 px-2 md:px-0 flex-wrap">
          <Link href={`/profile/${profileUser.username}`}>
            <h4 className="cursor-pointer opacity-100 md:opacity-45 md:hover:opacity-100 font-medium text-xs md:text-lg">
              {profileUser.name}
            </h4>
          </Link>
          <svg
            className="h-3 w-3 md:h-6 md:w-6"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 -960 960 960"
            fill="#1f1f1f"
          >
            <path d="m321-80-71-71 329-329-329-329 71-71 400 400L321-80Z" />
          </svg>
          <h4 className="text-xs md:text-lg">{type}</h4>
        </div>
        {/* {Followers/Following list} */}
        <div className="flex flex-col gap-8 items-center">
          <h2
            className={`text-2xl md:text-4xl font-bold border-b border-[#a1a1a1] py-2 text-center ${lora.className}`}
          >
            {profileUser.typeCount} {type}
          </h2>
          <div className="bg-[#FFFDF9] rounded-2xl px-2.5 py-0.5 md:p-5  transition-all duration-300 flex flex-col justify-between w-full md:w-3/4">
            {users.length === 0 ? (
              <div>
                <p className="text-center text-lg md:text-xl opacity-80 px-4">
                  {" "}
                  {type === "followers"
                    ? `${session?.user?.username === profileUser.username ? "You don't have any followers yet" : "This user does not have any followers yet"}`
                    : type === "following"
                      ? `${session?.user?.username === profileUser.username ? "You don't follow anyone yet" : "This user does not follow anyone yet"}`
                      : type === "mutuals"
                        ? "This user does not have any mutual followers"
                        : type === "suggested"
                          ? "No suggested users yet"
                          : ""}
                </p>
              </div>
            ) : (
              <div className="space-y-4 md:space-y-8 flex-1">
                {users.map((user) => (
                  <div
                    key={user._id}
                    className="flex justify-between items-center group gap-3"
                  >
                    <div className="flex items-center gap-3 md:gap-6 min-w-0">
                      <Image
                        src={user.profileImageUrl || "/defaultAvatar.png"}
                        alt="profile"
                        width={40}
                        height={40}
                        unoptimized
                        className="rounded-full border border-[#e8e2dd] bg-white h-[42px] w-[42px] md:w-[52px] md:h-[52px] lg:w-[62px] lg:h-[62px] shrink-0 object-cover"
                      />
                      <div>
                        <Link
                          href={`/profile/${user.username}`}
                          className="text-xs md:text-xl font-medium truncate max-w-[120px] md:max-w-none text-[#1f1f1f] group-hover:text-[#5A2A27] transition-colors duration-200"
                        >
                          {user.name}
                        </Link>
                        <p className="text-[11px] md:text-lg text-[#6b625e] truncate max-w-[120px] md:max-w-none">
                          @{user.username}
                        </p>
                      </div>
                    </div>
                    {session?.user?.id !== user._id && (
                      <FollowButton
                        userId={user._id}
                        initialIsFollowing={user.isFollowing}
                        className="px-2.5 py-1 md:px-5 md:py-1 text-xs md:text-lg font-medium shrink-0"
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {hasMore && (
          <div
            ref={loadMoreRef}
            className="h-10 flex items-center justify-center text-sm opacity-60"
          >
            {loading && (
              <div className="w-5 h-5 border-2 border-[#5A2A27] border-t-transparent rounded-full animate-spin" />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
