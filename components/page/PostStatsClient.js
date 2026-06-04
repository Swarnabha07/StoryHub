"use client";

import Navbar from "../layout/Navbar";
import Sidebar from "../layout/Sidebar";
import { AnimatePresence, motion } from "framer-motion";
import { useStore } from "@/Store/store";
import { Lora } from "next/font/google";
import { useEffect, useState } from "react";
import StatsCard from "../shared/stats/StatsCard";
import StatsChart from "../shared/stats/StatsChart";
import { useRouter } from "next/navigation";

const lora = Lora({
  weight: "600",
  subsets: ["latin"],
});

export default function PostStatsClient({ postId, postSlug }) {
  const { isSidebarOpen, setIsSidebarOpen } = useStore();
  const router = useRouter();

  const [stats, setStats] = useState(null);
  const [growthData, setGrowthData] = useState([]);
  const [range, setRange] = useState("7d");

  useEffect(() => {
    const fetchStatsData = async () => {
      const res = await fetch(`/api/posts/id/${postId}/analytics`);
      const data = await res.json();
      setStats(data.stats);
    };

    fetchStatsData();
  }, [postId]);

  useEffect(() => {
    const fetchGrowthData = async () => {
      const res = await fetch(
        `/api/posts/id/${postId}/analytics/growth?range=${range}`,
      );
      const data = await res.json();
      setGrowthData(data.growth || []);
    };

    fetchGrowthData();
  }, [postId, range]);

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

      <button
        onClick={() => {
          router.push(`/posts/${postSlug}`);
        }}
        className="flex items-center gap-2 relative left-2.5 top-2.5 md:left-5 md:top-5 text-xs md:text-base text-gray-600 hover:text-black font-semibold"
      >
        <svg
          className="h-4 w-4 md:h-6 md:w-6"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 -960 960 960"
          fill="currentColor"
        >
          <path d="m313-440 224 224-57 56-320-320 320-320 57 56-224 224h487v80H313Z" />
        </svg>
        <p>Back to post</p>
      </button>

      <div className="flex flex-col items-center gap-6 w-full px-0 md:px-8 mx-auto mb-8">
        <h2
          className={`text-2xl md:text-4xl font-bold border-b border-[#a1a1a1] py-2 my-4 ${lora.className}`}
        >
          Story Insights
        </h2>

        <div className="flex flex-wrap justify-center gap-4 md:gap-6 w-full">
          <StatsCard
            title="Total Impressions"
            value={stats?.totalImpressions}
            isLoading={!stats}
          />
          <StatsCard
            title="Total Reach"
            value={stats?.totalReach}
            isLoading={!stats}
          />

          <StatsCard
            title="Total Likes"
            value={stats?.totalLikes}
            isLoading={!stats}
          />

          <StatsCard
            title="Total Comments"
            value={stats?.totalComments}
            isLoading={!stats}
          />

          <StatsCard
            title="Total Engagement Score"
            value={`${stats?.engagementScore}`}
            isLoading={!stats}
            description="Measures how intensely your audience interacts with your content relative to reach."
          />
        </div>

        <div className="flex gap-2 mt-6">
          <button
            onClick={() => setRange("7d")}
            className={`px-4 py-1 rounded-full text-sm md:text-base transition-colors duration-200 ${
              range === "7d"
                ? "bg-[#C5A572] text-white"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            Last 7 Days
          </button>

          <button
            onClick={() => setRange("30d")}
            className={`px-4 py-1 rounded-full text-sm md:text-base transition-colors duration-200 ${
              range === "30d"
                ? "bg-[#C5A572] text-white"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            Last 30 Days
          </button>
        </div>
        <StatsChart growthData={growthData} showAudienceTab={false} />
      </div>
    </main>
  );
}
