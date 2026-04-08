export default function ToggleItem({
  label,
  description,
  checked,
  onChange,
  loading,
}) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="font-medium text-lg">{label}</p>
        <p className=" text-gray-500">{description}</p>
      </div>

      <button
        onClick={onChange}
        disabled={loading}
        className={`relative w-12 h-6 rounded-full transition ${
          checked ? "bg-[#5A2A27]" : "bg-gray-300"
        } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        <span
          className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition ${
            checked ? "translate-x-6" : "" 
          }`}
        />
      </button>
    </div>
  );
}
