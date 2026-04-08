"use client";

export default function ProfileSkeletonLoader() {
  return (
    <section className="grid grid-cols-2 animate-pulse">
      {/* LEFT SECTION */}
      <div className="flex flex-col items-center gap-8">
        {/* Banner Skeleton */}
        <div className="w-full rounded-b-2xl overflow-hidden">
          <div className="relative w-full h-[250px] bg-neutral-200">
            {/* Name placeholder */}
            <div className="absolute bottom-4 left-3 h-8 w-48 rounded-md bg-neutral-300"></div>
          </div>

          {/* Options placeholder */}
          <div className="w-full flex justify-end px-3 pt-7 -mt-10 relative z-10">
            <div className="h-10 w-10 rounded-full bg-neutral-200"></div>
          </div>
        </div>

        {/* Posts Section */}
        <div className="w-full flex flex-col items-center gap-6 pb-12">
          <div className="h-6 w-40 rounded bg-neutral-200"></div>
          <div className="bg-black h-0.5 opacity-5 w-full"></div>

          {[1, 2, 3].map((_, index) => (
            <div
              key={index}
              className="bg-[#FFFDF9] border border-[#f0ebe7] rounded-2xl p-5 shadow-sm w-3/4 min-h-[300px] flex flex-col justify-between"
            >
              {/* Header */}
              <div className="flex items-center gap-3 mb-3">
                <div className="h-8 w-8 rounded-full bg-neutral-200"></div>
                <div className="h-4 w-32 rounded bg-neutral-200"></div>
              </div>

              {/* Content */}
              <div className="space-y-3">
                <div className="h-5 w-3/4 rounded bg-neutral-200"></div>
                <div className="h-4 w-full rounded bg-neutral-200"></div>
                <div className="h-4 w-5/6 rounded bg-neutral-200"></div>
              </div>

              {/* Footer */}
              <div className="flex justify-between items-center mt-4">
                <div className="h-6 w-16 rounded-full bg-neutral-200"></div>
                <div className="flex gap-4">
                  <div className="h-5 w-10 rounded bg-neutral-200"></div>
                  <div className="h-5 w-10 rounded bg-neutral-200"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT SECTION */}
      <div className="min-h-screen border-l border-[#f0ebe7]">
        <div className="sticky top-20">
          <div className="flex flex-col items-center gap-10 px-28 py-20 my-5">
            {/* Avatar */}
            <div className="w-[150px] h-[150px] rounded-full bg-neutral-200"></div>

            {/* Username */}
            <div className="h-6 w-40 rounded bg-neutral-200"></div>

            {/* Followers / Following */}
            <div className="flex gap-20">
              {[1, 2].map((_, i) => (
                <div key={i} className="flex flex-col items-center gap-2">
                  <div className="h-4 w-24 rounded bg-neutral-200"></div>
                  <div className="h-4 w-10 rounded bg-neutral-200"></div>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-3 animate-pulse">
              {/* Avatar Stack Skeleton */}
              <div className="flex -space-x-2">
                <div className="w-10 h-10 rounded-full bg-neutral-200 border-2 border-white" />
                <div className="w-10 h-10 rounded-full bg-neutral-200 border-2 border-white" />
              </div>

              {/* Text Link Skeleton */}
              <div className="h-4 w-40 bg-neutral-200 rounded" />
            </div>

            {/* Bio */}
            <div className="space-y-2 w-full">
              <div className="h-4 w-full rounded bg-neutral-200"></div>
              <div className="h-4 w-5/6 rounded bg-neutral-200"></div>
            </div>

            {/* Button */}
            <div className="h-12 w-1/4 rounded-full bg-neutral-300"></div>
          </div>
        </div>
      </div>
    </section>
  );
}
