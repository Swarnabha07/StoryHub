"use client";

import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Legend,
  Tooltip,
  CartesianGrid,
} from "recharts";

import CustomTooltip from "./CustomTooltip";
import FollowersTooltip from "./FollowersTooltip";

export default function StatsChart({ growthData, followersGrowthData }) {
  const MAX_ACTIVE = 2;

  const [isMobile, setIsMobile] = useState(false);
  const [activeMetrics, setActiveMetrics] = useState({
    reach: true,
    likes: true,
    comments: false,
    impressions: false,
    engagement: false,
  });
  const [activeAudienceMetrics, setActiveAudienceMetrics] = useState({
    gained: true,
    lost: true,
    net: false,
  });

  // Track order of activation
  const [activeOrder, setActiveOrder] = useState(["reach", "likes"]);
  const [activeAudienceOrder, setActiveAudienceOrder] = useState([
    "gained",
    "lost",
  ]);

  const [activeTab, setActiveTab] = useState("engagement");

  //for detecting screen size
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  //for engagement growth chart
  const toggleMetric = (key) => {
    setActiveMetrics((prev) => {
      const isActive = prev[key];

      // CASE 1: If already active → just turn OFF
      if (isActive) {
        setActiveOrder((order) => order.filter((m) => m !== key));
        return { ...prev, [key]: false };
      }

      // CASE 2: If inactive → turn ON
      return { ...prev, [key]: true };
    });

    setActiveOrder((prevOrder) => {
      // If already active, we already handled removal above
      if (prevOrder.includes(key)) return prevOrder;

      // Add new metric
      const newOrder = [...prevOrder, key];

      // If exceeds limit → remove oldest
      if (newOrder.length > MAX_ACTIVE) {
        const removed = newOrder[0];
        setActiveMetrics((prev) => ({
          ...prev,
          [removed]: false,
        }));
        return newOrder.slice(1);
      }

      return newOrder;
    });
  };

  //for audience growth chart
  const toggleAudienceMetric = (key) => {
    setActiveAudienceMetrics((prev) => {
      const isActive = prev[key];

      if (isActive) {
        setActiveAudienceOrder((order) => order.filter((m) => m !== key));

        return {
          ...prev,
          [key]: false,
        };
      }

      return {
        ...prev,
        [key]: true,
      };
    });

    setActiveAudienceOrder((prevOrder) => {
      if (prevOrder.includes(key)) return prevOrder;

      const newOrder = [...prevOrder, key];

      if (newOrder.length > MAX_ACTIVE) {
        const removed = newOrder[0];

        setActiveAudienceMetrics((prev) => ({
          ...prev,
          [removed]: false,
        }));

        return newOrder.slice(1);
      }

      return newOrder;
    });
  };

  return (
    <div className="w-full xl:w-4/5 flex flex-col gap-8 rounded-2xl px-2 sm:px-4 md:px-6 mb-6">
      <div className="flex items-center gap-6 mb-1 border-b overflow-x-auto scrollbar-hide">
        <button
          onClick={() => setActiveTab("engagement")}
          className={`pb-2 whitespace-nowrap capitalize text-sm md:text-base transition ${
            activeTab === "engagement"
              ? "border-b-2 border-black font-medium"
              : "text-gray-500"
          }`}
        >
          Engagement
        </button>

        <button
          onClick={() => setActiveTab("audience")}
          className={`pb-2 whitespace-nowrap capitalize text-sm md:text-base transition ${
            activeTab === "audience"
              ? "border-b-2 border-black font-medium"
              : "text-gray-500"
          }`}
        >
          Audience
        </button>
      </div>

      {/* engagement growth chart */}
      {activeTab === "engagement" && (
        <div>
          <h3 className="text-lg md:text-xl font-semibold mb-4">
            Engagement Growth
          </h3>

          <div className="flex flex-wrap gap-2 mb-6">
            {["reach", "likes", "comments", "impressions", "engagement"].map(
              (metric) => (
                <button
                  key={metric}
                  onClick={() => toggleMetric(metric)}
                  className={`px-3 py-1 rounded-full text-xs md:text-sm border transition ${
                    activeMetrics[metric]
                      ? "bg-[#5A2A27] text-white"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {metric}
                </button>
              ),
            )}
          </div>

          <div className="w-full h-[260px] sm:h-[320px] md:h-[380px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={growthData}>
                <XAxis
                  dataKey="date"
                  tick={{
                    fontSize: isMobile ? 10 : 12,
                  }}
                  tickMargin={isMobile ? 6 : 10}
                  minTickGap={isMobile ? 16 : 20}
                />
                <YAxis
                  width={isMobile ? 30 : 40}
                  tick={{
                    fontSize: isMobile ? 10 : 12,
                  }}
                />
                <Tooltip
                  content={<CustomTooltip activeMetrics={activeMetrics} />}
                />
                <Legend
                  wrapperStyle={{
                    fontSize: isMobile ? "10px" : "16px",
                  }}
                />
                <CartesianGrid strokeDasharray="3 3" />

                {activeMetrics.reach && (
                  <Line
                    type="monotone"
                    dataKey="reach"
                    stroke="#5F8F8B"
                    isAnimationActive={true}
                    dot={false}
                    activeDot={{ r: 5 }}
                  />
                )}

                {activeMetrics.likes && (
                  <Line
                    type="monotone"
                    dataKey="likes"
                    stroke="#c22014"
                    isAnimationActive={true}
                    dot={false}
                    activeDot={{ r: 5 }}
                  />
                )}

                {activeMetrics.comments && (
                  <Line
                    type="monotone"
                    dataKey="comments"
                    stroke="#c5694d"
                    isAnimationActive={true}
                    dot={false}
                    activeDot={{ r: 5 }}
                  />
                )}

                {activeMetrics.impressions && (
                  <Line
                    type="monotone"
                    dataKey="impressions"
                    stroke="#7A8CA5"
                    isAnimationActive={true}
                    dot={false}
                    activeDot={{ r: 5 }}
                  />
                )}

                {activeMetrics.engagement && (
                  <Line
                    type="monotone"
                    dataKey="engagement"
                    stroke="#9333ea"
                    strokeWidth={2}
                    isAnimationActive={true}
                    dot={false}
                    activeDot={{ r: 5 }}
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Audience Growth */}
      {activeTab === "audience" && (
        <div>
          <h3 className="text-lg md:text-xl font-semibold mb-4">
            Audience Growth
          </h3>

          <div className="flex flex-wrap gap-2 mb-6">
            {["gained", "lost", "net"].map((metric) => (
              <button
                key={metric}
                onClick={() => toggleAudienceMetric(metric)}
                className={`px-3 py-1 rounded-full text-xs md:text-sm border transition ${
                  activeAudienceMetrics[metric]
                    ? "bg-[#5A2A27] text-white"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                {metric}
              </button>
            ))}
          </div>

          <div className="w-full h-[260px] sm:h-[320px] md:h-[380px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={followersGrowthData}>
                <XAxis
                  dataKey="date"
                  tick={{
                    fontSize: isMobile ? 10 : 12,
                  }}
                  tickMargin={isMobile ? 6 : 10}
                  minTickGap={isMobile ? 16 : 20}
                />

                <YAxis
                  width={isMobile ? 30 : 40}
                  tick={{
                    fontSize: isMobile ? 10 : 12,
                  }}
                />

                <Tooltip
                  content={
                    <FollowersTooltip activeMetrics={activeAudienceMetrics} />
                  }
                />

                <Legend
                  wrapperStyle={{
                    fontSize: isMobile ? "10px" : "12px",
                  }}
                />

                <CartesianGrid strokeDasharray="3 3" />

                {activeAudienceMetrics.gained && (
                  <Line
                    type="monotone"
                    dataKey="gained"
                    stroke="#16a34a"
                    name="Gained"
                    dot={false}
                    activeDot={{ r: 5 }}
                  />
                )}

                {activeAudienceMetrics.lost && (
                  <Line
                    type="monotone"
                    dataKey="lost"
                    stroke="#dc2626"
                    name="Lost"
                    dot={false}
                    activeDot={{ r: 5 }}
                  />
                )}

                {activeAudienceMetrics.net && (
                  <Line
                    type="monotone"
                    dataKey="net"
                    stroke="#7c3aed"
                    strokeWidth={2}
                    name="Net Growth"
                    dot={false}
                    activeDot={{ r: 5 }}
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
