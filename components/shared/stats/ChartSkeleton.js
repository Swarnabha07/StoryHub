export default function ChartSkeleton() {
  return (
    <div className="w-full xl:w-4/5 rounded-2xl px-2 sm:px-4 md:px-6 animate-pulse">
      {/* Tabs */}
      <div className="flex gap-6 border-b pb-2">
        <div className="h-5 w-24 bg-gray-200 rounded" />
        <div className="h-5 w-20 bg-gray-200 rounded" />
      </div>

      {/* Title */}
      <div className="h-7 w-48 bg-gray-200 rounded mt-6 mb-4" />

      {/* Metric pills */}
      <div className="flex flex-wrap gap-2 mb-6">
        <div className="h-8 w-16 bg-gray-200 rounded-full" />
        <div className="h-8 w-16 bg-gray-200 rounded-full" />
        <div className="h-8 w-20 bg-gray-200 rounded-full" />
        <div className="h-8 w-24 bg-gray-200 rounded-full" />
        <div className="h-8 w-24 bg-gray-200 rounded-full" />
      </div>

      {/* Chart */}
      <div className="w-full h-[260px] sm:h-[320px] md:h-[380px] rounded-xl bg-gray-200" />
    </div>
  );
}
