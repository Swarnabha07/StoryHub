export default function ActivityItemSkeleton() {
  return (
    <div className="flex flex-col gap-4 md:gap-6">
      {/* 🔹 1. WITHOUT IMAGE */}
      <div className="flex flex-col md:flex-row gap-3 md:gap-4 rounded-xl p-2 animate-pulse">
        {/* Left */}
        <div className="flex items-start gap-3 md:gap-6 min-w-0 flex-1">
          {/* Avatar */}
          <div className="w-[42px] h-[42px] md:w-[50px] md:h-[50px] lg:w-[60px] lg:h-[60px] rounded-full bg-gray-200 border border-[#e8e2dd] shrink-0" />

          {/* Text */}
          <div className="flex flex-col gap-2 min-w-0 w-full">
            <div className="flex flex-wrap items-center gap-2 md:gap-3">
              <div className="h-4 w-24 md:w-32 bg-gray-200 rounded" />
              <div className="h-4 w-20 md:w-24 bg-gray-200 rounded" />
            </div>

            <div className="h-4 w-40 md:w-56 bg-gray-200 rounded" />

            <div className="h-3 w-20 md:w-24 bg-gray-200 rounded" />
          </div>
        </div>
      </div>

      {/* 🔹 2. WITH IMAGE */}
      <div className="flex flex-col md:flex-row gap-3 md:gap-4 rounded-xl p-2 animate-pulse">
        {/* Left */}
        <div className="flex items-start gap-3 md:gap-6 min-w-0 flex-1">
          {/* Avatar */}
          <div className="w-[42px] h-[42px] md:w-[50px] md:h-[50px] lg:w-[60px] lg:h-[60px] rounded-full bg-gray-200 border border-[#e8e2dd] shrink-0" />

          {/* Text */}
          <div className="flex flex-col gap-2 min-w-0 w-full">
            <div className="flex flex-wrap items-center gap-2 md:gap-3">
              <div className="h-4 w-24 md:w-32 bg-gray-200 rounded" />
              <div className="h-4 w-20 md:w-24 bg-gray-200 rounded" />
            </div>

            <div className="h-4 w-40 md:w-56 bg-gray-200 rounded" />

            <div className="h-3 w-20 md:w-24 bg-gray-200 rounded" />
          </div>
        </div>

        {/* Right (image placeholder) */}
        <div className="w-full md:w-[110px] h-[140px] md:h-[82px] bg-gray-200 rounded-sm border border-[#f0ebe7] shrink-0" />
      </div>
    </div>
  );
}
