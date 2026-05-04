export default function StatsCard({ title, value }) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
      <p className="text-gray-400 text-sm">{title}</p>
      <h2 className="text-3xl font-bold mt-2">{value}</h2>
    </div>
  );
}
