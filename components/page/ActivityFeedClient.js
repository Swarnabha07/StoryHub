"use client";

import { useEffect, useRef, useState } from "react";
import Navbar from "../layout/Navbar";
import Sidebar from "../layout/Sidebar";
import { AnimatePresence, motion } from "framer-motion";
import { useStore } from "@/Store/store";
import { Lora } from "next/font/google";
import ActivityItemSkeleton from "../shared/activity/ActivityItemSkeleton";
import ActivityItem from "../shared/activity/ActivityItem";

const lora = Lora({
  weight: "600",
  subsets: ["latin"],
});

export default function ActivityFeedClient() {
  const { isSidebarOpen, setIsSidebarOpen, resetUnread } = useStore();
  const [activities, setActivities] = useState([]);
  const [cursor, setCursor] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const sentinelRef = useRef(null);
  const markedRef = useRef(new Set());

  const fetchActivities = async () => {
    if (loading || !hasMore) return;

    try {
      setLoading(true);
      const res = await fetch(
        cursor ? `/api/activity?cursor=${cursor}` : "/api/activity",
      );
      const data = await res.json();

      setActivities((prev) => {
        const seen = new Set(prev.map((a) => a._id));
        const unique = data.activities.filter((a) => !seen.has(a._id));
        return [...prev, ...unique];
      });

      setCursor(data.nextCursor);
      setHasMore(data.hasMore);
    } catch (error) {
      console.error("Failed to fetch activities:", error);
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    resetUnread();
    fetchActivities();
  }, []);

  useEffect(() => {
    if (!sentinelRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasMore && !loading) {
          fetchActivities();
        }
      },
      { rootMargin: "200px" },
    );

    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [hasMore, loading, cursor]);

  useEffect(() => {
    const unreadIds = [];

    activities.forEach((a) => {
      if (a.isRead) return;
      if (markedRef.current.has(a._id)) return;

      markedRef.current.add(a._id);

      if (a.activityIds) {
        unreadIds.push(...a.activityIds);
      } else {
        unreadIds.push(a._id);
      }
    });

    if (unreadIds.length === 0) return;

    unreadIds.forEach((id) => markedRef.current.add(id));

    fetch("/api/activity/read", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: unreadIds }),
    }).catch((error) => {
      console.error("Failed to read activities:", error);
    });
  }, [activities]);

  return (
    <main className="min-h-screen bg-[#FFFDF9]">
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

      <div className="flex flex-col items-center gap-6 w-3/4 mx-auto">
        <h2
          className={`text-4xl font-bold border-b border-[#a1a1a1] py-2 my-4 ${lora.className}`}
        >
          Notifications
        </h2>

        {/* Activities List */}
        <div className="activities flex flex-col gap-3 w-3/4 mb-8">
          {initialLoading ? (
            <div className="">
              {Array.from({ length: 4 }).map((_, i) => (
                <ActivityItemSkeleton key={i} />
              ))}
            </div>
          ) : activities.length === 0 ? (
            <p
              className={`text-gray-400 text-center my-10 text-4xl ${lora.className} opacity-60`}
            >
              No activities yet
            </p>
          ) : (
            activities.map((activity) => {
              return <ActivityItem key={activity._id} activity={activity} />;
            })
          )}
        </div>

        {/* invisible sentinel div */}
        {hasMore && (
          <div
            ref={sentinelRef}
            className="h-10 flex items-center justify-center text-sm opacity-60"
          >
            {loading && (
              <div className="w-5 h-5 border-2 border-[#5A2A27] border-t-transparent rounded-full animate-spin" />
            )}
          </div>
        )}
      </div>
    </main>
  );
}
