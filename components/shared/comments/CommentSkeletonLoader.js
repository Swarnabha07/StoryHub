"use client";

export default function CommentSkeletonLoader({ depth = 0 }) {
  return (
    <div
      className={`animate-pulse mt-6 ${depth > 0 ? "ml-6 border-l pl-4" : ""}`}
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-gray-300"></div>

        {/* Username + time */}
        <div className="flex gap-2">
          <div className="h-3 w-24 bg-gray-300 rounded"></div>
          <div className="h-2 w-2 bg-gray-200 rounded-full"></div>
          <div className="h-2 w-16 bg-gray-200 rounded"></div>
        </div>
      </div>

      {/* Comment body */}
      <div className="mt-3 space-y-2">
        <div className="h-3 bg-gray-300 rounded w-full"></div>
        <div className="h-3 bg-gray-300 rounded w-5/6"></div>
        <div className="h-3 bg-gray-300 rounded w-2/3"></div>
      </div>

      {/* Actions */}
      <div className="flex gap-4 mt-3">
        <div className="h-3 w-12 bg-gray-200 rounded"></div>
        <div className="h-3 w-12 bg-gray-200 rounded"></div>
      </div>
    </div>
  );
}
