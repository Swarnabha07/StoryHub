export default function ActivityItemSkeleton() {
  return (
    <div>
      <div className="flex items-center justify-between rounded-xl p-2 animate-pulse">
        {/* Left section */}
        <div className="flex items-center gap-6">
          {/* Avatar */}
          <div className="w-[60px] h-[60px] rounded-full bg-gray-200 border border-[#e8e2dd]" />

          {/* Text block */}
          <div className="flex flex-col gap-2">
            {/* Username + action */}
            <div className="flex items-center gap-3">
              <div className="h-4 w-32 bg-gray-200 rounded" />
              <div className="h-4 w-24 bg-gray-200 rounded" />
            </div>

            {/* Post title */}
            <div className="h-4 w-48 bg-gray-200 rounded" />

            {/* Timestamp */}
            <div className="h-3 w-24 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between rounded-xl p-2 animate-pulse">
        {/* Left section */}
        <div className="flex items-center gap-6">
          {/* Avatar */}
          <div className="w-[60px] h-[60px] rounded-full bg-gray-200 border border-[#e8e2dd]" />

          {/* Text block */}
          <div className="flex flex-col gap-2">
            {/* Username + action */}
            <div className="flex items-center gap-3">
              <div className="h-4 w-32 bg-gray-200 rounded" />
              <div className="h-4 w-24 bg-gray-200 rounded" />
            </div>

            {/* Post title */}
            <div className="h-4 w-48 bg-gray-200 rounded" />

            {/* Timestamp */}
            <div className="h-3 w-24 bg-gray-200 rounded" />
          </div>
        </div>

        {/* Right: cover image placeholder */}
        <div className="w-[110px] h-20 bg-gray-200 rounded-sm border border-[#f0ebe7]" />
      </div>
    </div>
  );
}
