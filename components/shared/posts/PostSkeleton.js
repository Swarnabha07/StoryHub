export default function PostSkeleton() {
  return (
    <div className="post bg-[#FFFDF9] border border-[#f0ebe7] rounded-2xl p-5 shadow-sm w-full md:w-3/4 min-h-[300px] max-h-[340px] flex flex-col justify-between animate-pulse">
      
      {/* Profile */}
      <div className="flex items-center gap-3 mb-3">
        <div className="h-[60px] w-[60px] rounded-full bg-gray-200 border border-[#e8e2dd]" />
        <div className="h-4 w-32 bg-gray-200 rounded" />
      </div>

      {/* Content + Cover Image Row */}
      <div className="flex gap-4 items-start">
        {/* Text content */}
        <div className="flex-1 space-y-3">
          <div className="h-5 w-3/4 bg-gray-200 rounded" />
          <div className="h-4 w-full bg-gray-200 rounded" />
          <div className="h-4 w-5/6 bg-gray-200 rounded" />
        </div>

        {/* Cover image placeholder */}
        <div className="w-[110px] h-20 shrink-0 rounded-sm bg-gray-200 border border-[#f0ebe7]" />
      </div>

      {/* Bottom Actions */}
      <div className="flex justify-between items-center mt-4">
        <div className="h-6 w-24 bg-gray-200 rounded-full" />

        <div className="flex items-center gap-4">
          <div className="h-5 w-12 bg-gray-200 rounded" />
          <div className="h-6 w-6 bg-gray-200 rounded" />
        </div>
      </div>
    </div>
  );
}
