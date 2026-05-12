export default function FollowersTooltip({
  active,
  payload,
  label,
  activeMetrics,
}) {
  if (!active || !payload || payload.length === 0) return null;

  const data = payload[0].payload;

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-md p-3 text-xs md:text-sm">
      <p className="font-semibold mb-2">{label}</p>

      <div className="flex flex-col gap-2">
        {activeMetrics.gained && (
          <div className="flex gap-2 font-medium text-green-600">
            <svg
              className="h-4 w-4 md:h-5 md:w-5"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 -960 960 960"
              fill="currentColor"
            >
              <path d="m136-240-56-56 296-298 160 160 208-206H640v-80h240v240h-80v-104L536-320 376-480 136-240Z" />
            </svg>{" "}
            <span>Gained: {data.gained}</span>
          </div>
        )}

        {activeMetrics.lost && (
          <div className="flex gap-2 font-medium text-red-600">
            <svg
              className="h-4 w-4 md:h-5 md:w-5"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 -960 960 960"
              fill="currentColor"
            >
              <path d="M640-240v-80h104L536-526 376-366 80-664l56-56 240 240 160-160 264 264v-104h80v240H640Z" />
            </svg>{" "}
            <span>Lost: {data.lost}</span>
          </div>
        )}

        {activeMetrics.net && (
          <div className="flex gap-2 font-medium text-purple-600">
            <svg
              className="h-4 w-4 md:h-5 md:w-5"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 -960 960 960"
              fill="currentColor"
            >
              <path d="M300-520q-58 0-99-41t-41-99q0-58 41-99t99-41q58 0 99 41t41 99q0 58-41 99t-99 41Zm0-80q25 0 42.5-17.5T360-660q0-25-17.5-42.5T300-720q-25 0-42.5 17.5T240-660q0 25 17.5 42.5T300-600Zm360 440q-58 0-99-41t-41-99q0-58 41-99t99-41q58 0 99 41t41 99q0 58-41 99t-99 41Zm42.5-97.5Q720-275 720-300t-17.5-42.5Q685-360 660-360t-42.5 17.5Q600-325 600-300t17.5 42.5Q635-240 660-240t42.5-17.5ZM216-160l-56-56 584-584 56 56-584 584Z" />
            </svg>{" "}
            <span>Net Growth: {data.net}</span>
          </div>
        )}
      </div>
    </div>
  );
}
