"use client";

import { useState } from "react";
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

export default function StatsChart({ growthData }) {
  const [activeMetrics, setActiveMetrics] = useState({
    views: true,
    likes: true,
    comments: true,
    engagement: false,
  });

  const toggleMetric = (key) => {
    setActiveMetrics((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6">
      <h3 className="text-lg font-semibold mb-4">Engagement Growth</h3>

      <div className="flex flex-wrap gap-2 mb-4">
        {["views", "likes", "comments", "engagement"].map((metric) => (
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
        ))}
      </div>

      <div className="w-full h-[300px]">
        <ResponsiveContainer height={300} width={800}>
          <LineChart data={growthData}>
            <XAxis dataKey="date" tick={{ fontSize: 12 }} tickMargin={10} />
            <YAxis />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <CartesianGrid strokeDasharray="3 3" />

            {activeMetrics.views && (
              <Line
                type="monotone"
                dataKey="views"
                stroke="#5A2A27"
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
                stroke="#C5A572"
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
  );
}
