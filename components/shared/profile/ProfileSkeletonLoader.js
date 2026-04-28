"use client";

export default function ProfileSkeletonLoader() {
  return (
    <section className="w-full flex flex-col items-center bg-[#FFFDF9] min-h-screen animate-pulse">
      {/* ================= COVER + HEADER ================= */}
      <div className="w-full">
        {/* Banner */}
        <div className="relative w-full h-[170px] md:h-[320px] bg-neutral-200" />

        {/* Profile Card */}
        <div className="relative px-2 md:px-8">
          {/* Avatar + Identity Row */}
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 md:gap-4 -mt-8 md:-mt-12">
            {/* LEFT SIDE */}
            <div className="flex items-end gap-3 md:gap-6">
              {/* Avatar */}
              <div className="w-[84px] h-[84px] md:w-[128px] md:h-[128px] rounded-full bg-neutral-300 border-4 border-[#FFFDF9] shadow-lg" />

              {/* Name + Username */}
              <div className="space-y-2">
                <div className="h-4 md:h-6 w-28 md:w-40 bg-neutral-300 rounded" />
                <div className="h-3 md:h-4 w-20 md:w-32 bg-neutral-200 rounded" />
              </div>
            </div>

            {/* RIGHT SIDE (CTA + Options) */}
            <div className="flex items-center gap-3">
              <div className="h-8 md:h-10 w-24 md:w-32 bg-neutral-300 rounded-xl" />
              <div className="h-8 w-8 bg-neutral-200 rounded-full" />
            </div>
          </div>

          {/* Bio */}
          <div className="mt-8 space-y-2 max-w-xl">
            <div className="h-3 md:h-4 w-full bg-neutral-200 rounded" />
            <div className="h-3 md:h-4 w-5/6 bg-neutral-200 rounded" />
          </div>

          {/* Stats + Mutuals */}
          <div className="flex flex-wrap justify-center md:justify-start items-center gap-10 mt-10 pb-5 border-b border-gray-100">
            {/* Followers */}
            <div className="space-y-2">
              <div className="h-4 md:h-5 w-10 bg-neutral-300 rounded" />
              <div className="h-3 md:h-4 w-20 bg-neutral-200 rounded" />
            </div>

            <div className="h-8 w-px bg-gray-200" />

            {/* Following */}
            <div className="space-y-2">
              <div className="h-4 md:h-5 w-10 bg-neutral-300 rounded" />
              <div className="h-3 md:h-4 w-20 bg-neutral-200 rounded" />
            </div>

            {/* Mutuals */}
            <div className="flex items-center gap-3 ml-2">
              <div className="flex -space-x-2">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-neutral-200 border-2 border-white" />
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-neutral-200 border-2 border-white" />
              </div>
              <div className="h-3 md:h-4 w-24 bg-neutral-200 rounded" />
            </div>
          </div>
        </div>
      </div>

      {/* ================= POSTS ================= */}
      <div className="w-full max-w-7xl flex flex-col items-center gap-6 mt-10 px-4 pb-16">
        {/* Section Title */}
        <div className="flex items-center gap-3 w-full">
          <div className="h-4 md:h-5 w-32 bg-neutral-300 rounded" />
          <div className="flex-1 h-px bg-gray-100" />
        </div>

        {/* Posts Skeleton */}
        <div className="flex flex-col items-center gap-5 w-full">
          {[1, 2, 3].map((_, i) => (
            <div
              key={i}
              className="w-full bg-white border border-[#f0ebe7] rounded-2xl p-4 md:p-5 shadow-sm"
            >
              {/* Header */}
              <div className="flex items-center gap-3 mb-3">
                <div className="h-8 w-8 rounded-full bg-neutral-200" />
                <div className="h-4 w-32 bg-neutral-200 rounded" />
              </div>

              {/* Content */}
              <div className="space-y-2">
                <div className="h-4 w-3/4 bg-neutral-200 rounded" />
                <div className="h-3 w-full bg-neutral-200 rounded" />
                <div className="h-3 w-5/6 bg-neutral-200 rounded" />
              </div>

              {/* Footer */}
              <div className="flex justify-between items-center mt-4">
                <div className="h-5 w-16 bg-neutral-200 rounded-full" />
                <div className="flex gap-4">
                  <div className="h-4 w-10 bg-neutral-200 rounded" />
                  <div className="h-4 w-10 bg-neutral-200 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
