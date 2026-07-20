import ToggleItemSkeleton from "./ToggleItemSkeleton";

export default function NotificationPreferencesSkeleton() {
  return (
    <div className="w-full border-b border-[#d3d3d3] bg-[#FFFDF9] px-2 py-10">
      <div className="animate-pulse">
        {/* Heading */}
        <div className="h-8 w-52 sm:w-72 rounded bg-gray-200" />
      </div>

      {/* Toggle Items */}
      <div className="mt-6 space-y-6">
        {Array.from({ length: 4 }).map((_, index) => (
          <ToggleItemSkeleton key={index} />
        ))}
      </div>
    </div>
  );
}
