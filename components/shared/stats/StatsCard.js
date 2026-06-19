"use client";

import { Info } from "lucide-react";

export default function StatsCard({ title, value, description, isLoading }) {
  return (
    <div
      className="
        relative
        w-[160px] md:w-[220px]
        h-[110px] md:h-[130px]
        rounded-2xl
        p-5
        shadow-sm
        flex flex-col justify-center
        group
      "
    >
      {/* title row */}
      <div className="flex items-center gap-1">
        <p className="text-gray-400 text-xs md:text-sm">{title}</p>

        {description && (
          <div className="relative group/info">
            <Info size={14} className="text-gray-400 cursor-pointer" />

            {/* Tooltip */}
            <div
              className="
                absolute
                left-1/2
                -translate-x-1/2
                bottom-6
                hidden
                group-hover/info:block
                z-50
                w-52
                rounded-lg
                bg-[#5A2A27]
                text-white
                text-[11px]
                md:text-xs
                p-3
                shadow-lg
              "
            >
              {description}
            </div>
          </div>
        )}
      </div>

      {/* VALUE / SKELETON */}
      {isLoading ? (
        <div
          className="
            mt-3
            h-8
            w-20
            rounded-md
            bg-gray-200
            animate-pulse
            transition-all duration-300
          "
        />
      ) : (
        <h2 className="text-lg md:text-3xl font-bold mt-2 truncate transition-all duration-300">
          {value}
        </h2>
      )}
    </div>
  );
}
