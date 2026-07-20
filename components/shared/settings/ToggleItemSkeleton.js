export default function ToggleItemSkeleton() {
  return (
    <div className="flex items-center justify-between gap-4 animate-pulse">
      <div className="flex-1 space-y-2">
        {/* Label */}
        <div className="h-5 w-24 sm:w-28 rounded bg-gray-200" />

        {/* Description */}
        <div className="h-4 w-full max-w-xs sm:max-w-md rounded bg-gray-200" />
      </div>

      {/* Toggle */}
      <div className="h-6 w-12 flex-shrink-0 rounded-full bg-gray-200" />
    </div>
  );
}