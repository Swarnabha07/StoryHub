export default function PostResultCardSkeleton() {
  return (
    <div className="flex flex-col justify-between p-1.5 my-4 rounded-lg animate-pulse w-full">
      {/* Profile Skeleton */}
      <div className="flex items-center gap-2 mb-3">
        <div className="h-10 w-10 rounded-full bg-gray-200" /> {/* Avatar */}
        <div className="h-4 w-24 bg-gray-200 rounded" /> {/* Username */}
      </div>

      {/* Content + Cover Image Row Skeleton */}
      <div className="flex gap-4 items-start">
        {/* Text content */}
        <div className="flex-1 space-y-3">
          <div className="h-6 w-3/4 bg-gray-300 rounded" /> {/* Title */}
          <div className="space-y-2">
            <div className="h-4 w-full bg-gray-200 rounded" />{" "}
            {/* Excerpt Line 1 */}
            <div className="h-4 w-5/6 bg-gray-200 rounded" />{" "}
            {/* Excerpt Line 2 */}
          </div>
        </div>

        {/* Right side cover image skeleton */}
        <div className="w-[110px] h-20 shrink-0 bg-gray-200 rounded-sm" />
      </div>

      {/* Footer Skeleton */}
      <div className="flex justify-between items-center my-4">
        <div className="h-4 w-20 bg-gray-200 rounded" /> {/* Date */}
      </div>
    </div>
  );
}
