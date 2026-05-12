export default function StatsCard({ title, value }) {
  return (
    <div
      className="
        w-[160px] md:w-[220px]
        h-[110px] md:h-[130px]
        rounded-2xl
        p-5
        shadow-sm

        flex flex-col justify-center
      "
    >
      <p className="text-gray-400 text-xs md:text-sm">{title}</p>

      <h2 className="text-lg md:text-3xl font-bold mt-2 truncate">{value}</h2>
    </div>
  );
}
