export default function ToggleItem({
  label,
  description,
  checked,
  onChange,
  loading,
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex-1 min-w-0 flex flex-col gap-0.5">
        <p className="font-medium text-sm md:text-lg">{label}</p>

        <p className="text-xs md:text-base text-gray-500">
          {description}
        </p>
      </div>

      <button
        onClick={onChange}
        disabled={loading}
        className={`relative flex-shrink-0 h-4 w-8 rounded-full transition md:h-6 md:w-12 ${
          checked ? "bg-[#5A2A27]" : "bg-gray-300"
        } ${loading ? "cursor-not-allowed opacity-50" : ""}`}
      >
        <span
          className={`absolute left-1 top-1 h-2 w-2 rounded-full bg-white transition-transform md:h-4 md:w-4 ${
            checked ? "translate-x-4 md:translate-x-6" : ""
          }`}
        />
      </button>
    </div>
  );
}