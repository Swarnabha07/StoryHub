"use client";

import Navbar from "../layout/Navbar";
import Sidebar from "../layout/Sidebar";
import { AnimatePresence, motion } from "framer-motion";
import { useStore } from "@/Store/store";
import { Lora } from "next/font/google";
import { useEffect, useState } from "react";
import StatsCard from "../shared/stats/StatsCard";
import StatsChart from "../shared/stats/StatsChart";
import TopPosts from "../shared/stats/TopPosts";

const lora = Lora({
  weight: "600",
  subsets: ["latin"],
});

export default function StatsClient() {
  const { isSidebarOpen, setIsSidebarOpen } = useStore();
  const [data, setData] = useState(null);
  const [growthData, setgrowthData] = useState([]);
  const [range, setRange] = useState("7d");

  useEffect(() => {
    const fetchStatsData = async () => {
      const res = await fetch("/api/stats");
      const data = await res.json();
      setData(data.stats);
    };

    fetchStatsData();
  }, []);

  useEffect(() => {
    const fetchGrowthData = async () => {
      const res = await fetch(`/api/stats/growth?range=${range}`);
      const data = await res.json();
      console.log("data?.growth", data?.growth);
      setgrowthData(data?.growth || []);
    };

    fetchGrowthData();
  }, [range]);

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

      <div className="flex flex-col items-center gap-6 w-full px-20 mx-auto mb-8">
        <h2
          className={`text-4xl font-bold border-b border-[#a1a1a1] py-2 my-4 ${lora.className}`}
        >
          Stats
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <StatsCard title="Total Views" value={data?.totalViews} />
          <StatsCard title="Total Reach" value={data?.totalReach} />
          <StatsCard
            title="Engagement"
            value={data ? `${data.engagementRate}%` : "0%"}
          />
        </div>

        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setRange("7d")}
            className={`px-4 py-1 rounded-full text-sm ${
              range === "7d"
                ? "bg-[#5A2A27] text-white"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            Last 7 Days
          </button>

          <button
            onClick={() => setRange("30d")}
            className={`px-4 py-1 rounded-full text-sm ${
              range === "30d"
                ? "bg-[#5A2A27] text-white"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            Last 30 Days
          </button>
        </div>
        <StatsChart growthData={growthData} />

        <TopPosts posts={data?.topPosts} />
      </div>
    </main>
  );
}
