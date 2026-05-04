export default function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || payload.length === 0) return null;

  const data = payload[0].payload;

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-md p-3 text-xs md:text-sm">
      <p className="font-semibold mb-2">{label}</p>

      <div className="flex flex-col gap-2">
        <div className="flex gap-2 font-medium text-[#5A2A27]">
          <svg
            className="h-4 w-4 md:h-5 md:w-5"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 -960 960 960"
            fill="currentColor"
          >
            <path d="M607.5-372.5Q660-425 660-500t-52.5-127.5Q555-680 480-680t-127.5 52.5Q300-575 300-500t52.5 127.5Q405-320 480-320t127.5-52.5Zm-204-51Q372-455 372-500t31.5-76.5Q435-608 480-608t76.5 31.5Q588-545 588-500t-31.5 76.5Q525-392 480-392t-76.5-31.5ZM214-281.5Q94-363 40-500q54-137 174-218.5T480-800q146 0 266 81.5T920-500q-54 137-174 218.5T480-200q-146 0-266-81.5ZM480-500Zm207.5 160.5Q782-399 832-500q-50-101-144.5-160.5T480-720q-113 0-207.5 59.5T128-500q50 101 144.5 160.5T480-280q113 0 207.5-59.5Z" />
          </svg>{" "}
          <span>Views: {data.views}</span>
        </div>
        <div className="flex gap-2 font-medium text-[#c22014]">
          <svg
            className="h-4 w-4 md:h-5 md:w-5"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 -960 960 960"
            fill="currentColor"
          >
            <path d="m480-120-58-52q-101-91-167-157T150-447.5Q111-500 95.5-544T80-634q0-94 63-157t157-63q52 0 99 22t81 62q34-40 81-62t99-22q94 0 157 63t63 157q0 46-15.5 90T810-447.5Q771-395 705-329T538-172l-58 52Z" />
          </svg>{" "}
          <span>Likes: {data.likes}</span>
        </div>
        <div className="flex gap-2 font-medium text-[#C5A572]">
          <svg
            className="h-4 w-4 md:h-5 md:w-5"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 -960 960 960"
            fill="currentColor"
          >
            <path d="M240-400h320v-80H240v80Zm0-120h480v-80H240v80Zm0-120h480v-80H240v80ZM80-80v-720q0-33 23.5-56.5T160-880h640q33 0 56.5 23.5T880-800v480q0 33-23.5 56.5T800-240H240L80-80Zm126-240h594v-480H160v525l46-45Zm-46 0v-480 480Z" />
          </svg>{" "}
          <span>Comments: {data.comments}</span>
        </div>
        <div className="flex gap-2 font-medium text-purple-600">
          <svg
            className="h-4 w-4 md:h-5 md:w-5"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 -960 960 960"
            fill="currentColor"
          >
            <path d="m280-80 160-300-320-40 480-460h80L520-580l320 40L360-80h-80Zm222-247 161-154-269-34 63-117-160 154 268 33-63 118Zm-22-153Z" />
          </svg>{" "}
          <span>Engagement: {data.engagement.toFixed(1)}</span>
        </div>
      </div>
    </div>
  );
}
